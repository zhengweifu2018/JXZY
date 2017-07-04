/**
 * [IsSupportH5WebGLOrNot 查看浏览器是否支持]
 * @return {Boolean} [1 ：html5, 2 : webgl, 3 : all not]
 */
export default () => { // 1 : html5, 2 : webgl, 3 : all not
    let canvas = document.createElement('canvas');
    if(canvas.getContext) {
      try {
          let webgl = !! window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        if(webgl) {
            return 2;
        } else {
            return 1;
        }
      } catch(e) {
        return 1;
      }
    } else {
        return 0;
    }
};