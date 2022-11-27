import {
	EventDispatcher,
	Matrix4,
	Object3D,
	Plane,
	Raycaster,
	Vector2,
	Vector3,
	Intersection,
	Camera,
	MOUSE,
	TOUCH
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { View } from './views/View';


export class InteractionManager {
	private interactionControls: InteractionControls;
	private orbitControls: OrbitControls;
	private camera: Camera;
	private domElement: HTMLElement;

	constructor(camera: Camera, domElement: HTMLElement) {
		this.camera = camera;
		this.domElement = domElement;
	}

	public init(): void {

	}

	public setCamera(camera: Camera): void {
		this.camera = camera;
	}

	public addInteractionControls(): void {
		this.interactionControls = new InteractionControls(this.camera, this.domElement);
		if (this.orbitControls) {
			this.addOrbitControlsDisableWhenDragging();
		}
	}

	public addOrbitControls(): void {
		this.orbitControls = new OrbitControls(this.camera, this.domElement);
		this.orbitControls.listenToKeyEvents(window);
		this.orbitControls.minPolarAngle = Math.PI * 0.15;
		this.orbitControls.maxPolarAngle = Math.PI * 0.48;
		this.orbitControls.keyPanSpeed = 20;
		this.orbitControls.mouseButtons.LEFT = MOUSE.PAN;
		this.orbitControls.mouseButtons.RIGHT = MOUSE.ROTATE;
		this.orbitControls.touches.ONE = TOUCH.PAN;
		this.orbitControls.touches.TWO = TOUCH.DOLLY_ROTATE;
		this.orbitControls.screenSpacePanning = false;
		this.orbitControls.maxDistance = 100;
		this.orbitControls.keys = {
			LEFT: "KeyA",
			RIGHT: "KeyD",
			UP: "KeyW",
			BOTTOM: "KeyS"
		};
		if (this.interactionControls) {
			this.addOrbitControlsDisableWhenDragging();
		}
	}

	public makeInteractive(view: View): void {
		if (this.interactionControls) {
			this.interactionControls.makeInteractive(view);
		}
	}

	public makeUninteractive(view: View): void {
		if (this.interactionControls) {
			this.interactionControls.makeUninteractive(view);
		}
	}

	private addOrbitControlsDisableWhenDragging(): void {
		document.addEventListener("pointerdown", (event: MouseEvent) => {
			if (event.button === 0) {
				this.orbitControls.enabled = false;
			}
		});
		document.addEventListener("pointerup", (event: MouseEvent) => {
			if (event.button === 0) {
				this.orbitControls.enabled = true;
			}
		});
	}
}


/**
 * Based on THREE.DragControls
 */
export class InteractionControls extends EventDispatcher {
	private objects: Object3D[] = [];
	private views: { [name: string]: View } = {};
	private camera: Camera;
	private raycaster: Raycaster = new Raycaster();
	private enabled: boolean = true;
	private domElement: HTMLElement;
	private selected: Object3D = null;
	private hovered: Object3D = null;
	private intersections: Array<Intersection<Object3D>> = [];
	private pointer: Vector2 = new Vector2();
	private offset: Vector3 = new Vector3();
	private intersection: Vector3 = new Vector3();
	private worldPosition: Vector3 = new Vector3();
	private inverseMatrix: Matrix4 = new Matrix4();
	private plane: Plane = new Plane(new Vector3(0, 1, 0));

	constructor(camera: Camera, domElement: HTMLElement) {
		super();
		this.camera = camera;
		this.domElement = domElement;
		this.domElement.style.touchAction = 'none';
		this.activate();
	}

	public activate(): void {
		this.domElement.addEventListener('pointermove', this.onPointerMove.bind(this));
		this.domElement.addEventListener('pointerdown', this.onPointerDown.bind(this));
		this.domElement.addEventListener('pointerup', this.onPointerCancel.bind(this));
		this.domElement.addEventListener('pointerleave', this.onPointerCancel.bind(this));
		this.domElement.addEventListener("wheel", this.onWheel.bind(this));
	}

	public deactivate(): void {
		this.domElement.removeEventListener('pointermove', this.onPointerMove.bind(this));
		this.domElement.removeEventListener('pointerdown', this.onPointerDown.bind(this));
		this.domElement.removeEventListener('pointerup', this.onPointerCancel.bind(this));
		this.domElement.removeEventListener('pointerleave', this.onPointerCancel.bind(this));
		this.domElement.removeEventListener("wheel", this.onWheel.bind(this));
		this.domElement.style.cursor = '';
	}

	public dispose(): void {
		this.deactivate();
	}

	public getObjects(): Object3D[] {
		return this.objects;
	}

	public getRaycaster(): Raycaster {
		return this.raycaster;
	}

	private onPointerMove(event: PointerEvent): void {
		if (this.enabled === false) return;
		this.updatePointer(event);
		this.raycaster.setFromCamera(this.pointer, this.camera);
		if (this.selected) {
			if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
				this.views[this.selected.uuid].onPointerMove(this.intersection.sub(this.offset).applyMatrix4(this.inverseMatrix));
				// this.selected.position.copy(this.intersection.sub(this.offset).applyMatrix4(this.inverseMatrix));
			}
			// this.dispatchEvent({ type: 'drag', object: this.selected });
			return;
		}

		// hover support
		if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
			this.intersections.length = 0;
			this.raycaster.setFromCamera(this.pointer, this.camera);
			this.raycaster.intersectObjects(this.objects, true, this.intersections);
			if (this.intersections.length > 0) {
				let object = this.intersections[0].object;
				// this.plane.setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(this.plane.normal), this.worldPosition.setFromMatrixPosition(object.matrixWorld));			

				for (let interactiveObject of this.objects) {
					let currentObject = this.intersections[0].object;
					if (currentObject.uuid === interactiveObject.uuid) {
						object = currentObject;
						break;
					} else {
						while (currentObject.parent) {
							currentObject = currentObject.parent;
							if (currentObject.uuid === interactiveObject.uuid) {
								object = currentObject;
								break;
							}
						}
					}
				}
				
				if (this.hovered !== object && this.hovered !== null) {
					this.views[this.hovered.uuid].onPointerOut();
					// this.dispatchEvent({ type: 'hoveroff', object: this.hovered });
					this.domElement.style.cursor = 'auto';
					this.hovered = null;
				}
				if (this.hovered !== object) {
					this.views[object.uuid].onPointerOver();
					// this.dispatchEvent({ type: 'hoveron', object: object });
					this.domElement.style.cursor = 'pointer';
					this.hovered = object;
				}
			} else {
				if (this.hovered !== null) {
					this.views[this.hovered.uuid].onPointerOut();
					// this.dispatchEvent({ type: 'hoveroff', object: this.hovered });
					this.domElement.style.cursor = 'auto';
					this.hovered = null;
				}
			}
		}
	}

	private onPointerDown(event: PointerEvent): void {
		if (this.enabled === false) return;
		if (event.button !== 0) return;
		this.updatePointer(event);
		this.intersections.length = 0;
		this.raycaster.setFromCamera(this.pointer, this.camera);
		this.raycaster.intersectObjects(this.objects, true, this.intersections);
		if (this.intersections.length > 0) {
			for (let interactiveObject of this.objects) {
				if (this.selected) {
					break;
				}
				let currentObject = this.intersections[0].object;
				if (currentObject.uuid === interactiveObject.uuid) {
					this.selected = currentObject;
					break;
				} else {
					while (currentObject.parent) {
						currentObject = currentObject.parent;
						if (currentObject.uuid === interactiveObject.uuid) {
							this.selected = currentObject;
							break;
						}
					}
				}
			}
			//  this.plane.setFromNormalAndCoplanarPoint(this.camera.getWorldDirection(this.plane.normal), this.worldPosition.setFromMatrixPosition(this.selected.matrixWorld));

			if (this.raycaster.ray.intersectPlane(this.plane, this.intersection)) {
				this.inverseMatrix.copy(this.selected.parent.matrixWorld).invert();
				this.offset.copy(this.intersection).sub(this.worldPosition.setFromMatrixPosition(this.selected.matrixWorld));
			}
			this.domElement.style.cursor = 'move';
			this.views[this.selected.uuid].onPointerDown();
			// this.dispatchEvent({ type: 'dragstart', object: this.selected });
		}
	}

	private onPointerCancel(): void {
		if (this.enabled === false) return;
		if (this.selected) {
			this.views[this.selected.uuid].onPointerUp();
			// this.dispatchEvent({ type: 'dragend', object: this.selected });
			this.selected = null;
		}
		this.domElement.style.cursor = this.hovered ? 'pointer' : 'auto';
	}

	private onWheel(event: WheelEvent): void {
		if (this.selected) {
			this.selected.rotation.y += ((event.deltaY > 0) ? -Math.PI : Math.PI) * 0.5;
		}
	}

	private updatePointer(event: PointerEvent): void {
		const rect = this.domElement.getBoundingClientRect();
		this.pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
		this.pointer.y = - (event.clientY - rect.top) / rect.height * 2 + 1;
	}

	public makeInteractive(view: View): void {
		this.objects.push(view.object);
		this.views[view.object.uuid] = view;
	}

	public makeUninteractive(view: View): void {
		for (let x = 0; x < this.objects.length; x++) {
			if (this.objects[x] = view.object) {
				this.objects.splice(x, 1);
				break;
			}
		}
		delete this.views[view.object.uuid];
	}
}