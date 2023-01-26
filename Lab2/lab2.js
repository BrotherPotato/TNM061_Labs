var container;
var camera, scene, renderer;
var mouseX = 0,
  mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// Object3D ("Group") nodes and Mesh nodes

const light = new THREE.PointLight(0xffffff, 1, 100);
const ambientLight = new THREE.AmbientLight(0x202020);

var sceneRoot = new THREE.Group();
var viewRoot = new THREE.Group();

var SunMesh;
var sunSpin = new THREE.Group();

var earthMesh;
var earthOrbit = new THREE.Group();
var earthTrans = new THREE.Group();
var earthTilt = new THREE.Group();
var earthSpin = new THREE.Group();

var moonMesh;
var moonTilt = new THREE.Group();
var moonSpin = new THREE.Group();
var moonOrbit = new THREE.Group();
var moonTrans = new THREE.Group();

var weezerMesh;
var weezerTilt = new THREE.Group();
var weezerSpin = new THREE.Group();
var weezerOrbit = new THREE.Group();
var weezerTrans = new THREE.Group();

var animation = true;

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
  // mouseX, mouseY are in the range [-1, 1]
  mouseX = (event.clientX - windowHalfX) / windowHalfX;
  mouseY = (event.clientY - windowHalfY) / windowHalfY;
}

function createSceneGraph() {
  scene = new THREE.Scene();

  // Top-level node
  scene.add(sceneRoot);

  sceneRoot.add(viewRoot);

  // View node
  scene.add(viewRoot);

  // LOOK INTO THE SUN
  viewRoot.add(sunSpin);
  sunSpin.add(SunMesh);
  SunMesh.add(ambientLight);
  SunMesh.add(light);

  // WEezer
  weezerTrans.position.x = 9.5;
  weezerTilt.rotation.z = 0.0;

  SunMesh.add(weezerOrbit);
  weezerOrbit.add(weezerTrans);
  weezerTrans.add(weezerTilt);
  weezerTilt.add(weezerSpin);
  weezerSpin.add(weezerMesh);

  // earth branch
  earthTrans.position.x = 5.8;
  earthTilt.rotation.z = -0.409105;

  SunMesh.add(earthOrbit);
  earthOrbit.add(earthTrans);
  earthTrans.add(earthTilt);
  earthTilt.add(earthSpin);
  earthSpin.add(earthMesh);

  // DA MOON
  moonTilt.rotation.z = 5 / (2 * Math.PI);
  moonTrans.position.x = -1.5;

  earthSpin.add(moonOrbit);
  moonOrbit.add(moonTrans);
  moonTrans.add(moonTilt);
  moonTilt.add(moonSpin);
  moonSpin.add(moonMesh);
}

function init() {
  container = document.getElementById("container");

  camera = new THREE.PerspectiveCamera(
    38,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.z = 5;

  var texloader = new THREE.TextureLoader();

  // Earth mesh
  //var geometryEarth = new THREE.BoxGeometry(1, 1, 1, 8, 8, 8);
  var geometryEarth = new THREE.SphereGeometry(1, 32, 32);
  var materialEarth = new THREE.MeshLambertMaterial();

  materialEarth.combine = 0;
  materialEarth.needsUpdate = true;
  materialEarth.wireframe = false;

  const earthTexture = texloader.load("tex/2k_earth_daymap.jpg");
  materialEarth.map = earthTexture;

  // Moon mesh
  var geometryMoon = new THREE.SphereGeometry(0.27, 32, 32);
  var materialMoon = new THREE.MeshLambertMaterial();

  materialMoon.combine = 0;
  materialMoon.needsUpdate = true;
  materialMoon.wireframe = false;

  const moonTexture = texloader.load("tex/2k_moon.jpg");
  materialMoon.map = moonTexture;

  // Sun mesh
  var geometrySun = new THREE.SphereGeometry(2, 32, 32);
  var materialSun = new THREE.MeshBasicMaterial();

  materialSun.combine = 0;
  materialSun.needsUpdate = true;
  materialSun.wireframe = false;

  const sunTexture = texloader.load("tex/2k_sun.jpg");
  materialSun.map = sunTexture;

  //weezer mesh
  var geometryWeezer = new THREE.SphereGeometry(0.5, 32, 32);
  var materialWeezer = new THREE.MeshLambertMaterial();

  materialWeezer.combine = 0;
  materialWeezer.needsUpdate = true;
  materialWeezer.wireframe = false;

  const weezerTexture = texloader.load("tex/Weezer.jpg");
  materialWeezer.map = weezerTexture;

  // Task 7: material using custom Vertex Shader and Fragment Shader
  var uniforms = THREE.UniformsUtils.merge([
    {
      colorTexture: { value: new THREE.Texture() },
      specularMap: { value: new THREE.Texture() },
    },
    THREE.UniformsLib["lights"],
  ]);

  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById("vertexShader").textContent.trim(),
    fragmentShader: document
      .getElementById("fragmentShader")
      .textContent.trim(),
    lights: true,
  });
  shaderMaterial.uniforms.colorTexture.value = earthTexture;

  const specularMap = texloader.load("tex/2k_earth_specular_map.jpg");
  shaderMaterial.uniforms.specularMap.value = specularMap;

  earthMesh = new THREE.Mesh(geometryEarth, shaderMaterial);
  moonMesh = new THREE.Mesh(geometryMoon, materialMoon);
  SunMesh = new THREE.Mesh(geometrySun, materialSun);
  weezerMesh = new THREE.Mesh(geometryWeezer, materialWeezer);

  createSceneGraph();

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(0x000000);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  container.appendChild(renderer.domElement);

  document.addEventListener("mousemove", onDocumentMouseMove, false);
  window.addEventListener("resize", onWindowResize, false);

  var checkBoxAnim = document.getElementById("animation");
  animation = checkBoxAnim.checked;
  checkBoxAnim.addEventListener("change", (event) => {
    animation = event.target.checked;
  });

  var checkBoxWireframe = document.getElementById("wireframe");
  earthMesh.material.wireframe = checkBoxWireframe.checked;
  checkBoxWireframe.addEventListener("change", (event) => {
    earthMesh.material.wireframe = event.target.checked;
    moonMesh.material.wireframe = event.target.checked;
    SunMesh.material.wireframe = event.target.checked;
    weezerMesh.material.wireframe = event.target.checked;
  });
}

function render() {
  // Set up the camera
  camera.position.x = mouseX * 10;
  camera.position.y = -mouseY * 10;
  camera.lookAt(scene.position);

  // Perform animations
  if (animation) {
    sunSpin.rotation.y += 0.1 / 25;

    earthSpin.rotation.y += 0.01;
    earthOrbit.rotation.y += 1 / 365;

    moonOrbit.rotation.y += -0.1 / 27.3;

    weezerOrbit.rotation.y += 0.02 / 365;
    weezerSpin.rotation.y += 0.01;
  }

  // Render the scene
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate); // Request to be called again for next frame
  render();
}

init(); // Set up the scene
animate(); // Enter an infinite loop
