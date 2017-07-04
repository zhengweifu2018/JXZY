/**
 * 更新path的矩阵
 * @param  {[type]}
 * @param  {[type]}
 * @return {[type]}
 */
export default (path, matrix) => {
    if(matrix === undefined) {
        matrix = new THREE.Matrix4();
    }
    let actions = path.actions, tempVector3 = new THREE.Vector3();
    for(let i = 0; i < actions.length; i++) {
        for(let j = 0; j < actions[i].args.length; j += 2)  {
            tempVector3.set(actions[i].args[j], actions[i].args[j + 1], 0);
            tempVector3.applyMatrix4(matrix);
            actions[i].args[j] = tempVector3.x;
            actions[i].args[j + 1] = tempVector3.y;
        }
    }
};