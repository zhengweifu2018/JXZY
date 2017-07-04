/**
 * 缩放图片
 * @param data
 * @param width => input width
 * @param height => input height
 * @param owidth => output width
 * @param oheight => output height
 * @returns {*}
 */
export default (data, width, height, owidth, oheight) => {
    if(!data.length || width <= 0 || height <= 0 || owidth <= 0 || oheight <= 0) {
        return null;
    }
    var format = data.length / (width * height);

    var w, h, ow, oh, s,
        odata = new Uint8ClampedArray(owidth * oheight * format);
    for(oh = 0; oh < oheight; oh++) {
        h = oh * height / oheight;
        for(ow = 0; ow < owidth; ow++) {
            w = ow * width / owidth;
            for(s = 0; s < format; s++) {
                odata[(ow + oh * owidth) * format + s] = data[(Math.floor(w) + Math.floor(h) * width) * format + s];
            }
        }
    }
    return [odata, format];
};