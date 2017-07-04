import THREE from 'three';
import Point from '../../../../common/utils/math/Point2';
import FitCurves from '../../../../common/utils/FitCurves';

function arrayListToThreePath(arrayList, path) {
    path = path === undefined ? new THREE.Path() : path;
    let points = arrayList.map(item => {
        return new Point(item[0], item[1]);
    });
    let bezierPoints = FitCurves.fit(points, 3);
    
    path.moveTo(bezierPoints[0].x, bezierPoints[0].y);
    for(let i = 1, l = bezierPoints.length; i < l - 2; ) {
        path.bezierCurveTo(
            bezierPoints[i].x, bezierPoints[i].y,
            bezierPoints[i + 1].x, bezierPoints[i + 1].y,
            bezierPoints[i + 2].x, bezierPoints[i + 2].y
        );

        i += 3;
    }

    path.lineTo(bezierPoints[0].x, bezierPoints[0].y);

    return path;
}

export default (imgdata, options) => {

    options.smooth !== undefined ? options.smooth : 0;
    options.minArea !== undefined ? options.minArea : 2;

    options.maxAngle !== undefined ? options.maxAngle : 180;

    let width = imgdata.width, height = imgdata.height;

    let imageData = data2Black();

    // 查询坐标
    const coords = [
        [-1,  0],
        [ 0,  1],
        [ 1,  0],
        [ 0, -1],
        [ 1, -1],
        [-1,  1],
        [ 1,  1],
        [-1, -1]
    ];

    // 方向坐标
    const coordsDir = [
        [-1,  0],
        [-1,  1],
        [ 0,  1],
        [ 1,  1],
        [ 1,  0],
        [ 1, -1],
        [ 0, -1],
        [-1, -1]
    ];


    let borderlineData = getBorderlineData();


    // 将小于128的数据转换成0，大于128的数据转换成255
    function data2Black() {
        let result = new Uint8Array(width * height);
        let step = imgdata.data.length / (width * height);
        for (let y = 0; y < height; y ++) {
            for (let x = 0; x < width; x ++) {
                let i = y * width + x;
                let j = i * step;
                if(j != 0) {
                    j += 1;
                }
                result[i] = imgdata.data[j] >= 255 ? 255 : 0;
            }
        }

        return result;
    }

    // 根据x， y的位置得到相应的值
    function getValue(ix, iy) {
        return imageData[width * iy + ix];
    }

    // 得到边界数据(1 表示边界数据)
    function getBorderlineData() {
        let result = new Uint8Array(width * height);
        for (let y = 0; y < height; y ++) {
            for (let x = 0; x < width; x ++) {

                if(y == 0 || y == height - 1 || x == 0 || x == width - 1) {
                    if(getValue(x, y) == 0) {
                        result[width * y + x] = 1;
                    }
                } else if(getValue(x, y) == 0) {
                    for(let i = 0; i < coords.length; i++) {
                        if(getValue(x + coords[i][0], y + coords[i][1]) == 255) {
                            result[width * y + x] = 1;
                            //console.log(width * y + x, result[width * y + x]);
                            break;
                        }
                    }
                }
            }
        }
        return result;
    }


    // 检查路径的方向
    function checkDir(path) {
        let x0 = path[1][0],
            y0 = path[1][1],
            x1 = path[3][0],
            y1 = path[3][1],
            iCoord = 0;

        if(y0 == y1) {
            if(x0 < x1) {
                iCoord = 4;
            }

            if(x0 > x1) {
                iCoord = 0;
            }
        } else if(y0 < y1) {
            if(x0 < x1) {
                iCoord = 3;
            }

            if(x0 == x1) {
                iCoord = 2;
            }
            if(x0 > x1) {
                iCoord = 1;
            }
        } else {
            if(x0 < x1) {
                iCoord = 5;
            }

            if(x0 == x1) {
                iCoord = 6;
            }
            if(x0 > x1) {
                iCoord = 7;
            }
        }

        iCoord -= 2; //CW

        if(iCoord < 0) {
            iCoord += coords.length;
        }

        x1 += coordsDir[iCoord][0];
        y1 += coordsDir[iCoord][1];

        if(getValue(x1, y1) == 0) {
            return true;
        } else {
            return false;
        }
    }

    // 得到面积
    function getArea(contour) {

        let n = contour.length;
        let a = 0.0;

        for(let p = n - 1, q = 0; q < n; p = q++) {

            a += contour[p][0] * contour[q][1] - contour[q][0] * contour[p][1];

        }

        return a * 0.5;
    }

    // 绘制
    function drawEdges(edges, path) {
        let medges = [];

        for(let i = 0; i < edges.length; i++) {
            let t = edges[i];

            if(t.length < 5 || Math.abs(getArea(t)) < options.minArea) {
                continue;
            }
            if(checkDir(t)) {
                t = t.reverse();
            }

            let marea = getArea(t);

            for(let j = 0; j < options.smooth; j++) {
                t = averagePoints(t);
            }

            // t = deletePoints(t, options.maxAngle);

            if(marea < 0) {
                medges.splice(0, 0, t);
            } else {
                medges.push(t);
            }

            // drawEdge(t, path);
        }

        medges.forEach(function(e) {
            // console.log(getArea(e));
            drawEdge(e, path);
        });
    }

    // 删除多余的点
    function deletePoints(points, maxAngle) {
        let start = new THREE.Vector2(),
            center = new THREE.Vector2(),
            end = new THREE.Vector2(),
            v1 = new THREE.Vector2(),
            v2 = new THREE.Vector2(),
            newPoints = [];


        start.fromArray(points[points.length - 1]);

        for(let di = 0; di < points.length; di++) {

            center.fromArray(points[di]);

            if(di === points.length - 1) {
                end.fromArray(points[0]);
            } else {
                end.fromArray(points[di + 1]);
            }


            v1.subVectors(start, center).normalize();

            v2.subVectors(end, center).normalize();

            let dot = v1.dot(v2);


            if(dot <= Math.cos(maxAngle * Math.PI / 180)) {

            } else {

                newPoints.push(points[di].concat());

                start.fromArray(points[di]);
            }
        }

        return newPoints;
    }

    function averagePoints(points) {
        let start = new THREE.Vector2(),
            end = new THREE.Vector2(),
            newPoints = [];

        start.fromArray(points[points.length - 1]);

        for(let i = 0; i < points.length; i++) {
            let j = i;

            if(i == points.length - 1) {
                end.fromArray(points[0]);
            } else {
                end.fromArray(points[j + 1]);
            }


            newPoints.push([(start.x + end.x + points[j][0]) / 3, (start.y + end.y + points[j][1]) / 3]);


            start.fromArray(newPoints[newPoints.length - 1]);
        }

        return newPoints;
    }

    //Laplacian smoothing
    function smoothEdge(edge) {
        let newEdge = [];
        for(let i = 0; i < edge.length; i++) {
            let j = i + 1;
            if(j >= edge.length) {
                j -= edge.length;
            }

            let k = i - 1;
            if(k < 0) {
                k += edge.length;
            }


            /*
             let Lp_x = (edge[j][0]-edge[i][0]+edge[k][0]-edge[i][0])/2;
             let Lp_y = (edge[j][1]-edge[i][1]+edge[k][1]-edge[i][1])/2;

             let x = edge[i][0]+ 0.5*Lp_x;
             let y = edge[i][1]+ 0.5*Lp_y;
             */


            let x = (edge[i][0] + edge[j][0] + edge[k][0]) / 3;
            let y = (edge[i][1] + edge[j][1] + edge[k][1]) / 3;

            newEdge.push([x, y] );
        }

        return newEdge;
    }

    function drawEdge(edge, path) {
        if(edge.length < 1) {
            return;
        }

        arrayListToThreePath(edge, path);

         // path.moveTo( edge[0][0], edge[0][1]);

         // for(let i = 1; i < edge.length; i++) {

         //     path.lineTo( edge[i][0], edge[i][1]);

         // }

         // path.lineTo( edge[0][0], edge[0][1]);


        ////spline fit
        //path.moveTo( edge[0][0], edge[0][1]);
        //
        //let pt = [];
        //for(let i=1; i<edge.length; i++) {
        //    pt.push({'x':edge[i][0], 'y': edge[i][1]});
        //
        //}
        //pt.push({'x':edge[0][0], 'y': edge[0][1]});
        //path.splineThru(pt);

    }


    function findEdgeCW(x, y, edge) {
        let ix = x, iy = y;
        let bFind = true;
        let iStart = 0;
        let scale = 1;

        while(bFind){
            bFind = false;
            for(let i = 0; i < coords.length; i++){
                let ii = i + iStart;

                if(ii >= coords.length) {
                    ii -= coords.length;
                }
                let _x = ix + scale * coords[ii][0];
                let _y = iy + scale * coords[ii][1];

                if(getEdge(_x, _y)){

                    scale = 1.0;

                    bFind = true;

                    edge.push([_x, _y]);

                    ix = _x;
                    iy = _y;

                    break;
                }
            }
        }
    }

    // 得到边
    function getEdge(ix, iy) {
        if(borderlineData[ iy * width + ix ] > 0) {
            setSearched(ix, iy);
            return true;
        }
        return false;
    }

    // 设置已经查找过的边界值为0
    function setSearched(ix, iy) {
        borderlineData[iy * width + ix] = 0;
    }

    // 得到所有的边
    function getAllEdge() {
        let edges = [];

        let bfind = false;

        for(let y = 0; y < height; y++) {
            for(let x = 0; x < width; x++) {

                if(getEdge(x, y)) {

                    let edge = [];

                    edge.push([x, y]);

                    findEdgeCW(x, y, edge );

                    edges.push(edge);
                }
            }
        }

        mergeEdges(edges);

        return edges;
    }


    function calDistance(sPoint, ePoint) {

        let x = Math.abs(sPoint[0] - ePoint[0]);
        let y = Math.abs(sPoint[1] - ePoint[1]);

        let d = x * x + y * y;

        return d;
    }

    function connetPoint(p, q, w) {
        let _d = 2;
        if(w != undefined && w > _d){
            _d = w;
        }

        let d = calDistance(p, q);

        if(d < _d) {
            return true;
        }
        return false;
    }

    function calEdgeDistance(edge0, edge1) {
        let p = [];
        p.push(edge0[0]);
        p.push(edge0[edge0.length - 1]);

        let q = [];
        q.push(edge1[0]);
        q.push(edge1[edge1.length - 1]);

        let minD = 100000;
        for(let i = 0; i < p.length; i++) {

            let p0 = p[i];
            for(let j = 0; j < q.length; j++){
                let q0 = q[j];

                let d = calDistance(p0, q0);

                if(d < minD){
                    minD = d;
                }
            }

        }

        return minD;

    }
    function mergeEdge(edge0, edge1, d) {

        let p0 = edge0[0];
        let p1 = edge0[edge0.length - 1];

        let q0 = edge1[0];
        let q1 = edge1[edge1.length - 1];


        let newEdge = [];
        if(connetPoint(p0,q0, d)) {
            Array.prototype.push.apply( newEdge, edge0.reverse() );
            Array.prototype.push.apply( newEdge, edge1 );
        } else if(connetPoint(p0,q1, d)) {
            Array.prototype.push.apply( newEdge, edge0.reverse() );
            Array.prototype.push.apply( newEdge, edge1.reverse() );
        } else if(connetPoint(p1,q0, d)) {
            Array.prototype.push.apply( newEdge, edge0);
            Array.prototype.push.apply( newEdge, edge1);
        } else if(connetPoint(p1,q1, d)) {
            Array.prototype.push.apply( newEdge, edge0);
            Array.prototype.push.apply( newEdge, edge1.reverse() );
        }

        return newEdge;
    }
    function mergeEdges(edges) {

        closeEdges(edges, 2);

        closeEdges(edges, 4);

        closeEdges(edges, 8);

        closeEdges(edges, 10);

        closeEdges(edges, 18);


    }
    function closeEdges(edges, dTh) {

        let bfind = true;

        while(bfind){

            bfind = false;
            for(let i = 0; i < edges.length; i++){

                let edge0 = edges[i];

                if(edge0.length > 4 && connetPoint(edge0[0], edge0[edge0.length - 1], 2)) {
                    continue;
                }
                let minD = 10000;
                let minJ = -1;
                for(let j = i + 1; j < edges.length; j++){
                    let edge1 = edges[j];

                    let d = calEdgeDistance(edge0, edge1);


                    if(minD > d){
                        minD = d;
                        minJ = j;
                    }

                }

                if(minD <= dTh){
                    let edge1 = edges[minJ];
                    let newEdge = mergeEdge(edge0, edge1, minD + 1);

                    if(newEdge.length > 1){
                        edges.splice(minJ, 1);
                        edges.splice(i, 1);


                        edges.push(newEdge);


                        bfind = true;
                        break;
                    }

                }

            }
        }

    }

    // 构建几何体
    function buildGeometry() {

        let path = new THREE.Path();
        let shapes = [];

        let edges = getAllEdge();


        drawEdges(edges, path);

        Array.prototype.push.apply( shapes, path.toShapes() );

        return shapes;
    }

    return buildGeometry();
};