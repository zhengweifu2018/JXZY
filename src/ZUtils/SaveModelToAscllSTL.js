/**
 * 保存文本模型数据
 * @param  {[type]}
 * @return {[type]}
 */
export default (geometry) => {
    let output = '';
    // 判断输入的geometry的类是否属于THREE.Mesh
    if(geometry instanceof THREE.Mesh) {
        geometry.updateMatrixWorld();
        let matrix = geometry.matrixWorld;
        geometry = geometry.geometry.clone();
        geometry.applyMatrix(matrix);
    }

    if(!(geometry instanceof THREE.Geometry)) {
        return output;
    }

    let vertices = geometry.vertices,
        faces = geometry.faces;

    function outputFun(vertices, faces) {
        let vertex1, vertex2, vertex3, faceNormal;
        for(let i = 0; i < faces.length; i++) {
            vertex1 = vertices[faces[i].a];
            vertex2 = vertices[faces[i].b];
            vertex3 = vertices[faces[i].c];
            faceNormal = faces[i].normal;
            output += (
                '  facet normal ' +
                faceNormal.x.toFixed(5) + ' ' +
                faceNormal.y.toFixed(5) + ' ' +
                faceNormal.z.toFixed(5) + '\n    outer loop\n' +
                '      vertex ' +
                vertex1.x.toFixed(5) + ' ' +
                vertex1.y.toFixed(5) + ' ' +
                vertex1.z.toFixed(5) + '\n' +
                '      vertex ' +
                vertex2.x.toFixed(5) + ' ' +
                vertex2.y.toFixed(5) + ' ' +
                vertex2.z.toFixed(5) + '\n' +
                '      vertex ' +
                vertex3.x.toFixed(5) + ' ' +
                vertex3.y.toFixed(5) + ' ' +
                vertex3.z.toFixed(5) + '\n    endloop\n  endfacet\n'
            );
        }
    }

    outputFun(vertices, faces);

    return output;
};