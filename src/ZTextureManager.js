
import THREE from 'three';

export default class ZTextureManager {
	constructor(project) {
		this.textures = {};
		this.record = [];
		this.project = project;
	}


	setValues(texture, parameters) {
		let parameterDefault = {
			anisotropy		: 1,
			magFilter		: THREE.LinearFilter,
			minFilter 		: THREE.LinearMipMapLinearFilter,
			format			: THREE.RGBAFormat,
			wrapS			: THREE.ClampToEdgeWrapping,
			wrapT			: THREE.ClampToEdgeWrapping
		};
		for(let each in parameterDefault) {
			if(parameters[each] !== undefined) {
				texture[each] = parameters[each];
			} else {
				texture[each] = parameterDefault[each];
			}
		}

		if(parameters['repeat'] !== undefined) {
			texture.repeat.set(parameters['repeat'][0], parameters['repeat'][1]);
		} else {
			texture.repeat.set(1, 1);
		}

		if(parameters['offset'] !== undefined) {
			texture.offset.set(parameters['offset'][0], parameters['offset'][1]);
		} else {
			texture.offset.set(0, 0);
		}

	}

    read(jsonList) {
    	jsonList = jsonList || [];
        jsonList.forEach(json => {
            this.parse(json);
        });
    }

	parse(json) {
        if(json.url === undefined) {
        	return [];
        }
        let texture;
        if(typeof(json.url) === 'string') {
            let pointIndex = json.url.lastIndexOf('.');
            if(pointIndex === -1) {
            	return;
            }
            let ext = json.url.substring(pointIndex + 1, json.url.length).toLowerCase();
            let src2d = this.project.pathToAbs(json.url);
            if(ext === 'dds') {
                texture = THREE.ImageUtils.loadDDSTexture(src2d);
            } else if(ext === 'tga') {
                console.error('暂时不支持TGA格式的贴图。');
            } else {
                texture = new THREE.TextureLoader().load(src2d, _texture => {
                	_texture.needsUpdate = true;
                });
            }
        } else {
            let srcCube = [];
            for(let j = 0; j < json.url.length; j++) {
                srcCube.push(this.project.pathToAbs(json.url[j]));
            }
            texture = THREE.ImageUtils.loadTextureCube(srcCube);
            // texture = new THREE.CubeTextureLoader();
        }

        // record parameters
        let recordTexture = {};
        recordTexture.object = texture;
        recordTexture.parameters = json;
        this.record.push(recordTexture);

        this.setValues(texture, json);

        if(json.uuid !== undefined) {
        	texture.uuid = json.uuid;
        }

        texture.needsUpdate = true;

        this.textures[json.uuid] = texture;

	}

	write() {
		result = [];
		let eResult, t, UID, each;
		for(UID in this.textures) {
			eResult = {};
			t = this.textures[UID];
			if(t.uuid !== undefined) {
				eResult.uuid = t.uuid;
			}
			let image = t.image;
			let imageLength = image.length;
			let src;
			if(imageLength) {
				let urlList = [];
				for(let i = 0; i < imageLength; i++) {
					
					if(image[i].src !== undefined) {
						src = this.project.pathToRelative(this.project.pathSubAddress(image[i].src));
						urlList.push(src);
					} 
				}
				if(urlList.length) {
					eResult.url = urlList;
				}
			} else {
				if(t.sourceFile !== undefined) {
					src = this.project.pathToRelative(this.project.pathSubAddress(t.sourceFile));
					eResult.url = src;
				}		
			}
			
			let parameterDefault = {
				anisotropy		: 1,
				magFilter		: THREE.LinearFilter,
				minFilter 		: THREE.LinearMipMapLinearFilter,
				format			: THREE.RGBAFormat,
				wrapS			: THREE.RepeatWrapping,
				wrapT			: THREE.RepeatWrapping
			};
			for(each in parameterDefault) {
				if(t[each] !== undefined) {
					if(t[each] !== parameterDefault[each]) {
						eResult[each] = t[each];
					}
				}
			}
			if(t.offset !== undefined) {
				if(t.offset.x !== 0.0 && t.offset.y !== 0.0) {
					eResult.offset = [t.offset.x, t.offset.y];
				}
			}

			if(t.repeat !== undefined) {
				if(t.repeat.x !== 0.0 && t.repeat.y !== 0.0) {
					eResult.repeat = [t.repeat.x, t.repeat.y];
				}
			}

			if(eResult !== {}) {
				result.push(eResult);
			}
		}
		return result;	 
	}
}
