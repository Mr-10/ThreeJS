// utilities
import {
  setMaterial,
  getTextureMaterial,
  selectSwatch,
} from "./utils/materialHelper.js";

// constants
import { texturesAndColors } from "./constants/constants.js";

const LOADER = document.getElementById("js-loader");

const scene = new THREE.Scene();
// Set background
scene.background = new THREE.Color(0xf1f1f1);
scene.fog = new THREE.Fog(0xf1f1f1, 20, 100);

const canvas = document.querySelector("#sofa-canvas");

let camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;
camera.position.x = 0;

// Init the renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);

document.body.appendChild(renderer.domElement);

let controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.maxPolarAngle = Math.PI;
controls.minPolarAngle = 0;
controls.enableDamping = true;
controls.enablePan = false;
controls.dampingFactor = 0.1;
controls.autoRotate = false; // Toggle this if you'd like to rotate the sofa automatically
controls.autoRotateSpeed = 0.2;

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  let width = window.innerWidth;
  let height = window.innerHeight;
  let canvasPixelWidth = canvas.width / window.devicePixelRatio;
  let canvasPixelHeight = canvas.height / window.devicePixelRatio;

  const needResize = canvasPixelWidth !== width || canvasPixelHeight !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
}

animate();

const DEFAULT_SOFA_TEXTURE = {
  texture: "./textures/denim_.jpg",
  size: [3, 3, 3],
  shininess: 0,
};

const DEFAULT_PILLOW_TEXTURE = {
  texture: "./textures/cloth.jpeg",
  size: [6, 6, 6],
  shininess: 0,
};

function setInitialSofaMaterial() {
  const sofaMaterial = getTextureMaterial(DEFAULT_SOFA_TEXTURE);
  setMaterial(theModel, sofaMaterial, "sofa");
  const pillowMaterial = getTextureMaterial(DEFAULT_PILLOW_TEXTURE);
  setMaterial(theModel, pillowMaterial, "pillows");
}

// Init the object loader
let loader = new THREE.GLTFLoader();
let theModel;
loader.load(
  "./models/sofa.glb",
  function (gltf) {
    theModel = gltf.scene;

    theModel.traverse((object) => {
      if (object.isMesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });

    // Set the models initial scale
    theModel.scale.set(1, 1, 1);
    theModel.rotation.x = Math.PI / 15;

    theModel.position.x = 3.5;
    theModel.position.y = -1;
    theModel.position.z = 0;

    scene.add(theModel);

    // Setting initial material
    setInitialSofaMaterial();

    // setTimeout is just to finish setMaterial() execution so we don't see black color
    setTimeout(() => {
      // Remove the loader
      LOADER.remove();
    }, 100);
  },
  undefined,
  function (error) {
    console.error(error);
  }
);

window.onscroll = function () {
  window.scrollTo(0, 0);
};

// Add lights
let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
// Add directional Light to scene
scene.add(dirLight);

// Floor
let floorGeometry = new THREE.PlaneGeometry(8, 4, 1, 1);

let floorTexture = new THREE.TextureLoader().load(
  "./textures/wooden_floor.jpg"
);
floorTexture.repeat.set(1, 1, 1);
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;

let floorMaterial = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  map: floorTexture,
});

let floor = new THREE.Mesh(floorGeometry, floorMaterial);

floor.rotation.x = -0.43 * Math.PI;
floor.receiveShadow = true;
floor.position.y = -0.61;
scene.add(floor);

const showAxis = false;
// axis helper
if (showAxis) {
  const axisHelper = new THREE.AxisHelper(100);
  scene.add(axisHelper);
}

// Setup the colors and textures tray

const TRAY = document.getElementById("js-tray-slide");
let activeOption = "sofa";

function buildColors(colors) {
  for (let [i, color] of colors.entries()) {
    let swatch = document.createElement("div");
    swatch.classList.add("tray__swatch");

    if (color.texture) {
      swatch.style.backgroundImage = "url(" + color.texture + ")";
    } else {
      swatch.style.background = "#" + color.color;
    }

    swatch.setAttribute("data-key", i);
    TRAY.append(swatch);
  }
}

buildColors(texturesAndColors);

// Swatches
const swatches = document.querySelectorAll(".tray__swatch");

for (const swatch of swatches) {
  swatch.addEventListener("click", (event) =>
    selectSwatch(event, theModel, texturesAndColors, activeOption)
  );
}

// Select Option
const options = document.querySelectorAll(".option");

for (const option of options) {
  option.addEventListener("click", selectOption);
}

function selectOption(e) {
  let option = e.target;
  activeOption = e.target.dataset.option;
  for (const otherOption of options) {
    otherOption.classList.remove("--is-active");
  }
  option.classList.add("--is-active");
}
