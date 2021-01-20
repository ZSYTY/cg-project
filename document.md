<h1 align = "center"> CG Project </h1>
<h4 align = "center">朱辰恺 3181013526 ... ...</h4>
## 项目简介
#### 技术背景与技术栈
#### 游戏简介

## 操作介绍
#### UI界面介绍
本项目的UI分为两部分，游戏加载页面为第一部分，游戏运行界面为第二部分。

**游戏加载页面**

在游戏加载页面中，主要分为场景、标题、人物预览和游戏设置按钮两个部分。

代码主体部分如下：

```html
<div id="start" class="full">
    <div id="menu">
        <div id="mazePre">
        </div>
        <div class="menuButtonDiv"> ......
        </div>
    <div id="preView">
        <div id="titlePre">
        </div>
        <div id="humanPre">
        </div>
    </div>
</div>
```

实际效果如下图所示，其中，点击左侧的按钮，可以实现修改游戏中环境设置的效果。具体的展示在需求处。

![](documentPic/startView.jpg)

**游戏运行界面**

在游戏运行界面中，可以通过上方的按钮来切换视角或截图。也可以使用方向键来控制人物移动，或者视角旋转等。

代码主体部分如下：

```html
<div id="game" class="full" style="visibility:hidden;">
    <div id="consoleDiv" style="width: 20%;height: 10%;position: absolute; top: 5%;left: 5%;">
    </div>

    <div id="firstDiv" style="width: 20%;height: 10%;position: absolute; top: 5%;left: 30%;">
    </div>

    <div id="thirdDiv" style="width: 20%;height: 10%;position: absolute; top: 5%;left: 55%;">
    </div>

    <div id="godDiv" style="width: 20%;height: 10%;position: absolute; top: 5%;left: 80%;">
    </div>

    <div class="buttonDiv" style=" right: 10vw;">
    </div>
</div>
```



效果如下：

![](documentPic/runView.jpg)

当人物走到终点时即可获得胜利，展示You Win，代表游戏胜利

![](documentPic/youWin.jpg)

## 需求实现展示

##### 1. 具有基本体素（立方体、球、圆柱、圆锥、多面棱柱、多面棱台）的建模表达能力。
##### 2. 具有基本三维网格导入导出功能（建议OBJ格式）。
##### 3. 具有基本材质、纹理的显示和编辑能力。
##### 4. 具有基本几何变换功能（旋转、平移、缩放等）。
##### 5. 基本光照明模型要求，并实现基本的光源编辑（如调整光源的位置，光强等参数）。
##### 6. 能对建模后场景进行漫游如Zoom In/Out， Pan, Orbit, Zoom To Fit等观察功能。
##### 7. 能够提供屏幕截取/保存功能。
##### 8. 漫游时可实时碰撞检测。
##### 9. 采用HTML5/IOS/Android移动平台实现。
##### 10. 采用HTML5/IOS/Android移动平台实现。
##### 11. 构建了基于此引擎的完整三维游戏，具有可玩性。