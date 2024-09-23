#include <windows.h>
#include <iostream>
#include <string>
#include <vector>
#include "psapi.h"

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

// 从文件中提取产品名称
std::string GetAppNameFromFile(const std::string& filePath) {
  DWORD verHandle = 0;
  // DWORD verSize = GetFileVersionInfoSizeA(filePath.c_str(), &verHandle);
  // if (verSize == 0) {
  //   return "";
  // }

  // std::vector<char> verData(verSize);

  // if (GetFileVersionInfoA(filePath.c_str(), verHandle, verSize, verData.data())) {
  //   VS_FIXEDFILEINFO* fileInfo = nullptr;
  //   UINT size = 0;
  //   if (VerQueryValueA(verData.data(), "\\", (LPVOID*)&fileInfo, &size) && size > 0) {
  //     if (fileInfo->dwSignature == 0xfeef04bd) {
  //       // 查找产品名称
  //       char* productName = nullptr;
  //       UINT productNameLen = 0;
  //       if (VerQueryValueA(verData.data(), "\\StringFileInfo\\040904B0\\ProductName", (LPVOID*)&productName, &productNameLen)) {
  //         return std::string(productName, productNameLen);
  //       }
  //     }
  //   }
  // }
  return "";
}

std::string GetProcessNameByPID(DWORD processID) {
  HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, processID);
  if (NULL == hProcess) {
    return "";
  }

  char processName[MAX_PATH] = "<unknown>";

  // 获取进程名称
  if (hProcess) {
    HMODULE hMod;
    DWORD cbNeeded;
    if (EnumProcessModules(hProcess, &hMod, sizeof(hMod), &cbNeeded)) {
      GetModuleBaseName(hProcess, hMod, processName, sizeof(processName) / sizeof(char));
    }

    std::string processPath = GetProcessPath(processID);
    if (!processPath.empty()) {
      return std::string(processPath);
    }
  }

  CloseHandle(hProcess);

  return std::string(processName);
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

        HWND activeWindow = GetForegroundWindow();
        if (activeWindow) {
          char title[256];
          GetWindowText(activeWindow, title, sizeof(title));  // 获取窗口标题
          std::cout << "Current Active Window Title: " << title << std::endl;

          DWORD processId;
          GetWindowThreadProcessId(activeWindow, &processId);  // 获取窗口所属的进程ID
          std::string processName = GetProcessNameByPID(processId);
          std::cout << "Process ID: " << processId << std::endl;
          // TODO 无法获取系统应用
          std::cout << "Process Name: " << processName << std::endl;
          std::cout << "Application Name: " << GetAppNameFromFile(processName) << std::endl;

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
