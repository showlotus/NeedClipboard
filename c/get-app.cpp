#include <psapi.h>
#include <windows.h>
#include <iostream>
#include <string>
#include <vector>

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
  if (VerQueryValueW(versionData.data(), L"\\StringFileInfo\\040904b0\\FileDescription", &descriptionPtr, &len)) {
    return std::wstring((WCHAR*)descriptionPtr);
  }

  std::cout << "no FileDescription info" << std::endl;

  return L"";
}

int main() {
  DWORD processID = 9660;  // 替换为你要查询的进程ID

  HANDLE hProcess = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, processID);
  if (hProcess) {
    wchar_t processName[MAX_PATH] = {0};
    if (GetModuleFileNameExW(hProcess, NULL, processName, MAX_PATH)) {
      std::wcout << L"Process path: " << processName << std::endl;

      // 获取并打印文件的描述信息
      std::wstring description = GetProcessDescription(processName);
      if (!description.empty()) {
        std::wcout << L"Process description: " << description << std::endl;
      } else {
        std::wcout << L"Failed to retrieve process description." << std::endl;
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
