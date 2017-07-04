import THREE from 'three';
/**
 * 计算模型体积
 * @param  {[type]}
 * @return {[type]}
 */
export default (geometry) => {
    let outVolume = 0;
    // 判断输入的geometry的类是否属于THREE.Mesh
    if(geometry instanceof THREE.Mesh) {
        geometry.updateMatrixWorld(true);
        let matrix = geometry.matrixWorld;
        geometry = geometry.geometry.clone();
        geometry.applyMatrix(matrix);
        //geometry.computeFaceNormals();
    }


    if(!(geometry instanceof THREE.Geometry)) {
        return 0;
    }

    // geometry.computeFaceNormals();
    // 判断模型的boundingBox是否存在，如果不存在重新计算
    if(geometry.boundingBox === null) {
        geometry.computeBoundingBox();
    }

    // 更具模型的boundingBox得到其中心点
    let center = new THREE.Vector3(
        (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2,
        (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2,
        (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2
    );

    // 得到模型的顶点列表
    let vertices = geometry.vertices;

    // 得到模型的面列表
    let faces = geometry.faces;
    let fLength = faces.length;
    let eachVolume;
    for(let i = 0; i < fLength; i++) {
        eachVolume = computeVolumeFromFace(faces[i]);
        if(!isNaN(eachVolume)) {
            outVolume += eachVolume;
        }
    }

    // 取体积的绝对值
    outVolume = Math.abs(outVolume);

    return outVolume;

    function getDistance(p1, p2, p3, pt) {
        const a = ((p2.y - p1.y) * (p3.z - p1.z) - (p2.z - p1.z) * (p3.y - p1.y));  
        const b = ((p2.z - p1.z) * (p3.x - p1.x) - (p2.x - p1.x) * (p3.z - p1.z));  
        const c = ((p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x));  
        const d = -(a * p1.x + b * p1.y + c * p1.z);

        return (a * pt.x + b * pt.y + c * pt.z + d) / Math.sqrt(a * a + b * b + c * c);
    }

    // 计算每个面和中心点组成的三棱锥的体积
    function computeVolumeFromFace(face) {
        let v1 = vertices[face.a].clone(), v2 = vertices[face.b].clone(), v3 = vertices[face.c].clone();

        let vAB = new THREE.Vector3(), vAC = new THREE.Vector3();
        vAB.subVectors(v2, v1);
        vAC.subVectors(v3, v1);

        // 计算三菱锥的高
        let fNormal = vAB.clone();
        fNormal.cross(vAC);

        // 法线归一化
        fNormal.normalize();

        // 根据平面公式计算d的值
        let d = -(fNormal.x * v2.x +  fNormal.y * v2.y + fNormal.z * v2.z);

        // 计算中心点到平面的距离
        // let height = fNormal.x * center.x + fNormal.y * center.y + fNormal.z * center.z + d;
        let height = getDistance(v1, v2, v3, center);

        // 计算face的表面积
        
        let ABDotAC = vAB.x * vAC.x + vAB.y * vAC.y + vAB.z * vAC.z;
        let mAB = Math.sqrt(vAB.x * vAB.x + vAB.y * vAB.y + vAB.z * vAB.z);
        let mAC = Math.sqrt(vAC.x * vAC.x + vAC.y * vAC.y + vAC.z * vAC.z);
        let faceArea = 0.5 * Math.sqrt(Math.pow(mAB * mAC, 2) - Math.pow(ABDotAC, 2));

        // 计算体积
        let volume = 1 / 3 * faceArea * height;

        return volume;
    }
};