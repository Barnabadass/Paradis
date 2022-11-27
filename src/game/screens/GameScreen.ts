import { DirectionalLight, HemisphereLight, PerspectiveCamera, Vector2 } from "three";
import { InteractionManager } from "../Interacton";
import { Ground } from "../views/Ground";
import { House } from "../views/House";
import { BaseScreen } from "./Screen";


export class GameScreen extends BaseScreen {
	protected init(): void {
		super.init();
		this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
		this.camera.position.set(25, 25, 25);
		this.camera.lookAt(this.scene.position);
		this.scene.add(this.camera);

		this.interactionManager = new InteractionManager(this.camera, this.renderer.domElement);
		this.interactionManager.addOrbitControls();
		this.interactionManager.addInteractionControls();

		let directionalLight = new DirectionalLight(0xffffff);
		directionalLight.position.set(200, 100, 15);
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize = new Vector2(4096, 4096);
		directionalLight.shadow.camera.far = 330;
		directionalLight.shadow.camera.left = -300;
		directionalLight.shadow.camera.right = 300;
		directionalLight.shadow.camera.top = 300;
		directionalLight.shadow.camera.bottom = -300;
		directionalLight.shadow.camera.near = 10;
		directionalLight.shadow.bias = -0.002;
		directionalLight.intensity = 0.5;
		this.scene.add(directionalLight);	

		let ground = new Ground(this.game.getModel("ground"));
		this.addView(ground);

		let hotelSalon = new House(this.game.getModel("hotel_salon"), {
			onPlace: () => {
				// this.interactionManager.makeUninteractive(hotelSalon);
			}
		});
		let salonDeThe = new House(this.game.getModel("salon_de_the"), {
			onPlace: () => {
				// this.interactionManager.makeUninteractive(salonDeThe);
			}
		});
		salonDeThe.position.x = 30;
		salonDeThe.rotation.y = - Math.PI / 2;
		
		this.addView(hotelSalon);
		this.addView(salonDeThe);
		this.interactionManager.makeInteractive(hotelSalon);
		this.interactionManager.makeInteractive(salonDeThe);

		let skybox = this.game.getTexture("casual_day_skybox");
		this.scene.background = skybox;
		this.scene.environment = skybox;
	}
}