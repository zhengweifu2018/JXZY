import ZMeshLoader from '../ZMeshLoader';
import ZSTLLoader from '../ZSTLLoader';

export default (url, isDebug = false) => {
    return function(onLoad) {
        let loader = new ZMeshLoader(isDebug);
        loader.parse(url, onLoad);
    };
};

export const LoadMeshForCO = (url, isDebug = false) => {
	return new Promise((resolve, reject) => {
        let loader = new ZMeshLoader(isDebug);
        loader.parse(url, function(data) {
            // if (error) reject(error);
            resolve(data);
        }); 
    });
};

export const LoadSTLForCO = (url, isDebug = false) => {
    return new Promise((resolve, reject) => {
        let loader = new ZSTLLoader(isDebug);
        loader.load(url, function(data) {
            // if (error) reject(error);
            resolve(data);
        }); 
    });
};
