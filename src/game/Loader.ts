import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


export class Loader {
	private gltfLoader: GLTFLoader = new GLTFLoader();

	public async loadModels(filePaths: string | string[], modelNames: string[]): Promise<THREE.Object3D[]> {
		if (typeof filePaths === "string") {
			return await this.loadModelsFromFile(filePaths, modelNames);
		} else {
			let meshes: THREE.Object3D[] = [];
			for (let filePath of filePaths) {
				let fileMeshes = await this.loadModelsFromFile(filePath, modelNames);
				meshes.push(...fileMeshes);
			}
			return meshes;
		}
	}

	private async loadModelsFromFile(filePath: string, modelNames: string[]): Promise<THREE.Object3D[]> {
		let meshes: THREE.Object3D[] = [];
		let asset = await this.gltfLoader.loadAsync(filePath);
		asset.scene.traverse((child) => {
			if (modelNames.includes(child.name)) {
				meshes.push(child);
			}
		});
		return meshes;
	}
}