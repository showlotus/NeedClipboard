#include <napi.h>
#include <windows.h>
//
#include <atomic>
#include <iostream>
#include <sstream>
#include <string>
#include <thread>
#include <vector>
//
#include <psapi.h>
#include <tlhelp32.h>

#pragma comment(lib, "version.lib")

std::atomic<bool> isRunning(false);
HWND hwnd = nullptr;
Napi::ThreadSafeFunction tsfn;

std::string getAppInfo(LPCVOID info, WORD language, WORD codePage, std::string field) {
    char query[256];
    char* str = nullptr;
    UINT strLen = 0;
    sprintf(query, "\\StringFileInfo\\%04x%04x\\%s", language, codePage, field.c_str());
    std::cout << query << std::endl;
    char* res = nullptr;
    UINT resLen = 0;
    if (VerQueryValueA(info, query, (LPVOID*)&res, &resLen)) {
        return std::string(res, resLen);
    }
    return "";
}

std::string GetAppNameFromFile(const std::string& filePath) {
    DWORD verHandle = 0;
    DWORD verSize = GetFileVersionInfoSizeA(filePath.c_str(), &verHandle);
    if (verSize == 0) {
        return "";
    }

    std::vector<char> verData(verSize);

    if (GetFileVersionInfoA(filePath.c_str(), verHandle, verSize, verData.data())) {
        VS_FIXEDFILEINFO* fileInfo = nullptr;
        UINT size = 0;
        if (VerQueryValueA(verData.data(), "\\", (LPVOID*)&fileInfo, &size) && size > 0) {
            struct LANGANDCODEPAGE {
                WORD wLanguage;
                WORD wCodePage;
            }* lpTranslate;
            UINT cbTranslate = 0;

            // 获取语言和编码信息，如果没有语言信息，则默认为英文
            if (!VerQueryValueA(verData.data(), "\\VarFileInfo\\Translation", (LPVOID*)&lpTranslate, &cbTranslate)) {
                // 0409 英文
                // 0804 中文
                // 04B0 Unicode 代码页
                lpTranslate->wLanguage = 0x0409;
                lpTranslate->wCodePage = 0x04B0;
                std::cout << "Error querying translation info" << std::endl;
            }

            if (fileInfo->dwSignature == 0xfeef04bd) {
                // TODO 判断是否为系统应用
                std::string::size_type isSystemApp = filePath.find(":\\Windows");
                if (isSystemApp != std::string::npos) {
                    std::cout << "is under Windows dir...." << std::endl;
                    // 1. 获取应用程序的描述
                    std::string fileDescription = getAppInfo(verData.data(), lpTranslate->wLanguage, lpTranslate->wCodePage, "FileDescription");
                    if (!fileDescription.empty()) {
                        return fileDescription;
                    }

                    // 2. 获取应用程序的产品名称
                    std::string productName = getAppInfo(verData.data(), lpTranslate->wLanguage, lpTranslate->wCodePage, "ProductName");
                    if (!productName.empty()) {
                        return productName;
                    }
                } else {
                    // 1. 获取应用程序的产品名称
                    std::string productName = getAppInfo(verData.data(), lpTranslate->wLanguage, lpTranslate->wCodePage, "ProductName");
                    if (!productName.empty()) {
                        return productName;
                    }

                    // 2. 获取应用程序的描述
                    std::string fileDescription = getAppInfo(verData.data(), lpTranslate->wLanguage, lpTranslate->wCodePage, "FileDescription");
                    if (!fileDescription.empty()) {
                        return fileDescription;
                    }
                }
            }
        }
    }
    std::cout << "no version info" << std::endl;
    return "";
}

// 移除 .exe 后缀
std::string removeExeSuffix(const std::string& str) {
    std::string exeSuffix = ".exe";
    if (str.length() >= exeSuffix.length()) {
        // 将后缀部分转换为小写，进行比较
        std::string processNameLower = str.substr(str.length() - exeSuffix.length());
        std::transform(processNameLower.begin(), processNameLower.end(), processNameLower.begin(), ::tolower);

        // 如果后缀是 ".exe"，则去掉
        if (processNameLower == exeSuffix) {
            return str.substr(0, str.length() - exeSuffix.length());
        }
    }
    return str;
}

// 获取进程名称
std::string GetProcessNameByPID(DWORD processID) {
    HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, processID);
    if (NULL == hProcess) {
        return "";
    }

    char processName[MAX_PATH] = "<unknown>";
    HMODULE hMod;
    DWORD cbNeeded;
    if (EnumProcessModules(hProcess, &hMod, sizeof(hMod), &cbNeeded)) {
        GetModuleBaseName(hProcess, hMod, processName, sizeof(processName) / sizeof(char));
    }
    CloseHandle(hProcess);
    return removeExeSuffix(processName);
}

// 获取进程可执行文件的路径
std::string GetProcessPath(DWORD processID) {
    char processPath[MAX_PATH] = {0};
    HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, processID);
    if (hProcess) {
        if (GetModuleFileNameExA(hProcess, NULL, processPath, MAX_PATH)) {
            CloseHandle(hProcess);
            return std::string(processPath);
        }
        CloseHandle(hProcess);
    }
    return "";
}

// 获取进程可执行文件的绝对路径
std::string GetProcessAbsolutePathByPID(DWORD processID) {
    HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, processID);
    if (NULL == hProcess) {
        return "";
    }

    std::string processPath = GetProcessPath(processID);
    if (!processPath.empty()) {
        return std::string(processPath);
    }

    CloseHandle(hProcess);
    return "";
}

// 枚举所有窗口
BOOL CALLBACK EnumWindowsProc(HWND hwnd, LPARAM lParam) {
    DWORD pid;
    GetWindowThreadProcessId(hwnd, &pid);

    if (pid == lParam) {
        // 检查窗口是否可见
        if (IsWindowVisible(hwnd)) {
            // std::cout << "Found a visible window for the process." << std::endl;
            return FALSE;  // 找到可见窗口后停止枚举
        }
    }
    return TRUE;  // 继续枚举窗口
}

// 判断是否是应用进程
// BUG 判断有问题，Windows 进程也会返回 true，可以用系统设置做测试
bool IsApplicationProcess(DWORD pid) {
    // 枚举所有窗口，检查是否有窗口属于该进程
    if (!EnumWindows(EnumWindowsProc, pid)) {
        // std::cout << "Has visible window found for the process." << std::endl;
        return true;  // 找到可见窗口，认为是前台应用
    }

    // std::cout << "No visible window found for the process." << std::endl;
    return false;  // 未找到窗口，认为是后台进程
}

// 获取父进程 ID
DWORD GetParentProcessId(DWORD pid) {
    HANDLE hProcessSnap;
    PROCESSENTRY32 pe32;
    pe32.dwSize = sizeof(PROCESSENTRY32);

    // 创建一个进程快照
    hProcessSnap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
    if (hProcessSnap == INVALID_HANDLE_VALUE) {
        return 0;
    }

    // 遍历进程快照
    if (Process32First(hProcessSnap, &pe32)) {
        do {
            if (pe32.th32ProcessID == pid) {
                DWORD parentPid = pe32.th32ParentProcessID;
                CloseHandle(hProcessSnap);
                return parentPid;
            }
        } while (Process32Next(hProcessSnap, &pe32));
    }

    CloseHandle(hProcessSnap);
    return 0;
}

// 剪贴板更新事件处理程序
LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    if (uMsg == WM_CLIPBOARDUPDATE) {
        if (OpenClipboard(hwnd)) {
            // 通知 JavaScript 剪贴板内容已更改
            // TODO 处理剪贴板更新事件，触发回调，传递参数
            tsfn.BlockingCall([](Napi::Env env, Napi::Function callback) {
                /**
                 * 剪贴板格式对应的常量：https://learn.microsoft.com/zh-cn/windows/win32/dataxchg/standard-clipboard-formats#constants
                 */
                Napi::String type = Napi::String::New(env, "");
                if (IsClipboardFormatAvailable(CF_UNICODETEXT)) {
                    type = Napi::String::New(env, "Text");
                } else if (IsClipboardFormatAvailable(CF_HDROP)) {
                    type = Napi::String::New(env, "File");
                } else if (IsClipboardFormatAvailable(CF_DIB)) {
                    type = Napi::String::New(env, "Image");
                }
                CloseClipboard();

                HWND clipboardOwner = GetClipboardOwner();
                if (clipboardOwner) {
                    DWORD processId;
                    GetWindowThreadProcessId(clipboardOwner, &processId);  // 获取窗口所属的进程ID

                    // 如果是后台进程则获取父进程
                    if (!IsApplicationProcess(processId)) {
                        processId = GetParentProcessId(processId);
                    }

                    std::string processPath = GetProcessAbsolutePathByPID(processId);
                    std::string processName = GetProcessNameByPID(processId);
                    std::string appName = GetAppNameFromFile(processPath);
                    std::string applicationName = !appName.empty() ? appName : processName;

                    Napi::String data = Napi::String::New(env, "xxx");
                    Napi::String source = Napi::String::New(env, processPath);
                    Napi::String app = Napi::String::New(env, applicationName);
                    callback.Call({type, data, source, app});
                }
            });
        }
        SendMessage(hwnd, WM_DRAWCLIPBOARD, wParam, lParam);
    }
    return DefWindowProc(hwnd, uMsg, wParam, lParam);
}

// 消息循环线程
void MessageLoop() {
    // 创建一个隐藏的窗口用于处理剪贴板事件
    const char* className = "ClipboardListener";
    WNDCLASS wc = {};
    wc.lpfnWndProc = WindowProc;
    wc.hInstance = GetModuleHandle(nullptr);
    wc.lpszClassName = className;
    RegisterClass(&wc);

    hwnd = CreateWindowEx(0, className, "Clipboard Listener", 0, 0, 0, 0, 0, HWND_MESSAGE, nullptr, GetModuleHandle(nullptr), nullptr);

    // 注册剪贴板监听
    AddClipboardFormatListener(hwnd);

    // 消息循环
    MSG msg;
    while (isRunning) {
        while (PeekMessage(&msg, nullptr, 0, 0, PM_REMOVE)) {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }
        Sleep(1000);
        // std::this_thread::sleep_for(std::chrono::milliseconds(500));
    }

    // 移除剪贴板监听
    RemoveClipboardFormatListener(hwnd);
    DestroyWindow(hwnd);
    UnregisterClass(className, GetModuleHandle(nullptr));
}

// 启动剪贴板监听
Napi::Value watch(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Function callback = info[0].As<Napi::Function>();

    if (isRunning) {
        Napi::TypeError::New(env, "Listener is already running").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    // 创建一个线程安全的回调函数
    tsfn = Napi::ThreadSafeFunction::New(env, callback, "ClipboardListener", 0, 1);

    // 启动消息循环线程
    isRunning = true;
    std::thread(MessageLoop).detach();

    return env.Undefined();
}

// 停止剪贴板监听
Napi::Value unwatch(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!isRunning) {
        Napi::TypeError::New(env, "Listener is not running").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    isRunning = false;

    // 关闭线程安全函数
    tsfn.Release();

    return env.Undefined();
}

// TODO 将剪贴板内容写入应用程序
Napi::Value write(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Number pid = info[0].As<Napi::Number>();

    return env.Undefined();
}

// 根据句柄激活窗口
Napi::Value activateWindow(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::string hwndStr = info[0].As<Napi::String>();
    unsigned long long hwndInt = std::stoull(hwndStr);
    HWND hwnd = reinterpret_cast<HWND>(hwndInt);
    // 检查窗口句柄是否有效
    if (!IsWindow(hwnd)) {
        return env.Undefined();
    }

    // 激活并聚焦窗口
    SetForegroundWindow(hwnd);
    SetFocus(hwnd);
    return env.Undefined();
}

// 获取当前窗口的句柄
Napi::Value getCurrentWindowHandle(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::ostringstream oss;
    HWND hwnd = GetForegroundWindow();
    oss << reinterpret_cast<uintptr_t>(hwnd);
    return Napi::String::New(env, oss.str());
}

// 初始化模块
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "watch"), Napi::Function::New(env, watch));
    exports.Set(Napi::String::New(env, "unwatch"), Napi::Function::New(env, unwatch));
    exports.Set(Napi::String::New(env, "getCurrentWindowHandle"), Napi::Function::New(env, getCurrentWindowHandle));
    exports.Set(Napi::String::New(env, "activateWindow"), Napi::Function::New(env, activateWindow));
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)