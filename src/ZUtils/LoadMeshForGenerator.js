import ZMeshLoader from '../ZMeshLoader';
import ZSTLLoader from '../ZSTLLoader';

export default (url) => {
    return function(onLoad) {
        let loader = new ZMeshLoader();
        loader.parse(url, onLoad);
    };
};

export const LoadMeshForCO = (url) => {
	return new Promise((resolve, reject) => {
        let loader = new ZMeshLoader();
        loader.parse(url, function(data) {
            // if (error) reject(error);
            resolve(data);
        }); 
    });
};

export const LoadSTLForCO = (url) => {
    return new Promise((resolve, reject) => {
        let loader = new ZSTLLoader();
        loader.load(url, function(data) {
            // if (error) reject(error);
            resolve(data);
        }); 
    });
};
