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
            // console.log(project);
            scriptManager.read(projectJson.scripts, () => {

                let textureManager = new ZTextureManager(project);
                textureManager.read(projectJson.textures);
   
                let materialManager = new ZMaterialManager(textureManager, project);
                materialManager.read(projectJson.materials, projectJson.faceMaterials);

                let geometryManager = new ZGeometryManager(project);
                geometryManager.read(projectJson.geometries, () => {
                    let objectManager = new ZObjectManager(materialManager, scriptManager, geometryManager, project);
                    objectManager.read(projectJson.object);
                    if(onLoad) {
                    	onLoad({object: objectManager.topObject});
                    }
                    // this.player = new ZViewport3D(canvas3d, objectManager.topObject, cameraMatrix);
                    // this.player.grid.visible = false;
                    // this.player.loadScripts(objectManager.uid2Script, this.paras.projectName);
                });
            });   
        }
    });
};


export default ZProjectLoader;