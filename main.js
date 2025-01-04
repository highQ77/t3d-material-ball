import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { EXRLoader } from 'three/examples/jsm/Addons.js';
import { texture } from 'three/tsl';
// bumpmap512x512.png

// bumpmap href
// https://opengameart.org/content/700-noise-textures

(async () => {

    const texture = new THREE.TextureLoader().load('./bumpmap512x512.png');

    await new Promise(reslove => {
        window.addEventListener('DOMContentLoaded', reslove)
    })
    document.body.style.margin = '0px'

    const gui = new GUI();

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 0.66, 10)
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    // renderer
    const renderer = new THREE.WebGLRenderer({
        powerPreference: "high-performance",
        antialias: true,
        stencil: true,
        depth: true
    });
    // 顏色空間設置
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    // 預設背景顏色 透明
    renderer.setClearColor(0, 0.0)
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);
    // renderer.domElement.style.pointerEvents = 'none'

    const controls = new OrbitControls(camera, renderer.domElement);

    const geometry = new THREE.SphereGeometry(2, 64, 32);
    const material = new THREE.MeshStandardMaterial({ roughness: 0.122, metalness: 0.705 });
    material.bumpMap = texture
    material.bumpScale = 10
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    //建構環境光源
    const light = new THREE.AmbientLight(0xe0edd4);
    light.intensity = 0.85
    //將光源加進場景中
    scene.add(light);

    // 主光源
    const lightD = new THREE.DirectionalLight(0xffffff, Math.PI)
    lightD.position.set(-5.9, 7.5, 7.26)
    lightD.intensity = 3.15
    scene.add(lightD)

    // 反射光源
    const lightFloor = new THREE.DirectionalLight(0xffffff, Math.PI)
    lightFloor.position.set(100, -100, -100)
    lightFloor.intensity = 1.55
    scene.add(lightFloor)

    // 環境貼圖
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    new EXRLoader()
        .setDataType(THREE.FloatType)
        .load(
            "https://threejs.org/examples/textures/piz_compressed.exr",
            function (texture) {
                let exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
                let newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;
                material.envMap = newEnvMap
                texture.dispose();
            }
        );

    let mainLightFolder = gui.addFolder('Env Settings')
    mainLightFolder.addColor(light, 'color').name('Ambient Color');
    mainLightFolder.add(light, 'intensity', 0, 50).name('Ambient Intensity');
    // mainLightFolder.addColor(lightD, 'color').name('Main Light Color');
    mainLightFolder.add(lightD, 'intensity', 0, 50).name('Main Light Intensity');
    mainLightFolder.add(lightFloor, 'intensity', 0, 50).name('Reflect Light Intensity');
    mainLightFolder.addColor(scene.fog, 'color').name('Fog Color');
    mainLightFolder.add(scene.fog, 'near', 0, 10).name('Fog Near');
    mainLightFolder.add(scene.fog, 'far', 0, 10).name('Fog Far');
    // mainLightFolder.add(lightFloor.position, 'x', -100, 100).name('Reflect Light x');
    // mainLightFolder.add(lightFloor.position, 'y', -100, 100).name('Reflect Light y');
    // mainLightFolder.add(lightFloor.position, 'z', -100, 100).name('Reflect Light z');

    let materialFolder = gui.addFolder('Material')
    materialFolder.addColor(material, 'color').name('Material Color');
    materialFolder.addColor(material, 'emissive').name('Material Emissive');
    materialFolder.add(material, 'metalness', 0, 1).name('Material Metalness');
    materialFolder.add(material, 'roughness', 0, 1).name('Material Roughness');
    materialFolder.add(material, 'wireframe')
    materialFolder.add(material, 'bumpScale', 0, 100)

    function animate() {
        // cube.rotation.x += 0.01;
        // cube.rotation.y += 0.01;
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', onWindowResize, false);
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        // uilayer.width = window.innerWidth
        // uilayer.height = window.innerHeight
    }
    onWindowResize()

    document.body.style.background = `linear-gradient(rgb(11,11,11),rgb(99, 99, 99))`
})()