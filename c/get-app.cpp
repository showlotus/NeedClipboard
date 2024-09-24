#include <windows.h>
#include <iostream>
#include <string>
#include <vector>
#include "psapi.h"
#include "tlhelp32.h"

std::wstring GetProcessDescription(const std::wstring& filePath) {
  DWORD dummy;
  DWORD size = GetFileVersionInfoSizeW(filePath.c_str(), &dummy);
  if (size == 0) {
    return L"";
  }

  std::vector<BYTE> versionData(size);
  // if (!GetFileVersionInfoW(filePath.c_str(), 0, size, versionData.data())) {
  //   return L"";
  // }

  // VS_FIXEDFILEINFO* fileInfo = nullptr;
  UINT len = 0;
  // if (!VerQueryValueW(versionData.data(), L"\\", (LPVOID*)&fileInfo, &len)) {
  //   return L"";
  // }

  // 查找文件描述
  void* descriptionPtr = nullptr;
  if (VerQueryValueW(versionData.data(), L"\\StringFileInfo\\040904b0\\ProductName", &descriptionPtr, &len)) {
    return std::wstring((WCHAR*)descriptionPtr);
  }

  std::cout << "no FileDescription info" << std::endl;

  return L"";
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

bool IsApplicationProcess(DWORD pid) {
  // 枚举所有窗口，检查是否有窗口属于该进程
  if (!EnumWindows(EnumWindowsProc, pid)) {
    // std::cout << "Has visible window found for the process." << std::endl;
    return true;  // 找到可见窗口，认为是前台应用
  }

  // std::cout << "No visible window found for the process." << std::endl;
  return false;  // 未找到窗口，认为是后台进程
}

int main() {
  DWORD processID = 53524;  // MouseInc Webview
  // processID = 20748;        // MouseInc
  processID = 10964;  // Outlook

  if (!IsApplicationProcess(processID)) {
    processID = GetParentProcessId(processID);
  }

  // DWORD parentPid = GetParentProcessId(processID);

  // IsApplicationProcess(processID);
  // IsApplicationProcess(parentPid);

  // std::cout << "Parent Process ID: " << parentPid << std::endl;
  // std::cout << "GrandParent Process ID: " << GetParentProcessId(parentPid) << std::endl;
  HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, processID);
  if (hProcess) {
    char processPath[MAX_PATH] = {0};
    if (GetModuleFileNameExA(hProcess, NULL, processPath, MAX_PATH)) {
      std::cout << "Process path: " << processPath << std::endl;

      // 获取并打印文件的描述信息
      std::string appName = GetAppNameFromFile(processPath);
      if (!appName.empty()) {
        std::cout << "Process App Name: " << appName << std::endl;
      } else {
        std::cout << "Failed to retrieve process description." << std::endl;
      }
    } else {
      std::cerr << "Failed to get process file name." << std::endl;
    }
    CloseHandle(hProcess);
  } else {
    std::cerr << "Failed to open process." << std::endl;
  }

  return 0;
}
