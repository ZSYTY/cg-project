// 菜单里设置的全局变量
var humanSex = "sex-1";
var lightColor = "color-1";
var gameDiff = "diff-1";
var wallTexture = "wall-1";

// Lib
function consoleView() {
    var e = document.getElementById("consoleDiv");
    console.log(e);
    var w = window.innerWidth;
    var h = window.innerHeight;
    e.innerText = "w" + w + "h" + h;
}

function screenShoot(e) {

}

function randInt(min, max) {
    max = max || 0;
    min = min || 0;
    var step = Math.abs(max - min);
    var st = (arguments.length < 2) ? 0 : min;//参数只有一个的时候，st = 0;
    var result;
    result = st + (Math.ceil(Math.random() * step)) - 1;
    return result;
}

//初始化按钮事件
function start() {
    for (var i = 0; i < 4; i++) {
        var tid;
        var btn = window.document.getElementById("button" + i);
        //console.log(btn);

        btn.onmousedown = function (e) {
            var s = e.target.id;
            go(s);
            tid = setInterval(function () {
                go(s);
            }, 50);
        };
        btn.onmouseup = function (e) {
            clearInterval(tid);
        };
        btn.onmouseout = function (e) {
            clearInterval(tid);
        }
    }

    for (var i = 0; i < 4; i++) {
        var tid;
        var btn = window.document.getElementById("button" + i);
        //console.log(btn);

        btn.ontouchstart = function (e) {
            var s = e.target.id;
            //console.log("touch");
            go(s);
            tid = setInterval(function () {
                go(s);
            }, 50);
        };
        btn.ontouchmove = function (e) {
            clearInterval(tid);
        };
        btn.ontouchend = function (e) {
            clearInterval(tid);
        }
    }

    // 前四项设置
    var set = "diff-";
    for (var i = 1; i <= 3; i++) {
        var btn = window.document.getElementById("diff-" + i);
        btn.onmousedown = function (e) {
            gameDiff = e.target.id;
            for (var j = 1; j <= 3; j++) {
                var b = window.document.getElementById("diff-" + j);
                b.style.backgroundColor = "lightgray";
            }
            e.target.style.backgroundColor = "lightslategray";
        };
    }
    var set = "color-";
    for (var i = 1; i <= 3; i++) {
        var btn = window.document.getElementById("color-" + i);
        btn.onmousedown = function (e) {
            gameDiff = e.target.id;
            for (var j = 1; j <= 3; j++) {
                var b = window.document.getElementById("color-" + j);
                b.style.backgroundColor = "lightgray";
            }
            e.target.style.backgroundColor = "lightslategray";
        };
    }
    var set = "sex-";
    for (var i = 1; i <= 3; i++) {
        var btn = window.document.getElementById("sex-" + i);
        btn.onmousedown = function (e) {
            gameDiff = e.target.id;
            for (var j = 1; j <= 3; j++) {
                var b = window.document.getElementById("sex-" + j);
                b.style.backgroundColor = "lightgray";
            }
            e.target.style.backgroundColor = "lightslategray";
        };
    }

    for (var i = 1; i <= 3; i++) {
        var btn = window.document.getElementById("wall-" + i);
        btn.onmousedown = function (e) {
            gameDiff = e.target.id;
            for (var j = 1; j <= 3; j++) {
                var b = window.document.getElementById("wall-" + j);
                b.style.backgroundColor = "lightgray";
            }
            e.target.style.backgroundColor = "lightslategray";
        };
    }

    var btn = window.document.getElementById("startGame");
    btn.onmousedown = function (e) {
        var b = window.document.getElementById("start");
        b.style.visibility = "hidden";
        var c = window.document.getElementById("game");
        c.style.visibility = "visible";
    };

}

// 按钮事件
function go(dir) {
    var e = document.getElementById("fuck");
    var t = parseInt(e.style.top);
    var l = parseInt(e.style.left);
    //console.log(dir);
    switch (dir) {
        case "button" + 0:
            t--;
            break;
        case "button" + 1:
            l++;
            break;
        case "button" + 2:
            t++
            break;
        case "button" + 3:
            l--;
            break;
        default:
            break;
    }
    e.style.top = t + "%";
    e.style.left = l + "%";
    //console.log(e.style.top);

}

// 生成迷宫
function primMaze(r, c) {
    //初始化数组
    function init(r, c) {
        var a = new Array(2 * r + 1);
        //全部置1
        for (let i = 0, len = a.length; i < len; i++) {
            var cols = 2 * c + 1;
            a[i] = new Array(cols);
            for (let j = 0, len1 = a[i].length; j < len1; j++) {
                a[i][j] = 1;
            }
        }
        //中间格子为0
        for (let i = 0; i < r; i++)
            for (let j = 0; j < c; j++) {
                a[2 * i + 1][2 * j + 1] = 0;
            }
        return a;
    }

    //处理数组，产生最终的数组
    function process(arr) {
        //acc存放已访问队列，noacc存放没有访问队列
        var acc = [], noacc = [];
        var r = arr.length >> 1, c = arr[0].length >> 1;
        var count = r * c;
        for (var i = 0; i < count; i++) {
            noacc[i] = 0;
        }
        //定义空单元上下左右偏移
        var offs = [-c, c, -1, 1], offR = [-1, 1, 0, 0], offC = [0, 0, -1, 1];
        //随机从noacc取出一个位置
        var pos = randInt(count);
        noacc[pos] = 1;
        acc.push(pos);
        while (acc.length < count) {
            var ls = -1, offPos = -1;
            offPos = -1;
            //找出pos位置在二维数组中的坐标
            var pr = pos / c | 0, pc = pos % c, co = 0, o = 0;
            //随机取上下左右四个单元
            while (++co < 5) {
                o = randInt(0, 5);
                ls = offs[o] + pos;
                var tpr = pr + offR[o];
                var tpc = pc + offC[o];
                if (tpr >= 0 && tpc >= 0 && tpr <= r - 1 && tpc <= c - 1 && noacc[ls] == 0) {
                    offPos = o;
                    break;
                }
            }
            if (offPos < 0) {
                pos = acc[randInt(acc.length)];
            }
            else {
                pr = 2 * pr + 1;
                pc = 2 * pc + 1;
                //相邻空单元中间的位置置0
                arr[pr + offR[offPos]][pc + offC[offPos]] = 0;
                pos = ls;
                noacc[pos] = 1;
                acc.push(pos);
            }
        }
    }

    var a = init(r, c);
    process(a);
    a[0][1] = 0;
    a[a.length - 1][a[a.length - 1].length - 2] = 0;
    console.log(a);
    return a;
    //返回一个二维数组，行的数据为2r+1个,列的数据为2c+1个
}
