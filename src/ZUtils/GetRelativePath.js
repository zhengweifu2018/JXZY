/**
 * 将绝对路径转成相对路径
 * @param url
 * @param sAbs
 * @returns {*}
 */
export default (url, sAbs) => {
    let urlN = url.replace('\\', '/');
    let urlNL = urlN.split('/');

    let sAbsN = sAbs.replace('\\', '/');
    let sAbsNL = sAbsN.split('/');

    let lenUrl = urlNL.length;
    let lenSAbs = sAbsNL.length;


    let ref = null;

    for(let i = 0; i < lenUrl - 1 && i < lenSAbs; i++) {
        if(urlNL[i] !== sAbsNL[i]) {
            ref = i;
            break;
        } else {
            if(i === lenUrl - 2) {
                ref = i + 1;
            }
        }
    }

    if(ref === null || ref < 0) {
        return sAbs;
    }

    let split = [];

    for(let i = ref; i < lenUrl - 1; i++) {
        split.push('..');
    }

    for(let i = ref; i < lenSAbs; i++) {
        split.push(sAbsNL[i]);
    }

    return split.join('/');
};