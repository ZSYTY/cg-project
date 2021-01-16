import * as THREE from './three.js-master/three.js-master/build/three.module.js';
import primMaze from './maze.js'
// import {OBJLoader} from "./three.js-master/three.js-master/examples/jsm/loaders/OBJLoader.js";
import {MTLLoader} from "./three.js-master/three.js-master/examples/jsm/loaders/MTLLoader.js";
import {MyOBJLoader} from './myLoader.js'

var renderer, overview_camera, scene, stats, controls, gui, rotate = true, light;
let follow_camera;
let first_camera;
let camera;
let dest;
let dest_scaler = 1;
let dest_bb;
let chara, chara_available = false;
let step = 0.2;
let rotate_step = 0.1;
var base_floor;
const barrier_size = 1;
const barrier_height = 5;
var camera_lookat = new THREE.Vector3(0.0, 0.0, 10.0);
var rotate_camera = true;
var init_camera_pos = new THREE.Vector3(0.0, -20.0, 30.0);
let barriers = [];
let barriers_bb = [];

function init(config) {

    const {maze_r, maze_c, lightColor, texture_name} = config

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
        overview_camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 20000);
        overview_camera.position.set(init_camera_pos.x, init_camera_pos.y, init_camera_pos.z);
        overview_camera.lookAt(new THREE.Vector3(0.0, 0.0, 0.0));

        follow_camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 20000);
        follow_camera.up = new THREE.Vector3(0, 0, 1);
        follow_camera.dist = 0.5;

        first_camera = new THREE.PerspectiveCamera(90, width / height, 0.1, 20000);
        first_camera.up = new THREE.Vector3(0, 0, 1);
        first_camera.dist = 0.1;
        first_camera.cur_rise = 0;

        camera = overview_camera;
    }

//创建灯光
    function initLight() {
        scene.add(new THREE.AmbientLight(0x111111 & lightColor));

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

        var lightg = new THREE.DirectionalLight(lightColor); //添加了一个平行光
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
        texture_floor.repeat.set(2000, 2000);
        base_floor = new THREE.Mesh(new THREE.PlaneBufferGeometry(10000, 10000), material_floor);
        base_floor.position.z = -0.01;
        base_floor.receiveShadow = true;
        scene.add(base_floor);
    }

    function getRandomBarrier() {
        let k = Math.floor(Math.random() * 6);
        //k=1;
        switch (k) {
            case 0: {
                let g = new THREE.BoxBufferGeometry(barrier_size, barrier_size, barrier_height);
                //g.translate(0, 0, barrier_height / 2);
                // g.rotateX(Math.PI / 2);
                return g;
            }
            case 1: {
                let g = new THREE.ConeGeometry(barrier_size / 2, barrier_height, 360);
                //g.translate(0, 0, barrier_height / 2);
                g.rotateX(Math.PI / 2);
                return g;
            }
            case 2: {
                let g = new THREE.SphereBufferGeometry(barrier_size / 2, 360, 360);
                //g.translate(0, 0, barrier_height / 2);
                return g;
            }
            case 3: {
                // 圆柱
                let g = new THREE.CylinderBufferGeometry(barrier_size / 2, barrier_size / 2, barrier_height, 360);
                //g.translate(0, 0, barrier_height / 2);
                g.rotateX(Math.PI / 2);
                return g;
            }
            case 4: {
                // 多面棱柱
                let g = new THREE.CylinderBufferGeometry(barrier_size / 2, barrier_size / 2, barrier_height, 6);
                //g.translate(0, 0, barrier_height / 2);
                g.rotateX(Math.PI / 2);
                return g;
            }
            case 5: {
                // 多面棱台
                let g = new THREE.CylinderBufferGeometry(barrier_size / 2, barrier_size / 4, barrier_height, 6);
                //g.translate(0, 0, barrier_height / 2);
                g.rotateX(Math.PI / 2);
                return g;
            }


            default:
                console.log(k);
        }
        // console.log(getRandomBarrier);
    }

    function initCubeBarriers(maze) {
        let texture = new THREE.TextureLoader().load("assets/" + texture_name); // 地板纹理
        let material = new THREE.MeshLambertMaterial({map: texture});
        texture.wrapS = THREE.MirroredRepeatWrapping; //设置水平方向无限循环
        texture.wrapT = THREE.MirroredRepeatWrapping; //设置垂直方向无限循环
        texture.repeat.set(2, 2);
        for (let i = 0; i < maze.length; ++i) {
            for (let j = 0; j < maze[i].length; ++j) {
                if (maze[i][j]) {
                    let barrier_cube = new THREE.Mesh(getRandomBarrier(), material);
                    let actual_barrier = new THREE.Mesh(new THREE.BoxBufferGeometry(barrier_size, barrier_size, barrier_height), material);
                    // console.log([maze[i].length,maze.length]);
                    actual_barrier.position.x = barrier_cube.position.x = j * barrier_size - maze[i].length * barrier_size / 2;
                    actual_barrier.position.y = barrier_cube.position.y = i * barrier_size - maze.length * barrier_size / 2;
                    actual_barrier.position.z = barrier_cube.position.z = barrier_height / 2;
                    scene.add(barrier_cube);
                    barriers.push(barrier_cube);
                    barriers_bb.push(new THREE.Box3().setFromObject(barrier_cube));
                }
            }
        }
        // dest = new THREE.Mesh(new THREE.CylinderBufferGeometry(barrier_size / 2, 1000, 360), new THREE.MeshNormalMaterial({
        //     transparent: true,
        //     opacity: 0.5
        // }));
        dest = new THREE.Mesh(new THREE.BoxBufferGeometry(barrier_size, barrier_size, 1000), new THREE.MeshNormalMaterial({
            transparent: true,
            opacity: 0.5
        }));
        dest.position.x = (maze[0].length - 2) * barrier_size - maze[0].length * barrier_size / 2;
        dest.position.y = (maze.length - 1) * barrier_size - maze.length * barrier_size / 2;
        scene.add(dest);
        dest_bb = new THREE.Box3().setFromObject(dest);
    }

    function initCharacter() {
        let mloader = new MTLLoader();
        mloader.load('assets/bro.mtl', function (materials) {
            materials.preload();
            let loader = new MyOBJLoader();
            loader.setMaterials(materials);
            loader.load('assets/bro.obj', function (model) {
                let bb = new THREE.Box3().setFromObject(model);
                // scene.add(new THREE.Box3Helper(bb,0xFFFF00));

                console.log(bb);
                let scale = barrier_size * 0.4 / Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y);
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
    let dest_ds = 0.25;
    let dest_dr = 0.05;

    function animate() {
        let t1 = new Date(); //本次时间
        let t = t1 - t0; // 时间差

        if (dest_scaler > Math.min(Math.min(maze_c, maze_r) * 0.5, 4) || dest_scaler <= 0.1) {
            dest_ds = -dest_ds;
        }
        dest_scaler += dest_ds / t;
        dest.scale.set(dest_scaler, dest_scaler, 1);
        dest.rotateOnAxis(new THREE.Vector3(0, 0, 1), dest_dr);
        dest_bb = new THREE.Box3().setFromObject(dest);

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
        //     overview_camera.position.x = e;
        // });
        // gui.add(controls, "camera_position_y").onChange(function (e) {
        //     overview_camera.position.y = e;
        // });
        // gui.add(controls, "camera_position_z").onChange(function (e) {
        //     overview_camera.position.z = e;
        // });
        // gui.add(controls, "camera_lookat_x").onChange(function (e) {
        //     camera_lookat.x = e;
        //     overview_camera.lookAt(camera_lookat);
        // });
        // gui.add(controls, "camera_lookat_y").onChange(function (e) {
        //     camera_lookat.y = e;
        //     overview_camera.lookAt(camera_lookat);
        // });
        // gui.add(controls, "camera_lookat_z").onChange(function (e) {
        //     camera_lookat.z = e;
        //     overview_camera.lookAt(camera_lookat);
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
        let bb = new THREE.Box3().setFromObject(chara);
        chara.position.y = -maze_r * barrier_size - 0.5 * barrier_size;
        chara.position.x = -maze_c * barrier_size + 0.5 * barrier_size;
        chara.position.z += -bb.min.z;
        update_follow_camera();
        update_first_camera();
        update_follow_camera();
        update_first_camera();
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

function check_win() {
    if (new THREE.Box3().setFromObject(chara).intersectsBox(dest_bb)) {
        alert("你赢了！");
    }
}

function update_follow_camera() {
    let bb = new THREE.Box3().setFromObject(chara);
    follow_camera.position.x = chara.position.x + follow_camera.dist * Math.sin(chara.cur_rotate);
    follow_camera.position.y = chara.position.y - follow_camera.dist * Math.cos(chara.cur_rotate);
    follow_camera.position.z = chara.position.z + 1 * (bb.max.z);
    follow_camera.lookAt(chara.position.x, chara.position.y, chara.position.z + 0.5 * (bb.max.z));
    follow_camera.up = new THREE.Vector3(0, 0, 1);
}

function update_first_camera() {
    let bb = new THREE.Box3().setFromObject(chara);
    first_camera.position.x = chara.position.x - first_camera.dist * Math.sin(chara.cur_rotate);
    first_camera.position.y = chara.position.y + first_camera.dist * Math.cos(chara.cur_rotate);
    first_camera.position.z = chara.position.z + 1 * (bb.max.z);
    first_camera.lookAt(chara.position.x - Math.sin(chara.cur_rotate), chara.position.y + Math.cos(chara.cur_rotate), first_camera.position.z);
    first_camera.up = new THREE.Vector3(0, 0, 1);
    first_camera.rotateOnAxis(new THREE.Vector3(1, 0, 0).normalize(), first_camera.cur_rise);
}

function start_game(config) {
    init(config);
}

function left_up_button_clicked() {
    let dx = -step * Math.sin(chara.cur_rotate);
    let dy = step * Math.cos(chara.cur_rotate);
    let bb = new THREE.Box3().setFromObject(chara);
    bb.max.x -= 0.03;
    bb.max.y -= 0.03;
    bb.min.x += 0.03;
    bb.min.y += 0.03;
    bb.translate(new THREE.Vector3(dx, dy, 0));
    for (let i = 0; i < barriers_bb.length; ++i) {
        if (bb.intersectsBox(barriers_bb[i])) {
            return;
        }
    }
    chara.position.x += dx;
    chara.position.y += dy;
    update_follow_camera();
    update_first_camera();
    check_win();
}

function left_down_button_clicked() {
    let dx = step * Math.sin(chara.cur_rotate);
    let dy = -step * Math.cos(chara.cur_rotate);
    let bb = new THREE.Box3().setFromObject(chara);
    bb.max.x -= 0.08;
    bb.max.y -= 0.08;
    bb.min.x += 0.08;
    bb.min.y += 0.08;
    bb.translate(new THREE.Vector3(dx, dy, 0));
    for (let i = 0; i < barriers_bb.length; ++i) {
        if (bb.intersectsBox(barriers_bb[i])) {
            return;
        }
    }
    chara.position.x += dx;
    chara.position.y += dy;
    update_follow_camera();
    update_first_camera();
    check_win();
}

function left_left_button_clicked() {

}

function left_right_button_clicked() {

}

function right_up_button_clicked() {
    if (camera === follow_camera) {
        follow_camera.dist += 0.025;
    } else if (camera === first_camera) {
        first_camera.cur_rise += 0.025;
    }
    update_follow_camera();
    update_first_camera();
    check_win();
}

function right_down_button_clicked() {
    if (camera === follow_camera) {
        follow_camera.dist -= 0.025;
    } else if (camera === first_camera) {
        first_camera.cur_rise -= 0.025
    }
    update_follow_camera();
    update_first_camera();
    check_win();

}

function right_left_button_clicked() {
    chara.rotateOnAxis(new THREE.Vector3(0, 1, 0).normalize(), rotate_step);
    chara.cur_rotate += rotate_step;
    update_follow_camera();
    update_first_camera();
    check_win();

}

function right_right_button_clicked() {
    chara.rotateOnAxis(new THREE.Vector3(0, 1, 0).normalize(), -rotate_step);
    chara.cur_rotate -= rotate_step;
    update_follow_camera();
    update_first_camera();
    check_win();
}

function switch_to_overview() {
    camera = overview_camera;
}

function switch_to_third() {
    camera = follow_camera;
}

function switch_to_first() {
    camera = first_camera;
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
    right_right_button_clicked,
    switch_to_overview,
    switch_to_third,
    switch_to_first
};

