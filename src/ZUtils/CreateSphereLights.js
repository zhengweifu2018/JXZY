import THREE from 'three.js';

function CreateSphereLights(radius, widthSegments, heightSegments, lightType, lightColor, lightIntersity) {
	let lightGroup = new THREE.Group();
	radius = radius || 50;
	widthSegments = Math.max( 3, Math.floor( widthSegments ) || 8 );
	heightSegments = Math.max( 2, Math.floor( heightSegments ) || 6 );

	for(let iy = 0; iy < heightSegments; iy ++) {
		const v = iy / heightSegments;
		const ay = v * Math.PI * 2;
		for(let ix = 0; ix < widthSegments; ix ++) {
			const u = ix / widthSegments;
			const ax = u * Math.PI * 2;
			let light = new THREE['lightType'];

			light.position.x = -radius * Math.cos(ax) * Math.sin(ay);
			light.position.y = radius + Math.cos(ay);
			light.position.z = radius + Math.sin(ax) * Math.sin(ay);

			lightGroup.add(light);
		}
	}

	return lightGroup;
};

export default CreateSphereLights;