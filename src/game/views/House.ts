import { Vector3 } from "three";
import { View } from "./View";


export class House extends View {
	public init(): void {
		this.object.traverse(child => {
			if ((<THREE.Mesh>child).isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
	}

	public onPointerDown(): void { }

	public onPointerMove(pointerPos: Vector3): void {
		this.object.position.copy(pointerPos);
	}

	public onPointerUp(): void { }

	public onPointerOver(): void {
		this.alpha = 0.5;
	}

	public onPointerOut(): void {
		this.alpha = 1;
		this.params.onPlace();
	}

	public onWheel(deltaY: number): void { }
}