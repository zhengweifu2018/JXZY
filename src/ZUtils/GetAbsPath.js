/**
 * 将相对路径转成绝对路径
 * @param url
 * @param sRelative
 * @returns {*}
 */
export default (url, sRelative) => {
    if(url.replace('\\', '/').split('/')[0] == sRelative.replace('\\', '/').split('/')[0]) {
        return sRelative;
    }

    let sUrl = url.replace(/^.*?\:\/\/[^\/]+/, '').replace(/[^\/]+$/, '');

    if (!sRelative) {
        return sUrl;
    }
    if (!/\/$/.test(sUrl)) {
        sUrl += '/';
    }
    if (/^\.\.\//.test(sRelative)) {
        let Re = new RegExp('^\\.\\.\\/'), iCount = 0;
        while (Re.exec(sRelative) != null) {
            sRelative = sRelative.replace(Re, '');
            iCount++;
        }
        for (let i = 0; i < iCount; i++) {
            sUrl = sUrl.replace(/[^\/]+\/$/, '');
        }
        if (sUrl == '') {
            return '/';
        }
        return sUrl + sRelative;
    }
    sRelative = sRelative.replace(/^\.\//, '');

    return sUrl + sRelative;
};