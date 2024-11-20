#include <windows.h>
#include <algorithm>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
//
#include <psapi.h>
#include <tlhelp32.h>

HWND hClipboardViewer = NULL;
boolean isFirst = true;

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

// 窗口过程，用于处理消息
LRESULT CALLBACK WndProc(HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam) {
    std::cout << "-------------------" << std::endl;
    std::cout << "Message: " << message << std::endl;
    switch (message) {
        case WM_CREATE:
            std::cout << "WM_CREATE: " << message << std::endl;
            hClipboardViewer = SetClipboardViewer(hwnd);
            break;

        case WM_DRAWCLIPBOARD: {
            // BUG 关闭窗口时，会再次触发一次？？？
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

                HWND clipboardOwner = GetClipboardOwner();
                if (clipboardOwner == NULL) {
                    clipboardOwner = GetForegroundWindow();
                }
                if (clipboardOwner) {
                    char title[256];
                    GetWindowText(clipboardOwner, title, sizeof(title));  // 获取窗口标题
                    std::cout << "Current Active Window Title: " << title << std::endl;

                    DWORD processId;
                    GetWindowThreadProcessId(clipboardOwner, &processId);  // 获取窗口所属的进程ID

                    // 如果是后台进程则获取父进程
                    if (!IsApplicationProcess(processId)) {
                        processId = GetParentProcessId(processId);
                    }
                    // HWND hwndParent = GetParent(clipboardOwner);
                    // DWORD parentProcessId;
                    std::string processPath = GetProcessAbsolutePathByPID(processId);
                    std::string processName = GetProcessNameByPID(processId);
                    std::string appName = GetAppNameFromFile(processPath);
                    std::string applicationName = !appName.empty() ? appName : processName;
                    std::cout << "Process ID: " << processId << std::endl;
                    std::cout << "Process Path: " << processPath << std::endl;
                    // std::cout << "Process Name: " << processName << std::endl;
                    std::cout << "Application Name: " << applicationName << std::endl;
                    std::cout << "-------------------" << std::endl;
                }
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
    const char* WINDOW_NAME = "ClipboardWatcher Window";
    WNDCLASS wc = {};
    wc.lpfnWndProc = WndProc;
    wc.hInstance = GetModuleHandle(NULL);
    wc.lpszClassName = CLASS_NAME;

    RegisterClass(&wc);

    // 创建一个窗口
    HWND hwnd = CreateWindowEx(
        0,
        CLASS_NAME,
        WINDOW_NAME,
        0,
        0, 0, 100, 100,
        HWND_MESSAGE,
        NULL,
        GetModuleHandle(NULL),
        NULL);

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
