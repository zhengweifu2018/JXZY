
import THREE from 'three';

export default class ZMaterialManager {

    constructor(textureManager) {
        this.materials = {};
        this.textureManager = textureManager;

        this.editableMaterials = [];
        this.record = [];
    }

    setValues(material, parameters) {
        // set common parameters
        if(parameters.color !== undefined && material.color !== undefined) {
            material.color.fromArray(parameters.color);
        } else {
            if(material.color !== undefined) {
                material.color.setRGB(1, 1, 1);
            }
        }

        if(parameters.emissive !== undefined && material.emissive !== undefined) {
            material.emissive.fromArray(parameters.emissive);
        } else {
            if(material.emissive !== undefined) {
                material.emissive.setRGB(0, 0, 0);
            }
        }
        if(parameters.specular !== undefined && material.specular !== undefined) {
            material.specular.fromArray(parameters.specular);
        } else {
            if(material.specular !== undefined) {
                material.specular.setRGB(1, 1, 1);
            }
        }

        if(parameters.shininess !== undefined && material.shininess !== undefined) {
            material.shininess = parameters.shininess;
        } else {
            if(material.shininess !== undefined) {
                material.shininess = 30;
            }
        }

        if(parameters.vertexColors !== undefined) {
            material.vertexColors = parameters.vertexColors;
        } else {
            material.vertexColors = THREE.NoColors;
        }

        if(parameters.blending !== undefined) {
            material.blending = parameters.blending;
        } else {
            material.blending = THREE.NormalBlending;
        }

        if(parameters.side !== undefined) {
            material.side = parameters.side;
        } else {
            material.side = THREE.FrontSide;
        }
        

        if(parameters.opacity !== undefined) {
            material.opacity = parameters.opacity;
        } else {
            material.opacity = 1;
        }

        if(parameters.transparent !== undefined) {
            material.transparent = parameters.transparent;
        } else {
            material.transparent = false;
        }
        

        if(parameters.wireframe !== undefined) {
            material.wireframe = parameters.wireframe;
        } else {
            material.wireframe = false;
        }

        
        // set special parameters
        let specialParameters = {
            'bumpScale' : 1.0,
            'normalScale' : new THREE.Vector2(1.0, 1.0),
            'reflectivity' : 0.0,
            'combine' : THREE.MultiplyOperation
        };  
        for(let each in specialParameters) {
            if(parameters[each] !== undefined && material[each] !== undefined) {
                material[each] = parameters[each];
            } else {
                material[each] = specialParameters[each];
            }
        }

        // material texture map
        let mapParameters = [
            'map', 
            'specularMap', 
            'normalMap', 
            'bumpMap',
            'envMap',
            'lightMap'
        ];
        for(let mapParameter of mapParameters) {
            if(material[mapParameter] === undefined) {
                continue;
            }
            if(parameters[mapParameter] !== undefined && this.textureManager.textures[parameters[mapParameter]] !== undefined) {
                material[mapParameter] = this.textureManager.textures[parameters[mapParameter]];
            } else {
                material[mapParameter] = null;
            }
        }
        material.needsUpdate = true;
    }

    //记录材质信息
    setRecord(material, parameters) {
        let obj = {};
        obj.object = material;
        obj.parameters = parameters;
        this.record.push(obj);
    }


    read(jsonList, jsonFaceMaterials) {
        jsonList = jsonList || [];
        jsonFaceMaterials = jsonFaceMaterials || [];
        jsonList.forEach(json => {

            this.parseMaterial(json);
        });

        jsonFaceMaterials.forEach(faceMaterial =>{

            this.parseFaceMaterial(faceMaterial);

        });
    }

    parseMaterial (json) {
        let material = new THREE[json.type];

        //记录材质信息
        this.setRecord(material, json);

        this.setValues(material, json);

        // children material
        if(json.materials !== undefined) {
            for(let i = 0; i < json.materials.length; i++) {
                material.materials.push(this.parseMaterial(json.materials[i]));
            }
        }

        this.materials[json.uid] = material;
        this.editableMaterials.push(material);
        return  material;
    }

    parseFaceMaterial(json) {
        let material = new THREE.MeshFaceMaterial();
        material.uuid = THREE.Math.generateUUID();
        for(let i = 0; i < json.materials.length; i++) {
            if(json.materials[i] !== undefined) {
                if(this.materials[json.materials[i]] !== undefined) {
                    material.materials.push(this.materials[json.materials[i]]);
                }

            }
        }
        this.materials[json.uid] = material;
    }

    write() {
        result = [];
        resultFaceMaterials = [];
        let eResult, m, each, i, UID;
        for(UID in this.materials) {
            eResult = {};
            m = this.materials[UID];
            eResult.uid = m.uuid;

            if(m instanceof THREE.MeshFaceMaterial) {
                let fmChildren = m.materials;
                if(fmChildren.length > 0) {
                    eResult.type = 'MeshFaceMaterial';
                    eResult.materials = [];
                    for(let es = 0; es < fmChildren.length; es++){
                        eResult.materials.push(fmChildren[es].uuid);
                    }
                }
                resultFaceMaterials.push(eResult);
                continue;
            }

            if(m instanceof THREE.MeshPhongMaterial) {
                eResult.type = 'MeshPhongMaterial';
            } else if(m instanceof THREE.MeshLambertMaterial) {
                eResult.type = 'MeshLambertMaterial';
            }


            // output colors
            let colorParameterDefault = {
                    color        : 16777215,
                    ambient      : 16777215,
                    emissive     : 16777215,
                    specular     : 1118481,
                    light        : 16777215
            };
            for(each in colorParameterDefault) {
                if(m[each] !== undefined) {
                    if(m[each] !== colorParameterDefault[each]) eResult[each] = m[each].getHex();
                }               
            }

            // output index
            let indexParameterDefault = {
                shininess    : 30,
                vertexColors : false,
                blending     : THREE.NormalBlending,
                side         : THREE.FrontSide,
                opacity      : 1.0,
                transparent  : false,
                wireframe    : false,
                combine      : THREE.MixOperation,
                reflectivity : 0
            };
            for(each in indexParameterDefault) {
                if(m[each] !== undefined) {
                    if(m[each] !== indexParameterDefault[each]) {
                        eResult[each] = m[each];
                    }
                }               
            }

            // output map uuid
            let mapParameters = [
                'map', 
                'specularMap', 
                'normalMap', 
                'bumpMap', 
                'lightMap'
            ];
            for(i in mapParameters) {
                if(m[mapParameters[i]] !== undefined && m[mapParameters[i]] !== null) {
                    eResult[mapParameters[i]] = m[mapParameters[i]]['uuid'];
                }
            }


            if(eResult !== {}) {
                result.push(eResult);
            }
        }
            
        return [result, resultFaceMaterials];
    }
}