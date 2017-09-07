import THREE from 'three';
import ZLoader from './ZLoader';
import ZProject from './ZProject';
import ZScriptManager from './ZScriptManager';
import ZTextureManager from './ZTextureManager';
import ZMaterialManager from './ZMaterialManager';
import ZGeometryManager from './ZGeometryManager';
import ZObjectManager from './ZObjectManager';

import GetCurrentDataString from './ZUtils/GetCurrentDataString';

require('babel-polyfill');

let ZProjectLoader = {};

ZProjectLoader.parse = (url, onLoad = undefined, isDebug = false) => {
    let loader = new ZLoader();
    let mUrl = isDebug ? `${url}?${GetCurrentDataString()}` : url;
    loader.load(mUrl, (response) => {
        if(response) {
        	let project = new ZProject(url);
        	const projectJson = JSON.parse(response);
            let scriptManager = new ZScriptManager(project);

            scriptManager.read(projectJson.scripts, () => {
                // console.log(scriptManager);
                let textureManager = new ZTextureManager(project, isDebug);
                textureManager.read(projectJson.textures);
   
                let materialManager = new ZMaterialManager(textureManager, project);
                materialManager.read(projectJson.materials, projectJson.faceMaterials);

                let geometryManager = new ZGeometryManager(project, isDebug);
                geometryManager.read(projectJson.geometries, () => {
                    let objectManager = new ZObjectManager(materialManager, scriptManager, geometryManager, project);
                    console.log(objectManager);
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