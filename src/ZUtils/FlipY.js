export default (data, w, h, setp, result) => {
    result = result || new Uint8Array(data.length);
    for(let i = 0, g = h - 1; i < h; i++, g--) {
        for(let j = 0; j < w; j++) {
            for(let k = 0; k < setp; k++) {
                result[i * w * setp + j * setp + k] = data[g * w * setp + j * setp + k];
            }
        }
    }
    return result;          
};