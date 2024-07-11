#include <napi.h>

Napi::String Method(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  return Napi::String::New(env, "world");
}

// 用以导出模块
Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "hello"),  // 模块名
              Napi::Function::New(env, Method)  // 模块对应的方法
  );
  return exports;
}

NODE_API_MODULE(hello, Init)
