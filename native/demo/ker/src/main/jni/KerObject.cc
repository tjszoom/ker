//
// Created by zhanghailong on 2016/11/7.
//

#include "kk.h"
#include "KerObject.h"
#include <core/kk.h>
#include <core/jit.h>
#include "global.h"

jobject ker_to_JObject(JNIEnv * env, kk::Any &v) {

    switch (v.type) {
        case kk::TypeBoolean:
        {
            jobject r = env->NewObject(G.Boolean.isa,G.Boolean.init,(jboolean) v.booleanValue);
            return r;
        }
        case kk::TypeInt8:
        {
            jobject r = env->NewObject(G.Integer.isa,G.Integer.init,(jint) v.int8Value);
            return r;
        }
        case kk::TypeUint8:
        {
            jobject r = env->NewObject(G.Integer.isa,G.Integer.init,(jint) v.uint8Value);
            return r;
        }
        case kk::TypeInt16:
        {
            jobject r = env->NewObject(G.Integer.isa,G.Integer.init,(jint) v.int16Value);
            return r;
        }
        case kk::TypeUint16:
        {
            jobject r = env->NewObject(G.Integer.isa,G.Integer.init,(jint) v.uint16Value);
            return r;
        }
        case kk::TypeInt32:
        {
            jobject r = env->NewObject(G.Integer.isa,G.Integer.init,(jint) v.int32Value);
            return r;
        }
        case kk::TypeUint32:
        {
            jobject r = env->NewObject(G.Integer.isa,G.Integer.init,(jint) v.uint32Value);
            return r;
        }
        case kk::TypeInt64:
        {
            jobject r = env->NewObject(G.Integer.isa,G.Integer.init,(jlong) v.int64Value);
            return r;
        }
        case kk::TypeUint64:
        {
            jobject r = env->NewObject(G.Long.isa,G.Long.init,(jlong) v.uint64Value);
            return r;
        }
        case kk::TypeFloat32:
        {
            jobject r = env->NewObject(G.Float.isa,G.Float.init,(jfloat) v.float32Value);
            return r;
        }
        case kk::TypeFloat64:
        {
            jobject r = env->NewObject(G.Double.isa,G.Double.init,(jdouble) v.float64Value);
            return r;
        }
        case kk::TypeString:
        {
            return v.stringValue == nullptr ? nullptr : env->NewStringUTF(v.stringValue);
        }
        case kk::TypeObject:
        {
            return ker_Object_to_JObject(env,v.objectValue.get());
        }
        default:
            return nullptr;
    }

}

jobject ker_Object_to_JObject(JNIEnv * env, kk::Object * object) {

    if(object == nullptr) {
        return nullptr;
    }

    {
        kk::JSObject * v = dynamic_cast<kk::JSObject *>(object);
        if(v != nullptr) {
            duk_context * ctx = v->jsContext();
            void * heapptr = v->heapptr();
            if(heapptr && ctx) {
                duk_push_heapptr(ctx,heapptr);
                jobject r = duk_to_JObject(env,ctx,-1);
                duk_pop(ctx);
                return r;
            }
            return nullptr;
        }
    }

    {
        kk::ArrayBuffer * v = dynamic_cast<kk::ArrayBuffer *>(object);
        if(v != nullptr) {
            jbyteArray r = env->NewByteArray(v->byteLength());
            env->SetByteArrayRegion(r,0,v->byteLength(),(jbyte *) v->data());
            return r;
        }
    }

    {
        kk::_TObject * v = dynamic_cast<kk::_TObject *>(object);
        if(v != nullptr) {

            jobject r = env->NewObject(G.TreeMap.isa,G.TreeMap.init);

            v->forEach([&r,&env](kk::Any & value,kk::Any & key)->void{
                kk::CString sKey = (kk::CString) key;
                if(sKey != nullptr) {
                    jobject v = ker_to_JObject(env,value);
                    if(v != nullptr) {
                        jstring jKey = env->NewStringUTF(sKey);
                        jobject rr = env->CallObjectMethod(r,G.TreeMap.put,jKey,v);
                        if(rr != nullptr) {
                            env->DeleteLocalRef(rr);
                        }
                        env->DeleteLocalRef(jKey);
                        env->DeleteLocalRef(v);
                    }
                }
            });

            return r;
        }
    }

    {
        kk::_Array * v = dynamic_cast<kk::_Array *>(object);

        if(v != nullptr) {

            jobject r = env->NewObject(G.ArrayList.isa,G.ArrayList.init);

            v->forEach([&r,&env](kk::Any & value)->void{
                jobject v = ker_to_JObject(env,value);
                if(v != nullptr) {
                    env->CallBooleanMethod(r,G.ArrayList.add,v);
                    env->DeleteLocalRef(v);
                }
            });

            return r;
        }
    }

    return nullptr;
}

jboolean duk_to_JBoolean(JNIEnv * env, duk_context * ctx, duk_idx_t idx) {

    if(idx >= 0) {
        return false;
    }

    switch (duk_get_type(ctx,idx)) {
        case DUK_TYPE_BOOLEAN:
            return duk_to_boolean(ctx,idx);
        case DUK_TYPE_NUMBER:
            return duk_to_number(ctx,idx) != 0;
        case DUK_TYPE_STRING:
        {
            kk::CString v = duk_to_string(ctx,idx);
            return !kk::CStringEqual(v,"");
        }
        case DUK_TYPE_OBJECT:
        case DUK_TYPE_BUFFER:
        case DUK_TYPE_LIGHTFUNC:
            return true;

    }

    return false;
}

jbyte duk_to_JByte(JNIEnv * env, duk_context * ctx, duk_idx_t idx) {

    if(idx >= 0) {
        return 0;
    }

    switch (duk_get_type(ctx,idx)) {
        case DUK_TYPE_BOOLEAN:
            return duk_to_boolean(ctx,idx);
        case DUK_TYPE_NUMBER:
            return duk_to_int(ctx,idx);
        case DUK_TYPE_STRING:
        {
            kk::CString v = duk_to_string(ctx,idx);
            return atoi(v);
        }
    }

    return 0;

}

jchar duk_to_JChar(JNIEnv * env, duk_context * ctx, duk_idx_t idx) {

    if(idx >= 0) {
        return 0;
    }

    switch (duk_get_type(ctx,idx)) {
        case DUK_TYPE_BOOLEAN:
            return duk_to_boolean(ctx,idx);
        case DUK_TYPE_NUMBER:
            return duk_to_int(ctx,idx);
        case DUK_TYPE_STRING:
        {
            kk::CString v = duk_to_string(ctx,idx);
            return atoi(v);
        }
    }

    return 0;
}

jshort duk_to_JShort(JNIEnv * env, duk_context * ctx, duk_idx_t idx) {

    if(idx >= 0) {
        return 0;
    }

    switch (duk_get_type(ctx,idx)) {
        case DUK_TYPE_BOOLEAN:
            return duk_to_boolean(ctx,idx);
        case DUK_TYPE_NUMBER:
            return duk_to_int(ctx,idx);
        case DUK_TYPE_STRING:
        {
            kk::CString v = duk_to_string(ctx,idx);
            return atoi(v);
        }
    }

    return 0;
}

jint duk_to_JInt(JNIEnv * env, duk_context * ctx, duk_idx_t idx) {
    if(idx >= 0) {
        return 0;
    }

    switch (duk_get_type(ctx,idx)) {
        case DUK_TYPE_BOOLEAN:
            return duk_to_boolean(ctx,idx);
        case DUK_TYPE_NUMBER:
            return duk_to_int(ctx,idx);
        case DUK_TYPE_STRING:
        {
            kk::CString v = duk_to_string(ctx,idx);
            return atoi(v);
        }
    }

    return 0;
}

jlong duk_to_JLong(JNIEnv * env, duk_context * ctx, duk_idx_t idx) {

    if(idx >= 0) {
        return 0;
    }

    switch (duk_get_type(ctx,idx)) {
        case DUK_TYPE_BOOLEAN:
            return duk_to_boolean(ctx,idx);
        case DUK_TYPE_NUMBER:
            return duk_to_int(ctx,idx);
        case DUK_TYPE_STRING:
        {
            kk::CString v = duk_to_string(ctx,idx);
            return atoll(v);
        }
    }

    return 0;
}

jfloat duk_to_JFloat(JNIEnv * env, duk_context * ctx, duk_idx_t idx) {
    if(idx >= 0) {
        return 0;
    }

    switch (duk_get_type(ctx,idx)) {
        case DUK_TYPE_BOOLEAN:
            return duk_to_boolean(ctx,idx);
        case DUK_TYPE_NUMBER:
            return duk_to_number(ctx,idx);
        case DUK_TYPE_STRING:
        {
            kk::CString v = duk_to_string(ctx,idx);
            return atof(v);
        }
    }

    return 0;
}

jdouble duk_to_JDouble(JNIEnv * env, duk_context * ctx, duk_idx_t idx) {
    if(idx >= 0) {
        return 0;
    }

    switch (duk_get_type(ctx,idx)) {
        case DUK_TYPE_BOOLEAN:
            return duk_to_boolean(ctx,idx);
        case DUK_TYPE_NUMBER:
            return duk_to_number(ctx,idx);
        case DUK_TYPE_STRING:
        {
            kk::CString v = duk_to_string(ctx,idx);
            return atof(v);
        }
    }

    return 0;
}

duk_ret_t JObjectGetProperty(JNIEnv * env,jobject object,jfieldID field,kk::CString type,duk_context * ctx) {

    switch (* type) {
        case 'Z':
        {
            duk_push_boolean(ctx,env->GetBooleanField(object,field));
            return 1;
        }
        case 'B':
        {
            duk_push_int(ctx,env->GetByteField(object,field));
            return 1;
        }
        case 'C':
        {
            duk_push_int(ctx,env->GetCharField(object,field));
            return 1;
        }
        case 'S':
        {
            duk_push_int(ctx,env->GetShortField(object,field));
            return 1;
        }
        case 'I':
        {
            duk_push_int(ctx,env->GetIntField(object,field));
            return 1;
        }
        case 'J':
        {
            duk_push_int(ctx,env->GetLongField(object,field));
            return 1;
        }
        case 'F':
        {
            duk_push_number(ctx,env->GetFloatField(object,field));
            return 1;
        }
        case 'D':
        {
            duk_push_number(ctx,env->GetDoubleField(object,field));
            return 1;
        }
        case 'L':
        {
            jobject v = env->GetObjectField(object,field);
            if(v != nullptr) {
                duk_push_JObject(ctx,v);
                env->DeleteLocalRef(v);
                return 1;
            }
        }

    }

    return 0;
}

static jobject KerToJObject(JNIEnv * env,duk_context * ctx,duk_idx_t idx,kk::CString type) {

    jobject v = nullptr;

    if(duk_is_object(ctx,idx)) {
        kk::NativeObject * native = dynamic_cast<kk::NativeObject *>(kk::GetObject(ctx,idx));
        if(native != nullptr) {
            v = env->NewLocalRef((jobject) native->native());
        } else {
            kk::Strong<kk::JSObject> jsObject = new kk::JSObject(ctx,duk_get_heapptr(ctx,idx));
            v = env->CallStaticObjectMethod(G.Native.isa,G.Native.allocJSObject,(jlong) jsObject.get());
        }
    } else {
        v = duk_to_JObject(env,ctx,idx);
    }

    if(v != nullptr) {
        jclass isa = env->FindClass(type);
        if(!env->IsInstanceOf(v,isa)) {
            env->DeleteLocalRef(v);
            v = nullptr;
        }
        env->DeleteLocalRef(isa);
    }

    return v;
}

duk_ret_t JObjectSetProperty(JNIEnv * env,jobject object,jfieldID field,kk::CString type,duk_context * ctx) {

    char * p = (char *) type;

    switch (* p) {
        case 'Z':
        {
            env->SetBooleanField(object,field,duk_to_JBoolean(env,ctx,-1));
            return 1;
        }
        case 'B':
        {
            env->SetByteField(object,field,duk_to_JByte(env,ctx,-1));
            return 1;
        }
        case 'C':
        {
            env->SetCharField(object,field,duk_to_JChar(env,ctx,-1));
            return 1;
        }
        case 'S':
        {
            env->SetShortField(object,field,duk_to_JShort(env,ctx,-1));
            return 1;
        }
        case 'I':
        {
            env->SetIntField(object,field,duk_to_JInt(env,ctx,-1));
            return 1;
        }
        case 'J':
        {
            env->SetLongField(object,field,duk_to_JLong(env,ctx,-1));
            return 1;
        }
        case 'F':
        {
            env->SetFloatField(object,field,duk_to_JFloat(env,ctx,-1));
            return 1;
        }
        case 'D':
        {
            env->SetDoubleField(object,field,duk_to_JDouble(env,ctx,-1));
            return 1;
        }
        case 'L':
        {
            kk::String n;
            p ++;
            while(p && *p) {
                if(*p == ';'){
                    break;
                }
                n.append(p,0,1);
                p ++;
            }
            jobject v = KerToJObject(env,ctx,-1,n.c_str());
            env->SetObjectField(object,field,v);
            if(v != nullptr) {
                env->DeleteLocalRef(v);
            }
        }

    }

    return 0;

}

duk_int_t JObjectMethodTypeArgumentCount(kk::CString types) {

    char * p = (char *) types;
    int s = 0;
    int count = 0;

    while(p && *p) {

        if(s == 0) {
            if(*p == '(') {
                s = 1;
            }
        } else if(s == 1) {
            if(*p == ')') {
                s = 2;
            } else {
                count ++;
                if(*p == 'L') {
                    while(p && *p) {
                        if(*p == ';') {
                            break;
                        }
                        p ++;
                    }
                }

            }
        } else {
            break;
        }

        p ++;

    }

    return count;

}

duk_ret_t JObjectInvoke(JNIEnv * env,jobject object,jmethodID method,kk::CString types,duk_context * ctx,duk_idx_t top) {

    std::vector<jvalue> vs;
    std::vector<jobject> objects;

    jvalue v;
    char * p = (char *) types;
    int s = 0;

    while(p && *p) {

        if(s == 0) {
            if(*p == '(') {
                s = 1;
            }
        } else if(s == 1) {
            if(*p == ')') {
                s = 2;
            } else {
                switch (* p) {
                    case 'Z':
                        v.z = duk_to_JBoolean(env,ctx,-top);
                        vs.push_back(v);
                        top ++;
                        break;
                    case 'B':
                        v.b = duk_to_JByte(env,ctx,-top);
                        vs.push_back(v);
                        top ++;
                        break;
                    case 'C':
                        v.c = duk_to_JChar(env,ctx,-top);
                        vs.push_back(v);
                        top ++;
                        break;
                    case 'S':
                        v.s = duk_to_JShort(env,ctx,-top);
                        vs.push_back(v);
                        top ++;
                        break;
                    case 'I':
                        v.i = duk_to_JInt(env,ctx,-top);
                        vs.push_back(v);
                        top ++;
                        break;
                    case 'J':
                        v.j = duk_to_JLong(env,ctx,-top);
                        vs.push_back(v);
                        top ++;
                        break;
                    case 'F':
                        v.f = duk_to_JFloat(env,ctx,-top);
                        vs.push_back(v);
                        top ++;
                        break;
                    case 'D':
                        v.d = duk_to_JDouble(env,ctx,-top);
                        vs.push_back(v);
                        top ++;
                        break;
                    case 'L':
                    {
                        kk::String n;
                        p ++;
                        while(p && *p) {
                            if(*p == ';'){
                                break;
                            }
                            n.append(p,0,1);
                            p ++;
                        }
                        v.l = KerToJObject(env,ctx,-top,n.c_str());
                        vs.push_back(v);
                        if(v.l != nullptr) {
                            objects.push_back(v.l);
                        }
                        top ++;
                        break;
                    }
                    default:
                        assert(0);
                        break;

                }
            }
        } else {

            duk_ret_t r = 0;

            switch (* p) {
                case 'Z':
                    duk_push_boolean(ctx,env->CallBooleanMethodA(object,method,vs.data()));
                    r = 1;
                    break;
                case 'B':
                    duk_push_int(ctx,env->CallByteMethodA(object,method,vs.data()));
                    r = 1;
                    break;
                case 'C':
                    duk_push_int(ctx,env->CallCharMethodA(object,method,vs.data()));
                    r = 1;
                    break;
                case 'S':
                    duk_push_int(ctx,env->CallShortMethodA(object,method,vs.data()));
                    r = 1;
                    break;
                case 'I':
                    duk_push_int(ctx,env->CallIntMethodA(object,method,vs.data()));
                    r = 1;
                    break;
                case 'J':
                    duk_push_int(ctx,env->CallLongMethodA(object,method,vs.data()));
                    r = 1;
                    break;
                case 'F':
                    duk_push_number(ctx,env->CallFloatMethodA(object,method,vs.data()));
                    r = 1;
                    break;
                case 'D':
                    duk_push_number(ctx,env->CallDoubleMethodA(object,method,vs.data()));
                    r = 1;
                    break;
                case 'L':
                {
                    jobject v = env->CallObjectMethodA(object,method,vs.data());
                    if(v != nullptr){
                        duk_push_JObject(ctx,v);
                        env->DeleteLocalRef(v);
                        r = 1;
                    }
                    break;
                }
                case 'V':
                    env->CallVoidMethodA(object,method,vs.data());
                    break;
                default:
                    assert(0);
                    break;

            }

            auto i = objects.begin();

            while(i != objects.end()) {
                env->DeleteLocalRef(*i);
                i ++;
            }

            return r;
        }

        p ++;

    }

    return 0;

}

void duk_push_JObject(duk_context * ctx, jobject object) {

    jboolean isAttach = false;

    JNIEnv *env = kk_env(&isAttach);

    env->CallStaticVoidMethod(G.Native.isa,G.Native.pushObject,(jlong)ctx, object);

    if(isAttach) {
        gJavaVm->DetachCurrentThread();
    }

}

jobject duk_to_JObject(JNIEnv * env,duk_context * ctx, duk_idx_t idx) {

    jobject v = env->CallStaticObjectMethod(G.Native.isa,G.Native.toObject,(jlong) ctx,(jint) idx);

    return v;
}

namespace kk {

    void LogV(const char * format, va_list va) {
        kk_logv(format,va);
    }

    void PushNative(duk_context * ctx, kk::Native * native) {
        ::duk_push_JObject(ctx, (jobject) native);
    }

    NativeObject::NativeObject(Native * native):_native(nullptr) {

        if(native){

            jboolean isAttach = false;

            JNIEnv *env = kk_env(&isAttach);

            _native = (Native *) env->NewGlobalRef((jobject)native);

            if(isAttach) {
                gJavaVm->DetachCurrentThread();
            }

        }
    }

    kk::String NativeObject::getPrototype(Native * native) {

        kk::String v ;

        jboolean isAttach = false;

        JNIEnv *env = kk_env(&isAttach);

        jobject name =  env->CallStaticObjectMethod(G.Native.isa,G.Native.getPrototype,(jobject) native);

        if(name != nullptr) {

            kk::CString s = env->GetStringUTFChars((jstring) name, nullptr);

            v = s;

            env->ReleaseStringUTFChars((jstring)name,s);

            env->DeleteLocalRef(name);
        }

        if(isAttach) {
            gJavaVm->DetachCurrentThread();
        }

        return v;

    }

    NativeObject::~NativeObject() {
        if(_native != nullptr) {

            jboolean isAttach = false;

            JNIEnv *env = kk_env(&isAttach);

            env->DeleteGlobalRef((jobject) _native);

            if(isAttach) {
                gJavaVm->DetachCurrentThread();
            }

        }
    }

    Native * NativeObject::native() {
        return _native;
    }

    Any::operator Native*() {

        if(type == TypeObject) {
            {
                NativeObject * v = dynamic_cast<NativeObject *>(objectValue.get());
                if(v != nullptr) {
                    return v->native();
                }
            }
            {
                JSObject * v = dynamic_cast<JSObject *>(objectValue.get());

                if(v != nullptr) {

                    NativeObject * object = nullptr;

                    jboolean isAttach = false;

                    JNIEnv *env = kk_env(&isAttach);

                    jobject native = env->CallStaticObjectMethod(G.Native.isa,G.Native.allocJSObject,(jlong) v);


                    if(native != nullptr) {
                        object = new kk::NativeObject((kk::Native *) native);
                        objectValue = object;
                        env->DeleteLocalRef(native);
                    }


                    if(isAttach) {
                        gJavaVm->DetachCurrentThread();
                    }

                    if(object != nullptr) {
                        return object->native();
                    }

                    return nullptr;
                }

            }
        }

        return nullptr;
    }

}
