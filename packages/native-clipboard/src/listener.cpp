#include "listener.h"
#include <windows.h>
#include <thread>
#include <atomic>
#include <string>

std::atomic<bool> running(false);
std::thread monitorThread;

void GetWindowInfo(Napi::Env env, Napi::Function callback) {
    HWND hwnd = GetForegroundWindow();

    std::string title;
    DWORD pid = 0;

    if (hwnd != NULL) {
        char buffer[256];
        title.clear();

        // 获取窗口标题
        if (GetWindowText(hwnd, buffer, sizeof(buffer))) {
            title = buffer;
        }

        // 获取进程ID
        GetWindowThreadProcessId(hwnd, &pid);
    }

    Napi::Object result = Napi::Object::New(env);
    result.Set("handle", Napi::String::New(env, std::to_string(reinterpret_cast<uintptr_t>(hwnd))));
    result.Set("title", Napi::String::New(env, title));
    result.Set("pid", Napi::Number::New(env, pid));

    callback.Call({ result });
}

void MonitorWindowHandle(Napi::Env env, Napi::Function callback) {
    HWND lastHwnd = NULL;

    while (running) {
        HWND hwnd = GetForegroundWindow();

        if (hwnd != lastHwnd) {
            lastHwnd = hwnd;
            GetWindowInfo(env, callback);
        }

        std::this_thread::sleep_for(std::chrono::milliseconds(100)); // 每100毫秒检查一次
    }
}

void StartListening(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Function callback = info[0].As<Napi::Function>();

    if (running) {
        Napi::TypeError::New(env, "Listener is already running").ThrowAsJavaScriptException();
        return;
    }

    running = true;
    monitorThread = std::thread(MonitorWindowHandle, env, callback);
}
