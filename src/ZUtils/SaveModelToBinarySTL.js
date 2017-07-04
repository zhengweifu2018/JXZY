/**
 * 保存二进制模型数据
 * @param  {[type]}
 * @return {[type]}
 */
export default (geometry) => {
    let vertices = [], faces = [], fLength = 0;
    // 判断输入的geometry的类是否属于Array
    if(!(geometry instanceof Array)) {
        geometry = [geometry];
    }
    for(let i = 0; i < geometry.length; i++) {
        let geo = geometry[i];
        // 判断输入的geo的类是否属于THREE.Mesh
        if(geo instanceof THREE.Mesh) {
            geo.updateMatrixWorld();
            let matrix = geo.matrixWorld;
            geo = geo.geometry.clone();
            geo.applyMatrix(matrix);
        }

        if(!(geo instanceof THREE.Geometry)) {
            continue;
        }

        vertices.push(geo.vertices);

        faces.push(geo.faces);

        fLength += geo.faces.length;
    }

    // 定义一个ArrayBuffer容器保存stl二进制信息
    let outputArrayBuffer = new ArrayBuffer(fLength * 50 + 84),
        dataView = new DataView(outputArrayBuffer, 0);

    // 前面80个字节用来描述创建的信息
    for(let j = 0; j < 20; j++) {
        dataView.setFloat32(j * 4, j);
    }

    // 这四个字节记录该模型的面数量
    dataView.setUint32(80, fLength, true);


    // 循环将每个面的法线和三个顶点的数据填入到ArrayBuffer中
    let vertex1, vertex2, vertex3, faceNormal, tempCount = 84;
    for(let i = 0; i < faces.length; i++) {
        for(let j = 0; j < faces[i].length; j++) {
            vertex1 = vertices[i][faces[i][j].a];
            vertex2 = vertices[i][faces[i][j].b];
            vertex3 = vertices[i][faces[i][j].c];
            faceNormal = faces[i][j].normal;

            dataView.setFloat32(tempCount, faceNormal.x, true);
            dataView.setFloat32(tempCount + 4, faceNormal.y, true);
            dataView.setFloat32(tempCount + 8, faceNormal.z, true);

            dataView.setFloat32(tempCount + 12, vertex1.x, true);
            dataView.setFloat32(tempCount + 16, vertex1.y, true);
            dataView.setFloat32(tempCount + 20, vertex1.z, true);

            dataView.setFloat32(tempCount + 24, vertex2.x, true);
            dataView.setFloat32(tempCount + 28, vertex2.y, true);
            dataView.setFloat32(tempCount + 32, vertex2.z, true);


            dataView.setFloat32(tempCount + 36, vertex3.x, true);
            dataView.setFloat32(tempCount + 40, vertex3.y, true);
            dataView.setFloat32(tempCount + 44, vertex3.z, true);

            tempCount += 50;
        }
    }

    return outputArrayBuffer;
};