一、
    1、实现红绿灯按顺序依次点亮：红灯三秒  绿灯一秒 黄灯两秒

    function red() {
        console.log("red")
    }
    function green() {
        console.log("green")
    }
    function yellow() {
        console.log("yellow")
    }

    // 亮灯，setTimeout异步实现延时效果
    var light = function (timmer, cb) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                cb()
                resolve()
            }, timmer)
        })
    }

    var queue = [
        {timeout: 3000, cb: red},
        {timeout: 1000, cb: green},
        {timeout: 2000, cb: yellow},
        {timeout: 0, cb: step},
    ]
    // 实现队列效果
    function step(){
        queue.reduce((p,n) => {
            return p.then(() => {
                return light(n.timeout, n.cb)
            })
        }, Promise.resolve())
    }
    step()

    // 活学活用：对koa-compose洋葱模型学习后，打算将step函数优化为compose模型
    function next(){
        return Promise.resolve()
    }
    function createNext(fn, next){
        return function(){
            fn(next)
        }
    }
    function step(){
        const len = queue.length - 1;
        for(let i = len; i >= 0; i--) {
            const item = queue[i]
            next = 
        }
    }


2、实现 mergePromise 函数，把传进去的数组按顺序先后执行，并且把返回的数据先后放到数组 data 中。

var timeout = ms => new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve();
    }, ms);
});

var ajax1 = () => timeout(2000).then(() => {
    console.log('1');
    return 1;
});

var ajax2 = () => timeout(1000).then(() => {
    console.log('2');
    return 2;
});

var ajax3 = () => timeout(2000).then(() => {
    console.log('3');
    return 3;
});

var data = [], sequence = Promise.resolve();
var mergePromise = ajaxArray => {
    // 在这里实现你的代码
    return new Promise((resolve, rejct) => {
        ajaxArray.forEach((ajax, index) => {
            sequence = sequence.then(ajax).then(res => {
                data.push(res)
                if (index === ajaxArray.length - 1) {
                    resolve(data)
                }
                return Promise.resolve()
            })
        })
    })
};

mergePromise([ajax1, ajax2, ajax3]).then(data => {
    console.log('done');
    console.log(1111, data); // data 为 [1, 2, 3]
});

// 要求分别输出
// 1
// 2
// 3
// done
// [1, 2, 3]


3、并发量限制

    有 8 个图片资源的 url，已经存储在数组 urls 中（即urls = ['http://example.com/1.jpg', ...., 'http://example.com/8.jpg']），
    而且已经有一个函数 function loadImg，输入一个 url 链接，返回一个 Promise，该 Promise 在图片下载完成的时候 resolve，下载失败则 reject。
    但是我们要求，任意时刻，同时下载的链接数量不可以超过 3 个。
    请写一段代码实现这个需求，要求尽可能快速地将所有图片下载完成。

var urls = [
    'https://www.kkkk1000.com/images/getImgData/getImgDatadata.jpg', 
    'https://www.kkkk1000.com/images/getImgData/gray.gif', 
    'https://www.kkkk1000.com/images/getImgData/Particle.gif', 
    'https://www.kkkk1000.com/images/getImgData/arithmetic.png', 
    'https://www.kkkk1000.com/images/getImgData/arithmetic2.gif', 
    'https://www.kkkk1000.com/images/getImgData/getImgDataError.jpg', 
    'https://www.kkkk1000.com/images/getImgData/arithmetic.gif', 
    'https://user-gold-cdn.xitu.io/2018/10/29/166be40ccc434be0?w=600&h=342&f=png&s=122185'];

function loadImg(url) {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = function () {
            console.log('一张图片加载完成',url);
            resolve();
        }
        img.onerror = reject
        img.src = url
    })
};

var loads = function (limit) {
var sequence = [].concat(urls);
var promises = sequence.splice(0, limit).map((url, index) => {
    return loadImg(url).then(() => {
        return index
    })
})

return sequence.reduce((p,url,curIndex) => {
    return p.then(() => {
        return Promise.race(promises)
    }).then(index => {
        // console.log("每一次是什么值", index, url)
        promises[index] = loadImg(url).then(() => {
            return index
        })
    })
}, Promise.resolve())
}



4、JS实现一个带并发限制的异步调度器Scheduler，保证同时运行的任务最多有 一个 两个 。

class Scheduler {
    constructor() {
        this.pendings = []
        this.plays = []
        this.maxNum = 2
        this.num = 0
        this.runindex = 0
    }

    add(promiseCreator) {
        this.num++
        this.pendings.push({
            index: this.num,
            val: promiseCreator
        })
        this.push()
    }

    push() {
        if(this.plays.length < this.maxNum && this.pendings.length) {
            let item = this.pendings.splice(0,1)[0]
            this.runindex = item.index
            this.plays.push(item)
            this.run()
        }
    }
    
    run(){
        this.plays.forEach((item,index) => {
            if(item.index === this.runindex) {
                item.val().then(res => {
                    this.plays.splice(index, 1)
                    this.run()
                })
            }
        })
        }
    }

const timeout = (time,order) => new Promise(resolve => {
    setTimeout(() => { resolve(); console.log(Date.now(), order)}, time)
})

const scheduler = new Scheduler()
const addTask = (time, order) => {
    scheduler.add(() => timeout(time, order).then(() => {console.log(order);return order}))
}

addTask(1000, '1')
addTask(500, '2')
addTask(300, '3')
addTask(400, '4')