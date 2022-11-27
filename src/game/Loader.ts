import { DataTexture, EquirectangularReflectionMapping, Texture } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';


export class Loader {
	private gltfLoader: GLTFLoader = new GLTFLoader();
	private rgbeLoader: RGBELoader = new RGBELoader();

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

	public async loadHDRIs(filePaths: string | string[]): Promise<Texture[]> {
		if (typeof filePaths === "string") {
			let hdri = await this.loadHDRIFromFile(filePaths);
			return [hdri];
		} else {
			let hdris: Texture[] = [];
			for (let filePath of filePaths) {
				let hdri = await this.loadHDRIFromFile(filePath);
				hdris.push(hdri);
			}
			return hdris;
		}
	}

	private async loadHDRIFromFile(filePath: string): Promise<DataTexture> {
		let hdri = await this.rgbeLoader.loadAsync(filePath);
		hdri.name = filePath.match(/\/([^\/]+)[.]/)[1];
		if (filePath.endsWith(".hdr")) {
			hdri.mapping = EquirectangularReflectionMapping;
		}
		return hdri;
	}
}