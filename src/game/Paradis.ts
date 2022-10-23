import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Loader } from './Loader';
import { ModelList } from './ModelList';
import { ModelFiles } from './ResourceList';


export class Paradis {
	private renderer: THREE.WebGLRenderer;
	private loader: Loader = new Loader();
	private models: { [name: string]: THREE.Object3D } = {};
	private currentScene: THREE.Scene;
	private currentCamera: THREE.PerspectiveCamera;
	private orbitControls: OrbitControls;
	private currentTime: number = 0;

	constructor() {
		this.init();
	}

	private async init(): Promise<void> {
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setClearColor(new THREE.Color(0x81d4fa));
		this.renderer.shadowMap.enabled = true;

		this.currentScene = new THREE.Scene();

		this.currentCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.currentCamera.position.set(25, 25, 25);
		this.currentCamera.lookAt(this.currentScene.position);
		this.currentScene.add(this.currentCamera);

		this.orbitControls = new OrbitControls(this.currentCamera, this.renderer.domElement);
		this.orbitControls.listenToKeyEvents(window);
		this.orbitControls.minPolarAngle = Math.PI * 0.15;
		this.orbitControls.maxPolarAngle = Math.PI * 0.48;
		this.orbitControls.keyPanSpeed = 20;
		this.orbitControls.mouseButtons.LEFT = THREE.MOUSE.PAN;
		this.orbitControls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
		this.orbitControls.touches.ONE = THREE.TOUCH.PAN;
		this.orbitControls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
		this.orbitControls.screenSpacePanning = false;
		this.orbitControls.keys = {
			LEFT: "KeyA",
			RIGHT: "KeyD",
			UP: "KeyW",
			BOTTOM: "KeyS"
		};

		let plane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshLambertMaterial({
			color: 0x999999
		}));
		plane.rotation.x = -Math.PI * 0.5;
		plane.rotation.z = Math.PI * 0.25;
		plane.receiveShadow = true;
		this.currentScene.add(plane);

		let hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
		hemisphereLight.position.set(0, 100, 0);
		this.currentScene.add(hemisphereLight);

		let directionalLight = new THREE.DirectionalLight(0xffffff);
		directionalLight.position.set(-50, 100, 100);
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize = new THREE.Vector2(4096, 4096);
		directionalLight.shadow.camera.far = 330;
		directionalLight.shadow.camera.left = -300;
		directionalLight.shadow.camera.right = 300;
		directionalLight.shadow.camera.top = 300;
		directionalLight.shadow.camera.bottom = -300;
		directionalLight.shadow.camera.near = 10;
		directionalLight.shadow.bias = -0.002;
		this.currentScene.add(directionalLight);

		let models = await this.loader.loadModels(ModelFiles, ModelList);
		for (let model of models) {
			this.models[model.name] = model;
		}
		let hotelSalon1 = this.models["hotel_salon"].clone();
		let hotelSalon2 = this.models["hotel_salon"].clone();		
		hotelSalon1.castShadow = true;
		hotelSalon1.receiveShadow = true;
		hotelSalon2.receiveShadow = true;
		hotelSalon2.castShadow = true;
		hotelSalon1.traverse(child => {
			if ((<THREE.Mesh>child).isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
		hotelSalon2.traverse(child => {
			if ((<THREE.Mesh>child).isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
		hotelSalon1.position.x = 7;
		hotelSalon2.position.x = -1;
		hotelSalon1.position.z = 7;
		hotelSalon2.position.z = 15;
		hotelSalon2.rotation.y = Math.PI * 0.5;
		this.currentScene.add(hotelSalon1);
		this.currentScene.add(hotelSalon2);
		this.setupResize();
		document.body.appendChild(this.renderer.domElement);
		this.render(this.currentTime);
	}

	private render(delta: number): void {
		this.currentTime += delta;
		this.renderer.render(this.currentScene, this.currentCamera);
		requestAnimationFrame((newTime: number) => this.render(newTime - this.currentTime));
	}

	private setupResize(): void {
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		window.onresize = () => this.onResize();
	}

	private onResize(): void {
		this.currentCamera.aspect = window.innerWidth / window.innerHeight;
		this.currentCamera.updateProjectionMatrix();
		this.orbitControls.update();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}
}