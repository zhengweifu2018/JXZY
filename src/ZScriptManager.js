/**
 * manage project objects
 */

import THREE from 'three';
// import ZUtils from './ZUtils';
// import ZLoader from './ZLoader';
// 
import RunGenerator from './ZUtils/RunGenerator';
import LoadForGenerator from './ZUtils/LoadForGenerator';

export default class ZScriptManager {
	constructor(project) {
		this.scripts = {};
		this.project = project;
	}

    read(jsonList, onLoad) {
    	jsonList = jsonList || [];
		// for(let json of jsonList) {
		// 	this.parse(json);
		// }
		// 
		let self = this;

		RunGenerator(function *() {
			for(let json of jsonList) {
				if(json.content) {
					self.scripts[json.uuid] = json.content;
					continue;
				}

				if(json.uuid !== undefined && json.url !== undefined) {
					let url = self.project.pathToAbs(json.url);
					let src = yield LoadForGenerator(url);
					self.scripts[json.uuid] = src;
				}
			}

			if(onLoad) {
				onLoad(self.scripts);
			}
		});
    }

	generate(source) {
		let uuid = THREE.Math.generateUUID();
		this.scripts[uuid] = source;
	}

	write() {
		return this.scripts;
	}
}