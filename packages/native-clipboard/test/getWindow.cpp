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

int main() {
    HWND hwnd = GetHwndByPid(124200);
    // hwnd = GetForegroundWindow();
    SetForegroundWindow(hwnd);
    Sleep(1000);
    if (OpenClipboard(NULL)) {
        if (IsClipboardFormatAvailable(CF_TEXT)) {
            std::cout << "pasted" << std::endl;
            SendMessage(hwnd, WM_PASTE, 0, 0);
        }
    }
    // BringWindowToTop(hwnd);
    return 0;
}
