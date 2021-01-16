// 菜单里设置的全局变量
import {
    start_game,
    left_up_button_clicked,
    left_down_button_clicked,
    left_left_button_clicked,
    left_right_button_clicked,
    right_up_button_clicked,
    right_down_button_clicked,
    right_left_button_clicked,
    right_right_button_clicked, switch_to_third, switch_to_overview, switch_to_first,
    screenShoot_clicked,
} from "./game.js";



var humanSex = "sex-1";
var lightColor = "color-1";
var gameDiff = "diff-1";
var wallTexture = "wall-1";
let config = { maze_r: 3, maze_c: 3, lightColor: 0xffffff, texture_name: 'metal_wall.jpg' }

// Lib
function consoleView() {
    var e = document.getElementById("consoleDiv");
    console.log(e);
    var w = window.innerWidth;
    var h = window.innerHeight;
    e.innerText = "w" + w + "h" + h;
}

screenShootF = function() {
    screenShoot_clicked();

}

firstView = function(){
    switch_to_first();
}

thirdView = function(){
    switch_to_third();
}

godView = function(){
    switch_to_overview();
}

//初始化按钮事件
export function start() {
    function clearTimer(tid){
        for(var i = tid - 3; i < tid; i++) {
            clearInterval(i);
        }
    }

    for (var i = 0; i < 8; i++) {
        var tid;
        var btn = window.document.getElementById("button" + i);
        //console.log(btn);

        btn.onmousedown = function (e) {
            var s = e.target.id;
            go(s);
            tid = setInterval(function () {
                go(s);
            }, 50);
            clearTimer(tid);
        };
        btn.onmouseup = function (e) {
            clearInterval(tid);
        };
        btn.onmouseout = function (e) {
            clearInterval(tid);
        }
    }

    for (var i = 0; i < 8; i++) {
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
            clearTimer(tid);
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
    const sizeList = [[3, 3], [6, 6], [9, 9]]
    for (var i = 1; i <= 3; i++) {
        var btn = window.document.getElementById("diff-" + i);
        btn.onmousedown = function (e) {
            gameDiff = e.target.id;
            let idx = parseInt(gameDiff.split('-')[1]) - 1;
            config.maze_c = sizeList[idx][0]
            config.maze_r = sizeList[idx][1]
            for (var j = 1; j <= 3; j++) {
                var b = window.document.getElementById("diff-" + j);
                b.style.backgroundColor = "lightgray";
            }
            e.target.style.backgroundColor = "lightslategray";
        };
    }

    var set = "color-";
    const colorList = [0xffffff, 0x1111ff, 0xff1111]
    for (var i = 1; i <= 3; i++) {
        var btn = window.document.getElementById("color-" + i);
        btn.onmousedown = function (e) {
            gameDiff = e.target.id;
            let idx = parseInt(gameDiff.split('-')[1]) - 1
            config.lightColor = colorList[idx];
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

    const textList = ['metal_wall.jpg', 'wooden_wall.jpg', 'smooth_wall.jpg']
    for (var i = 1; i <= 3; i++) {
        var btn = window.document.getElementById("wall-" + i);
        btn.onmousedown = function (e) {
            gameDiff = e.target.id;
            let idx = parseInt(gameDiff.split('-')[1]) - 1
            config.texture_name = textList[idx];
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
            b.parentNode.removeChild(b);
            var c = window.document.getElementById("game");
            c.style.visibility = "visible";
            start_game(config);
        }
    };

}

// 按钮事件
function go(dir) {
    console.log(dir);
    switch (dir) {
        case "button" + 0:
            left_up_button_clicked();
            break;
        case "button" + 1:
            left_right_button_clicked();
            break;
        case "button" + 2:
            left_down_button_clicked();
            break;
        case "button" + 3:
            left_left_button_clicked();
            break;
        case "button" + 4:
            right_up_button_clicked();
            break;
        case "button" + 5:
            right_right_button_clicked();
            break;
        case "button" + 6:
            right_down_button_clicked();
            break;
        case "button" + 7:
            right_left_button_clicked();
            break;
        default:
            break;
    }

}

