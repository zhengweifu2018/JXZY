import THREE from 'three';
import ZLoader from './ZLoader';
import ZProject from './ZProject';
import ZScriptManager from './ZScriptManager';
import ZTextureManager from './ZTextureManager';
import ZMaterialManager from './ZMaterialManager';
import ZGeometryManager from './ZGeometryManager';
import ZObjectManager from './ZObjectManager';

require('babel-polyfill');

let ZProjectLoader = {};

ZProjectLoader.parse = (url, onLoad) => {
    let loader = new ZLoader();
    loader.load(url, (response) => {
        if(response) {
        	let project = new ZProject(url);
        	const projectJson = JSON.parse(response);
            let scriptManager = new ZScriptManager(project);

            scriptManager.read(projectJson.scripts, () => {
                // console.log(scriptManager);
                let textureManager = new ZTextureManager(project);
                textureManager.read(projectJson.textures);
   
                let materialManager = new ZMaterialManager(textureManager, project);
                materialManager.read(projectJson.materials, projectJson.faceMaterials);

                let geometryManager = new ZGeometryManager(project);
                geometryManager.read(projectJson.geometries, () => {
                    let objectManager = new ZObjectManager(materialManager, scriptManager, geometryManager, project);
                    objectManager.read(projectJson.object);
                    // console.log(objectManager.uuid2Script);
                    if(onLoad) {
                    	onLoad({
                            object: objectManager.topObject,
                            uuid2Script: objectManager.uuid2Script,
                        });
                    }
                });
            });   
        }
    });
};


export default ZProjectLoader;