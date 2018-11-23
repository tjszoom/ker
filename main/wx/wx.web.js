(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var autoId = 0;
var cur = 0;
var speed = 1000 / 60;
var frames = {};
function add(frame) {
    var id = ++autoId;
    frames[id] = frame;
    return id;
}
function remove(id) {
    delete frames[id];
}
setInterval(() => {
    cur += speed;
    var rm = [];
    for (var id in frames) {
        var fn = frames[id];
        if (fn(cur) === false) {
            rm.push(id);
        }
    }
    for (var id of rm) {
        delete frames[id];
    }
}, speed);
function startAnimation(duration, func) {
    let start = cur;
    return add((cur) => {
        let v = (cur - start) / duration;
        if (v >= 1) {
            v = 1;
            func(v);
            return false;
        }
        func(v);
        return true;
    });
}
exports.startAnimation = startAnimation;
;
function clearAnimation(id) {
    remove(id);
}
exports.clearAnimation = clearAnimation;
;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Element_1 = require("./Element");
const ViewElement_1 = require("./ViewElement");
class BlockElement extends Element_1.Element {
    onWillRemoveFromParent(element) {
        super.onWillRemoveFromParent(element);
        let p = this.firstChild;
        while (p) {
            if (p instanceof ViewElement_1.ViewElement) {
                let v = p.view;
                let pv = v.parentElement;
                if (pv) {
                    pv.removeChild(v);
                }
            }
            p = p.nextSibling;
        }
    }
}
exports.BlockElement = BlockElement;

},{"./Element":8,"./ViewElement":36}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewElement_1 = require("./ViewElement");
class ButtonElement extends ViewElement_1.ViewElement {
    constructor(document, name, id) {
        super(document, name, id);
        this._enabled = true;
        this._hoverStartTime = 20;
        this._hoverStayTime = 70;
        this.set("hover-class", "button-hover");
    }
    doEvent(event, name, detail) {
        if (this._enabled) {
            super.doEvent(event, name, detail);
        }
    }
    set(key, value) {
        super.set(key, value);
        if (key == 'size') {
            if (value === undefined) {
                this._view.removeAttribute(key);
            }
            else {
                this._view.setAttribute(key, value);
            }
        }
        else if (key == 'disabled') {
            if (value == 'true' || value == 'disabled') {
                this._view.setAttribute(key, value);
                this._enabled = false;
            }
            else {
                this._view.removeAttribute(key);
                this._enabled = true;
            }
        }
        else if (key == 'type') {
            if (value === undefined) {
                this._view.removeAttribute(key);
            }
            else {
                this._view.setAttribute(key, value);
            }
        }
        else if (key == 'plain') {
            if (value == 'true' || value == 'plain') {
                this._view.setAttribute(key, value);
            }
            else {
                this._view.removeAttribute(key);
            }
        }
    }
}
exports.ButtonElement = ButtonElement;

},{"./ViewElement":36}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NViewElement_1 = require("./NViewElement");
class CanvasElement extends NViewElement_1.NViewElement {
}
exports.CanvasElement = CanvasElement;

},{"./NViewElement":19}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewElement_1 = require("./ViewElement");
class CheckboxElement extends ViewElement_1.ViewElement {
}
exports.CheckboxElement = CheckboxElement;

},{"./ViewElement":36}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IObject {
    get(key) {
        return this[key];
    }
    set(key, value) {
        if (value === undefined) {
            delete this[key];
        }
        else {
            this[key] = value;
        }
    }
}
exports.IObject = IObject;
function get(object, keys, index = 0) {
    if (index < keys.length) {
        var key = keys[index];
        if (typeof object == 'object') {
            if (object instanceof IObject) {
                return get(object.get(key), keys, index + 1);
            }
            return get(object[key], keys, index + 1);
        }
    }
    else {
        return object;
    }
}
exports.get = get;
function set(object, keys, value, index = 0) {
    if (typeof object != 'object') {
        return;
    }
    if (index + 1 < keys.length) {
        var key = keys[index];
        var v;
        if (object instanceof IObject) {
            v = object.get(key);
        }
        else {
            v = object[key];
        }
        if (v === undefined) {
            v = {};
            if (object instanceof IObject) {
                object.set(key, v);
            }
            else {
                object[key] = v;
            }
        }
        set(v, keys, value, index + 1);
    }
    else if (index < keys.length) {
        var key = keys[index];
        if (object instanceof IObject) {
            object.set(key, value);
        }
        else {
            object[key] = value;
        }
    }
}
exports.set = set;
class Evaluate {
    constructor(keys, evaluateScript) {
        this.keys = keys;
        this.evaluateScript = evaluateScript;
    }
    exec(object) {
        var vs = [];
        for (let key of this.keys) {
            let v = object[key[0]];
            if (v === undefined) {
                v = window[key[0]];
            }
            vs.push(v);
        }
        return this.evaluateScript.apply(undefined, vs);
    }
}
exports.Evaluate = Evaluate;
class KeyCallback {
    constructor(func) {
        this.hasChildren = false;
        this.priority = 0;
        this.func = func;
    }
    run(object, changedKeys) {
        var v;
        if (this.evaluate !== undefined) {
            v = this.evaluate.exec(object);
        }
        else if (this.keys !== undefined) {
            v = get(object, this.keys);
        }
        this.func(v, changedKeys);
    }
}
class KeyObserver {
    constructor() {
        this.children = {};
        this.callbacks = [];
    }
    add(keys, callback, index) {
        if (index < keys.length) {
            let key = keys[index];
            var ch = this.children[key];
            if (ch === undefined) {
                ch = new KeyObserver();
                this.children[key] = ch;
            }
            ch.add(keys, callback, index + 1);
        }
        else {
            this.callbacks.push(callback);
        }
    }
    remove(keys, func, index) {
        if (func === undefined) {
            this.children = {};
            this.callbacks = [];
        }
        else if (index < keys.length) {
            let key = keys[index];
            let ch = this.children[key];
            if (ch !== undefined) {
                ch.remove(keys, func, index + 1);
            }
        }
        else {
            let cbs = [];
            for (let cb of this.callbacks) {
                if (cb.func != func) {
                    cbs.push(cb);
                }
            }
            this.callbacks = cbs;
            for (let key in this.children) {
                var ch = this.children[key];
                ch.remove(keys, func, index);
            }
        }
    }
    change(keys, callbacks, index) {
        if (index < keys.length) {
            let key = keys[index];
            let ch = this.children[key];
            if (ch !== undefined) {
                ch.change(keys, callbacks, index + 1);
            }
            for (let cb of this.callbacks) {
                if (cb.hasChildren) {
                    callbacks.push(cb);
                }
            }
        }
        else {
            for (let cb of this.callbacks) {
                callbacks.push(cb);
            }
            for (let key in this.children) {
                var ch = this.children[key];
                ch.change(keys, callbacks, index);
            }
        }
    }
    changedKeys(object, keys) {
        let callbacks = [];
        this.change(keys, callbacks, 0);
        callbacks.sort((a, b) => {
            return a.priority - b.priority;
        });
        for (let cb of callbacks) {
            cb.run(object, keys);
        }
    }
    on(object, keys, func, hasChildren = false, priority = 0) {
        let onKeys = [];
        let cb = new KeyCallback(func);
        cb.hasChildren = hasChildren;
        cb.priority = priority;
        if (keys instanceof Evaluate) {
            onKeys = keys.keys;
            cb.evaluate = keys;
        }
        else {
            cb.keys = keys;
            onKeys.push(keys);
        }
        if (onKeys.length == 0) {
            var vv;
            if (cb.evaluate !== undefined) {
                try {
                    vv = cb.evaluate.exec(object);
                }
                catch (e) {
                    console.info("[ERROR] " + e);
                }
            }
            if (vv !== undefined) {
                func(vv, []);
            }
        }
        else {
            for (let ks of onKeys) {
                this.add(ks, cb, 0);
            }
        }
    }
    off(keys, func) {
        this.remove(keys, func, 0);
    }
}
class Data {
    constructor() {
        this._keyObserver = new KeyObserver();
        this.object = {};
    }
    get(keys) {
        return get(this.object, keys);
    }
    set(keys, value, changed = true) {
        set(this.object, keys, value);
        if (changed === true) {
            this.changedKeys(keys);
        }
    }
    changedKeys(keys) {
        this._keyObserver.changedKeys(this.object, keys);
    }
    on(keys, func, hasChildren = false, priority = 0) {
        this._keyObserver.on(this.object, keys, func, hasChildren, priority);
    }
    off(keys, func) {
        this._keyObserver.off(keys, func);
    }
    setParent(parent) {
        this.recycle();
        if (parent !== undefined) {
            this._parent = parent;
            let data = this;
            this._parentFunc = function (value, keys) {
                if (value !== undefined) {
                    data.set(keys, get(value, keys));
                }
            };
            parent.on([], this._parentFunc, true);
            for (var key in parent.object) {
                this.object[key] = parent.object[key];
            }
        }
    }
    recycle() {
        if (this._parent !== undefined) {
            this._parent.off([], this._parentFunc);
            this._parent = undefined;
            this._parentFunc = undefined;
        }
    }
    static evaluateKeys(evaluate, keys) {
        var v = evaluate.replace(/(\\\')|(\\\")/g, '');
        v = v.replace(/(\'.*?\')|(\".*?\")/g, '');
        v = v.replace(/\".*?\"/g, '');
        v.replace(/[a-zA-Z_][0-9a-zA-Z\\._]*/g, (name) => {
            if (!/(true)|(false)|(null)|(undefined)|(NaN)/i.test(name)) {
                keys.push(name.split("."));
            }
            return '';
        });
    }
    static evaluateScript(evaluateScript) {
        let keys = [];
        let code = [];
        var idx = 0;
        var count = 0;
        evaluateScript.replace(/\{\{(.*?)\}\}/g, (text, exaluate, index) => {
            if (index > idx) {
                if (count != 0) {
                    code.push("+");
                }
                code.push(JSON.stringify(evaluateScript.substr(idx, index - idx)));
                count++;
            }
            Data.evaluateKeys(exaluate, keys);
            if (count != 0) {
                code.push("+");
            }
            code.push("(");
            code.push(exaluate);
            code.push(")");
            count++;
            idx = index + text.length;
            return '';
        });
        if (evaluateScript.length > idx && count != 0) {
            code.push("+");
            code.push(JSON.stringify(evaluateScript.substr(idx)));
        }
        if (count == 0) {
            return undefined;
        }
        let args = [];
        for (let key of keys) {
            args.push(key[0]);
        }
        return new Evaluate(keys, eval('(function(' + args.join(',') + '){ return ' + code.join('') + '; })'));
    }
}
exports.Data = Data;

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Element_1 = require("./Element");
const events_1 = require("events");
class Document extends events_1.EventEmitter {
    constructor() {
        super(...arguments);
        this._autoId = 0;
        this._elementClass = {};
        this._elements = {};
        this._documentElement = new Element_1.Element(this, "document", 0);
    }
    createElement(name) {
        let id = ++this._autoId;
        let fn = this._elementClass[name];
        var v;
        if (fn === undefined) {
            v = new Element_1.Element(this, name, id);
        }
        else {
            v = new fn(this, name, id);
        }
        this._elements[id] = v;
        return v;
    }
    element(id) {
        return this._elements[id];
    }
    removeElement(id) {
        delete this._elementClass[id];
    }
    addElementClass(name, elementClass) {
        this._elementClass[name] = elementClass;
    }
    get documentElement() {
        return this._documentElement;
    }
}
exports.Document = Document;

},{"./Element":8,"events":39}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Event_1 = require("./Event");
const EventEmitter_1 = require("./EventEmitter");
class ElementEvent extends Event_1.Event {
    constructor(element) {
        super();
        this.cancelBubble = false;
        this.element = element;
    }
}
exports.ElementEvent = ElementEvent;
class Element extends EventEmitter_1.EventEmitter {
    constructor(document, name, id) {
        super();
        this._attributes = {};
        this._levelId = 0;
        this._depth = 0;
        this._autoLevelId = 0;
        this._name = name;
        this._id = id;
        this._document = document;
    }
    get document() {
        return this._document;
    }
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    get levelId() {
        return this._levelId;
    }
    get depth() {
        return this._depth;
    }
    get firstChild() {
        return this._firstChild;
    }
    get lastChild() {
        return this._lastChild;
    }
    get nextSibling() {
        return this._nextSibling;
    }
    get prevSibling() {
        return this._prevSibling;
    }
    get parent() {
        return this._parent;
    }
    onDidAddToParent(element) {
    }
    onDidAddChildren(element) {
        let e = element;
        e._depth = this._depth + 1;
        e._levelId = this._autoLevelId + 1;
        this._autoLevelId = e._levelId;
        e.onDidAddToParent(this);
    }
    append(element) {
        var e = element;
        e.remove();
        if (this._lastChild !== undefined) {
            this._lastChild._nextSibling = e;
            e._prevSibling = this._lastChild;
            this._lastChild = e;
            e._parent = this;
        }
        else {
            this._firstChild = e;
            this._lastChild = e;
            e._parent = this;
        }
        this.onDidAddChildren(element);
    }
    before(element) {
        var e = element;
        e.remove();
        if (this._prevSibling !== undefined) {
            this._prevSibling._nextSibling = e;
            e._prevSibling = this._prevSibling;
            e._nextSibling = this;
            e._parent = this._parent;
            this._prevSibling = e;
        }
        else if (this._parent) {
            e._nextSibling = this;
            e._parent = this._parent;
            this._prevSibling = e;
            this._parent._firstChild = e;
        }
        if (this._parent !== undefined) {
            this._parent.onDidAddChildren(element);
        }
    }
    after(element) {
        var e = element;
        e.remove();
        if (this._nextSibling !== undefined) {
            this._nextSibling._prevSibling = e;
            e._nextSibling = this._nextSibling;
            e._prevSibling = this;
            e._parent = this._parent;
            this._nextSibling = e;
        }
        else if (this._parent) {
            e._prevSibling = this;
            e._parent = this._parent;
            this._nextSibling = e;
            this._parent._lastChild = e;
        }
        if (this._parent !== undefined) {
            this._parent.onDidAddChildren(element);
        }
    }
    onWillRemoveFromParent(element) {
    }
    onWillRemoveChildren(element) {
        let e = element;
        e._depth = 0;
        e._levelId = 0;
        e.onWillRemoveFromParent(this);
    }
    remove() {
        if (this._prevSibling !== undefined && this._parent !== undefined) {
            this._parent.onWillRemoveChildren(this);
            this._prevSibling._nextSibling = this._nextSibling;
            if (this._nextSibling !== undefined) {
                this._nextSibling._prevSibling = this._prevSibling;
            }
            else {
                this._parent._lastChild = this._prevSibling;
            }
        }
        else if (this._parent !== undefined) {
            this._parent.onWillRemoveChildren(this);
            this._parent._firstChild = this._nextSibling;
            if (this._nextSibling) {
                this._nextSibling._prevSibling = undefined;
            }
            else {
                this._parent._lastChild = undefined;
            }
        }
        if (this._parent) {
            this._parent = undefined;
            this._prevSibling = undefined;
            this._nextSibling = undefined;
        }
    }
    appendTo(element) {
        element.append(this);
    }
    beforeTo(element) {
        element.before(this);
    }
    afterTo(element) {
        element.after(this);
    }
    get(key) {
        return this._attributes[key];
    }
    set(key, value) {
        if (value === undefined) {
            delete this._attributes[key];
        }
        else {
            this._attributes[key] = value;
        }
    }
    get attributes() {
        return this._attributes;
    }
    emitBubble(name, event) {
        if (event instanceof ElementEvent) {
            var e = event;
            if (e.element === undefined) {
                e.element = this;
            }
        }
        this.emit(name, event);
        if (event instanceof ElementEvent) {
            var e = event;
            if (!e.cancelBubble) {
                if (this._parent !== undefined) {
                    this._parent.emit(name, event);
                }
                else if (this._document !== undefined) {
                    this._document.emit(name, event);
                }
            }
        }
    }
    hasBubble(name) {
        if (super.has(name)) {
            return true;
        }
        if (this._parent !== undefined) {
            return this._parent.hasBubble(name);
        }
        return false;
    }
    recycle() {
        this._document.removeElement(this._id);
        var p = this._firstChild;
        while (p !== undefined) {
            let n = p._nextSibling;
            p.recycle();
            p = n;
        }
        this._parent = undefined;
        this._firstChild = undefined;
        this._lastChild = undefined;
        this._prevSibling = undefined;
        this._nextSibling = undefined;
    }
    onEvent(name, data) {
    }
}
exports.Element = Element;

},{"./Event":9,"./EventEmitter":10}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Event {
}
exports.Event = Event;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventEmitter {
    constructor() {
        this._events = {};
    }
    on(name, func) {
        var v = this._events[name];
        if (v === undefined) {
            v = [];
            this._events[name] = v;
        }
        v.push(func);
    }
    off(name, func) {
        if (name === undefined && func === undefined) {
            this._events = {};
        }
        else if (func === undefined && name !== undefined) {
            delete this._events[name];
        }
        else if (name !== undefined) {
            var v = this._events[name];
            if (v !== undefined) {
                var vs = [];
                for (let fn of v) {
                    if (fn != func) {
                        vs.push(fn);
                    }
                }
                this._events[name] = vs;
            }
        }
    }
    emit(name, event) {
        var v = this._events[name];
        if (v !== undefined) {
            var vs = v.slice();
            for (let fn of vs) {
                fn(event);
            }
        }
    }
    has(name) {
        return this._events[name] !== undefined;
    }
}
exports.EventEmitter = EventEmitter;

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewElement_1 = require("./ViewElement");
class FormElement extends ViewElement_1.ViewElement {
}
exports.FormElement = FormElement;

},{"./ViewElement":36}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function postMessage(data) {
    let w = window;
    if (w.webkit && w.webkit.messageHandlers && w.webkit.messageHandlers.kk) {
        w.webkit.messageHandlers.kk.postMessage(data);
    }
}
exports.postMessage = postMessage;

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewElement_1 = require("./ViewElement");
class IconElement extends ViewElement_1.ViewElement {
}
exports.IconElement = IconElement;

},{"./ViewElement":36}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewElement_1 = require("./ViewElement");
const URI_1 = require("./URI");
class ImageElement extends ViewElement_1.ViewElement {
    get imageView() {
        return this._view.firstElementChild;
    }
    createView() {
        var v = document.createElement("wx-" + this._name);
        var img = document.createElement("img");
        v.appendChild(img);
        return v;
    }
    set(key, value) {
        super.set(key, value);
        if (key == 'src') {
            if (value === undefined) {
                this.imageView.removeAttribute("src");
            }
            else {
                this.imageView.setAttribute("src", URI_1.resolveURI(value));
            }
        }
    }
}
exports.ImageElement = ImageElement;

},{"./URI":34,"./ViewElement":36}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NViewElement_1 = require("./NViewElement");
const IPC_1 = require("./IPC");
class InputElement extends NViewElement_1.NViewElement {
    constructor() {
        super(...arguments);
        this._value = "";
    }
    createView() {
        var v = super.createView();
        this._placeholderView = document.createElement('span');
        v.appendChild(this._placeholderView);
        IPC_1.postMessage({
            view: 'on',
            id: this._id,
            name: 'change'
        });
        return v;
    }
    display() {
        super.display();
        let s = window.getComputedStyle(this._view);
        IPC_1.postMessage({
            view: 'set',
            id: this._id,
            name: 'padding',
            value: [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft].join(' '),
        });
    }
    hasNativeKey(key) {
        if (key == "placeholder" || key.startsWith("placeholder-")) {
            return false;
        }
        return super.hasNativeKey(key);
    }
    set(key, value) {
        super.set(key, value);
        if (key == 'placeholder') {
            this._placeholderView.textContent = value;
        }
        else if (key == 'placeholder-style') {
            this._placeholderView.setAttribute("style", value);
        }
        else if (key == 'placeholder-class') {
            this._placeholderView.className = value;
        }
        else if (key == 'value') {
            this.value = value || '';
        }
    }
    set value(value) {
        this._value = value;
        if (this._value) {
            this._placeholderView.style.visibility = 'hidden';
        }
        else {
            this._placeholderView.style.visibility = 'visible';
        }
    }
    get value() {
        return this._value;
    }
    onEvent(name, data) {
        console.info(name, data);
        if (name == "change") {
            this.value = data.value || '';
        }
    }
}
exports.InputElement = InputElement;

},{"./IPC":12,"./NViewElement":19}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewElement_1 = require("./ViewElement");
class LabelElement extends ViewElement_1.ViewElement {
}
exports.LabelElement = LabelElement;

},{"./ViewElement":36}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Data_1 = require("./Data");
const Element_1 = require("./Element");
const Page_1 = require("./Page");
const ViewElement_1 = require("./ViewElement");
const ImageElement_1 = require("./ImageElement");
const IPC_1 = require("./IPC");
const InputElement_1 = require("./InputElement");
const ScrollViewElement_1 = require("./ScrollViewElement");
const SwiperElement_1 = require("./SwiperElement");
const MovableViewElement_1 = require("./MovableViewElement");
const IconElement_1 = require("./IconElement");
const TextElement_1 = require("./TextElement");
const RichTextElement_1 = require("./RichTextElement");
const ProgressElement_1 = require("./ProgressElement");
const ButtonElement_1 = require("./ButtonElement");
const CheckboxElement_1 = require("./CheckboxElement");
const FormElement_1 = require("./FormElement");
const LabelElement_1 = require("./LabelElement");
const PickerElement_1 = require("./PickerElement");
const PickerViewElement_1 = require("./PickerViewElement");
const RadioElement_1 = require("./RadioElement");
const SliderElement_1 = require("./SliderElement");
const SwitchElement_1 = require("./SwitchElement");
const TextareaElement_1 = require("./TextareaElement");
const NavigatorElement_1 = require("./NavigatorElement");
const CanvasElement_1 = require("./CanvasElement");
const once_1 = require("./once");
const BlockElement_1 = require("./BlockElement");
function ElementOnEvent(element, prefix, name, value) {
    element.on(name, (event) => {
        if (event instanceof Element_1.ElementEvent) {
            IPC_1.postMessage({
                event: value,
                data: event.data
            });
            if (prefix.endsWith("catch")) {
                event.cancelBubble = true;
            }
        }
    });
}
function ElementSetAttributes(element, data, attributes) {
    for (let key in attributes) {
        if (key.startsWith("wx:")) {
        }
        else if (key.startsWith("bind:")) {
            ElementOnEvent(element, key.substr(0, 4), key.substr(5), attributes[key]);
        }
        else if (key.startsWith("bind")) {
            ElementOnEvent(element, key.substr(0, 4), key.substr(4), attributes[key]);
        }
        else if (key.startsWith("catch:")) {
            ElementOnEvent(element, key.substr(0, 5), key.substr(6), attributes[key]);
        }
        else if (key.startsWith("catch")) {
            ElementOnEvent(element, key.substr(0, 5), key.substr(6), attributes[key]);
        }
        else if (key.startsWith("capture-bind:")) {
            ElementOnEvent(element, key.substr(0, 12), key.substr(13), attributes[key]);
        }
        else if (key.startsWith("capture-bind")) {
            ElementOnEvent(element, key.substr(0, 12), key.substr(12), attributes[key]);
        }
        else if (key.startsWith("capture-catch:")) {
            ElementOnEvent(element, key.substr(0, 13), key.substr(14), attributes[key]);
        }
        else if (key.startsWith("capture-catch")) {
            ElementOnEvent(element, key.substr(0, 13), key.substr(13), attributes[key]);
        }
        else {
            let v = attributes[key];
            let evaluate = Data_1.Data.evaluateScript(v);
            if (evaluate === undefined) {
                element.set(key, v);
            }
            else {
                let fn = (key, element, evaluate) => {
                    data.on(evaluate, (value, changdKeys) => {
                        element.set(key, value + '');
                    });
                };
                fn(key, element, evaluate);
            }
        }
    }
}
function CreateForElement(element, data, name, attributes, context, children) {
    let evaluate = Data_1.Data.evaluateScript(attributes["wx:for"]);
    if (evaluate === undefined) {
        return;
    }
    delete attributes["wx:for"];
    let before = context.page.document.createElement("element");
    before.appendTo(element);
    let index = attributes["wx:for-index"] || "index";
    let item = attributes["wx:for-item"] || "item";
    let items = [];
    data.on(evaluate, (object, changedKeys) => {
        var i = 0;
        context.begin();
        if (object instanceof Array) {
            for (let d of object) {
                let v;
                if (i < items.length) {
                    v = items[i];
                }
                else {
                    v = {
                        data: new Data_1.Data(),
                        element: context.page.document.createElement(name)
                    };
                    ElementSetAttributes(v.element, v.data, attributes);
                    before.before(v.element);
                    context.begin();
                    children(v.element, v.data, context);
                    context.end();
                    v.data.setParent(data);
                    items.push(v);
                }
                v.data.set([index], i, false);
                v.data.set([item], d, false);
                v.data.changedKeys([]);
                i++;
            }
        }
        while (i < items.length) {
            let v = items.pop();
            v.element.remove();
            v.element.recycle();
            v.data.recycle();
        }
        context.end();
    });
}
function CreateIfElement(element, data, name, attributes, context, children) {
    let evaluate = Data_1.Data.evaluateScript(attributes["wx:if"]);
    if (evaluate === undefined) {
        return;
    }
    let before = context.page.document.createElement("element");
    before.appendTo(element);
    let scope = context.scope();
    let block;
    block = new Page_1.IfBlock({
        element: undefined,
        name: name,
        attributes: attributes,
        children: children,
        evaluate: evaluate,
        data: data,
        elementData: undefined
    }, (value, changedKeys) => {
        let e;
        for (let item of block.elements) {
            if (e === undefined) {
                if (item.evaluate !== undefined) {
                    let v = item.evaluate.evaluateScript(item.data.object);
                    if (v) {
                        e = item;
                    }
                }
                else {
                    e = item;
                }
            }
            if (e == item) {
                if (item.element === undefined) {
                    item.element = context.page.document.createElement(item.name);
                    item.elementData = new Data_1.Data();
                    ElementSetAttributes(item.element, item.data, item.attributes);
                    context.begin();
                    item.children(item.element, item.elementData, context);
                    context.end();
                    item.elementData.setParent(item.data);
                }
                else {
                    before.before(item.element);
                    item.elementData.changedKeys([]);
                }
            }
            else if (item.element !== undefined) {
                item.element.remove();
                item.element.recycle();
                item.elementData.recycle();
                item.element = undefined;
                item.elementData = undefined;
            }
        }
    });
    scope.ifblock = block;
    data.on(evaluate, block.func);
}
function CreateElifElement(element, data, name, attributes, context, children) {
    let scope = context.scope();
    if (scope.ifblock !== undefined) {
        let evaluate = Data_1.Data.evaluateScript(attributes["wx:elif"]);
        if (evaluate === undefined) {
            return;
        }
        scope.ifblock.elements.push({
            element: undefined,
            name: name,
            attributes: attributes,
            children: children,
            evaluate: evaluate,
            data: data,
            elementData: undefined
        });
        data.on(evaluate, scope.ifblock.func);
    }
}
function CreateElseElement(element, data, name, attributes, context, children) {
    let scope = context.scope();
    if (scope.ifblock !== undefined) {
        scope.ifblock.elements.push({
            element: undefined,
            name: name,
            attributes: attributes,
            children: children,
            evaluate: undefined,
            data: data,
            elementData: undefined
        });
        scope.ifblock = undefined;
    }
}
function CreateElement(element, data, name, attributes, context, children) {
    if (attributes["wx:for"] !== undefined) {
        CreateForElement(element, data, name, attributes, context, children);
    }
    else if (attributes["wx:if"] !== undefined) {
        CreateIfElement(element, data, name, attributes, context, children);
    }
    else if (attributes["wx:elif"] !== undefined) {
        CreateElifElement(element, data, name, attributes, context, children);
    }
    else if (attributes["wx:else"] !== undefined) {
        CreateElseElement(element, data, name, attributes, context, children);
    }
    else {
        let e = context.page.document.createElement(name);
        ElementSetAttributes(e, data, attributes);
        element.append(e);
        context.begin();
        children(e, data, context);
        context.end();
    }
}
exports.CreateElement = CreateElement;
var page = new Page_1.Page();
page.document.addElementClass("view", ViewElement_1.ViewElement);
page.document.addElementClass("input", InputElement_1.InputElement);
page.document.addElementClass("image", ImageElement_1.ImageElement);
page.document.addElementClass("scroll-view", ScrollViewElement_1.ScrollViewElement);
page.document.addElementClass("swiper", SwiperElement_1.SwiperElement);
page.document.addElementClass("swiper-item", SwiperElement_1.SwiperItemElement);
page.document.addElementClass("movable-view", MovableViewElement_1.MovableViewElement);
page.document.addElementClass("icon", IconElement_1.IconElement);
page.document.addElementClass("text", TextElement_1.TextElement);
page.document.addElementClass("rich-text", RichTextElement_1.RichTextElement);
page.document.addElementClass("progress", ProgressElement_1.ProgressElement);
page.document.addElementClass("button", ButtonElement_1.ButtonElement);
page.document.addElementClass("checkbox", CheckboxElement_1.CheckboxElement);
page.document.addElementClass("form", FormElement_1.FormElement);
page.document.addElementClass("label", LabelElement_1.LabelElement);
page.document.addElementClass("picker", PickerElement_1.PickerElement);
page.document.addElementClass("picker-view", PickerViewElement_1.PickerViewElement);
page.document.addElementClass("radio", RadioElement_1.RadioElement);
page.document.addElementClass("slider", SliderElement_1.SliderElement);
page.document.addElementClass("switch", SwitchElement_1.SwitchElement);
page.document.addElementClass("textarea", TextareaElement_1.TextareaElement);
page.document.addElementClass("navigator", NavigatorElement_1.NavigatorElement);
page.document.addElementClass("canvas", CanvasElement_1.CanvasElement);
page.document.addElementClass("block", BlockElement_1.BlockElement);
function Page(view, styleSheet, options) {
    IPC_1.postMessage({ page: 'readying' });
    view(page.document.documentElement, page.data, new Page_1.PageViewContext(page));
    page.data.changedKeys([]);
    once_1.once(() => { IPC_1.postMessage({ page: 'ready' }); });
}
exports.Page = Page;
function setData(data) {
    for (var key in data) {
        page.data.set([key], data[key]);
    }
    console.info("[DATA]", data);
}
exports.setData = setData;
function sendEvent(id, name, data) {
    let element = page.document.element(id);
    if (element != undefined) {
        element.onEvent(name, data);
    }
}
exports.sendEvent = sendEvent;

},{"./BlockElement":2,"./ButtonElement":3,"./CanvasElement":4,"./CheckboxElement":5,"./Data":6,"./Element":8,"./FormElement":11,"./IPC":12,"./IconElement":13,"./ImageElement":14,"./InputElement":15,"./LabelElement":16,"./MovableViewElement":18,"./NavigatorElement":20,"./Page":21,"./PickerElement":22,"./PickerViewElement":23,"./ProgressElement":24,"./RadioElement":25,"./RichTextElement":26,"./ScrollViewElement":27,"./SliderElement":28,"./SwiperElement":30,"./SwitchElement":31,"./TextElement":32,"./TextareaElement":33,"./ViewElement":36,"./once":37}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewElement_1 = require("./ViewElement");
class MovableViewElement extends ViewElement_1.ViewElement {
}
exports.MovableViewElement = MovableViewElement;

},{"./ViewElement":36}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewElement_1 = require("./ViewElement");
const IPC_1 = require("./IPC");
const once_1 = require("./once");
var _autoId = 0;
class NViewElement extends ViewElement_1.ViewElement {
    constructor() {
        super(...arguments);
        this._displaying = false;
    }
    createView() {
        var v = document.createElement("wx-" + this._name);
        IPC_1.postMessage({
            view: 'create',
            id: this._id,
            name: this._name
        });
        return v;
    }
    display() {
        var p = this._view;
        var x = 0;
        var y = 0;
        while (p !== undefined && p != document.body) {
            x += p.offsetLeft;
            y += p.offsetTop;
            p = p.offsetParent;
        }
        IPC_1.postMessage({
            view: 'setFrame',
            id: this._id,
            x: x,
            y: y,
            width: this._view.clientWidth,
            height: this._view.clientHeight
        });
        this._displaying = false;
    }
    setNeedsDisplay() {
        if (this._displaying) {
            return;
        }
        this._displaying = true;
        var v = this;
        once_1.once(function () {
            v.display();
        });
    }
    hasNativeKey(key) {
        return true;
    }
    set(key, value) {
        super.set(key, value);
        if (this.hasNativeKey(key)) {
            IPC_1.postMessage({
                view: 'set',
                id: this._id,
                name: key,
                value: value
            });
        }
        this.setNeedsDisplay();
    }
    onDidAddToParent(element) {
        super.onDidAddToParent(element);
        var pid = undefined;
        if (element instanceof NViewElement) {
            pid = element._id;
        }
        IPC_1.postMessage({
            view: 'add',
            id: this._id,
            pid: pid
        });
        this.setNeedsDisplay();
    }
    onWillRemoveFromParent(element) {
        super.onWillRemoveFromParent(element);
        IPC_1.postMessage({
            view: 'remove',
            id: this._id
        });
    }
    recycle() {
        IPC_1.postMessage({
            view: 'remove',
            id: this._id
        });
        super.recycle();
    }
}
exports.NViewElement = NViewElement;

},{"./IPC":12,"./ViewElement":36,"./once":37}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewElement_1 = require("./ViewElement");
const IPC_1 = require("./IPC");
class NavigatorElement extends ViewElement_1.ViewElement {
    constructor(document, name, id) {
        super(document, name, id);
        this._hoverStartTime = 50;
        this._hoverStayTime = 600;
        this.set("hover-class", "navigator-hover");
    }
    doEvent(event, name, detail) {
        super.doEvent(event, name, detail);
        var v = this.get("url");
        if (name == "tap" && v) {
            IPC_1.postMessage({ page: "open", url: v });
        }
    }
}
exports.NavigatorElement = NavigatorElement;

},{"./IPC":12,"./ViewElement":36}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Data_1 = require("./Data");
const Document_1 = require("./Document");
class IfBlock {
    constructor(element, func) {
        this.elements = [element];
        this.func = func;
    }
}
exports.IfBlock = IfBlock;
class PageViewScope {
}
exports.PageViewScope = PageViewScope;
class PageViewContext {
    constructor(page) {
        this._page = page;
        this._scopes = [new PageViewScope()];
    }
    get page() {
        return this._page;
    }
    begin() {
        this._scopes.push(new PageViewScope());
    }
    end() {
        this._scopes.pop();
    }
    scope() {
        return this._scopes[this._scopes.length - 1];
    }
}
exports.PageViewContext = PageViewContext;
class Page {
    constructor() {
        this._document = new Document_1.Document();
        this._data = new Data_1.Data();
    }
    get document() {
        return this._document;
    }
    get data() {
        return this._data;
    }
}
exports.Page = Page;

},{"./Data":6,"./Document":7}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewElement_1 = require("./ViewElement");
class PickerElement extends ViewElement_1.ViewElement {
}
exports.PickerElement = PickerElement;

},{"./ViewElement":36}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewElement_1 = require("./ViewElement");
class PickerViewElement extends ViewElement_1.ViewElement {
}
exports.PickerViewElement = PickerViewElement;

},{"./ViewElement":36}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewElement_1 = require("./ViewElement");
class ProgressElement extends ViewElement_1.ViewElement {
}
exports.ProgressElement = ProgressElement;

},{"./ViewElement":36}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewElement_1 = require("./ViewElement");
class RadioElement extends ViewElement_1.ViewElement {
}
exports.RadioElement = RadioElement;

},{"./ViewElement":36}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewElement_1 = require("./ViewElement");
class RichTextElement extends ViewElement_1.ViewElement {
}
exports.RichTextElement = RichTextElement;

},{"./ViewElement":36}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewElement_1 = require("./ViewElement");
const V_1 = require("./V");
const Anim_1 = require("./Anim");
class ScrollViewElement extends ViewElement_1.ViewElement {
    constructor(document, name, id) {
        super(document, name, id);
        this._scrollAnimateId = 0;
        this._upperThreshold = 50;
        this._lowerThreshold = 50;
        this._enabledScrollX = false;
        this._enabledScrollY = false;
        this._thgresholdin = false;
        this._scrollWithAnimation = false;
        let element = this;
        let delta = {
            x: 0,
            y: 0,
            deltaX: 0,
            deltaY: 0
        };
        this._view.addEventListener("scroll", (event) => {
            element.onScroll(element.scrollLeft, element.scrollTop, event);
            delta.deltaX = element.scrollLeft - delta.x;
            delta.deltaY = element.scrollTop - delta.y;
            delta.x = element.scrollLeft;
            delta.y = element.scrollTop;
            element.doEvent(event, "scroll", {
                scrollLeft: element.scrollLeft,
                scrollTop: element.scrollTop,
                scrollWidth: element.scrollWidth,
                scrollHeight: element.scrollHeight,
                deltaX: delta.deltaX,
                deltaY: delta.deltaY
            });
            event.stopPropagation();
        });
    }
    doEvent(event, name, detail) {
        super.doEvent(event, name, detail);
    }
    scrollTo(x, y, animated) {
        if (this._scrollAnimateId) {
            Anim_1.clearAnimation(this._scrollAnimateId);
            this._scrollAnimateId = 0;
        }
        if (animated) {
            let view = this._view;
            let x0 = view.scrollLeft;
            let y0 = view.scrollTop;
            let dx = x - x0;
            let dy = y - y0;
            this._scrollAnimateId = Anim_1.startAnimation(300, (v) => {
                view.scrollTo(x0 + dx * v, y0 + dy * v);
            });
        }
        else {
            this._view.scrollTo(x, y);
        }
    }
    onScroll(x, y, event) {
        var sBottom = this._view.scrollHeight - this._view.clientHeight;
        var sRight = this._view.scrollWidth - this._view.clientWidth;
        if (this._enabledScrollY) {
            if (y < this._upperThreshold) {
                if (!this._thgresholdin) {
                    this._thgresholdin = true;
                    this.doEvent(event, "scrolltoupper", {});
                    ;
                }
            }
            else if (y > sBottom - this._lowerThreshold) {
                if (!this._thgresholdin) {
                    this._thgresholdin = true;
                    this.doEvent(event, "scrolltolower", {});
                    ;
                }
            }
            else {
                this._thgresholdin = false;
            }
        }
        else if (this._enabledScrollX) {
            if (x < this._upperThreshold) {
                if (!this._thgresholdin) {
                    this._thgresholdin = true;
                    this.doEvent(event, "scrolltoupper", {});
                    ;
                }
            }
            else if (x > sRight - this._lowerThreshold) {
                if (!this._thgresholdin) {
                    this._thgresholdin = true;
                    this.doEvent(event, "scrolltolower", {});
                    ;
                }
            }
            else {
                this._thgresholdin = false;
            }
        }
    }
    get scrollLeft() {
        return this._view.scrollLeft;
    }
    get scrollTop() {
        return this._view.scrollTop;
    }
    get scrollWidth() {
        return this._view.scrollWidth;
    }
    get scrollHeight() {
        return this._view.scrollHeight;
    }
    set(key, value) {
        super.set(key, value);
        if (key == 'scroll-x') {
            if (V_1.booleanValue(value)) {
                this._view.style.overflowX = 'auto';
                this._enabledScrollX = true;
            }
            else {
                this._view.style.overflowX = 'hidden';
                this._enabledScrollX = false;
            }
        }
        else if (key == 'scroll-y') {
            if (V_1.booleanValue(value)) {
                this._view.style.overflowY = 'auto';
                this._enabledScrollY = true;
            }
            else {
                this._view.style.overflowY = 'hidden';
                this._enabledScrollY = false;
            }
        }
        else if (key == 'upper-threshold') {
            this._upperThreshold = V_1.pixelValue(value);
        }
        else if (key == 'lower-threshold') {
            this._lowerThreshold = V_1.pixelValue(value);
        }
        else if (key == 'scroll-into-view') {
            if (value) {
                var v = document.getElementById(value);
                if (v && v.parentElement == this._view) {
                    if (this._enabledScrollY) {
                        this.scrollTo(this._view.scrollLeft, v.offsetTop, this._scrollWithAnimation);
                    }
                    else if (this._enabledScrollX) {
                        this.scrollTo(v.offsetLeft, this._view.scrollTop, this._scrollWithAnimation);
                    }
                }
            }
        }
        else if (key == 'scroll-top') {
            if (this._enabledScrollY) {
                this.scrollTo(this._view.scrollLeft, V_1.pixelValue(value), this._scrollWithAnimation);
            }
        }
        else if (key == 'scroll-left') {
            if (this._enabledScrollX) {
                this.scrollTo(V_1.pixelValue(value), this._view.scrollTop, this._scrollWithAnimation);
            }
        }
    }
}
exports.ScrollViewElement = ScrollViewElement;

},{"./Anim":1,"./V":35,"./ViewElement":36}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewElement_1 = require("./ViewElement");
class SliderElement extends ViewElement_1.ViewElement {
}
exports.SliderElement = SliderElement;

},{"./ViewElement":36}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewElement_1 = require("./ViewElement");
const V_1 = require("./V");
const once_1 = require("./once");
const BlockElement_1 = require("./BlockElement");
const Anim_1 = require("./Anim");
class SwiperItemElement extends ViewElement_1.ViewElement {
}
exports.SwiperItemElement = SwiperItemElement;
class SwiperElement extends ViewElement_1.ViewElement {
    constructor(document, name, id) {
        super(document, name, id);
        this._scrollAnimationId = 0;
        this._index = 0;
        this._touching = false;
        this._preScrollX = 0;
        this._preScrollY = 0;
        this._vScrollX = 0;
        this._vScrollY = 0;
        this._vertical = false;
        this._items = [];
        this._autoplaying = false;
        this._updateItemsing = false;
        this._interval = 5000;
        this._duration = 500;
        this._autoplay = false;
        let element = this;
        this.scrollView.addEventListener("scroll", (event) => {
            element.onScroll(event);
            event.stopPropagation();
        });
        this.scrollView.addEventListener("touchstart", (event) => {
            element.onTouchStart(event);
        });
        this.scrollView.addEventListener("touchend", (event) => {
            element.onTouchEnd(event);
            event.preventDefault();
            event.stopPropagation();
        });
        this.scrollView.addEventListener("touchcancel", (event) => {
            element.onTouchEnd(event);
            event.preventDefault();
            event.stopPropagation();
        });
    }
    get contentView() {
        return this._view.contentView;
    }
    get width() {
        return this._view.clientWidth;
    }
    get height() {
        return this._view.clientHeight;
    }
    scrollTo(x, y, animated) {
        if (this._scrollAnimationId) {
            Anim_1.clearAnimation(this._scrollAnimationId);
            this._scrollAnimationId = 0;
        }
        if (animated) {
            let element = this;
            let view = this.scrollView;
            let x0 = view.scrollLeft;
            let y0 = view.scrollTop;
            let dx = x - x0;
            let dy = y - y0;
            this._scrollAnimationId = Anim_1.startAnimation(this._duration, (v) => {
                view.scrollTo(x0 + dx * v, y0 + dy * v);
                if (v >= 1) {
                    element._scrollAnimationId = 0;
                }
            });
        }
        else {
            this._view.scrollTo(x, y);
        }
    }
    scrollToPage(index, animated, source) {
        if (this._vertical) {
            var b = this._view.clientHeight;
            this.scrollTo(this.scrollView.scrollLeft, (index * b), animated);
        }
        else {
            var b = this._view.clientWidth;
            this.scrollTo((index * b), this.scrollView.scrollTop, animated);
        }
        let view = this.dotsView;
        let items = view.children;
        let n = items.length;
        for (let i = 0; i < n; i++) {
            let item = items[i];
            if (i == index) {
                item.className = "wx-active";
            }
            else {
                item.className = "";
            }
        }
        if (this._index != index) {
            this._index = index;
            this.doElementEvent("change", { current: index, source: source });
        }
    }
    onTouchStart(event) {
        this._touching = true;
    }
    onTouchEnd(event) {
        this._touching = false;
        if (this._items.length == 0) {
            return;
        }
        if (this._vertical) {
            let index = Math.floor(this.scrollView.scrollTop / this._view.clientHeight);
            if (this._vScrollY > 5) {
                index++;
            }
            if (index < 0) {
                index = 0;
            }
            if (index > this._items.length) {
                index = this._items.length - 1;
            }
            this.scrollToPage(index, true, "touch");
        }
        else {
            let index = Math.floor(this.scrollView.scrollLeft / this._view.clientWidth);
            if (this._vScrollX > 5) {
                index++;
            }
            if (index < 0) {
                index = 0;
            }
            if (index > this._items.length) {
                index = this._items.length - 1;
            }
            this.scrollToPage(index, true, "touch");
        }
    }
    onScroll(event) {
        let x = this.scrollView.scrollLeft;
        let y = this.scrollView.scrollTop;
        if (Math.abs(x - this._preScrollX) > 5) {
            this._vScrollX = x - this._preScrollX;
            this._preScrollX = x;
        }
        if (Math.abs(y - this._preScrollY) > 5) {
            this._vScrollY = y - this._preScrollY;
            this._preScrollY = y;
        }
    }
    get dotsView() {
        return this._view.dotsView;
    }
    get scrollView() {
        return this._view.scrollView;
    }
    createView() {
        var v = document.createElement("wx-" + this._name);
        v.scrollView = document.createElement("div");
        v.scrollView.className = "wx-scroll";
        v.appendChild(v.scrollView);
        v.contentView = document.createElement("div");
        v.contentView.className = "wx-content";
        v.scrollView.appendChild(v.contentView);
        v.dotsView = document.createElement("div");
        v.dotsView.className = "wx-dots";
        v.appendChild(v.dotsView);
        return v;
    }
    set(key, value) {
        super.set(key, value);
        if (key == "indicator-dots") {
            if (V_1.booleanValue(value)) {
                this.dotsView.style.display = 'block';
            }
            else {
                this.dotsView.style.display = 'none';
            }
        }
        else if (key == 'vertical') {
            this._vertical = V_1.booleanValue(value);
            let v = this.scrollView;
            if (this._vertical) {
                v.style.overflowX = 'hidden';
                v.style.overflowY = 'auto';
            }
            else {
                v.style.overflowX = 'auto';
                v.style.overflowY = 'hidden';
            }
            this.setNeedsUpdateItems();
        }
        else if (key == 'autoplay') {
            this._autoplay = V_1.booleanValue(value);
            this.setNeedsAutoplay();
        }
        else if (key == 'duration') {
            this._duration = parseFloat(value || '0');
        }
        else if (key == 'interval') {
            this._interval = parseFloat(value || '0');
            this.setNeedsAutoplay();
        }
    }
    updateDotView() {
        let view = this.dotsView;
        let p = view.firstElementChild;
        let index = 0;
        let n = this._items.length;
        while (p) {
            if (index < n) {
                p.className = '';
            }
            else {
                let e = p.nextElementSibling;
                view.removeChild(p);
                p = e;
                index++;
                continue;
            }
            p = p.nextElementSibling;
            index++;
        }
        while (index < n) {
            let v = document.createElement('span');
            view.appendChild(v);
            index++;
        }
        if (this._vertical) {
            view.className = 'wx-dots wx-vertical';
            view.style.marginLeft = 'auto';
            let h = (9 * this._items.length);
            view.style.height = h + 'px';
            view.style.marginTop = (-h * 0.5) + 'px';
        }
        else {
            view.className = 'wx-dots';
            view.style.height = 'auto';
            view.style.marginTop = 'auto';
            view.style.marginLeft = (-view.clientWidth * 0.5) + 'px';
        }
    }
    updateItems() {
        let width = this.width;
        let height = this.height;
        let index = 0;
        let p = this.firstChild;
        let items = [];
        let vertical = this._vertical;
        let each = (p) => {
            if (vertical) {
                p.view.style.top = (index * height) + 'px';
                p.view.style.left = '0px';
            }
            else {
                p.view.style.left = (index * width) + 'px';
                p.view.style.top = '0px';
            }
            p.view.style.width = width + 'px';
            p.view.style.height = height + 'px';
            items.push(p);
            index++;
        };
        while (p) {
            if (p instanceof SwiperItemElement) {
                each(p);
            }
            else if (p instanceof BlockElement_1.BlockElement) {
                let e = p.firstChild;
                while (e) {
                    if (e instanceof SwiperItemElement) {
                        each(e);
                    }
                    e = e.nextSibling;
                }
            }
            p = p.nextSibling;
        }
        this._items = items;
        if (vertical) {
            this.contentView.style.width = width + 'px';
            this.contentView.style.height = (height * index) + 'px';
            this.scrollView.style.width = (width + 20) + 'px';
            this.scrollView.style.height = height + 'px';
        }
        else {
            this.contentView.style.width = (width * index) + 'px';
            this.contentView.style.height = height + 'px';
            this.scrollView.style.width = width + 'px';
            this.scrollView.style.height = (height + 20) + 'px';
        }
        if (index >= items.length) {
            index = 0;
        }
        this.updateDotView();
        this.scrollToPage(index, false, "autoplay");
        this._updateItemsing = false;
    }
    autoplayNextPage() {
        if (this._touching) {
            return;
        }
        if (this._scrollAnimationId) {
            return;
        }
        let n = this._items.length;
        if (n == 0) {
            return;
        }
        this.scrollToPage((this._index + 1) % n, true, "autoplay");
    }
    setAutoplay() {
        if (this._autoplay) {
            clearInterval(this._autoplayId);
            let v = this;
            this._autoplayId = setInterval(function () {
                v.autoplayNextPage();
            }, this._interval);
        }
        else if (this._autoplayId) {
            clearInterval(this._autoplayId);
            this._autoplayId = undefined;
        }
        this._autoplaying = false;
    }
    setNeedsAutoplay() {
        if (this._autoplaying) {
            return;
        }
        this._autoplaying = true;
        let v = this;
        once_1.once(() => {
            v.setAutoplay();
        });
    }
    recycle() {
        if (this._autoplayId) {
            clearInterval(this._autoplayId);
            this._autoplayId = undefined;
        }
        super.recycle();
    }
    setNeedsUpdateItems() {
        if (this._updateItemsing) {
            return;
        }
        this._updateItemsing = true;
        let v = this;
        once_1.once(() => {
            v.updateItems();
        });
    }
    onDidAddChildren(element) {
        super.onDidAddChildren(element);
        this.setNeedsUpdateItems();
    }
    onWillRemoveChildren(element) {
        super.onWillRemoveChildren(element);
        this.setNeedsUpdateItems();
    }
}
exports.SwiperElement = SwiperElement;

},{"./Anim":1,"./BlockElement":2,"./V":35,"./ViewElement":36,"./once":37}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewElement_1 = require("./ViewElement");
class SwitchElement extends ViewElement_1.ViewElement {
}
exports.SwitchElement = SwitchElement;

},{"./ViewElement":36}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ViewElement_1 = require("./ViewElement");
class TextElement extends ViewElement_1.ViewElement {
}
exports.TextElement = TextElement;

},{"./ViewElement":36}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InputElement_1 = require("./InputElement");
class TextareaElement extends InputElement_1.InputElement {
}
exports.TextareaElement = TextareaElement;

},{"./InputElement":15}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function resolveURI(uri) {
    if (uri.indexOf('://') < 0) {
        let v = window.__basePath;
        if (v !== undefined) {
            return v + '/' + uri;
        }
    }
    return uri;
}
exports.resolveURI = resolveURI;

},{}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function booleanValue(v) {
    return v == 'true';
}
exports.booleanValue = booleanValue;
function pixelValue(v) {
    if (v && v.endsWith("rpx")) {
        var r = parseFloat(document.documentElement.style.fontSize) || 14;
        return parseFloat(v) * r * 0.05;
    }
    else if (v) {
        return parseFloat(v) || 0;
    }
    return 0;
}
exports.pixelValue = pixelValue;

},{}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Element_1 = require("./Element");
const BlockElement_1 = require("./BlockElement");
function getDataSet(element) {
    let v = {};
    let length = element.attributes.length;
    for (var i = 0; i < length; i++) {
        var attr = element.attributes.item(i);
        if (attr.localName.startsWith("data-")) {
            v[attr.localName.substr(5)] = attr.value;
        }
    }
    return v;
}
function getTouches(touches) {
    let vs = [];
    let length = touches.length;
    for (var i = 0; i < length; i++) {
        let touch = touches.item(i);
        vs.push({
            identifier: touch.identifier,
            pageX: touch.pageX,
            pageY: touch.pageY,
            clientX: touch.clientX,
            clientY: touch.clientY
        });
    }
    return vs;
}
class ViewElement extends Element_1.Element {
    get view() {
        return this._view;
    }
    get contentView() {
        return this._view;
    }
    createView() {
        return document.createElement("wx-" + this._name);
    }
    setHover(hover) {
        if (this._hoverTimeoutId) {
            clearTimeout(this._hoverTimeoutId);
            this._hoverTimeoutId = undefined;
        }
        if (hover) {
            var v = this.get("hover-class");
            if (v && v != 'none') {
                this._view.className = (this.get("class") || '') + ' ' + v;
                return;
            }
        }
        this._view.className = this.get("class") || '';
        this._hover = hover;
    }
    doElementEvent(name, detail) {
        let e = new Element_1.ElementEvent(this);
        let target = {
            id: this._view.id,
            dataset: getDataSet(this._view)
        };
        e.data = {
            type: name,
            target: target,
            currentTarget: target,
            detail: detail
        };
        this.emit(name, e);
    }
    doEvent(event, name, detail) {
        let e = new Element_1.ElementEvent(this);
        e.data = {
            type: name,
            timeStamp: event.timeStamp,
            target: event.target ? {
                id: event.target.id,
                dataset: getDataSet(event.target)
            } : undefined,
            currentTarget: event.currentTarget ? {
                id: event.currentTarget.id,
                dataset: getDataSet(event.target)
            } : undefined,
            detail: detail,
            touches: event instanceof TouchEvent ? getTouches(event.touches) : undefined,
            changedTouches: event instanceof TouchEvent ? getTouches(event.changedTouches) : undefined,
        };
        this.emit(name, e);
        if (e.cancelBubble) {
            event.stopPropagation();
        }
        if (name == "touchstart") {
            if (this._hoverTimeoutId) {
                clearTimeout(this._hoverTimeoutId);
            }
            let v = this;
            this._hoverTimeoutId = setTimeout(function () {
                v.setHover(true);
            }, this._hoverStartTime);
        }
        else if (name == "touchend" || name == "touchcancel") {
            if (this._hoverTimeoutId) {
                clearTimeout(this._hoverTimeoutId);
            }
            let v = this;
            this._hoverTimeoutId = setTimeout(function () {
                v.setHover(false);
            }, this._hoverStayTime);
        }
    }
    constructor(document, name, id) {
        super(document, name, id);
        this._hoverStartTime = 50;
        this._hoverStayTime = 400;
        this._hoverStopPropagation = false;
        this._hover = false;
        let timeStamp = 0;
        let element = this;
        this._view = this.createView();
        this._view.addEventListener("touchstart", (event) => {
            timeStamp = event.timeStamp;
            element.doEvent(event, "touchstart", {});
        });
        this._view.addEventListener("touchmove", (event) => {
            element.doEvent(event, "touchmove", {});
        });
        this._view.addEventListener("touchcancel", (event) => {
            element.doEvent(event, "touchcancel", {});
        });
        this._view.addEventListener("touchend", (event) => {
            element.doEvent(event, "touchend", {});
        });
        this._view.addEventListener("touchforcechange", (event) => {
            element.doEvent(event, "touchforcechange", {});
        });
        this._view.addEventListener("mouseup", (event) => {
            if (event.timeStamp - timeStamp > 350) {
                if (element.has("longpress")) {
                    element.doEvent(event, "longpress", {});
                    return;
                }
                element.doEvent(event, "longtap", {});
            }
            element.doEvent(event, "tap", {});
        });
    }
    set(key, value) {
        super.set(key, value);
        if (key == 'class') {
            this._view.className = value === undefined ? '' : value;
        }
        else if (key == 'style') {
            if (value === undefined) {
                this._view.removeAttribute(key);
            }
            else {
                this._view.setAttribute('style', value);
            }
        }
        else if (key == '#text') {
            this._view.innerText = value === undefined ? '' : value;
        }
        else if (key == 'id') {
            if (value === undefined) {
                this._view.removeAttribute("id");
            }
            else {
                this._view.setAttribute("id", value);
            }
        }
        else if (key.startsWith("data-")) {
            if (value === undefined) {
                this._view.removeAttribute(key);
            }
            else {
                this._view.setAttribute(key, value);
            }
        }
        else if (key == 'hover-stop-propagation') {
            this._hoverStopPropagation = value == 'true';
        }
        else if (key == 'hover-start-time') {
            this._hoverStartTime = parseInt(value || '0');
        }
        else if (key == 'hover-stay-time') {
            this._hoverStayTime = parseInt(value || '0');
        }
    }
    onDidAddToParent(element) {
        super.onDidAddToParent(element);
        if (element instanceof ViewElement) {
            element.contentView.appendChild(this._view);
        }
        else if (element instanceof BlockElement_1.BlockElement) {
            debugger;
            if (element.parent instanceof ViewElement) {
                element.parent.contentView.appendChild(this._view);
            }
        }
        else {
            document.body.appendChild(this._view);
        }
    }
    onWillRemoveFromParent(element) {
        super.onWillRemoveFromParent(element);
        let p = this._view.parentElement;
        if (p) {
            p.removeChild(this._view);
        }
    }
    recycle() {
        super.recycle();
    }
}
exports.ViewElement = ViewElement;

},{"./BlockElement":2,"./Element":8}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _running = false;
var _funcs = [];
function run() {
    var fn;
    while ((fn = _funcs.shift())) {
        fn();
    }
    _running = false;
}
function once(func) {
    _funcs.push(func);
    if (!_running) {
        _running = true;
        setTimeout(function () {
            run();
        }, 0);
    }
}
exports.once = once;

},{}],38:[function(require,module,exports){

require('./bin/Data.js');
require('./bin/V.js');
require('./bin/Anim.js');
require('./bin/URI.js');
require('./bin/IPC.js');
require('./bin/once.js');
require('./bin/Event.js');
require('./bin/EventEmitter.js');
require('./bin/Style.js');
require('./bin/Element.js');
require('./bin/ViewElement.js');
require('./bin/ImageElement.js');
require('./bin/NViewElement.js');
require('./bin/InputElement.js');
require('./bin/ScrollViewElement.js');
require('./bin/SwiperElement.js');
require('./bin/MovableViewElement.js');
require('./bin/IconElement.js');
require('./bin/TextElement.js');
require('./bin/RichTextElement.js');
require('./bin/ProgressElement.js');
require('./bin/ButtonElement.js');
require('./bin/CheckboxElement.js');
require('./bin/FormElement.js');
require('./bin/LabelElement.js');
require('./bin/PickerElement.js');
require('./bin/PickerViewElement.js');
require('./bin/RadioElement.js');
require('./bin/SliderElement.js');
require('./bin/SwitchElement.js');
require('./bin/TextareaElement.js');
require('./bin/NavigatorElement.js');
require('./bin/CanvasElement.js');
require('./bin/BlockElement.js');

require('./bin/Document.js');
require('./bin/Page.js');

kk = require('./bin/Main.js');


},{"./bin/Anim.js":1,"./bin/BlockElement.js":2,"./bin/ButtonElement.js":3,"./bin/CanvasElement.js":4,"./bin/CheckboxElement.js":5,"./bin/Data.js":6,"./bin/Document.js":7,"./bin/Element.js":8,"./bin/Event.js":9,"./bin/EventEmitter.js":10,"./bin/FormElement.js":11,"./bin/IPC.js":12,"./bin/IconElement.js":13,"./bin/ImageElement.js":14,"./bin/InputElement.js":15,"./bin/LabelElement.js":16,"./bin/Main.js":17,"./bin/MovableViewElement.js":18,"./bin/NViewElement.js":19,"./bin/NavigatorElement.js":20,"./bin/Page.js":21,"./bin/PickerElement.js":22,"./bin/PickerViewElement.js":23,"./bin/ProgressElement.js":24,"./bin/RadioElement.js":25,"./bin/RichTextElement.js":26,"./bin/ScrollViewElement.js":27,"./bin/SliderElement.js":28,"./bin/Style.js":29,"./bin/SwiperElement.js":30,"./bin/SwitchElement.js":31,"./bin/TextElement.js":32,"./bin/TextareaElement.js":33,"./bin/URI.js":34,"./bin/V.js":35,"./bin/ViewElement.js":36,"./bin/once.js":37}],39:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

EventEmitter.prototype.listeners = function listeners(type) {
  var evlistener;
  var ret;
  var events = this._events;

  if (!events)
    ret = [];
  else {
    evlistener = events[type];
    if (!evlistener)
      ret = [];
    else if (typeof evlistener === 'function')
      ret = [evlistener.listener || evlistener];
    else
      ret = unwrapListeners(evlistener);
  }

  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}]},{},[38]);