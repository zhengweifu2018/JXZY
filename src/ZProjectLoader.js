import THREE from 'three';
import ZLoader from './ZLoader';
import GetAbsPath from './ZUtils/GetAbsPath';
import { LoadMeshForCO } from './ZUtils/LoadMeshForGenerator';
import os from './ZUtils/os';

import co from 'co';
import axios from 'axios';

require('babel-polyfill');

let ZProjectLoader = {};

ZProjectLoader.parse = (url, onLoad) => {
    let loader = new ZLoader();

    loader.load(url, (response) => {
        if(response) {
        	const projectJson = JSON.parse(response);
            if(projectJson.env) {
	            new THREE.TextureLoader().load(GetAbsPath(url, projectJson.env), (_texture) => {

	            	_texture.wrapS = THREE.RepeatWrapping;
					_texture.repeat.x = -1;
					_texture.anisotropy = 8;
					_texture.needsUpdate = true;
					let data = {
						texture: _texture,
						geometries: []
					}
					if(projectJson.meshes !== undefined) {
						co(function *() {
							for(let _meshUrl of projectJson.meshes) {
								const _meshAbsUrl = GetAbsPath(url, _meshUrl);
								let geo = yield LoadMeshForCO(_meshAbsUrl);
								geo.name = os.basename(_meshAbsUrl).split('.')[0];
								data.geometries.push(geo);
							}

							if(onLoad) {
				                onLoad(data);
				            }

						});
					}
	            });
	        }
        }
    });
};


export default ZProjectLoader;