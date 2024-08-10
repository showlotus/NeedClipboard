#include <iostream>
#include <windows.h>
#include <psapi.h>
#include <tchar.h>

void GetActiveWindowIconPath() {
    HWND hwnd = GetForegroundWindow();
    if (hwnd) {
        DWORD processId;
        GetWindowThreadProcessId(hwnd, &processId);
        
        HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, processId);
        if (hProcess) {
            TCHAR exePath[MAX_PATH];
            if (GetModuleFileNameEx(hProcess, NULL, exePath, MAX_PATH)) {
                std::wcout << L"Executable Path: " << exePath << std::endl;

                // The icon is typically stored in the executable itself.
                std::wcout << L"Icon Path: " << exePath << std::endl;
            } else {
                std::cerr << "Failed to get executable path." << std::endl;
            }
            CloseHandle(hProcess);
        } else {
            std::cerr << "Failed to open process." << std::endl;
        }
    } else {
        std::cerr << "No active window found." << std::endl;
    }
    std::cout << "------------------------------------------" << std::endl;
}

void PrintActiveWindowTitle() {
    HWND hwnd = GetForegroundWindow(); // 获取当前活动窗口的句柄
    if (hwnd) {
        char title[256];
        GetWindowText(hwnd, title, sizeof(title)); // 获取窗口标题
        std::cout << "Current Active Window Title: " << title << std::endl;
        
        DWORD processId;
        GetWindowThreadProcessId(hwnd, &processId); // 获取窗口所属的进程ID
        std::cout << "Process ID: " << processId << std::endl;
    } else {
        std::cout << "No active window found." << std::endl;
    }
}

int main() {
    while (true) {
        PrintActiveWindowTitle();
        GetActiveWindowIconPath();
        Sleep(1000); // 每秒获取一次活动窗口信息
    }
    return 0;
}
