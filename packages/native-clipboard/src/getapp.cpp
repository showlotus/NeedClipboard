#include <napi.h>
#include <windows.h>
#include <psapi.h>
#include <string>

#pragma comment(lib, "Psapi.lib")

// 获取进程的路径
std::string GetProcessPath(DWORD processID) {
    char path[MAX_PATH];
    HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, processID);
    if (hProcess) {
        if (GetModuleFileNameExA(hProcess, NULL, path, MAX_PATH)) {
            CloseHandle(hProcess);
            return path;
        }
        CloseHandle(hProcess);
    }
    return "";
}

// 获取应用程序的图标路径
std::string GetIconPath(const std::string& exePath) {
    // Here we're just returning the executable path as a placeholder.
    // Extracting the actual icon path involves more complex operations.
    return exePath;
}

Napi::Value GetCursorAppInfo(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    POINT pt;
    GetCursorPos(&pt);
    HWND hwnd = WindowFromPoint(pt);

    std::string title;
    DWORD pid = 0;
    std::string exePath;
    std::string iconPath = "Default Icon";

    if (hwnd != NULL) {
        char buffer[256];
        title.clear();

        // 获取窗口标题
        if (GetWindowText(hwnd, buffer, sizeof(buffer))) {
            title = buffer;
        }

        // 获取进程ID
        GetWindowThreadProcessId(hwnd, &pid);

        // 获取进程路径
        exePath = GetProcessPath(pid);

        // 获取图标路径
        iconPath = GetIconPath(exePath);
    }

    Napi::Object result = Napi::Object::New(env);
    result.Set(Napi::String::New(env, "title"), Napi::String::New(env, title));
    result.Set(Napi::String::New(env, "icon"), Napi::String::New(env, iconPath));

    return result;
}
