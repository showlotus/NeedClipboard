#include <napi.h>
#include <windows.h>
//
#include <atomic>
#include <chrono>
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
HWND hClipboardViewer = NULL;
Napi::ThreadSafeFunction tsfn;

std::string getAppInfo(LPCVOID info, WORD language, WORD codePage, std::string field) {
    char query[256];
    char* str = nullptr;
    UINT strLen = 0;
    sprintf(query, "\\StringFileInfo\\%04x%04x\\%s", language, codePage, field.c_str());
    // std::cout << query << std::endl;
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
    HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ | PROCESS_QUERY_LIMITED_INFORMATION, FALSE, processID);
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
    HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ | PROCESS_QUERY_LIMITED_INFORMATION, FALSE, processID);
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
    HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ | PROCESS_QUERY_LIMITED_INFORMATION, FALSE, processID);
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

std::wstring stringToWstring(const std::string& str) {
    int len = MultiByteToWideChar(CP_UTF8, 0, str.c_str(), -1, nullptr, 0);
    std::wstring wstr(len, L'\0');
    MultiByteToWideChar(CP_UTF8, 0, str.c_str(), -1, &wstr[0], len);
    return wstr;
}

// 获取剪贴板文本内容
std::string getClipboardText() {
    std::string utf8Text = "";
    // 优先尝试获取 Unicode 格式的文本（UTF-16）
    HANDLE hData = GetClipboardData(CF_UNICODETEXT);
    if (hData != nullptr) {
        // 锁定内存，获取宽字符文本指针
        wchar_t* pText = static_cast<wchar_t*>(GlobalLock(hData));
        if (pText != nullptr) {
            // 将宽字符文本（UTF-16）转换为 UTF-8 编码的 std::string
            int utf8Length = WideCharToMultiByte(CP_UTF8, 0, pText, -1, nullptr, 0, nullptr, nullptr);
            if (utf8Length > 0) {
                utf8Text.resize(utf8Length - 1);  // 去除末尾的空字符
                WideCharToMultiByte(CP_UTF8, 0, pText, -1, &utf8Text[0], utf8Length, nullptr, nullptr);
            }
            GlobalUnlock(hData);
        }
    }

    return utf8Text;
}

// 转为 UTF-8 格式
std::string convertToUtf8(const std::string& input) {
    // 将 std::string (ANSI) 转换为 std::wstring (UTF-16)
    int wideCharLength = MultiByteToWideChar(CP_ACP, 0, input.c_str(), -1, nullptr, 0);
    if (wideCharLength == 0) {
        return "";  // 转换失败，返回空字符串
    }

    std::wstring wideString(wideCharLength - 1, L'\0');  // 去掉 null 终止符
    MultiByteToWideChar(CP_ACP, 0, input.c_str(), -1, &wideString[0], wideCharLength);

    // 将 std::wstring (UTF-16) 转换为 std::string (UTF-8)
    int utf8Length = WideCharToMultiByte(CP_UTF8, 0, wideString.c_str(), -1, nullptr, 0, nullptr, nullptr);
    if (utf8Length == 0) {
        return "";  // 转换失败，返回空字符串
    }

    std::string utf8String(utf8Length - 1, '\0');  // 去掉 null 终止符
    WideCharToMultiByte(CP_UTF8, 0, wideString.c_str(), -1, &utf8String[0], utf8Length, nullptr, nullptr);

    return utf8String;
}

// 剪贴板更新事件处理程序
LRESULT CALLBACK WindowProc(HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam) {
    switch (message) {
        case WM_DRAWCLIPBOARD: {
            if (OpenClipboard(hwnd)) {
                /**
                 * 剪贴板格式对应的常量：https://learn.microsoft.com/zh-cn/windows/win32/dataxchg/standard-clipboard-formats#constants
                 */
                std::string clipboard_type = "";
                std::string clipboard_data = "";
                if (IsClipboardFormatAvailable(CF_UNICODETEXT)) {
                    clipboard_type = "TEXT";
                    clipboard_data = getClipboardText();
                } else if (IsClipboardFormatAvailable(CF_HDROP)) {
                    clipboard_type = "FILE";
                } else if (IsClipboardFormatAvailable(CF_DIB)) {
                    clipboard_type = "IMAGE";
                }
                CloseClipboard();
                // 通知 JavaScript 剪贴板内容已更改
                // TODO 处理剪贴板更新事件，触发回调，传递参数
                tsfn.BlockingCall([clipboard_type, clipboard_data](Napi::Env env, Napi::Function callback) {
                    if (clipboard_type == "") {
                        return;
                    }
                    HWND clipboardOwner = GetClipboardOwner();
                    if (clipboardOwner == NULL) {
                        clipboardOwner = GetForegroundWindow();
                    }
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

                        Napi::String type = Napi::String::New(env, clipboard_type);
                        Napi::String data = Napi::String::New(env, clipboard_data);
                        Napi::String source = Napi::String::New(env, convertToUtf8(processPath));
                        Napi::String app = Napi::String::New(env, convertToUtf8(applicationName));
                        callback.Call({type, data, source, app});
                    }
                });
            }

            // 通知下一个观察者
            if (hClipboardViewer != nullptr) {
                SendMessage(hClipboardViewer, message, wParam, lParam);
            }
            break;
        }

        case WM_DESTROY: {
            ChangeClipboardChain(hwnd, hClipboardViewer);
            PostQuitMessage(0);
            break;
        }
    }
    return DefWindowProc(hwnd, message, wParam, lParam);
}

// 启动剪贴板监听
Napi::Value watch(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Function callback = info[0].As<Napi::Function>();

    if (isRunning) {
        Napi::TypeError::New(env, "Listener is already running").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    // 创建 ThreadSafeFunction
    tsfn = Napi::ThreadSafeFunction::New(env, callback, "ClipboardWatcher", 0, 1);

    // 启动线程，创建窗口
    std::thread watcherThread([]() {
        HINSTANCE hInstance = GetModuleHandle(nullptr);
        const char* CLASS_NAME = "ClipboardListener";
        const char* WINDOW_NAME = "ClipboardWatcher Window";

        WNDCLASS wc = {};
        wc.lpfnWndProc = WindowProc;
        wc.hInstance = hInstance;
        wc.lpszClassName = CLASS_NAME;

        RegisterClass(&wc);

        hwnd = CreateWindowEx(
            0,
            CLASS_NAME,
            WINDOW_NAME,
            0,
            0, 0, 0, 0,
            NULL, NULL, hInstance, NULL
        );

        // 注册为剪贴板查看器
        hClipboardViewer = SetClipboardViewer(hwnd);

        // 进入消息循环
        MSG msg;
        while (isRunning && GetMessage(&msg, nullptr, 0, 0)) {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }

        // 清理
        if (hClipboardViewer != nullptr) {
            ChangeClipboardChain(hwnd, hClipboardViewer);
            hClipboardViewer = nullptr;
        }
        DestroyWindow(hwnd);
        tsfn.Release();
    });

    watcherThread.detach();

    // 启动消息循环线程
    isRunning = true;

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
    if (hwnd) {
        PostMessage(hwnd, WM_DESTROY, 0, 0);
    }

    return env.Undefined();
}

// TODO 将剪贴板内容写入应用程序
Napi::Value write(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Number pid = info[0].As<Napi::Number>();

    return env.Undefined();
}

// 根据句柄激活窗口
Napi::Value activateWindowByHandle(const Napi::CallbackInfo& info) {
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

// 根据句柄获取应用名称
Napi::Value getAppNameByHandle(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::string hwndStr = info[0].As<Napi::String>();
    unsigned long long hwndInt = std::stoull(hwndStr);
    HWND hwnd = reinterpret_cast<HWND>(hwndInt);
    // 检查窗口句柄是否有效
    if (!IsWindow(hwnd)) {
        return env.Undefined();
    }

    DWORD processId;
    GetWindowThreadProcessId(hwnd, &processId);  // 获取窗口所属的进程ID

    // 如果是后台进程则获取父进程
    if (!IsApplicationProcess(processId)) {
        processId = GetParentProcessId(processId);
    }

    std::string processPath = GetProcessAbsolutePathByPID(processId);
    std::string processName = GetProcessNameByPID(processId);
    std::string appName = GetAppNameFromFile(processPath);
    std::string applicationName = !appName.empty() ? appName : processName;

    return Napi::String::New(env, convertToUtf8(applicationName));
}

// 获取当前窗口的句柄
Napi::Value getCurrentWindowHandle(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    std::ostringstream oss;
    HWND hwnd = GetForegroundWindow();
    oss << reinterpret_cast<uintptr_t>(hwnd);
    return Napi::String::New(env, oss.str());
}

// 触发粘贴
Napi::Value triggerPaste(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    // Simulate CTRL+V key press
    INPUT inputs[4] = {};

    // Press CTRL
    inputs[0].type = INPUT_KEYBOARD;
    inputs[0].ki.wVk = VK_CONTROL;

    // Press V
    inputs[1].type = INPUT_KEYBOARD;
    inputs[1].ki.wVk = 'V';

    // Release V
    inputs[2].type = INPUT_KEYBOARD;
    inputs[2].ki.wVk = 'V';
    inputs[2].ki.dwFlags = KEYEVENTF_KEYUP;

    // Release CTRL
    inputs[3].type = INPUT_KEYBOARD;
    inputs[3].ki.wVk = VK_CONTROL;
    inputs[3].ki.dwFlags = KEYEVENTF_KEYUP;

    SendInput(4, inputs, sizeof(INPUT));
    return env.Undefined();
}

// 初始化模块
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "watch"), Napi::Function::New(env, watch));
    exports.Set(Napi::String::New(env, "unwatch"), Napi::Function::New(env, unwatch));
    exports.Set(Napi::String::New(env, "getCurrentWindowHandle"), Napi::Function::New(env, getCurrentWindowHandle));
    exports.Set(Napi::String::New(env, "activateWindowByHandle"), Napi::Function::New(env, activateWindowByHandle));
    exports.Set(Napi::String::New(env, "getAppNameByHandle"), Napi::Function::New(env, getAppNameByHandle));
    exports.Set(Napi::String::New(env, "triggerPaste"), Napi::Function::New(env, triggerPaste));
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
