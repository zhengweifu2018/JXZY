/**
 * XMLHttpRequest 导入callback
 */
export default (request, onLoad) => {
    if(request.onload !== undefined) {
        request.onload = function() {
            if (request.responseText) {
                if(onLoad) {
                    onLoad(request.responseText);
                }
            }
        };
    } else if(request.onreadystatechange !== undefined) {
        request.onreadystatechange = function () {
            if (request.readyState == 4) {// 4 = 'loaded'
                if (request.status == 200) {// 200 = OK
                    if (request.responseText) {
                        if(onLoad) {
                            onLoad(request.responseText);
                        }
                    }
                } else {
                    alert('status: ' + request.status);
                }
            }
        };
    } else {
        alert('request error');
    }
};