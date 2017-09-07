/**
 * manage geometries
 */

import THREE from 'three';
import ZMeshLoader from './ZMeshLoader';

import RunGenerator from './ZUtils/RunGenerator';
import LoadMeshForGenerator from './ZUtils/LoadMeshForGenerator';

export default class ZGeometryManager {
	constructor(project, isDebug = false) {
		this.geometries = {};
		this.project = project;
		this.isDebug = isDebug;
	}

	read(jsonList, onLoad) {
		// jsonList.forEach(json => {
		// 	this.parse(json);
		// });
		let self = this;
		RunGenerator(function *() {
			for(let json of jsonList) {
				if(json.uuid !== undefined && json.url !== undefined) {
					let p = self.project.pathToAbs(json.url);
					let geo = yield LoadMeshForGenerator(p, self.isDebug);
					if(json.smooth !== undefined) {
						new THREE.SubdivisionModifier(json.smooth).modify(geo);
					}

					if(json.softenNormal !== undefined && !!json.softenNormal) {
						geo.computeVertexNormals();
					}

					self.geometries[json.uuid] = geo;
				}
			}
			if(onLoad) {
				onLoad(self.geometries);
			}
		});
	}

    parse(json) {
		if(json.uuid !== undefined && json.url !== undefined) {
			let p = this.project.pathToAbs(json.url);
			let geo = new ZMeshLoader();
			geo.geometry.uuid = json.uuid;

			let otherpara = {};

			if(json.smooth !== undefined) {
				otherpara['smooth'] = json.smooth;
			}
			if(json.softenNormal !== undefined) {
				otherpara['softenNormal'] = !!json.softenNormal;
			}
			geo.parse(p, g => {
				if(otherpara['smooth']) {
                    new THREE.SubdivisionModifier(otherpara['smooth']).modify(g);
                }

				if(otherpara['softenNormal']) {
					g.computeVertexNormals();
				}

                if(g.__webglInit) {
                	delete g.__webglInit;
                }
                if(g.__webglActive) {
                	delete g.__webglActive;
                }
                g.groupsNeedUpdate = true;

                if(g.zobjs !== undefined) {
                    for (let i = 0; i < g.zobjs.length; i++) {
                        if( g.zobjs[i].__webglActive) {
                        	delete g.zobjs[i].__webglActive;
                        }
                    }
                }
			});

			this.geometries[json.uuid] = geo.geometry;

		}
	}
}

