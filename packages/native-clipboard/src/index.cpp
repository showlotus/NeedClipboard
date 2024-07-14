#include <napi.h>
#include <shlobj.h>
#include <windows.h>
#include <iostream>
#include <thread>

HWND hwnd;
HWND nextClipboardViewer;
std::thread clipboardThread;

Napi::ThreadSafeFunction tsfn;

LRESULT CALLBACK WindowProc(HWND hwnd,
                            UINT uMsg,
                            WPARAM wParam,
                            LPARAM lParam) {
  switch (uMsg) {
    case WM_DRAWCLIPBOARD:
      tsfn.BlockingCall([](Napi::Env env, Napi::Function jsCallback) {
        jsCallback.Call({Napi::String::New(env, "Clipboard content changed!")});
      });
      if (nextClipboardViewer != NULL) {
        SendMessage(nextClipboardViewer, uMsg, wParam, lParam);
      }
      break;
    case WM_CHANGECBCHAIN:
      if ((HWND)wParam == nextClipboardViewer) {
        nextClipboardViewer = (HWND)lParam;
      } else if (nextClipboardViewer != NULL) {
        SendMessage(nextClipboardViewer, uMsg, wParam, lParam);
      }
      break;
    case WM_DESTROY:
      ChangeClipboardChain(hwnd, nextClipboardViewer);
      PostQuitMessage(0);
      break;
    default:
      return DefWindowProc(hwnd, uMsg, wParam, lParam);
  }
  return 0;
}

void ClipboardWatcherThread() {
  const char* CLASS_NAME = "ClipboardWatcher";
  WNDCLASS wc = {0};
  wc.lpfnWndProc = WindowProc;
  wc.hInstance = GetModuleHandle(NULL);
  wc.lpszClassName = CLASS_NAME;

  RegisterClass(&wc);

  hwnd = CreateWindowEx(0, CLASS_NAME, "Clipboard Watcher", WS_OVERLAPPEDWINDOW,
                        CW_USEDEFAULT, CW_USEDEFAULT, CW_USEDEFAULT,
                        CW_USEDEFAULT, NULL, NULL, GetModuleHandle(NULL), NULL);

  nextClipboardViewer = SetClipboardViewer(hwnd);

  MSG msg;
  while (GetMessage(&msg, NULL, 0, 0)) {
    TranslateMessage(&msg);
    DispatchMessage(&msg);
  }

  DestroyWindow(hwnd);
}

Napi::Value StartWatching(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  tsfn = Napi::ThreadSafeFunction::New(env, info[0].As<Napi::Function>(),
                                       "ClipboardWatcher", 0, 1);

  clipboardThread = std::thread(ClipboardWatcherThread);

  return env.Undefined();
}

Napi::Value StopWatching(const Napi::CallbackInfo& info) {
  if (clipboardThread.joinable()) {
    PostMessage(hwnd, WM_DESTROY, 0, 0);
    clipboardThread.join();
  }
  tsfn.Release();

  return info.Env().Undefined();
}

Napi::Array GetClipboardType(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  std::string type = "unknown";
  Napi::Array filePaths = Napi::Array::New(env);

#if defined(_WIN32)
  if (OpenClipboard(NULL)) {
    if (IsClipboardFormatAvailable(CF_TEXT)) {
      type = "Text";
    } else if (IsClipboardFormatAvailable(CF_BITMAP)) {
      type = "Image";
    } else if (IsClipboardFormatAvailable(CF_HDROP)) {
      HDROP hDrop = (HDROP)GetClipboardData(CF_HDROP);
      if (hDrop != NULL) {
        UINT fileCount = DragQueryFile(hDrop, 0xFFFFFFFF, NULL, 0);
        // 如果复制了多个文件，需要返回多个文件对应的路径
        for (int i = 0; i < fileCount; ++i) {
          char filePath[MAX_PATH];
          DragQueryFile(hDrop, i, filePath, MAX_PATH);
          filePaths.Set(i, Napi::String::New(env, filePath));
        }
      }
      type = "File";
    }
    CloseClipboard();
  }
#endif

  Napi::Array result = Napi::Array::New(env, 2);
  result.Set((uint32_t)0, Napi::String::New(env, type));
  result.Set((uint32_t)1, filePaths);
  return result;
}

void SetClipboardFiles(const std::vector<std::wstring>& filePaths) {
    if (!OpenClipboard(nullptr)) {
        return;
    }

    EmptyClipboard();

    // Calculate the total size needed for the DROPFILES structure
    size_t totalSize = sizeof(DROPFILES);
    for (const auto& path : filePaths) {
        totalSize += (path.size() + 1) * sizeof(wchar_t); // Size of each path including null terminator
    }
    totalSize += sizeof(wchar_t); // Additional null terminator for the end of the list

    HGLOBAL hGlobal = GlobalAlloc(GMEM_MOVEABLE, totalSize);
    if (!hGlobal) {
        CloseClipboard();
        return;
    }

    DROPFILES* df = static_cast<DROPFILES*>(GlobalLock(hGlobal));
    df->pFiles = sizeof(DROPFILES);
    df->fWide = TRUE; // Unicode file paths

    wchar_t* ptr = reinterpret_cast<wchar_t*>(reinterpret_cast<BYTE*>(df) + sizeof(DROPFILES));
    for (const auto& path : filePaths) {
        wcscpy(ptr, path.c_str());
        ptr += path.size() + 1;
    }
    *ptr = L'\0'; // End of the list

    GlobalUnlock(hGlobal);
    SetClipboardData(CF_HDROP, hGlobal);
    CloseClipboard();
}

Napi::Value WriteFilesToClipboard(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!info[0].IsArray()) {
        Napi::TypeError::New(env, "Array expected").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Array filePathsArray = info[0].As<Napi::Array>();
    std::vector<std::wstring> filePaths;

    for (uint32_t i = 0; i < filePathsArray.Length(); ++i) {
        std::string filePath = filePathsArray.Get(i).As<Napi::String>().Utf8Value();
        std::wstring wFilePath(filePath.begin(), filePath.end());
        filePaths.push_back(wFilePath);
    }

    SetClipboardFiles(filePaths);

    return env.Null();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "startWatching"),
              Napi::Function::New(env, StartWatching));
  exports.Set(Napi::String::New(env, "stopWatching"),
              Napi::Function::New(env, StopWatching));
  exports.Set(Napi::String::New(env, "getClipboardType"),
              Napi::Function::New(env, GetClipboardType));
  exports.Set(Napi::String::New(env, "writeFilesToClipboard"),
              Napi::Function::New(env, WriteFilesToClipboard));
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
