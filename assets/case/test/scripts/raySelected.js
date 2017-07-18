var sectionTipParent = document.createElement('div');
sectionTipParent.style.display = 'none';
sectionTipParent.style.position = 'absolute';
sectionTipParent.style.zIndex = 13;
sectionTipParent.style.backgroundColor = 'rgba(0, 0, 0, 1)';
sectionTipParent.style.color = 'rgba(255, 255, 255, 1)';
sectionTipParent.style.padding = '5px 10px';
sectionTipParent.style.borderRadius = '5px';
sectionTipParent.style.pointerEvents = 'none';
sectionTipParent.innerText = 'section';
player.canvas.parentNode.appendChild(sectionTipParent);

var raycaster = new THREE.Raycaster();

var mouse = new THREE.Vector2();

function getIntersects( point, objects ) {
	
	mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );

	raycaster.setFromCamera( mouse, camera );
	
	return raycaster.intersectObjects( objects );

}

var activeObject = null;
var defaultMaterial = new THREE.MeshLambertMaterial({color: 0x2342b0});
var activeMaterial = new THREE.MeshBasicMaterial({color: 0xff00ff});

// Set default material
for(var i = 0, l = this.children.length; i < l; i ++) {
	this.children.material = defaultMaterial;
}

function getMousePosition( dom, x, y ) {

	var rect = dom.getBoundingClientRect();
	return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];

}

function mousemove( event ) {
	sectionTipParent.style.left = event.clientX + 2 + 'px';
	sectionTipParent.style.top = event.clientY + 2 + 'px';

	var _point = new THREE.Vector2().fromArray(getMousePosition( player.canvas, event.clientX, event.clientY ));
	
	var intersections = getIntersects( _point,  this.children );
	if (intersections.length > 0) {
		if(activeObject) {
			activeObject.material = defaultMaterial;
		}
		// console.log(sectionTipParent);
		activeObject = intersections[0].object;
		activeObject.material = activeMaterial;
		sectionTipParent.innerText = 'section ' + activeObject.name; 
		sectionTipParent.style.display = 'block';
	} else {
		if(activeObject) {
			activeObject.material = defaultMaterial;
		}
		sectionTipParent.style.display = 'none';
		activeObject = null;
	}
}