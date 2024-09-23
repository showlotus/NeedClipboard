#include <windows.h>
#include <psapi.h>
#include <iostream>
#include <string>
#include <vector>
#include <algorithm> 

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
      if (fileInfo->dwSignature == 0xfeef04bd) {
        char* productName = nullptr;
        UINT productNameLen = 0;
        // 查找应用程序的名称
        if (VerQueryValueA(verData.data(), "\\StringFileInfo\\040904B0\\ProductName", (LPVOID*)&productName, &productNameLen)) {
          return std::string(productName, productNameLen);
        }

        char* description = nullptr;
        UINT descriptionLen = 0;
        // 查找应用程序的描述
        if (VerQueryValueA(verData.data(), "\\StringFileInfo\\040904B0\\FileDescription", (LPVOID*)&description, &descriptionLen)) {
          return std::string(description, descriptionLen);
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

        // HWND activeWindow = GetForegroundWindow();
        // TODO 获取到的是 webview 子进程
        HWND clipboardOwner = GetClipboardOwner();
        if (clipboardOwner) {
          char title[256];
          GetWindowText(clipboardOwner, title, sizeof(title));  // 获取窗口标题
          std::cout << "Current Active Window Title: " << title << std::endl;

          DWORD processId;
          GetWindowThreadProcessId(clipboardOwner, &processId);  // 获取窗口所属的进程ID
          HWND hwndParent = GetParent(clipboardOwner);
          DWORD parentProcessId;
          std::string processPath = GetProcessAbsolutePathByPID(processId);
          std::string processName = GetProcessNameByPID(processId);
          std::string appName = GetAppNameFromFile(processPath);
          std::string applicationName = !appName.empty() ? appName : processName;
          std::cout << "Process ID: " << processId << std::endl;
          // TODO 无法获取系统应用
          std::cout << "Process Path: " << processPath << std::endl;
          // std::cout << "Process Name: " << processName << std::endl;
          std::cout << "Application Name: [" << applicationName << "]" << std::endl;
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
