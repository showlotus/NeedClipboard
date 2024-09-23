#include <ShlObj.h>  // 用于拖放文件格式
#include <windows.h>
#include <iostream>
#include <string>
#include <vector>
// #include <atlbase.h>
// #include <atlimage.h>
#include <sstream>

HWND hClipboardViewer = NULL;

// 辅助函数：将图片数据转换为 Base64
std::string base64_encode(const unsigned char* data, size_t len) {
  static const char base64_chars[] =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "abcdefghijklmnopqrstuvwxyz"
    "0123456789+/";

  std::string result;
  result.reserve(((len / 3) + (len % 3 > 0)) * 4);

  unsigned int val = 0;
  int valb = -6;
  for (size_t i = 0; i < len; ++i) {
    val = (val << 8) + data[i];
    valb += 8;
    while (valb >= 0) {
      result.push_back(base64_chars[(val >> valb) & 0x3F]);
      valb -= 6;
    }
  }

  if (valb > -6)
    result.push_back(base64_chars[((val << 8) >> (valb + 8)) & 0x3F]);
  while (result.size() % 4)
    result.push_back('=');
  return result;
}

// 辅助函数：获取剪贴板文本
std::string GetClipboardText() {
  if (!IsClipboardFormatAvailable(CF_UNICODETEXT))
    return "";

  if (!OpenClipboard(NULL))
    return "";

  HANDLE hData = GetClipboardData(CF_UNICODETEXT);
  if (hData == NULL) {
    CloseClipboard();
    return "";
  }

  wchar_t* pText = static_cast<wchar_t*>(GlobalLock(hData));
  std::wstring text(pText);
  GlobalUnlock(hData);
  CloseClipboard();

  // 将宽字符转换为普通字符串
  std::string result(text.begin(), text.end());
  return result;
}

// 获取剪贴板文件路径
std::vector<std::wstring> GetClipboardFiles() {
  // std::vector<std::string> files;

  // // 检查剪贴板是否含有文件
  // if (!IsClipboardFormatAvailable(CF_HDROP)) return files;

  // // 打开剪贴板
  // if (!OpenClipboard(NULL)) return files;

  // // 获取剪贴板中的文件数据
  // HDROP hDrop = (HDROP)GetClipboardData(CF_HDROP);
  // if (hDrop == NULL) {
  //     CloseClipboard();
  //     return files;
  // }

  // // 获取文件数量
  // UINT fileCount = DragQueryFileA(hDrop, 0xFFFFFFFF, NULL, 0);
  // char filePath[MAX_PATH];

  // // 遍历每个文件并获取文件路径
  // for (UINT i = 0; i < fileCount; ++i) {
  //     DragQueryFileA(hDrop, i, filePath, MAX_PATH);
  //     files.push_back(std::string(filePath));
  // }

  // CloseClipboard();
  // return files;
  std::vector<std::wstring> filePaths;

  if (!OpenClipboard(nullptr)) {
    return filePaths;
  }

  HANDLE hData = GetClipboardData(CF_HDROP);
  if (hData) {
    HDROP hDrop = static_cast<HDROP>(GlobalLock(hData));
    if (hDrop) {
      UINT fileCount = DragQueryFileW(hDrop, 0xFFFFFFFF, nullptr, 0);
      for (UINT i = 0; i < fileCount; ++i) {
        UINT pathLen = DragQueryFileW(hDrop, i, nullptr, 0) + 1;
        std::wstring filePath(pathLen, L'\0');
        DragQueryFileW(hDrop, i, &filePath[0], pathLen);
        filePath.resize(pathLen - 1);  // Remove the trailing null character
        filePaths.push_back(filePath);
      }
      GlobalUnlock(hData);
    }
  }
  CloseClipboard();
  return filePaths;
}

// 辅助函数：获取剪贴板中的图片并转换为 Base64
std::string GetClipboardImageAsBase64() {
  if (!IsClipboardFormatAvailable(CF_DIB))
    return "";

  if (!OpenClipboard(NULL))
    return "";

  HANDLE hData = GetClipboardData(CF_DIB);
  if (hData == NULL) {
    CloseClipboard();
    return "";
  }

  BITMAPINFO* bmpInfo = (BITMAPINFO*)GlobalLock(hData);
  int width = bmpInfo->bmiHeader.biWidth;
  int height = bmpInfo->bmiHeader.biHeight;
  int bitsPerPixel = bmpInfo->bmiHeader.biBitCount;

  // 仅支持 24 位和 32 位图像
  if (bitsPerPixel != 24 && bitsPerPixel != 32) {
    GlobalUnlock(hData);
    CloseClipboard();
    return "";
  }

  // 获取图片像素数据
  unsigned char* pixelData = (unsigned char*)bmpInfo + bmpInfo->bmiHeader.biSize;
  size_t pixelDataSize = width * height * (bitsPerPixel / 8);

  // 转换为 Base64
  std::string base64Image = base64_encode(pixelData, pixelDataSize);

  GlobalUnlock(hData);
  CloseClipboard();
  return base64Image;
}

// 窗口过程，用于处理消息
LRESULT CALLBACK WndProc(HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam) {
  switch (message) {
    case WM_CREATE:
      hClipboardViewer = SetClipboardViewer(hwnd);
      return 0;

    case WM_DRAWCLIPBOARD: {
      if (OpenClipboard(hwnd)) {
        /**
         * 剪贴板格式对应的常量：https://learn.microsoft.com/zh-cn/windows/win32/dataxchg/standard-clipboard-formats#constants
         */
        if (IsClipboardFormatAvailable(CF_UNICODETEXT)) {
          std::string text = GetClipboardText();
          std::cout << "Clipboard text: " << text << std::endl;
        } else if (IsClipboardFormatAvailable(CF_HDROP)) {
          std::cout << "Clipboard file: " << std::endl;
          std::vector<std::wstring> files = GetClipboardFiles();
          for (size_t i = 0; i < files.size(); ++i) {
            // std::string filePath = files[i];
            std::string filePath(files[i].begin(), files[i].end());
            // filePaths[i] = Napi::String::New(env, filePath);
            std::cout << "Copied file: " << filePath << std::endl;
          }
          // for (const auto& file : files) {
          //     std::cout << "Copied file: " << file << std::endl;
          // }
        } else if (IsClipboardFormatAvailable(CF_DIB)) {
          // std::string base64Image = GetClipboardImageAsBase64();
          std::string base64Image = "";
          std::cout << "Clipboard image (Base64): " << base64Image << std::endl;
        }
        CloseClipboard();
      }
      SendMessage(hClipboardViewer, WM_DRAWCLIPBOARD, wParam, lParam);
      return 0;
    }

    case WM_CHANGECBCHAIN:
      if ((HWND)wParam == hClipboardViewer) {
        hClipboardViewer = (HWND)lParam;
      } else {
        SendMessage(hClipboardViewer, WM_CHANGECBCHAIN, wParam, lParam);
      }
      return 0;

    case WM_DESTROY:
      ChangeClipboardChain(hwnd, hClipboardViewer);
      PostQuitMessage(0);
      return 0;

    default:
      return DefWindowProc(hwnd, message, wParam, lParam);
  }
}

int main() {
  WNDCLASS wc = {};
  wc.lpfnWndProc = WndProc;
  wc.hInstance = GetModuleHandle(NULL);
  wc.lpszClassName = "ClipboardViewerClass";

  RegisterClass(&wc);

  HWND hwnd = CreateWindowEx(
    0,
    "ClipboardViewerClass",
    "Clipboard Viewer",
    0,
    0, 0, 0, 0,
    HWND_MESSAGE,
    NULL,
    GetModuleHandle(NULL),
    NULL);

  if (!hwnd) {
    std::cerr << "Failed to create window!" << std::endl;
    return 1;
  }

  MSG msg = {};
  while (GetMessage(&msg, NULL, 0, 0)) {
    TranslateMessage(&msg);
    DispatchMessage(&msg);
  }

  return 0;
}
