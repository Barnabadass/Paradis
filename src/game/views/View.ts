import { Euler, Material, Mesh, Object3D, Vector3 } from "three";


export abstract class View {
	protected object3D: Object3D;
	protected params: { [param: string]: any };
	private opacity: number = 1;

	constructor(object: Object3D, params: { [param: string]: any } = {}) {
		this.object3D = this.cloneObject(object);
		this.params = params;
	}

	private cloneObject(object: Object3D): Object3D {
		let clone = object.clone();
		clone.traverse(child => {
			if ((<Mesh>child).material) {
				(<Mesh>child).material = (<Material>(<Mesh>child).material).clone();
			}
		});
		return clone;
	}

	public get object(): Object3D {
		return this.object3D;
	}

	public get name(): string {
		return this.object.name;
	}

	public init(): void { }

	public onPointerUp(): void { }

	public onPointerDown(): void { }

	public onPointerOver(): void { }

	public onPointerOut(): void { }

	public onPointerMove(pointerPos: Vector3): void { }

	public onWheel(deltaY: number): void { }

	public get position(): Vector3 {
		return this.object3D.position;
	}

	public get rotation(): Euler {
		return this.object3D.rotation;
	}

	public set alpha(alpha: number) {
		if (alpha > 1 || alpha < 0) {
			return;
		}
		this.opacity = alpha;
		this.object.traverse(child => {
			if ((<Mesh>child).isMesh) {
				let material = <Material>(<Mesh>child).material;
				material.transparent = this.opacity !== 1;
				material.opacity = this.opacity;
			}
		});
	}

	public get alpha(): number {
		return this.opacity;
	}
}