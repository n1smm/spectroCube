import * as THREE from 'three';
import * as Tone from 'tone';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let noise = new Tone.Noise('pink');
let autoFilter = new Tone.AutoFilter({
	"frequency": "16n",
	"min": 800,
	"max": 15000
});

// noise.toDestination();
let analyze = new Tone.Analyser('waveform', 1024);
// let fft = new Tone.FFT(512);
// noise.connect(fft);
noise.connect(autoFilter);
autoFilter.connect(analyze);
analyze.toDestination();

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

//camera
const camera = new THREE.PerspectiveCamera(
	45,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.set(0, 10, 30);
camera.lookAt(scene.position);

const orbit = new OrbitControls(camera, renderer.domElement);

//axis helper
const axesHelper = new THREE.AxesHelper(3);
scene.add(axesHelper);

// box definition
const boxVertices = 6;
const boxGeometry = new THREE.BoxGeometry(6,6,6,boxVertices,boxVertices,boxVertices);
const boxMaterial = new THREE.MeshBasicMaterial({color: 0xff0088, wireframe: true});
const box = new THREE.Mesh(boxGeometry, boxMaterial);
scene.add(box);

// box 2
const box2Geometry = new THREE.BoxGeometry(5,5,5,boxVertices,boxVertices,boxVertices);
const box2Material = new THREE.MeshBasicMaterial({color: 0xff00cc, wireframe: true});
const box2 = new THREE.Mesh(box2Geometry, box2Material);
scene.add(box2);


const originalPositions = boxGeometry.attributes.position.array.slice();

function updateVertices() {
    const waveform = analyze.getValue();

	const vertPerSide = (boxVertices + 1) * (boxVertices + 1);
	const valuesPerSide = vertPerSide * 3;

	for (let i = 0; i < waveform.length; i++) {
		let value = waveform[i];
		boxGeometry.attributes.position.array[i] += value;
	}
    boxGeometry.attributes.position.needsUpdate = true;
}

function originalVertices() {
	for (let i = 0; i < originalPositions.length; i++) {
		boxGeometry.attributes.position.array[i] = originalPositions[i];
	}
	boxGeometry.attributes.position.needsUpdate = true;
}

// Render loop
let originalToggle = false;
let frameCounter = 0;

function animate() {
	// if (cube_restart === false) {
	// 	if (originalToggle)
	// 		updateVertices();
	// 	else 
	// 		originalVertices();
	// 	originalToggle = !originalToggle;
	// }
	if (frameCounter % 5 === 0)
		originalVertices();
	else
		updateVertices();
	frameCounter++;
	if (frameCounter === 50)
		frameCounter = 0;

	box.rotation.x += 0.01;
	box.rotation.y += 0.01;
	box2.rotation.x += 0.01;
	box2.rotation.y += 0.01;
    renderer.render(scene, camera);
}

//start noise sound
let cube_restart = true;
document.addEventListener('click', function() {
    if (noise.state === 'started') {
        noise.stop();
		cube_restart = true;
	}
    else
	{
		cube_restart = false;
		Tone.start();
        noise.start();
		setTimeout(() => {
			for (let i = 0; i < 10000; i ++)
				console.log(analyze.getValue());
		}, 1); 
	}

});

function touchStarted() {
	if (getAudioContext().state !== "running") {
		console.log("audio context is not running");
		getAudioContext().resume();
	}
	console.log('audio context');
}
// renderer.render(scene, camera);

renderer.setAnimationLoop(animate);
