1、手写实现一个call / apply /bind函数。
    Function.prototype._call = function(cxt) {
        let args = [...arguments].slice(1);
        if(typeof this !== 'function') {
            console.error('must be a function')
            return
        }

        ctx = ctx || window || global;
        ctx.fn = this;
        let result = ctx.fn(...args)
        delete ctx.fn;
        return result
    }


    Function.prototype._apply = function(cxt) {
        let args = [...arguments].slice(1);
        if(typeof this !== 'function') {
            console.error('must be a function')
            return
        }

        ctx = ctx || window || global;
        ctx.fn = this;
        let result = ctx.fn(args)
        delete ctx.fn;
        return result
    }

    Function.prototype._bind = function(cxt) {
        let _args = [...arguments].slice(1);
        if(typeof this !== 'function') {
            console.error('must be a function')
            return
        }

        let _this = this
        return function F(){
            let args = Array.from(arguments).push(..._args);
            if(this instanceof F) {
                return new _this(...args)
            } else {
                return _this.apply(cxt, args)
            }
        }
    }
    
2、手写实现一个promise

    问题1：then中考虑异步与同步问题。
        如果new Promise中使用setTimeout异步执行resolve操作，then中的回调执行如何确认在resolve之后才执行？
    
    问题2：then返回一个新的promise实例。

    var STATE_PENDING = 'pending'
    var STATE_RESOLVE = 'resolve'
    var STATE_REJECTED = 'rejected'
    function _Promise(executor) {
        this.value = undefined,
        this.reason = undefined,
        this.state = STATE_PENDING;
        
        this.resolveCallbacks = []
        this.rejectedCallbacks = []

        let _this = this;
        let resolve = function(res){
            console.log('resolve', res,12,_this)
            if(_this.state === STATE_PENDING) {
                _this.state = STATE_RESOLVE
                _this.value = res
                _this.resolveCallbacks.length && _this.resolveCallbacks.forEach(cb => cb(res))
            }
        }
        let reject = function(err){
            console.log('reject', res)
            if(_this.state === STATE_PENDING) {
                _this.state = STATE_REJECTED
                _this.reason = err
                _this.rejectedCallbacks.length && _this.rejectedCallbacks.forEach(cb => cb(err))
            }
        }
        // 捕获new _Promise时内部抛出的异常
        try {
            executor(resolve, reject)
        } catch (err) {
            reject(err)
        }
        
    }

    // 异步与同步执行resolve()函数时，then函数的执行
    _Promise.prototype.then = function(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
        onRejected = typeof onRejected === 'function' ? onRejected : r => { throw r }
        if(this.state === STATE_PENDING) {
            this.resolveCallbacks.push(onFulfilled)
            this.rejectedCallbacks.push(onRejected)
        }
        if(this.state === STATE_RESOLVE) {
            let res = onFulfilled(this.value)
            if(res instanceof _Promise || (res && typeof res.then === 'function')) {
                return res
            } else {
                return _Promise.resolve(res)
            }
        }
        if(this.state === STATE_REJECTED) {
            let res = onRejected(this.reason)
            if(res instanceof _Promise || (res && typeof res.catch === 'function')) {
                return res
            } else {
                return _Promise.rejected(res)
            }
        }
        return this
    }

    _Promise.prototype.resolve = function(val) {
        if(val && val instanceof _Promise) {
            return val
        } else if (val && typeof val === 'object' && val.then === 'function') {
            let then = val.then;
            return new _Promise(resolve => {
                then(resolve)
            })
        }else if (val) {
            return new _Promise(resolve => resolve(val))
        } else {
            return new _Promise(resolve => resolve())
        }
    }
    _Promise.prototype.catch = function(cb) {
        if(this.state === STATE_PENDING) {
            this.rejectedCallbacks.push(cb)
        } else if(this.state === STATE_REJECTED) {
            cb(this.reason)
        }
        return this
    }
    
    var p = new _Promise((resolve, reject) => {
        console.log(1,Date.now())
        setTimeout(() => {
            resolve('1秒后')
        }, 1000)
    })
    p.then(res => {
        console.log('then', res, 12,Date.now())
    }).then


3、手写实现一个new

    new一个构造函数发生了如下四个过程：

        1、初始化一个空对象
        2、空对象的__proto__属性指向构造函数的原型
        3、构造函数中的this指向空对象并执行构造函数完成初始化。
        4、构造函数如果返回一个对象，将会取代this

    function _new(fn){
        const ctx = {};
        ctx.__proto__ = fn.prototype;
        let res = fn.apply(ctx, Array.from(arguments).slice(1))
        
        return Object.prototype.toString.call(res) === '[object Object]' ? res : ctx
    }

4、实现一个函数防抖和节流
    //防抖
    function debounce(fn, delay) {
        return function () {
            const _this = this
            fn.id && clearTimeout(fn.id)
            fn.id = setTimeout(() => fn.apply(_this, [...arguments]), delay)
        }
    }

    // 节流 
    function throttle(fn, gapTime){
        return function (){
            const _this = this;
            if(!fn.run) {
                fn.run = true;
                setTimeout(() => {
                    // new Promise((resolve, reject) => {
                    //     fn.apply(_this, [...arguments])
                    // })
                    
                    console.log('网络请求', fn.run)
                    fn.run = false
                },gapTime)
            }
        }
    }
    // let fn = () => new Promise((resolve, reject) => {
    //     setTimeout(() => {
    //         console.log('延时')
    //         resolve()
    //     },2000)
    // })
    // var _thFn = throttle(fn, 1000)
    // setInterval(_thFn, 1000)

    //常规写法
    function throttle(fn, delay) {
        let runing = false;
        return function() {
            if(!runing) {
                runing = true
                setTimeout(() => {
                    fn.apply(this, [...arguments])
                    runing = false
                }, delay)
                
            }
        }
    }

    // 引申问题：如果节流函数中的fn是异步函数，这时候要怎么实现呢？

5、实现一个深拷贝函数 与 浅拷贝函数
    function deepClone(o) {
        if(o && typeof o === 'object') {
            let res = Array.isArray(o) ? [] : {}
            for(let key in o) {
                res[key] = deepClone(o[key])
            }
            return res
        }
        return o
    }

    let deepCopyO = JSON.stringify(JSON.parse(object));
    JSON.stringify的缺点：
        对象中存在重复引用对象会报错
        忽略undefined 函数

    
    // 浅拷贝
    Object.create(o)
    Object.assign(cloneObject, o)
    function shadowClone(o) {
        if(o && typeof o === 'object') {
            let res = Array.isArray(o) ? [] : {}
            for(let key in o) {
                res[key] = o[key]
            }
            return res
        }
        return o
    }


