/**
 * three.js website ZMeshLoader by fun.zheng
 */

import THREE from 'three';

import { ParseUChar8, ParseUInt32, ParseFloat32 } from './ZUtils/ParseDataType';

import AssignUVs from './ZUtils/AssignUVs';

import ZLoader from './ZLoader';

export default class ZMeshLoader {
    constructor() {
        this.geometry = new THREE.Geometry();
    }

    parse(url, onLoad, onProgress, onError) {
        let loader = new ZLoader();

        loader.setResponseType('arraybuffer');

        let recodeProcess = 0;

        loader.load(url, (response) => {
            if(response) {
                this.read(response, true, url);
                if(onLoad) {
                    onLoad(this.geometry);
                }
            }
        }, (event) => {
            if(onProgress) {
                onProgress(event.lengthComputable);
            }
        }, (event) => {
            if(onError) {
                onError(event);
            }
        });
    }

    read(data, binary, url) { //geometry json

        function isBitSet(value, position) {
            return value & (1 << position);
        }
        let vertices = [],
            normals = [],
            uvs = [],
            faces = [],
            colors = [],
            uvLayers = 0;

        if(binary) {

            let point = 0;

            uvLayers = ParseUChar8(data, point);

            point += 1;

            let uvCounts = [];

            for(let i = 0; i < uvLayers; i++) {
                uvCounts.push(ParseUInt32(data, point));
                point += 4;
            }

            let normalCount = ParseUInt32(data, point);
            point += 4;

            let vertexCount = ParseUInt32(data, point);
            point += 4;

            let faceInfos = ParseUInt32(data, point);
            point += 4;

            // uvs
            let uv;
            for(let i = 0; i < uvCounts.length; i++) {
                uv = [];

                for(let j = 0; j < uvCounts[i] * 2; j++) {
                    uv.push(ParseFloat32(data, point));
                    point += 4;
                }
                if(uv.length > 0) {
                    uvs.push(uv);
                }
            }

            // normals
            for(let i = 0; i < normalCount * 3; i++) {
                normals.push(ParseFloat32(data, point));
                point += 4;
            }

            // vertices
            for(let i = 0; i < vertexCount * 3; i++) {
                vertices.push(ParseFloat32(data, point));
                point += 4;
            }

            // faces
            for(let i = 0; i < faceInfos; i++) {
                faces.push(ParseUInt32(data, point));
                point += 4;
            }

        } else {
            let json = data;
            vertices = json.data.vertices;
            normals = json.data.normals;
            uvs = json.data.uvs;
            faces = json.data.faces;
            colors = json.data.colors;
            // uv layers
            if(uvs !== undefined) {
                if (uvs.length > 0) {
                    // disregard empty arrays
                    for(let i = 0; i < uvs.length; i++) {
                        if(uvs[i].length) {
                            uvLayers++;
                        }
                    }
                }
            }
        }

        //let geometry = new THREE.Geometry();

        // uuid
        //this.geometry.uuid = url;


        // vertices
        if(vertices.length > 0) {
            for(let i = 0; i < vertices.length; i += 3) {
                let vertex = new THREE.Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
                this.geometry.vertices.push(vertex);
            }
        }


        // faces
        let facesSize = faces.length;
        if(facesSize > 0) {
            let offset = 0;
            let type, face, materialIndex, uvIndex, u, v, normalIndex, colorIndex, faceNumber;

            let isTriangle,
                hasMaterial,
                hasFaceVertexUv,
                hasFaceNormal,
                hasFaceVertexNormal,
                hasFaceColor,
                hasFaceVertexColor;

            while(offset < facesSize) {
                //
                type = faces[offset++];
                isTriangle          = !isBitSet(type, 0);
                hasMaterial         = isBitSet(type, 1);
                hasFaceVertexUv     = isBitSet(type, 3);
                hasFaceNormal       = isBitSet(type, 4);
                hasFaceVertexNormal = isBitSet(type, 5);
                hasFaceColor        = isBitSet(type, 6);
                hasFaceVertexColor  = isBitSet(type, 7);

                //
                if(isTriangle) {
                    // new a face
                    face = new THREE.Face3();
                    face.a = faces[offset++];
                    face.b = faces[offset++];
                    face.c = faces[offset++];

                    // material is true
                    if(hasMaterial) {
                        materialIndex = faces[offset++];
                        face.materialIndex = materialIndex;
                    }

                    // face vertex uv is true
                    faceNumber = this.geometry.faces.length;
                    // console.log(uvLayers)
                    if(uvs !== undefined) {
                        if(hasFaceVertexUv) {
                            if(uvLayers > 0) {
                                
                                for(let i = 0; i < uvLayers; i++) {
                                    if(this.geometry.faceVertexUvs[i] === undefined) {
                                        this.geometry.faceVertexUvs.push([]);
                                    }

                                    this.geometry.faceVertexUvs[i][faceNumber] = [];
                                    for(let j = 0; j < 3; j++) {
                                        uvIndex = faces[offset++];
                                        u = uvs[i][uvIndex * 2];
                                        v = uvs[i][uvIndex * 2 + 1];
                                        this.geometry.faceVertexUvs[i][faceNumber].push(new THREE.Vector2(u, v));
                                    }
                                }
                            }
                        }
                    }
                    // console.log(this.geometry.faceVertexUvs)
                    // if have not uv2, copy uv1 to uv2, beacuse light map is uv2
                    if(this.geometry.faceVertexUvs.length === 1) {
                        this.geometry.faceVertexUvs.push(this.geometry.faceVertexUvs[0]);
                    }


                    // face normal is true
                    if(hasFaceNormal) {
                        normalIndex = faces[offset++] * 3;
                        face.normal.set(
                            normals[normalIndex],
                            normals[normalIndex + 1],
                            normals[normalIndex + 2]
                        );
                    }

                    // face vertex normal is true
                    if(hasFaceVertexNormal) {
                        for(let i = 0; i < 3; i++) {
                            normalIndex = faces[offset++] * 3;
                            face.vertexNormals.push(
                                new THREE.Vector3(
                                    normals[normalIndex],
                                    normals[normalIndex + 1],
                                    normals[normalIndex + 2]
                                )
                            );
                        }
                    }

                    // face color is true
                    if(hasFaceColor) {
                        colorIndex = faces[offset++];
                        face.color.setHex(colors[colorIndex]);
                    }

                    // face vertex color is true
                    if(hasFaceVertexColor) {
                        for(let i = 0; i < 3; i++) {
                            colorIndex = faces[offset++];
                            face.vertexColors.push(new THREE.Color(colors[colorIndex]));
                        }
                    }

                    this.geometry.faces.push(face);
                }
            }
        }

        // compute face normals
        this.geometry.computeFaceNormals();
        if(this.geometry.faceVertexUvs[0].length <= 0) {
            AssignUVs(this.geometry);
        }
        return this.geometry;
    }

    write() {
        let result = [];
        function _write(geometry) {
            let data = {};

            data.uuid = geometry.uuid;

            if ( geometry.name !== '' ) {
                data.name = geometry.name;
            }

            if ( geometry instanceof THREE.PlaneGeometry ) {

                data.type = 'PlaneGeometry';
                data.width = geometry.width;
                data.height = geometry.height;
                data.widthSegments = geometry.widthSegments;
                data.heightSegments = geometry.heightSegments;

            } else if ( geometry instanceof THREE.CubeGeometry ) {

                data.type = 'CubeGeometry';
                data.width = geometry.width;
                data.height = geometry.height;
                data.depth = geometry.depth;
                data.widthSegments = geometry.widthSegments;
                data.heightSegments = geometry.heightSegments;
                data.depthSegments = geometry.depthSegments;

            } else if ( geometry instanceof THREE.CircleGeometry ) {

                data.type = 'CircleGeometry';
                data.radius = geometry.radius;
                data.segments = geometry.segments;

            } else if ( geometry instanceof THREE.CylinderGeometry ) {

                data.type = 'CylinderGeometry';
                data.radiusTop = geometry.radiusTop;
                data.radiusBottom = geometry.radiusBottom;
                data.height = geometry.height;
                data.radialSegments = geometry.radialSegments;
                data.heightSegments = geometry.heightSegments;
                data.openEnded = geometry.openEnded;

            } else if ( geometry instanceof THREE.SphereGeometry ) {

                data.type = 'SphereGeometry';
                data.radius = geometry.radius;
                data.widthSegments = geometry.widthSegments;
                data.heightSegments = geometry.heightSegments;
                data.phiStart = geometry.phiStart;
                data.phiLength = geometry.phiLength;
                data.thetaStart = geometry.thetaStart;
                data.thetaLength = geometry.thetaLength;

            } else if ( geometry instanceof THREE.IcosahedronGeometry ) {

                data.type = 'IcosahedronGeometry';
                data.radius = geometry.radius;
                data.detail = geometry.detail;

            } else if ( geometry instanceof THREE.TorusGeometry ) {

                data.type = 'TorusGeometry';
                data.radius = geometry.radius;
                data.tube = geometry.tube;
                data.radialSegments = geometry.radialSegments;
                data.tubularSegments = geometry.tubularSegments;
                data.arc = geometry.arc;

            } else if ( geometry instanceof THREE.TorusKnotGeometry ) {

                data.type = 'TorusKnotGeometry';
                data.radius = geometry.radius;
                data.tube = geometry.tube;
                data.radialSegments = geometry.radialSegments;
                data.tubularSegments = geometry.tubularSegments;
                data.p = geometry.p;
                data.q = geometry.q;
                data.heightScale = geometry.heightScale;

            } else if ( geometry instanceof THREE.BufferGeometry ) {

                data.type = 'BufferGeometry';
                let bufferGeometryExporter = new THREE.BufferGeometryExporter();
                data.data = bufferGeometryExporter.parse( geometry );

                delete data.data.metadata;

            } else if ( geometry instanceof THREE.Geometry ) {

                data.type = 'Geometry';
                let geometryExporter = new THREE.GeometryExporter();
                data.data = geometryExporter.parse( geometry );

                delete data.data.metadata;

            }

            return data;
        }

        this.geometries.map((geo, index) => {
            return _write(geo);
        });

        return result;
    }
}
