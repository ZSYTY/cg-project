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
        if (e.button === 0) {
            var b = window.document.getElementById("start");
            b.style.visibility = "hidden";
            var c = window.document.getElementById("game");
            c.style.visibility = "visible";
        }
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
