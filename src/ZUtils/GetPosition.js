import GetRotationMatrix4FromCustomAsix from './GetRotationMatrix4FromCustomAsix';
/**
 * 得到点新的坐标
 * @param radian
 * @param up
 * @param eye
 * @param target
 * @param axis
 * @returns {THREE.Vector3}
 */
export default (radian, up, eye, target, axis) => {
    let x = new THREE.Vector3(),
        y = new THREE.Vector3(),
        z = new THREE.Vector3();

    z.subVectors(eye, target).normalize();
    x.crossVectors(up, z).normalize();
    y.crossVectors(z, x).normalize();

    //rotate_y = new THREE.Vector3();
    let end;
    if (axis === undefined) {
        axis = 'y';
    }
    if(axis === 'y') {
        end = y.add(target);
    } else if(axis === 'x') {
        end = x.add(target);
    } else if(axis === 'z') {
        end = z.add(target);
    } else {
        return new THREE.Vector3();
    }

    let newPoint = eye.clone();

    newPoint.applyMatrix4(GetRotationMatrix4FromCustomAsix(radian, target, end));

    return newPoint;
};