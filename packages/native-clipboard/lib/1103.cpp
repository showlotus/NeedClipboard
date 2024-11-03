#include <napi.h>
#include <thread>
#include <atomic>
#include <windows.h>
#include <iostream>

std::atomic<bool> keepRunning;
std::string lastClipboardText;

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

// 线程函数，用于监听剪贴板变化
void ClipboardWatcher(Napi::ThreadSafeFunction tsfn) {
    lastClipboardText = getClipboardText();

    while (keepRunning) {
        std::string currentText = getClipboardText();

        if (currentText != lastClipboardText) {
            lastClipboardText = currentText;

            // 使用 ThreadSafeFunction 将数据传递到主线程
            tsfn.BlockingCall([currentText](Napi::Env env, Napi::Function jsCallback) {
                jsCallback.Call({Napi::String::New(env, currentText)});
            });
        }

        // 休眠以减少 CPU 占用
        std::this_thread::sleep_for(std::chrono::milliseconds(500));
    }

    // 关闭 ThreadSafeFunction
    tsfn.Release();
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
    Napi::ThreadSafeFunction tsfn = Napi::ThreadSafeFunction::New(
        env, callback, "ClipboardWatcher", 0, 1);

    // 启动线程
    std::thread watcherThread([tsfn]() { ClipboardWatcher(tsfn); });
    watcherThread.detach();

    return Napi::Boolean::New(env, true);
}

// 停止剪贴板监听
Napi::Value unwatch(const Napi::CallbackInfo& info) {
    keepRunning = false;
    return Napi::Boolean::New(info.Env(), true);
}

// 初始化模块
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set("watch", Napi::Function::New(env, watch));
    exports.Set("unwatch", Napi::Function::New(env, unwatch));
    return exports;
}

NODE_API_MODULE(clipboard_watcher, Init)
