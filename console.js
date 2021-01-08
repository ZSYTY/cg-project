function consoleView() {
    var e = document.getElementById("consoleDiv");
    console.log(e);
    var w = window.innerWidth;
    var h = window.innerHeight;
    e.innerText = "w" + w + "h" + h;
}

function view(dir) {
    if (dir === "up") {

    }
}

function start() {
    for (var i = 0; i < 4; i++) {
        var tid;
        var btn = window.document.getElementById("button" + i);
        console.log(btn);

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
        console.log(btn);

        btn.ontouchstart = function (e) {
            var s = e.target.id;
            console.log("touch");
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
}

function go(dir) {
    var e = document.getElementById("fuck");
    var t = parseInt(e.style.top);
    var l = parseInt(e.style.left);
    console.log(dir);
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