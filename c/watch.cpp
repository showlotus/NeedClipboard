#include <windows.h>
#include <iostream>
#include <string>
#include <vector>

HWND hClipboardViewer = NULL;
boolean isFirst = true;

// 窗口过程，用于处理消息
LRESULT CALLBACK WndProc(HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam) {
    std::cout << "Message: " << message << std::endl;
    switch (message) {
        case WM_CREATE:
            std::cout << "WM_CREATE: " << message << std::endl;
            hClipboardViewer = SetClipboardViewer(hwnd);
            break;

        case WM_DRAWCLIPBOARD: {
            std::cout << "WM_DRAWCLIPBOARD: " << message << std::endl;
            if (isFirst) {
                isFirst = false;
                return 0;
            }
            if (OpenClipboard(hwnd)) {
                /**
                 * 剪贴板格式对应的常量：https://learn.microsoft.com/zh-cn/windows/win32/dataxchg/standard-clipboard-formats#constants
                 */
                if (IsClipboardFormatAvailable(CF_UNICODETEXT)) {
                    std::cout << "Clipboard Data is [Text]" << std::endl;
                } else if (IsClipboardFormatAvailable(CF_HDROP)) {
                    std::cout << "Clipboard Data is [File]" << std::endl;
                } else if (IsClipboardFormatAvailable(CF_DIB)) {
                    std::cout << "Clipboard Data is [Image]" << std::endl;
                }
                CloseClipboard();
            }
            SendMessage(hClipboardViewer, WM_DRAWCLIPBOARD, wParam, lParam);
            break;
        }

        case WM_CHANGECBCHAIN:
            std::cout << "WM_CHANGECBCHAIN: " << message << std::endl;
            if ((HWND)wParam == hClipboardViewer) {
                hClipboardViewer = (HWND)lParam;
            } else {
                SendMessage(hClipboardViewer, WM_CHANGECBCHAIN, wParam, lParam);
            }
            break;

        case WM_DESTROY:
            std::cout << "WM_DESTROY: " << message << std::endl;
            ChangeClipboardChain(hwnd, hClipboardViewer);
            PostQuitMessage(0);

        default:
            return DefWindowProc(hwnd, message, wParam, lParam);
    }
    return 0;
}

int main() {
    const char* CLASS_NAME = "ClipboardWatcher";
    WNDCLASS wc = {};
    wc.lpfnWndProc = WndProc;
    wc.hInstance = GetModuleHandle(NULL);
    wc.lpszClassName = CLASS_NAME;

    RegisterClass(&wc);

    // 创建一个窗口
    HWND hwnd = CreateWindowEx(
        0,
        CLASS_NAME,
        "Clipboard Watcher",
        0,
        0, 0, 0, 0,
        HWND_MESSAGE,
        NULL,
        GetModuleHandle(NULL),
        NULL
    );

    if (!hwnd) {
        std::cerr << "Failed to create window!" << std::endl;
        return 1;
    }

    MSG msg = {};
    // 监听消息
    while (GetMessage(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return 0;
}
