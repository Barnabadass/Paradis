import { Color, Object3D, sRGBEncoding, Texture, WebGLRenderer } from 'three';
import { Loader } from './Loader';
import { ModelList } from './resourceLists/ModelList';
import { ModelFiles, SkyBoxFiles } from './resourceLists/ResourceList';
import { BaseScreen } from './screens/Screen';
import { GameScreen } from './screens/GameScreen';


export class Paradis {
	private webglRenderer: WebGLRenderer = new WebGLRenderer();;
	private loader: Loader = new Loader();
	private models: { [name: string]: Object3D } = {};
	private textures: { [name: string]: Texture } = {};
	private currentScreen: BaseScreen;
	private currentTime: number = 0;

	constructor() {
		this.init();
	}

	private async init(): Promise<void> {
		this.webglRenderer.setClearColor(new Color(0x81d4fa));
		this.webglRenderer.shadowMap.enabled = true;
		this.webglRenderer.outputEncoding = sRGBEncoding;

		let models = await this.loader.loadModels(ModelFiles, ModelList);
		for (let model of models) {
			this.models[model.name] = model;
		}

		let skyboxes = await this.loader.loadHDRIs(SkyBoxFiles);
		for (let skybox of skyboxes) {
			this.textures[skybox.name] = skybox;
		}

		this.setupResize();
		document.body.appendChild(this.renderer.domElement);
		this.currentScreen = new GameScreen(this);
		
		this.render(this.currentTime);
	}

	private render(delta: number): void {
		this.currentTime += delta;
		this.currentScreen.render(delta);
		requestAnimationFrame((newTime: number) => this.render(newTime - this.currentTime));
	}

	private setupResize(): void {
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		window.onresize = () => this.onResize();
	}

	private onResize(): void {
		let { innerWidth: width, innerHeight: height } = window;
		this.currentScreen.onResize(width, height);
		this.renderer.setSize(width, height);
	}

	public get renderer(): WebGLRenderer {
		return this.webglRenderer;
	}

	public getModel(name: string): Object3D {
		return this.models[name];
	}

	public getTexture(name: string): Texture {
		return this.textures[name];
	}
}