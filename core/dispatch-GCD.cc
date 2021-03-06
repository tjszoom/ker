//
//  dispatch.cc
//  kk
//
//  Created by zhanghailong on 2018/10/26.
//  Copyright © 2018年 kkmofang.cn. All rights reserved.
//

#include <core/dispatch.h>
#include <future>
#include <dispatch/dispatch.h>
#include <pthread.h>

namespace kk {
    
    class GCDDispatchQueue;
    
    static pthread_key_t kGCDDispatchQueueKey = 0;
    
    
    class GCDDispatchQueue : public DispatchQueue {
    public:
        
        GCDDispatchQueue(kk::CString name) {
            _queue = ::dispatch_queue_create(name, DISPATCH_QUEUE_SERIAL);
            if(kGCDDispatchQueueKey == 0) {
                pthread_key_create(&kGCDDispatchQueueKey, nullptr);
            }
            GCDDispatchQueue * v = this;
            dispatch_async(_queue, ^{
                assert(pthread_getspecific(kGCDDispatchQueueKey) == nullptr);
                pthread_setspecific(kGCDDispatchQueueKey, v);
            });
        }
        
        GCDDispatchQueue(::dispatch_queue_t queue) {
            _queue = queue;
            if(kGCDDispatchQueueKey == 0) {
                pthread_key_create(&kGCDDispatchQueueKey, nullptr);
            }
            assert(pthread_getspecific(kGCDDispatchQueueKey) == nullptr);
            pthread_setspecific(kGCDDispatchQueueKey, this);
        }
        
        virtual ~GCDDispatchQueue(){
            dispatch_release(_queue);
            kk::Log("[GCDDispatchQueue] [dealloc]");
        }
        
        virtual void async(std::function<void()> && func) {
            
            std::function<void()> * f = new std::function<void()>(func);
            
            ::dispatch_async(_queue, ^{
                (*f)();
                delete f;
            });
            
        }
        virtual void sync(std::function<void()> && func) {
            if(this == getCurrentDispatchQueue()) {
                func();
            } else {
                ::dispatch_sync(_queue, ^{
                    func();
                });
            }
        }
        virtual ::dispatch_queue_t queue() {
            return _queue;
        }
    protected:
        ::dispatch_queue_t _queue;
    };

    DispatchQueue * getCurrentDispatchQueue() {
        if(kGCDDispatchQueueKey != 0) {
            return (DispatchQueue *) pthread_getspecific(kGCDDispatchQueueKey);
        }
        return nullptr;
    }
    
    kk::Strong<DispatchQueue> createDispatchQueue(kk::CString name) {
        return new GCDDispatchQueue(name);
    }
    
    DispatchQueue * mainDispatchQueue() {
        static DispatchQueue * v = nullptr;
        if(v == nullptr){
            v = new kk::GCDDispatchQueue(dispatch_get_main_queue());
            v->retain();
        }
        return v;
    }
    
    class GCDDispatchSource : public DispatchSource {
    public:
        
        GCDDispatchSource(kk::Uint64 fd,DispatchSourceType type,GCDDispatchQueue * queue):_queue(queue) {
            
            dispatch_source_type_t t;
            
            switch (type) {
                case DispatchSourceTypeRead:
                    t = DISPATCH_SOURCE_TYPE_READ;
                    break;
                case DispatchSourceTypeWrite:
                    t = DISPATCH_SOURCE_TYPE_WRITE;
                    break;
                case DispatchSourceTypeTimer:
                    t = DISPATCH_SOURCE_TYPE_TIMER;
                    break;
                case DispatchSourceTypeSignal:
                    t = DISPATCH_SOURCE_TYPE_SIGNAL;
                    break;
            }
            
            _source = ::dispatch_source_create(t, (uintptr_t) fd, 0, queue->queue());
            
            dispatch_source_set_event_handler(_source, ^{
                this->onEvent();
            });
            
        }
        
        virtual ~GCDDispatchSource() {
            dispatch_release(_source);
            kk::Log("[GCDDispatchSource] [dealloc]");
        }
        
        virtual void suspend() {
            dispatch_suspend(_source);
        }
        
        virtual void resume() {
            dispatch_resume(_source);
        }
        
        virtual void cancel() {
            dispatch_cancel(_source);
        }
        
        virtual void setTimer(kk::Uint64 delay,kk::Uint64 interval) {
            dispatch_source_set_timer(_source, dispatch_walltime(NULL, delay * NSEC_PER_MSEC), interval * NSEC_PER_MSEC, 0);
        }
        
        virtual void setEvent(std::function<void()> && func) {
            _event = func;
        }
        
    protected:
        
        virtual void onEvent() {
            if(_event != nullptr) {
                std::function<void()> fn = _event;
                fn();
            }
        }

        ::dispatch_source_t _source;
        std::function<void()> _event;
        kk::Strong<GCDDispatchQueue> _queue;

    };
    
    kk::Strong<DispatchSource> createDispatchSource(kk::Uint64 fd,DispatchSourceType type,DispatchQueue * queue) {
        return new GCDDispatchSource(fd, type, (GCDDispatchQueue *) queue);
    }
    
    DispatchQueue * IODispatchQueue() {
        static DispatchQueue * v = nullptr;
        static dispatch_once_t onceToken;
        dispatch_once(&onceToken, ^{
            v = new kk::GCDDispatchQueue("kk::IODispatchQueue");
            v->retain();
        });
        return v;
    }
    
    ::dispatch_queue_t DispatchQueueGCD(DispatchQueue * queue) {
        return ((GCDDispatchQueue *) queue)->queue();
    }
    
}

