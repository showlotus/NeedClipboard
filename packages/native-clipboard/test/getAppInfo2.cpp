#include <windows.h>
#include <iostream>
#include <vector>
#include <psapi.h> // For GetModuleFileNameEx

// Link with Psapi.lib
#pragma comment(lib, "Psapi.lib")

// Helper function to get the path of the executable from a window handle
std::wstring GetExecutablePath(HWND hwnd) {
    DWORD processId;
    GetWindowThreadProcessId(hwnd, &processId);

    HANDLE processHandle = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, FALSE, processId);
    if (!processHandle) {
        return L"";
    }

    HMODULE hMod;
    DWORD cbNeeded;
    if (EnumProcessModules(processHandle, &hMod, sizeof(hMod), &cbNeeded)) {
        wchar_t path[MAX_PATH];
        if (GetModuleFileNameExW(processHandle, hMod, path, sizeof(path) / sizeof(wchar_t))) {
            CloseHandle(processHandle);
            return path;
        }
    }
    CloseHandle(processHandle);
    return L"";
}

// Function to get the icon of the application given the window handle
HICON GetAppIcon(HWND hwnd) {
    std::wstring exePath = GetExecutablePath(hwnd);
    if (exePath.empty()) {
        return NULL;
    }

    HICON hIconLarge;
    UINT iconCount = ExtractIconExW(exePath.c_str(), 0, &hIconLarge, NULL, 1);
    if (iconCount == 0) {
        return NULL;
    }
    return hIconLarge;
}

int main() {
    // Example: Find the window handle for the Calculator application
    HWND hwnd = FindWindowW(L"CalcFrame", NULL);
    if (!hwnd) {
        std::wcout << L"Could not find the Calculator window." << std::endl;
        return 1;
    }

    HICON hIcon = GetAppIcon(hwnd);
    if (!hIcon) {
        std::wcout << L"Could not get the icon." << std::endl;
        return 1;
    }

    // Here you can use the icon handle (hIcon) as needed, for example, draw it in a window or save it as an image.

    // Don't forget to destroy the icon when done
    DestroyIcon(hIcon);

    std::wcout << L"Successfully retrieved the icon." << std::endl;
    return 0;
}
