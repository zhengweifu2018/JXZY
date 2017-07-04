/**
 * 根据自定义轴旋转点
 * @param radian
 * @param pivotStart
 * @param pivotEnd
 * @returns {THREE.Vector3}
 */
export default (radian, pivotStart, pivotEnd) => {
    let c = Math.cos(radian);
    let s = Math.sin(radian);

    let p = new THREE.Vector3();
    p.subVectors(pivotEnd, pivotStart).normalize();

    let u = p.x, v = p.y, w = p.z;

    let x =  pivotStart.x, y = pivotStart.y, z = pivotStart.z;

    let uu = u * u,
        uv = u * v,
        uw = u * w,
        vv = v * v,
        vw = v * w,
        ww = w * w,

        xu = x * u,
        xv = x * v,
        xw = x * w,
        yu = y * u,
        yv = y * v,
        yw = y * w,
        zu = z * u,
        zv = z * v,
        zw = z * w;



    let m11 = uu + (vv + ww) * c,
        m12 = uv * (1 - c) - w * s,
        m13 = uw * (1 - c) + v * s,
        m14 = (x * (vv + ww) - u * (yv + zw)) * (1 - c) + (yw - zv) * s,

        m21 = uv * (1 - c) + w * s,
        m22 = vv + (uu + ww) * c,
        m23 = vw * (1 - c) - u * s,
        m24 = (y * (uu + ww) - v * (xu + zw)) * (1 - c) + (zu - xw) * s,

        m31 = uw * (1 - c) - v * s,
        m32 = vw * (1 - c) + u * s,
        m33 = ww + (uu + vv) * c,
        m34 = (z * (uu + vv) - w * (xu + yv)) * (1 - c) + (xv - yu) * s;

    let outputMatrix4 = new THREE.Matrix4();

    outputMatrix4.set(m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, 0, 0, 0, 1);

    return outputMatrix4;
};