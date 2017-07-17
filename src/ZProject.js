import GetAbsPath from './ZUtils/GetAbsPath';
import GetRelativePath from './ZUtils/GetRelativePath';

class Project {

	constructor(path, root) {
		this.path = path;
		this.root = root;
	}

	pathToAbs(path) {
		return GetAbsPath(this.path, path);
	}

	pathToRelative(path) {
		return GetRelativePath(this.path, path);
	}

	pathSubAddress(addressPath) {
		let address = window.location.protocol + '//' + window.location.host;
		if(addressPath.substring(0, address.length) === address){
			return addressPath.substring(address.length, addressPath.length);
		} else {
			return addressPath;
		}
	}

	pathAddAddress(path) {
		let address = window.location.protocol + '//' + window.location.host;
		if(path.substring(0, address.length) !== address){
			return address + path;
		} else {
			return path;
		}
	}
}

export default Project;
