class ZViewport3D {
	constructor(canvas, options) {
		this.canvas = canvas;
        options = options || {};
        options.radius = options.radius === undefined ? 3.183 : options.radius;
        options.geometries = options.geometries === undefined ? [] : options.geometries;

        this.pre_href = options.pre_href;

        this.href = undefined;

		this.width = this.canvas.clientWidth;
		this.height = this.canvas.clientHeight;

        this.clock = new THREE.Clock();

        this.objects = [];

		this.scene = new THREE.Scene();

        let topGroup = new THREE.Group();
        topGroup.scale.set(200, 200, 200);
        topGroup.rotation.y = Math.PI;

		let envSphereGeometry = new THREE.SphereGeometry(options.radius, 100, 100);

        this.envSphereMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, side: 1, wireframe: false});
       	let envSphereMesh = new THREE.Mesh(envSphereGeometry, this.envSphereMaterial);
        envSphereMesh.rotation.set(0, -Math.PI / 2, 0);

        // this.sectionMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, side: 0, wireframe: false, transparent: true, opacity: 0.0});
        
        for(let geo of options.geometries) {
            // console.log(geo);
            let sectionMaterial = new THREE.MeshBasicMaterial({color: 0xff00fc, side: 0, wireframe: false, transparent: true, opacity: 0});
            let sectionMesh = new THREE.Mesh(geo, sectionMaterial);

            topGroup.add(sectionMesh);
            this.objects.push(sectionMesh);
        }

        topGroup.add(envSphereMesh);

        this.scene.add(topGroup);

        this.camera = new THREE.PerspectiveCamera(53, this.width / this.height, 0.1, 5000);

        this.camera.position.set(0, 0, 200);


		this.renderer = new THREE.WebGLRenderer({canvas : this.canvas, alpha: true, antialias: true});
		this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.autoClear = false;

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        // console.log(this.controls);
        this.controls.minDistance = 100;
        this.controls.maxDistance = 400;
        this.controls.zoomSpeed = 2;
        this.controls.enablePan = false;
        // this.controls.autoRotate = true;
        // this.controls.autoRotateSpeed = 0.2;

        // camera animation
        this.cameraMixer = new THREE.AnimationMixer(this.camera);
        let cameraStartTracks = [
            new THREE.NumberKeyframeTrack('.position', [0, 2], [0, 800, 200, 0, 0, 200]),
            new THREE.NumberKeyframeTrack('.quaternion', [0, 2], [-0.7, 0, 0, 0.7, 0, 0, 0, 1])
            
        ];
        this.cameraStartClip = new THREE.AnimationClip('Action', -1, cameraStartTracks);


        this.cameraMixer.addEventListener('finished', (e) => {
            // console.log(e);
            if(this.href !== undefined) {
                window.location.href = this.href;
            }
        });

        this.sectionTipParent = document.createElement('div');
        this.sectionTipParent.style.position = 'absolute';
        this.sectionTipParent.style.zIndex = 3;
        this.sectionTipParent.style.backgroundColor = 'rgba(0, 0, 0, 1)';
        this.sectionTipParent.style.color = 'rgba(255, 255, 255, 1)';
        this.sectionTipParent.style.padding = '5px 10px';
        this.sectionTipParent.style.borderRadius = '5px';
        this.sectionTipParent.style.pointerEvents = 'none';
        this.sectionTipParent.innerText = 'section';
        this.canvas.parentNode.appendChild(this.sectionTipParent);

        this.setEnabled(false);

        this.raycaster = new THREE.Raycaster();

        this.actionCenter = new THREE.Vector3();

        this.mouse = new THREE.Vector2();

        this.onDownPosition = new THREE.Vector2();

        this.onUpPosition = new THREE.Vector2();

        this.cacheObject = undefined;

        this.canvas.parentNode.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
        this.canvas.parentNode.addEventListener( 'mousedown', this.onMouseDown.bind(this), false );

	
		window.addEventListener('resize', event => {
            this.resizeWindow(this.canvas.parentNode.clientWidth, this.canvas.parentNode.clientHeight);
        }, false );

        this.resizeWindow();
        this.renderLoop();
	}

    aniActionPlay(mixer, clip) {
        let action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopOnce);
        action.play();
    }

    updateAnimationMixer(mixer) {
        const delta = this.clock.getDelta();
        if (mixer) {
            mixer.update(delta);
        }
    }

	render() {
		this.scene.updateMatrixWorld();
        this.camera.updateProjectionMatrix();

        this.updateAnimationMixer(this.cameraMixer);

        this.renderer.clear();

        // this.controls.update();

        this.resizeWindow(this.canvas.parentNode.clientWidth, this.canvas.parentNode.clientHeight);

        this.renderer.render(this.scene, this.camera);
	}

	renderLoop() {
		if(window.requestAnimationFrame) {
            requestAnimationFrame(this.renderLoop.bind(this));
            this.render();
        } else {
            console.error('没有发现 window.requestAnimationFrame');
        }
	}

	// resize window
    resizeWindow(width, height) {
    	// console.log(width, height);
        // resize camera aspect
        let w = width ? width : this.canvas.clientWidth, h = height ? height : this.canvas.clientHeight;
        this.width = w;
        this.height = h;

        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();

        // resize viewport width and height
        this.renderer.setSize(w, h, true);
    }

    setEnabled(enabled = true) {
        if(enabled) {
            this.sectionTipParent.style.display = 'block';
        } else {
            this.sectionTipParent.style.display = 'none';
        }

        if(this.cacheObject) {
            let material = this.cacheObject.material;
            if(enabled) {
                const name = this.cacheObject.geometry.name;
                if(name == 'floor') {
                    this.sectionTipParent.innerText = name;
                } else {
                    this.sectionTipParent.innerText = 'section ' + name;
                }
                material.opacity = 0.4;
            } else {
                material.opacity = 0.0;
            }
                
            material.needUpdate = true;
        }
    }

    /**
     * 获取射线相交的物体
     * @param  {THREE.Vector2} point   [description]
     * @param  {Array} objects [description] 需要查询的物体
     * @return {THREE.Mesh}         相交的物体
     */
    getIntersects( point, objects ) {
        this.mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );
        this.raycaster.setFromCamera( this.mouse, this.camera );
        return this.raycaster.intersectObjects( objects );
    }


    getMousePosition( x, y ) {
        const rect = this.canvas.getBoundingClientRect();
        return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];
    }

    onMouseMove(event) {
        const array = this.getMousePosition( event.clientX, event.clientY );
        this.sectionTipParent.style.left = array[0] * (this.width + 5) + 'px';
        this.sectionTipParent.style.top = array[1] * (this.height + 5) + 'px';
        const point = new THREE.Vector2().fromArray(array);
        const intersects = this.getIntersects( point, this.objects );
        if(intersects.length > 0) {
            let intersect = intersects[0];
            if(this.cacheObject != intersect.object) {
                this.cacheObject = intersect.object;
                this.actionCenter.copy(this.cacheObject.geometry.boundingBox.center());
                this.actionCenter.applyMatrix4(this.cacheObject.matrixWorld);
                this.setEnabled(true);
            }
        } else {
            if(this.cacheObject !== undefined) {
                this.setEnabled(false);
                this.cacheObject = undefined;
            }
        }
    }

    /**
     * 鼠标按下事件
     * @param  {object} 事件参数 
     */
    onMouseDown(event) {
        event.preventDefault();

        const array = this.getMousePosition( event.clientX, event.clientY );

        this.onDownPosition.fromArray( array );

        document.addEventListener( 'mouseup', this.onMouseUp.bind(this), false );
    }

    /**
     * 鼠标抬起事件
     * @param  {object} 事件参数 
     */
    onMouseUp( event ) {
        const array = this.getMousePosition( event.clientX, event.clientY );
        this.onUpPosition.fromArray( array );
 
        if ( this.onDownPosition.distanceTo( this.onUpPosition ) === 0 ) {
            if(this.cacheObject) {
                if(this.pre_href) {
                    let quaternion = new THREE.Quaternion();
                    let m1 = new THREE.Matrix4();
                    m1.lookAt(this.camera.position, this.actionCenter, this.camera.up);
                    quaternion.setFromRotationMatrix(m1);
                    let tracks = [
                        new THREE.NumberKeyframeTrack('.position', [0.3, 1.0], [
                            this.camera.position.x, 
                            this.camera.position.y, 
                            this.camera.position.z,
                            this.actionCenter.x, 
                            this.actionCenter.y, 
                            this.actionCenter.z
                        ]),
                        new THREE.NumberKeyframeTrack('.quaternion', [0, 0.3], [
                            this.camera.quaternion.x,
                            this.camera.quaternion.y,
                            this.camera.quaternion.z,
                            this.camera.quaternion.w,
                            quaternion.x,
                            quaternion.y,
                            quaternion.z,
                            quaternion.w,
                        ])
                    ];
                    let aniClip = new THREE.AnimationClip('Action_t', -1, tracks);
                    this.aniActionPlay(this.cameraMixer, aniClip);
                    this.href = this.pre_href + this.cacheObject.geometry.name;
                }
            }
        }

        document.removeEventListener( 'mouseup', this.onMouseUp, false );

    }

}

export default ZViewport3D;