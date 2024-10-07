#include <napi.h>
#include <shlobj.h>
#include <windows.h>
#include <iostream>
#include <thread>
#include <vector>
// #include "listener.h"
// #include "stop.h"
// #include "getapp.h"

// HWND hwnd;
// HWND nextClipboardViewer;
// std::thread clipboardThread;

// // 辅助函数：获取剪贴板文本
// std::string GetClipboardText() {
//     if (!IsClipboardFormatAvailable(CF_UNICODETEXT))
//         return "";

//     if (!OpenClipboard(NULL))
//         return "";

//     HANDLE hData = GetClipboardData(CF_UNICODETEXT);
//     if (hData == NULL) {
//         CloseClipboard();
//         return "";
//     }

//     wchar_t* pText = static_cast<wchar_t*>(GlobalLock(hData));
//     std::wstring text(pText);
//     GlobalUnlock(hData);
//     CloseClipboard();

//     // 将宽字符转换为普通字符串
//     std::string result(text.begin(), text.end());
//     return result;
// }

// // 获取剪贴板文件路径
// std::vector<std::wstring> GetClipboardFiles() {
//     std::vector<std::wstring> filePaths;

//     if (!OpenClipboard(nullptr)) {
//         return filePaths;
//     }

//     HANDLE hData = GetClipboardData(CF_HDROP);
//     if (hData) {
//         HDROP hDrop = static_cast<HDROP>(GlobalLock(hData));
//         if (hDrop) {
//             UINT fileCount = DragQueryFileW(hDrop, 0xFFFFFFFF, nullptr, 0);
//             for (UINT i = 0; i < fileCount; ++i) {
//                 UINT pathLen = DragQueryFileW(hDrop, i, nullptr, 0) + 1;
//                 std::wstring filePath(pathLen, L'\0');
//                 DragQueryFileW(hDrop, i, &filePath[0], pathLen);
//                 filePath.resize(pathLen - 1);  // Remove the trailing null character
//                 filePaths.push_back(filePath);
//             }
//             GlobalUnlock(hData);
//         }
//     }
//     CloseClipboard();
//     return filePaths;
// }

// // 窗口过程，用于处理消息
// LRESULT CALLBACK WndProc(HWND hwnd, UINT message, WPARAM wParam, LPARAM lParam) {
//     switch (message) {
//         case WM_CREATE:
//             hClipboardViewer = SetClipboardViewer(hwnd);
//             return 0;

//         case WM_DRAWCLIPBOARD: {
//             if (OpenClipboard(hwnd)) {
//                 /**
//                  * 剪贴板格式对应的常量：https://learn.microsoft.com/zh-cn/windows/win32/dataxchg/standard-clipboard-formats#constants
//                  */
//                 if (IsClipboardFormatAvailable(CF_UNICODETEXT)) {
//                     std::string text = GetClipboardText();
//                     std::cout << "Clipboard text: " << text << std::endl;
//                 } else if (IsClipboardFormatAvailable(CF_HDROP)) {
//                     std::cout << "Clipboard file: " << std::endl;
//                     std::vector<std::wstring> files = GetClipboardFiles();
//                     for (size_t i = 0; i < files.size(); ++i) {
//                         // std::string filePath = files[i];
//                         std::string filePath(files[i].begin(), files[i].end());
//                         // filePaths[i] = Napi::String::New(env, filePath);
//                         std::cout << "Copied file: " << filePath << std::endl;
//                     }
//                     // for (const auto& file : files) {
//                     //     std::cout << "Copied file: " << file << std::endl;
//                     // }
//                 } else if (IsClipboardFormatAvailable(CF_DIB)) {
//                     // std::string base64Image = GetClipboardImageAsBase64();
//                     std::string base64Image = "";
//                     std::cout << "Clipboard image (Base64): " << base64Image << std::endl;
//                 }
//                 CloseClipboard();
//             }
//             SendMessage(hClipboardViewer, WM_DRAWCLIPBOARD, wParam, lParam);
//             return 0;
//         }

//         case WM_CHANGECBCHAIN:
//             if ((HWND)wParam == hClipboardViewer) {
//                 hClipboardViewer = (HWND)lParam;
//             } else {
//                 SendMessage(hClipboardViewer, WM_CHANGECBCHAIN, wParam, lParam);
//             }
//             return 0;

//         case WM_DESTROY:
//             ChangeClipboardChain(hwnd, hClipboardViewer);
//             PostQuitMessage(0);
//             return 0;

//         default:
//             return DefWindowProc(hwnd, message, wParam, lParam);
//     }
// }

bool isWatching = true;

// void ThreadFunction() {
//     while (isWatching) {
//         std::cout << "Thread is running..." << std::endl;
//         Sleep(100);
//         // std::this_thread::sleep_for(std::chrono::milliseconds(1000));  // 每秒打印一次
//     }
//     std::cout << "Thread is exiting..." << std::endl;  // 线程退出时的消息
// }

Napi::Value watch(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Function callback = info[0].As<Napi::Function>();

    // Napi::Boolean stop = Napi::Boolean::New(env, false);

    // std::thread thread(ThreadFunction);
    // thread.detach();  // 分离线程，让它独立运行

    Napi::String type = Napi::String::New(env, "Text");
    Napi::String data = Napi::String::New(env, "xafdasdfas");
    Napi::String source = Napi::String::New(env, "Chrome");

    callback.Call({type, data, source});

    // Napi::Function unwatch = Napi::Function::New(env, [](const Napi::CallbackInfo& innerInfo) mutable {
    //     Napi::Env innerEnv = innerInfo.Env();
    //     isWatching = false;
    //     // printf("%s", "stop................");
    //     return innerEnv.Undefined();
    // });

    return env.Undefined();
}

Napi::Value unwatch(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    return env.Undefined();
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "watch"),
                Napi::Function::New(env, watch));
    exports.Set(Napi::String::New(env, "unwatch"),
                Napi::Function::New(env, unwatch));
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)
