import * as THREE from './three.js-master/three.js-master/build/three.module.js';
import primMaze from './maze.js'
function init() {
    var renderer, camera, scene, stats, controls, gui, rotate = true;

    var base_floor;
    const barrier_size = 1;
    const barrier_height = 1;
    var camera_lookat = new THREE.Vector3(0.0, 0.0, 10.0);
    var rotate_camera = true;
    var init_camera_pos = new THREE.Vector3(0.0, -20.0, 30.0);

    var parentDOM = document.getElementById('mazePre');
    const width = parentDOM.offsetWidth, height = parentDOM.offsetHeight

//初始化渲染器
    function initRenderer() {
        renderer = new THREE.WebGLRenderer(); //实例化渲染器
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
        // camera.position.set(0, 800, -800);
        camera.position.set(init_camera_pos.x, init_camera_pos.y, init_camera_pos.z);
        camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
    }

//创建灯光
    function initLight() {
        // scene.add(new THREE.AmbientLight(0x444444));
        //
        // light = new THREE.DirectionalLight(0xaaaaaa);
        // light.position.set(0, 200, 100);
        // light.lookAt(new THREE.Vector3());
        //
        // light.castShadow = true;
        // light.shadow.camera.top = 180;
        // light.shadow.camera.bottom = -180;
        // light.shadow.camera.left = -180;
        // light.shadow.camera.right = 180;
        //
        // //告诉平行光需要开启阴影投射
        // light.castShadow = true;
        //
        // scene.add(light);

        var light = new THREE.DirectionalLight(0xffffff); //添加了一个白色的平行光
        light.position.set(20, 50, 50); //设置光的方向
        scene.add(light); //添加到场景

        //添加一个全局环境光
        scene.add(new THREE.AmbientLight(0x222222));

    }

    function initAxes() {
        var axes = new THREE.AxisHelper(500);
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
        console.log(base_floor);
        scene.add(base_floor);
    }

    function initCubeBarriers(maze) {
        let texture = new THREE.TextureLoader().load("assets/wooden_wall.jpg"); // 地板纹理
        let material = new THREE.MeshLambertMaterial({map: texture});
        texture.wrapS = THREE.MirroredRepeatWrapping; //设置水平方向无限循环
        texture.wrapT = THREE.MirroredRepeatWrapping; //设置垂直方向无限循环
        texture.repeat.set(2, 2);
        for (let i = 0; i < maze.length; ++i) {
            for (let j = 0; j < maze.length; ++j) {
                if (maze[i][j]) {
                    let barrier_cube = new THREE.Mesh(new THREE.BoxBufferGeometry(barrier_size, barrier_size, barrier_height), material);
                    barrier_cube.position.x = j * barrier_size - maze.length * barrier_size / 2;
                    barrier_cube.position.y = i * barrier_size - maze.length * barrier_size / 2;
                    barrier_cube.position.z = 0;
                    scene.add(barrier_cube);
                }
            }
        }
    }

//创建模型
    function initMesh() {
        initBase();
        initCubeBarriers(primMaze(10, 10));
    }

    let t0 = new Date()

    function animate() {
        let t1 = new Date(); //本次时间
        let t = t1 - t0; // 时间差

        if (rotate_camera) {
            camera.position.set(camera.position.x + 0.01, camera.position.y + 0.01, camera.position.z);
            let r = Math.sqrt(Math.pow(camera.position.x - camera_lookat.x, 2) + Math.pow(camera.position.y - camera_lookat.y, 2));
            let theta = Math.atan2(camera.position.y - camera_lookat.y, camera.position.x - camera_lookat.x);
            theta += 0.1 / t;
            camera.position.x = Math.cos(theta) * r + camera_lookat.x;
            camera.position.y = Math.sin(theta) * r + camera_lookat.y;
            // camera.rotateY(0.02);
            camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));
            camera.up = new THREE.Vector3(0, 0, 1);
        }

        stats.update(); //更新性能检测框

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
        };

        gui = new dat.GUI();
        gui.add(controls, "camera_position_x").onChange(function (e) {
            camera.position.x = e;
        });
        gui.add(controls, "camera_position_y").onChange(function (e) {
            camera.position.y = e;
        });
        gui.add(controls, "camera_position_z").onChange(function (e) {
            camera.position.z = e;
        });
        gui.add(controls, "camera_lookat_x").onChange(function (e) {
            camera_lookat.x = e;
            camera.lookAt(camera_lookat);
        });
        gui.add(controls, "camera_lookat_y").onChange(function (e) {
            camera_lookat.y = e;
            camera.lookAt(camera_lookat);
        });
        gui.add(controls, "camera_lookat_z").onChange(function (e) {
            camera_lookat.z = e;
            camera.lookAt(camera_lookat);
        });
        gui.add(controls, "rotate_camera").onChange(function (e) {
            rotate_camera = e;
        });


    }

//初始化函数，页面加载完成是调用
    initRenderer();
    initScene();
    console.log(scene);
    initLight();
    initCamera();
    console.log(camera);
    initMesh();
    initAxes();
    initStats();
    initGui();

    animate();
}

export default function () {
    init();
}

