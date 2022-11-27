import { Mesh, MeshStandardMaterial } from "three";
import { View } from "./View";


export class Ground extends View {
	private repeat: number = 300;

	public init(): void {
		this.object.scale.set(this.repeat, 1, this.repeat);
		this.object.receiveShadow = true;
	
		let material = <MeshStandardMaterial>(<Mesh>this.object).material;
		material.map.repeat.set(this.repeat, this.repeat);
		material.normalMap.repeat.set(this.repeat, this.repeat);
		material.roughnessMap.repeat.set(this.repeat, this.repeat);
		material.metalnessMap.repeat.set(this.repeat, this.repeat);
	}
}