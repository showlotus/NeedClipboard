#ifndef LISTENER_H
#define LISTENER_H

#include <napi.h>
#include <string>

void GetWindowInfo(Napi::Env env, Napi::Function callback);
void StartListening(const Napi::CallbackInfo& info);

#endif
