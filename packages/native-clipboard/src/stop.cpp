#include "stop.h"
#include <thread>
#include <atomic>

extern std::atomic<bool> running;
extern std::thread monitorThread;

void StopListening(const Napi::CallbackInfo& info) {
    if (running) {
        running = false;
        monitorThread.join();
    }
}
