import * as THREE from './three.js-master/three.js-master/build/three.module.js';
import primMaze from './maze.js'
import {OBJLoader} from "./three.js-master/three.js-master/examples/jsm/loaders/OBJLoader.js";
import {MTLLoader} from "./three.js-master/three.js-master/examples/jsm/loaders/MTLLoader.js";

var renderer, camera, scene, stats, controls, gui, rotate = true, light;
let follow_camera;
let chara, chara_available = false;
let step = 0.2;
let rotate_step = 0.1;
var base_floor;
const barrier_size = 1;
const barrier_height = 0.1;
var camera_lookat = new THREE.Vector3(0.0, 0.0, 10.0);
var rotate_camera = true;
var init_camera_pos = new THREE.Vector3(0.0, -20.0, 30.0);

function init(maze_r, maze_c) {


    var parentDOM = document.getElementById('game');
    const width = parentDOM.offsetWidth, height = parentDOM.offsetHeight;
    console.log(width);
    console.log(height);

//初始化渲染器
    function initRenderer() {
        renderer = new THREE.WebGLRenderer({antialias: true, alpha: false}); //实例化渲染器
        renderer.setSize(width, height); //设置宽和高
        parentDOM.appendChild(renderer.domElement); //添加到dom
    }

//初始化场景
    function initScene() {
        scene = new THREE.Scene(); //实例化场景
        // scene.fog = new THREE.Fog(0xa0a0a0, 1000, 11000);
    }

//初始化相机
    function initCamera() {
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 20000);
        camera.position.set(init_camera_pos.x, init_camera_pos.y, init_camera_pos.z);
        camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

        follow_camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 20000);
    }

//创建灯光
    function initLight() {
        scene.add(new THREE.AmbientLight(0x111111));

        light = new THREE.DirectionalLight(0xaaaaaa);
        light.position.set(0, 200, 100);
        light.lookAt(new THREE.Vector3());

        light.castShadow = true;
        light.shadow.camera.top = 180;
        light.shadow.camera.bottom = -180;
        light.shadow.camera.left = -180;
        light.shadow.camera.right = 180;

        //告诉平行光需要开启阴影投射
        light.castShadow = true;

        scene.add(light);

        var lightg = new THREE.DirectionalLight(0xffffff); //添加了一个白色的平行光
        lightg.position.set(20, 50, 50); //设置光的方向
        scene.add(lightg); //添加到场景

        //添加一个全局环境光
        scene.add(new THREE.AmbientLight(0x222222));

    }

    function initAxes() {
        var axes = new THREE.AxesHelper(500);
        scene.add(axes);
    }

    function initBase() {
        let texture_floor = new THREE.TextureLoader().load("assets/floor.jpg"); // 地板纹理
        let material_floor = new THREE.MeshLambertMaterial({map: texture_floor});
        texture_floor.wrapS = THREE.MirroredRepeatWrapping; //设置水平方向无限循环
        texture_floor.wrapT = THREE.MirroredRepeatWrapping; //设置垂直方向无限循环
        texture_floor.repeat.set(1000, 1000);
        base_floor = new THREE.Mesh(new THREE.BoxBufferGeometry(10000, 10000, 10), material_floor);
        base_floor.position.z = -5.5;
        base_floor.receiveShadow = true;
        scene.add(base_floor);
    }

    function initCubeBarriers(maze) {
        let texture = new THREE.TextureLoader().load("assets/wooden_wall.jpg"); // 地板纹理
        let material = new THREE.MeshLambertMaterial({map: texture});
        texture.wrapS = THREE.MirroredRepeatWrapping; //设置水平方向无限循环
        texture.wrapT = THREE.MirroredRepeatWrapping; //设置垂直方向无限循环
        texture.repeat.set(2, 2);
        for (let i = 0; i < maze.length; ++i) {
            for (let j = 0; j < maze[i].length; ++j) {
                if (maze[i][j]) {
                    let barrier_cube = new THREE.Mesh(new THREE.BoxBufferGeometry(barrier_size, barrier_size, barrier_height), material);
                    // console.log([maze[i].length,maze.length]);
                    barrier_cube.position.x = j * barrier_size - maze[i].length * barrier_size / 2;
                    barrier_cube.position.y = i * barrier_size - maze.length * barrier_size / 2;
                    barrier_cube.position.z = 0;
                    scene.add(barrier_cube);
                }
            }
        }
    }

    function initCharacter() {
        let mloader = new MTLLoader();
        mloader.load('assets/bro.mtl', function (materials) {
            materials.preload();
            let loader = new OBJLoader();
            loader.setMaterials(materials);
            loader.load('assets/bro.obj', function (model) {
                let bb = new THREE.Box3().setFromObject(model);
                // scene.add(new THREE.Box3Helper(bb,0xFFFF00));

                console.log(bb);
                let scale = barrier_size * 0.6 / Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y);
                console.log(scale);
                // scale = 0.1;
                model.scale.set(scale, scale, scale);
                // console.log(bb.min+bb.max);
                console.log(new THREE.Box3().setFromObject(model));
                model.position.set(-(bb.min.x + bb.max.x) / 2, -(bb.min.y + bb.max.y) / 2, -(bb.min.z + bb.max.z) / 2);
                console.log(new THREE.Box3().setFromObject(model));
                model.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0).normalize(), Math.PI / 2);
                console.log(new THREE.Box3().setFromObject(model));
                bb = new THREE.Box3().setFromObject(model);
                model.position.set(model.position.x - (bb.min.x + bb.max.x) / 2,
                    model.position.y - (bb.min.y + bb.max.y) / 2, model.position.z - (bb.min.z + bb.max.z) / 2);
                console.log(new THREE.Box3().setFromObject(model));
                // let material = new THREE.MeshPhongMaterial({color: '#FFFF80'});
                // model.traverse(child => {
                //     if (child instanceof THREE.Mesh) {
                //         child.material = material;
                //     }
                // });
                scene.add(model);
                chara = model;
                chara.cur_rotate = 0;
                chara_available = true;
                initPosition();
            }, null, null, null);
        });
    }

//创建模型
    function initMesh() {
        initBase();
        initCubeBarriers(primMaze(maze_r, maze_c));
        initCharacter();
    }

    let t0 = new Date()

    function animate() {
        let t1 = new Date(); //本次时间
        let t = t1 - t0; // 时间差

        // if (rotate_camera) {
        //     camera.position.set(camera.position.x + 0.01, camera.position.y + 0.01, camera.position.z);
        //     let r = Math.sqrt(Math.pow(camera.position.x - camera_lookat.x, 2) + Math.pow(camera.position.y - camera_lookat.y, 2));
        //     let theta = Math.atan2(camera.position.y - camera_lookat.y, camera.position.x - camera_lookat.x);
        //     theta += 0.1 / t;
        //     camera.position.x = Math.cos(theta) * r + camera_lookat.x;
        //     camera.position.y = Math.sin(theta) * r + camera_lookat.y;
        //     // camera.rotateY(0.02);
        //     camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
        //     camera.up = new THREE.Vector3(0, 0, 1);
        // }

        stats.update(); //更新性能检测框
        // if (chara_available) {
        //     console.log(chara.rotation._x);
        // }

        renderer.render(scene, camera); //渲染界面
        t0 = t1;
        requestAnimationFrame(animate); //循环调用函数
    }

//性能检测框
    function initStats() {
        stats = new Stats();
        document.body.appendChild(stats.dom);
    }

//创建调试框
    function initGui() {
        controls = {
            rotate_x: 0,
            rotate_y: 0,
            rotate_z: 0,
            camera_position_x: init_camera_pos.x,
            camera_position_y: init_camera_pos.y,
            camera_position_z: init_camera_pos.z,
            camera_lookat_x: 0,
            camera_lookat_y: 0,
            camera_lookat_z: 10,
            rotate_camera: true,
            // new
            chara_pos_x: 0,
            chara_pos_y: 0,
        };

        gui = new dat.GUI();
        // gui.add(controls, "camera_position_x").onChange(function (e) {
        //     camera.position.x = e;
        // });
        // gui.add(controls, "camera_position_y").onChange(function (e) {
        //     camera.position.y = e;
        // });
        // gui.add(controls, "camera_position_z").onChange(function (e) {
        //     camera.position.z = e;
        // });
        // gui.add(controls, "camera_lookat_x").onChange(function (e) {
        //     camera_lookat.x = e;
        //     camera.lookAt(camera_lookat);
        // });
        // gui.add(controls, "camera_lookat_y").onChange(function (e) {
        //     camera_lookat.y = e;
        //     camera.lookAt(camera_lookat);
        // });
        // gui.add(controls, "camera_lookat_z").onChange(function (e) {
        //     camera_lookat.z = e;
        //     camera.lookAt(camera_lookat);
        // });
        // gui.add(controls, "rotate_camera").onChange(function (e) {
        //     rotate_camera = e;
        // });
        gui.add(controls, "chara_pos_x").onChange(function (e) {
            chara.position.x = e;
        });
        gui.add(controls, "chara_pos_y").onChange(function (e) {
            chara.position.y = e;
        });

    }

    function initPosition() {
        chara.position.y = -maze_r * barrier_size - 0.5 * barrier_size;
        chara.position.x = -maze_c * barrier_size + 0.5 * barrier_size;
        follow_camera.position.x = chara.position.x + 0.3;
        follow_camera.position.y = chara.position.y + 0.3;
        let bb = new THREE.Box3().setFromObject(chara);
        follow_camera.lookAt(chara.position.x, chara.position.y, chara.position.z + 0.5 * (bb.max.z - bb.min.z));
        follow_camera.up = new THREE.Vector3(0, 0, 1);
        // console.log(chara.position);
        // let bb = new THREE.Box3().setFromObject(chara);
        // scene.add(new THREE.Box3Helper(bb,0xFFFF00));
    }

//初始化函数，页面加载完成是调用
    initRenderer();
    initScene();
    initLight();
    initCamera();
    initMesh();
    initAxes();
    initStats();

    initGui();

    animate();
}

function start_game() {
    init(10, 20);
}

function left_up_button_clicked() {
    chara.position.x -= step * Math.sin(chara.cur_rotate);
    chara.position.y += step * Math.cos(chara.cur_rotate);
    follow_camera.position.x = chara.position.x + 0.3;
    follow_camera.position.y = chara.position.y + 0.3;
    let bb = new THREE.Box3().setFromObject(chara);
    follow_camera.lookAt(chara.position.x, chara.position.y, chara.position.z + 0.5 * (bb.max.z - bb.min.z));
    follow_camera.up = new THREE.Vector3(0, 0, 1);
}

function left_down_button_clicked() {
    chara.position.x += step * Math.sin(chara.cur_rotate);
    chara.position.y -= step * Math.cos(chara.cur_rotate);
    follow_camera.position.x = chara.position.x + 0.3;
    follow_camera.position.y = chara.position.y + 0.3;
    let bb = new THREE.Box3().setFromObject(chara);
    follow_camera.lookAt(chara.position.x, chara.position.y, chara.position.z + 0.5 * (bb.max.z - bb.min.z));
    follow_camera.up = new THREE.Vector3(0, 0, 1);
}

function left_left_button_clicked() {

}

function left_right_button_clicked() {

}

function right_up_button_clicked() {

}

function right_down_button_clicked() {

}

function right_left_button_clicked() {
    chara.rotateOnAxis(new THREE.Vector3(0, 1, 0).normalize(), rotate_step);
    chara.cur_rotate += rotate_step;
}

function right_right_button_clicked() {
    chara.rotateOnAxis(new THREE.Vector3(0, 1, 0).normalize(), -rotate_step);
    chara.cur_rotate -= rotate_step;
}


export {
    start_game,
    left_up_button_clicked,
    left_down_button_clicked,
    left_left_button_clicked,
    left_right_button_clicked,
    right_up_button_clicked,
    right_down_button_clicked,
    right_left_button_clicked,
    right_right_button_clicked
};

