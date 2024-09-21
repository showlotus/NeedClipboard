#include <windows.h>
#include <iostream>
#include <string>
#include <thread>
#include <vector>

HWND hwnd;
HWND nextClipboardViewer;
std::thread clipboardThread;

LRESULT CALLBACK WindowProc(HWND hwnd,
                            UINT uMsg,
                            WPARAM wParam,
                            LPARAM lParam) {
  switch (uMsg) {
    case WM_DRAWCLIPBOARD:
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
    std::cout << "00" << std::endl;
  }

  DestroyWindow(hwnd);
}

int main() {
  //   clipboardThread = std::thread(ClipboardWatcherThread);

  ClipboardWatcherThread();
  return 0;
}
