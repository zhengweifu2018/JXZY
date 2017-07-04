import ZLoader from '../ZLoader';

export default (url) => {
    return function(onLoad) {
        let loader = new ZLoader();
        loader.load(url, onLoad);
    };
};