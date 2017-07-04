export function ParseString(data, offset, length) {
    let  charArray = new Uint8Array( data, offset, length);
    let  text = '';
    for (let i = 0; i < length; i ++ ) {
        text += String.fromCharCode( charArray[ offset + i ]);
    }
    return text;
};

export function ParseUChar8(data, offset) {
    let  charArray = new Uint8Array(data, offset, 1);
    return charArray[0];
};

export function ParseUInt32(data, offset) {
    let  intArray = new Uint32Array(data.slice(offset, offset + 4), 0, 1);
    return intArray[0];
};

export function ParseFloat32(data, offset) {
    let  floatArray = new Float32Array(data.slice(offset, offset + 4), 0, 1);
    return floatArray[0];
};