/**
 * 根据物体的boundingbox自动计算相机的位置
 * @param  {[fov 相机夹角]}
 * @param  {[aspect 相机宽高比]}
 * @param  {[box3 物体boundingBox]}
 * @return {[相机位置]}
 */
export default (fov, aspect, box3) => {
    let distance = box3.max.distanceTo(box3.min);

    let center = box3.center();

    let position = new THREE.Vector3();

    if(distance) {
        let dx = box3.max.x - box3.min.x,
            dy = box3.max.y - box3.min.y,
            dz = box3.max.z - box3.min.z;

        let t = Math.tan(fov * Math.PI / 360);

        if(dx / dy > aspect) {
            dx /= aspect;
        } else {
            dx /= dx / dy; 
        }

        let d = dx * 0.5 / t;

        position.set( 
            center.x,
            center.y,
            center.z + (dz * 0.5 + d) * 1.0
        );
    }

    return position;
};