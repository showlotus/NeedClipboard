#include <iostream>
#include <windows.h>

// https://learn.microsoft.com/zh-cn/windows/win32/api/winuser/nf-winuser-getforegroundwindow
// 使用输入面板自动完成 https://learn.microsoft.com/zh-cn/windows/win32/tablet/using-input-panel-autocomplete
// WM_PASTE 消息 https://learn.microsoft.com/zh-cn/windows/win32/dataxchg/wm-paste
// 标准剪贴板格式 https://learn.microsoft.com/zh-cn/windows/win32/dataxchg/standard-clipboard-formats
// https://learn.microsoft.com/zh-cn/windows/win32/api/winuser/nf-winuser-openclipboard
// https://blog.51cto.com/ikaros/6845024
// https://blog.csdn.net/iSunwish/article/details/87927192

// 通过 pid 获取窗口句柄
HWND GetHwndByPid(DWORD dwProcessID) {
    HWND h = GetTopWindow(0);
    HWND retHwnd = NULL;
    while (h) {
        DWORD pid = 0;
        DWORD dwTheardId = GetWindowThreadProcessId(h, &pid);
        if (dwTheardId != 0) {
            if (pid == dwProcessID && GetParent(h) == NULL && ::IsWindowVisible(h)) {
                retHwnd = h;    //会有多个相等值
            }
        }
        h = GetNextWindow(h, GW_HWNDNEXT);
    }
    return retHwnd;
}

// 模拟 Ctrl + V 事件触发粘贴
void simulatePaste() {
    keybd_event(VK_CONTROL, 0, 0, 0);
    keybd_event('V', 0, 0, 0);
    keybd_event('V', 0, KEYEVENTF_KEYUP, 0);
    keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, 0);
}

bool IsForegroundWindowFocused() {
    // 获取当前前台窗口的句柄
    HWND foregroundWindow = GetForegroundWindow();
    if (foregroundWindow == NULL) {
        std::cout << "无法获取前台窗口的句柄。" << std::endl;
        return false;
    }

    // 获取当前键盘焦点的窗口句柄
    HWND focusedWindow = GetFocus();
    if (focusedWindow == NULL) {
        // 键盘焦点不在当前线程的任何窗口上
        std::cout << "没有窗口有键盘焦点。" << std::endl;
        return false;
    }

    // 比较前台窗口和焦点窗口的句柄
    return (foregroundWindow == focusedWindow);
}

int main() {
    HWND hwnd = GetHwndByPid(12680);
    // HWND hwnd = GetHwndByPid(9224);
    // hwnd = GetForegroundWindow();
    SetForegroundWindow(hwnd);
    // Sleep(1000);
    // simulatePaste();
    
    // if (OpenClipboard(NULL)) {
    //     HANDLE hData = GetClipboardData(CF_TEXT);
    //     if (hData != NULL) {
    //         char* pszText = static_cast<char*>(GlobalLock(hData));
    //         if (pszText != NULL) {
    //             std::cout << "剪贴板内容: " << pszText << std::endl;
    //             GlobalUnlock(hData);
    //         }
    //     }
    //     CloseClipboard();
    // }
    // Sleep(500);
    if (GetFocus() == hwnd) {
        std::cout << "has focus" << std::endl;
    }
    if (OpenClipboard(NULL) && IsClipboardFormatAvailable(CF_TEXT)) {
        std::cout << "pasted" << std::endl;
        simulatePaste();
        // SendMessage(hwnd, WM_PASTE, 0, 0);
    }
    return 0;
}
