/**
 * manage project objects
 */

import THREE from 'three';
import Is from './ZUtils/Is';

export default class ZObjectManager {

    constructor(materialManager, scriptManager, geometryManager, project) {
        this.materialManager = materialManager;
        this.scriptManager = scriptManager;
        this.geometryManager = geometryManager;

        this.geometries = [];

        this.uuid2Meshes = {};
        this.project = project;

        this.topObject = null;

        this.uuid2Script = {};
    }


    /**
     * read project object parameters
     * @param json
     * @param onLoad
     * @returns {*}
     */
    read(json, onLoad) {
        this.topObject = this.parse(json, onLoad);
    }

    parse(json, onLoad) {
        let self = this;
        let object, i;

        switch(json.type) {
            case 'Group':
                object = new THREE.Group();
                break;
            case 'Mesh':
                let mat, g;
                if(json.material !== undefined) {
                    if(Is(json.material, 'Array')) {
                        mat = new THREE.MultiMaterial();
                        for(let matUuid of json.material) {
                            mat.materials.push(this.materialManager.materials[matUuid]);
                        }
                    } else {
                        mat = this.materialManager.materials[json.material];
                    }
                } else{
                    mat = new THREE.MeshPhongMaterial({color : 0x888888});
                    this.materialManager.materials[mat.uuid] = mat;
                    if( onLoad ) {
                        onLoad(mat); // implement callback
                    }
                }

                if(json.geometry !== undefined && this.geometryManager.geometries[json.geometry]) {
                   g = this.geometryManager.geometries[json.geometry];
                } else {
                    console.error("Not fount " + json.geometry + " geometry.");
                    return new THREE.Group();
                }

                object = new THREE.Mesh();
                object.material = mat;
                object.geometry = g;

                if(g.zobjs === undefined) {
                    g.zobjs = [];
                }
                if(g.zobjs.findIndex(obj => obj === object) === -1) {
                    g.zobjs.push(object);
                }

                // open cast shadow and receive shadow
                object.castShadow = true;
                object.receiveShadow = true;
                
                break;
            case 'DirectionalLight':
                object = new THREE.DirectionalLight();
                break;
            case 'CSSSpriteObject':

                if(json.url !== undefined) {
                    object = new THREE.CSSSpriteObject(this.project.pathToAbs(json.url));
                    if(json.zIndex !== undefined) {
                        object.zIndex = json.zIndex;
                    }
                } else {
                    object = new THREE.Object3D();
                }
                break;

            default:
                object = new THREE.Object3D();
        }

        this.setCommonValues(json, object);

        // save object uuid => script source
        if(json.scripts !== undefined) {
            this.uuid2Script[object.uuid] = [];
            for(i in json.scripts) {
                if (this.scriptManager.scripts[json.scripts[i]]) {
                    this.uuid2Script[object.uuid].push(this.scriptManager.scripts[json.scripts[i]]);
                }
            }
        }
        //console.log(this.uuid2Script);
        if(json.children !== undefined) {
            for(let child in json.children) {
                object.add(this.parse(json.children[child]));
            }

        }

        return object;

    }

    setCommonValues(json, object) {
        if(json.uuid !== undefined) {
            object.uuid = json.uuid;
        } else {
            THREE.Math.generateUUID();
        }

        if(json.name !== undefined) {
            object.name = json.name;
        }

        if(json.color !== undefined) {
            if(Is(json.color, 'Array')) {
                object.color.fromArray(json.color);
            } else {
                object.color.setHex(json.color);
            }
        }

        if(json.intensity !== undefined) {
            object.intensity = json.intensity;
        }

        if(json.matrix !== undefined) {
            let matrix = new THREE.Matrix4();
            matrix.fromArray(json.matrix);
            matrix.decompose(object.position, object.quaternion, object.scale);
        }

        if(json.animationData !== undefined) {
            let animate = new THREE.Animation(object, json.animationData);
            object.__animationData = json.animationData;
            object.__animation = animate;
        }

        if(json.visible !== undefined) {
            object.visible = json.visible;
        }

        if(json.groupid !== undefined) {
            object.groupid = json.groupid;
        }

        if(json.materialEngName !== undefined) {
            object.materialEngName = json.materialEngName;
        }
    }

    getGeometryFromUid (uid) {
        for(let i = 0; i < this.geometries.length; i++) {
            if(this.geometries[i].uuid === uid) {
                return this.geometries[i];
            }
        }

        return null;
    }

    write() {
        let self = this;
        //let result = {};

        function _write(object) {
            let result = {};
            result.uuid = object.uuid;

            if (object.name !== '') {
                result.name = object.name;
            }

            if (!object.visible) {
                result.visible = object.visible;
            }

            if (object instanceof THREE.Scene) {

                result.type = 'Scene';

            } else if (object instanceof THREE.PerspectiveCamera) {

                result.type = 'PerspectiveCamera';
                result.fov = object.fov;
                result.aspect = object.aspect;
                result.near = object.near;
                result.far = object.far;

            } else if (object instanceof THREE.OrthographicCamera) {

                result.type = 'OrthographicCamera';
                result.left = object.left;
                result.right = object.right;
                result.top = object.top;
                result.bottom = object.bottom;
                result.near = object.near;
                result.far = object.far;

            } else if (object instanceof THREE.AmbientLight) {

                result.type = 'AmbientLight';
                result.color = object.color.getHex();
                result.intensity = object.intensity;

            } else if (object instanceof THREE.DirectionalLight) {

                result.type = 'DirectionalLight';
                result.color = object.color.getHex();
                result.intensity = object.intensity;

            } else if (object instanceof THREE.PointLight) {

                result.type = 'PointLight';
                result.color = object.color.getHex();
                result.intensity = object.intensity;
                result.distance = object.distance;

            } else if (object instanceof THREE.SpotLight) {

                result.type = 'SpotLight';
                result.color = object.color.getHex();
                result.intensity = object.intensity;
                result.distance = object.distance;
                result.angle = object.angle;
                result.exponent = object.exponent;

            } else if (object instanceof THREE.HemisphereLight) {

                result.type = 'HemisphereLight';
                result.color = object.color.getHex();
                result.groundColor = object.groundColor.getHex();

            } else if (object instanceof THREE.Mesh) {

                result.type = 'Mesh';
                result.geometry = object.geometry.uuid;
                result.material = object.material.uuid;


            } else if (object instanceof THREE.Sprite) {

                result.type = 'Sprite';

            } else if (object instanceof THREE.Group) {

                result.type = 'Group';

            } else {

                result.type = 'Object3D';
            }

            if(object.__animationData) {
                result.animationData = object.__animationData;
            }

            result.matrix = object.matrix.toArray();
            for(let c in object.children) {
                if(result.children === undefined) {
                    result.children = [];
                }
                result.children.push(_write(object.children[c])); 
            }
            return result;
        }
        
        let output = [];
        for(let m in this.project.root.children) {
            output.push(_write(this.project.root.children[m]));
        }
        return output;           
    }
}