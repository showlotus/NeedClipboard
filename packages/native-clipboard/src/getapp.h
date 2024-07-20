#ifndef LISTENER_H
#define LISTENER_H

#include <napi.h>

// 获取光标所在应用程序的信息
Napi::Value GetCursorAppInfo(const Napi::CallbackInfo& info);

#endif
