import { Camera, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { InteractionManager } from "../Interacton";
import { Paradis } from "../Paradis";
import { View } from "../views/View";


export abstract class BaseScreen {
	protected game: Paradis;
	protected renderer: WebGLRenderer;
	protected scene: Scene;
	protected camera: Camera;
	protected interactionManager: InteractionManager;

	constructor(game: Paradis) {
		this.game = game;
		this.renderer = this.game.renderer;
		this.init();
	}

	protected init(): void {
		this.scene = new Scene();
	}

	protected addView(view: View): void {
		this.scene.add(view.object);
		view.init();
	}

	public render(delta: number): void {
		this.renderer.render(this.scene, this.camera);
	}

	public onResize(width: number, height: number): void {
		if (this.camera instanceof PerspectiveCamera) {
			this.camera.aspect = width / height;
			this.camera.updateProjectionMatrix();
		}
	}
}