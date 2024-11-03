#include <napi.h>
#include <windows.h>
#include <string>
#include <thread>
#include <atomic>

std::atomic<bool> keepRunning;
HWND hWnd;
HWND nextClipboardViewer;
Napi::ThreadSafeFunction tsfn;

// 获取剪贴板文本内容
std::string getClipboardText() {
    if (!OpenClipboard(nullptr)) return "";

    HANDLE hData = GetClipboardData(CF_TEXT);
    if (hData == nullptr) {
        CloseClipboard();
        return "";
    }

    char* pszText = static_cast<char*>(GlobalLock(hData));
    if (pszText == nullptr) {
        CloseClipboard();
        return "";
    }

    std::string text(pszText);

    GlobalUnlock(hData);
    CloseClipboard();

    return text;
}

// 窗口过程函数，用于处理剪贴板变化消息
LRESULT CALLBACK WindowProc(HWND hwnd, UINT uMsg, WPARAM wParam, LPARAM lParam) {
    switch (uMsg) {
        case WM_DRAWCLIPBOARD: {
            // 获取剪贴板内容
            std::string clipboardText = "";

            // 使用 ThreadSafeFunction 将数据传递到主线程
            tsfn.BlockingCall([clipboardText](Napi::Env env, Napi::Function jsCallback) {
                jsCallback.Call({Napi::String::New(env, clipboardText)});
            });

            // 通知下一个观察者
            if (nextClipboardViewer != nullptr) {
                SendMessage(nextClipboardViewer, uMsg, wParam, lParam);
            }
            break;
        }
        case WM_DESTROY: {
            ChangeClipboardChain(hwnd, nextClipboardViewer);
            PostQuitMessage(0);
            break;
        }
    }
    return DefWindowProc(hwnd, uMsg, wParam, lParam);
}

// 启动剪贴板监听
Napi::Value watch(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    // 检查回调函数参数
    if (!info[0].IsFunction()) {
        Napi::TypeError::New(env, "Expected a function").ThrowAsJavaScriptException();
        return env.Null();
    }

    Napi::Function callback = info[0].As<Napi::Function>();
    keepRunning = true;

    // 创建 ThreadSafeFunction
    tsfn = Napi::ThreadSafeFunction::New(env, callback, "ClipboardWatcher", 0, 1);

    // 启动线程，创建窗口
    std::thread watcherThread([]() {
        HINSTANCE hInstance = GetModuleHandle(nullptr);
        const char CLASS_NAME[] = "ClipboardWatcher";

        WNDCLASS wc = {};
        wc.lpfnWndProc = WindowProc;
        wc.hInstance = hInstance;
        wc.lpszClassName = CLASS_NAME;

        RegisterClass(&wc);

        hWnd = CreateWindowEx(
            0,
            CLASS_NAME,
            "Clipboard Watcher",
            0,
            CW_USEDEFAULT, CW_USEDEFAULT, CW_USEDEFAULT, CW_USEDEFAULT,
            nullptr, nullptr, hInstance, nullptr
        );

        // 注册为剪贴板查看器
        nextClipboardViewer = SetClipboardViewer(hWnd);

        // 进入消息循环
        MSG msg;
        while (keepRunning && GetMessage(&msg, nullptr, 0, 0)) {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }

        // 清理
        if (nextClipboardViewer != nullptr) {
            ChangeClipboardChain(hWnd, nextClipboardViewer);
            nextClipboardViewer = nullptr;
        }
        DestroyWindow(hWnd);
        tsfn.Release();
    });

    watcherThread.detach();

    return Napi::Boolean::New(env, true);
}

// 停止剪贴板监听
Napi::Value unwatch(const Napi::CallbackInfo& info) {
    keepRunning = false;
    if (hWnd) {
        PostMessage(hWnd, WM_DESTROY, 0, 0);
    }
    return Napi::Boolean::New(info.Env(), true);
}

// 初始化模块
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("watch", Napi::Function::New(env, watch));
    exports.Set("unwatch", Napi::Function::New(env, unwatch));
    return exports;
}

NODE_API_MODULE(clipboard_watcher, Init)
