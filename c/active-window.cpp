#include <windows.h>
#include <iostream>
#include <string>
#include <vector>
#include <shlobj.h>

// 函数：激活指定的窗口
void ActivateWindow(HWND hwnd) {
    // 检查窗口句柄是否有效
    if (!IsWindow(hwnd)) {
        std::cerr << "无效的窗口句柄" << std::endl;
        return;
    }

    // 激活并聚焦窗口
    SetForegroundWindow(hwnd);
    SetFocus(hwnd);
    std::cout << "窗口已激活" << std::endl;
}

HWND stringToHwnd(const std::string& hwndStr) {
    // 将字符串转换为 unsigned long long
    unsigned long long hwndInt = std::stoull(hwndStr);
    
    // 将 unsigned long long 转换为 HWND
    return reinterpret_cast<HWND>(hwndInt);
}

// 函数：聚焦并触发粘贴操作
void FocusAndPaste(HWND hwnd) {
    // 检查窗口句柄是否有效
    if (!IsWindow(hwnd)) {
        std::cerr << "无效的窗口句柄" << std::endl;
        return;
    }

    // 聚焦窗口
    SetForegroundWindow(hwnd);
    SetFocus(hwnd);

    // 发送 Ctrl+V（粘贴操作）
    INPUT inputs[4] = {};

    // Ctrl key down
    inputs[0].type = INPUT_KEYBOARD;
    inputs[0].ki.wVk = VK_CONTROL;

    // V key down
    inputs[1].type = INPUT_KEYBOARD;
    inputs[1].ki.wVk = 'V';

    // V key up
    inputs[2].type = INPUT_KEYBOARD;
    inputs[2].ki.wVk = 'V';
    inputs[2].ki.dwFlags = KEYEVENTF_KEYUP;

    // Ctrl key up
    inputs[3].type = INPUT_KEYBOARD;
    inputs[3].ki.wVk = VK_CONTROL;
    inputs[3].ki.dwFlags = KEYEVENTF_KEYUP;

    // 发送输入事件
    SendInput(ARRAYSIZE(inputs), inputs, sizeof(INPUT));

    std::cout << "粘贴操作已触发" << std::endl;
}

void PasteClipboard() {
    // 模拟 Ctrl + V
    keybd_event(VK_CONTROL, 0, 0, 0); // 按下 Ctrl
    keybd_event(0x56, 0, 0, 0);        // 按下 V
    keybd_event(0x56, 0, KEYEVENTF_KEYUP, 0); // 释放 V
    keybd_event(VK_CONTROL, 0, KEYEVENTF_KEYUP, 0); // 释放 Ctrl
}

void SimulatePaste() {
    INPUT inputs[4] = {};

    // 模拟按下 Ctrl 键
    inputs[0].type = INPUT_KEYBOARD;
    inputs[0].ki.wVk = VK_CONTROL;

    // 模拟按下 V 键
    inputs[1].type = INPUT_KEYBOARD;
    inputs[1].ki.wVk = 'V';

    // 模拟释放 V 键
    inputs[2].type = INPUT_KEYBOARD;
    inputs[2].ki.wVk = 'V';
    inputs[2].ki.dwFlags = KEYEVENTF_KEYUP;

    // 模拟释放 Ctrl 键
    inputs[3].type = INPUT_KEYBOARD;
    inputs[3].ki.wVk = VK_CONTROL;
    inputs[3].ki.dwFlags = KEYEVENTF_KEYUP;

    // 发送输入事件
    SendInput(ARRAYSIZE(inputs), inputs, sizeof(INPUT));
}

void PostPasteMessage(HWND hwnd) {
    // HWND hwnd = FindWindow("CabinetWClass", NULL);
    if (hwnd) {
        // 模拟 Ctrl + V 组合键
        PostMessage(hwnd, WM_KEYDOWN, VK_CONTROL, 0);
        PostMessage(hwnd, WM_KEYDOWN, 'V', 0);
        PostMessage(hwnd, WM_KEYUP, 'V', 0);
        PostMessage(hwnd, WM_KEYUP, VK_CONTROL, 0);
    } else {
        std::cerr << "未找到文件资源管理器窗口" << std::endl;
    }
}

void SetTextToClipboard(const std::string& text) {
    // 打开剪贴板
    if (OpenClipboard(NULL)) {
        // 清空剪贴板
        EmptyClipboard();

        // 分配内存并复制文本到剪贴板
        HGLOBAL hGlob = GlobalAlloc(GMEM_MOVEABLE, text.size() + 1);
        if (hGlob) {
            char* pGlobal = static_cast<char*>(GlobalLock(hGlob));
            memcpy(pGlobal, text.c_str(), text.size() + 1);
            GlobalUnlock(hGlob);

            // 将数据放入剪贴板
            SetClipboardData(CF_TEXT, hGlob);
        }
        CloseClipboard();
    }
}

void SetFilesToClipboard(const std::vector<std::string>& files) {
    // 打开剪贴板
    if (OpenClipboard(NULL)) {
        // 清空剪贴板
        EmptyClipboard();

        // 分配内存以存储文件列表
        size_t totalSize = 0;
        for (const auto& file : files) {
            totalSize += file.size() + 1; // +1 for null terminator
        }

        HGLOBAL hGlob = GlobalAlloc(GMEM_MOVEABLE, totalSize + sizeof(DROPFILES));
        if (hGlob) {
            DROPFILES* dropFiles = static_cast<DROPFILES*>(GlobalLock(hGlob));
            dropFiles->pFiles = sizeof(DROPFILES);
            dropFiles->fWide = FALSE; // 这里使用 ANSI
            char* pFiles = reinterpret_cast<char*>(dropFiles + 1);
            size_t offset = 0;

            for (const auto& file : files) {
                memcpy(pFiles + offset, file.c_str(), file.size());
                offset += file.size();
                pFiles[offset++] = '\0'; // null terminator
            }
            GlobalUnlock(hGlob);

            // 将文件列表放入剪贴板
            SetClipboardData(CF_HDROP, hGlob);
        }
        CloseClipboard();
    }
}

int main() {
    // 设置控制台输出为 UTF-8
    SetConsoleOutputCP(CP_UTF8);

    std::string hwnd_str = "459976"; // notepad
    // hwnd_str = "66576"; // clash verge
    // hwnd_str = "787890"; // edge
    // hwnd_str = "525460"; // explorer
    // hwnd_str = "52546011"; // error hwnd
    HWND hwnd = stringToHwnd(hwnd_str);
    std::cout << hwnd << std::endl;
    std::cout << hwnd_str << std::endl;

    // 写入纯文本到剪贴板
    SetTextToClipboard("\nxxxx\nyyyy");

    // 写入文件到剪贴板
    // std::vector<std::string> files = { "C:\\Users\\showlotus\\Desktop\\WinCode\\t1.txt" };
    // SetFilesToClipboard(files);

    ActivateWindow(hwnd);
    // Sleep(3000);
    // 3 种粘贴触发方式，都无法触发文件的粘贴
    // PasteClipboard();
    SimulatePaste();
    // PostPasteMessage(hwnd);
    return 0;
}
