import {
    BufferGeometry,
    FileLoader,
    Float32BufferAttribute,
    Group,
    LineBasicMaterial,
    LineSegments,
    Loader,
    Material,
    Mesh,
    MeshPhongMaterial,
    Points,
    PointsMaterial,
    Vector3,
    LoaderUtils
} from './three.js-master/three.js-master/build/three.module.js';
import { MTLLoader } from "./three.js-master/three.js-master/examples/jsm/loaders/MTLLoader.js";

const MyOBJLoader = (function () {

    // o object_name | g group_name
    let object_pattern = /^[og]\s*(.+)?/;
    // mtllib file_reference
    let material_library_pattern = /^mtllib /;
    // usemtl material_name
    let material_use_pattern = /^usemtl /;


    function ParserState() {

        let state = {
            objects: [],
            object: {},
            vertices: [],
            normals: [],
            colors: [],
            uvs: [],
            materials: {},
            materialLibraries: [],

            startObject: function (name, fromDeclaration) {

                if (this.object && this.object.fromDeclaration === false) {
                    this.object.name = name;
                    this.object.fromDeclaration = (fromDeclaration !== false);
                    return;
                }

                let previousMaterial = (this.object && this.object.isInit === true ? this.object.currentMaterial() : undefined);

                if (this.object && this.object.isInit === true) {
                    this.object._finalize(true);
                }

                this.object = {
                    isInit: true,
                    name: name || '',
                    fromDeclaration: (fromDeclaration !== false),

                    geometry: {
                        vertices: [],
                        normals: [],
                        colors: [],
                        uvs: [],
                        hasUVIndices: false
                    },
                    materials: [],
                    smooth: true,

                    startMaterial: function (name, libraries) {
                        let previous = this._finalize(false);

                        if (previous && (previous.inherited || previous.groupCount <= 0)) {
                            this.materials.splice(previous.index);
                        }

                        let material = {
                            index: this.materials.length,
                            name: name || '',
                            mtllib: (Array.isArray(libraries) && libraries.length > 0 ? libraries[libraries.length - 1] : ''),
                            smooth: (previous !== undefined ? previous.smooth : this.smooth),
                            groupStart: (previous !== undefined ? previous.groupEnd : 0),
                            groupEnd: - 1,
                            groupCount: - 1,
                            inherited: false,

                            clone: index => {
                                return {
                                    index: (typeof index === 'number' ? index : this.index),
                                    name: this.name,
                                    mtllib: this.mtllib,
                                    smooth: this.smooth,
                                    groupStart: 0,
                                    groupEnd: - 1,
                                    groupCount: - 1,
                                    inherited: false
                                }
                            }
                        };

                        this.materials.push(material);
                        return material;

                    },

                    currentMaterial: function () {
                        if (this.materials.length > 0) {
                            return this.materials[this.materials.length - 1];
                        }
                        return undefined;
                    },

                    _finalize: function (isEnd) {
                        let last = this.currentMaterial();
                        if (last && last.groupEnd === - 1) {
                            last.groupEnd = this.geometry.vertices.length / 3;
                            last.groupCount = last.groupEnd - last.groupStart;
                            last.inherited = false;
                        }

                        if (isEnd && this.materials.length > 1) {
                            this.materials = this.materials.filter(item => item.groupCount > 0)
                        }

                        if (isEnd && this.materials.length === 0) {
                            this.materials.push({
                                name: '',
                                smooth: this.smooth
                            });
                        }
                        return last;
                    }
                };

                if (previousMaterial && previousMaterial.name) {
                    this.object.materials.push({ inherited: true, ...previousMaterial.clone(0) });
                }
                this.objects.push(this.object);
            },

            finalize: function () {
                if (this.object && this.object.isInit === true) {
                    this.object._finalize(true);
                }
            },

            parseVertexIndex: function (value, len) {
                let index = parseInt(value, 10);
                return (index >= 0 ? index - 1 : index + len / 3) * 3;
            },

            parseNormalIndex: function (value, len) {
                let index = parseInt(value, 10);
                return (index >= 0 ? index - 1 : index + len / 3) * 3;
            },

            parseUVIndex: function (value, len) {
                let index = parseInt(value, 10);
                return (index >= 0 ? index - 1 : index + len / 2) * 2;
            },

            addVertex: function (a, b, c) {
                let src = this.vertices;
                let dst = this.object.geometry.vertices;
                dst.push(src[a + 0], src[a + 1], src[a + 2]);
                dst.push(src[b + 0], src[b + 1], src[b + 2]);
                dst.push(src[c + 0], src[c + 1], src[c + 2]);
            },

            addVertexPoint: function (a) {
                let src = this.vertices;
                let dst = this.object.geometry.vertices;
                dst.push(src[a + 0], src[a + 1], src[a + 2]);
            },

            addVertexLine: function (a) {
                let src = this.vertices;
                let dst = this.object.geometry.vertices;
                dst.push(src[a + 0], src[a + 1], src[a + 2]);
            },

            addNormal: function (a, b, c) {
                let src = this.normals;
                let dst = this.object.geometry.normals;
                dst.push(src[a + 0], src[a + 1], src[a + 2]);
                dst.push(src[b + 0], src[b + 1], src[b + 2]);
                dst.push(src[c + 0], src[c + 1], src[c + 2]);
            },

            addFaceNormal: function (a, b, c) {
                let src = this.vertices;
                let dst = this.object.geometry.normals;

                let vA = new Vector3();
                let vB = new Vector3();
                let vC = new Vector3();

                let ab = new Vector3();
                let cb = new Vector3();

                vA.fromArray(src, a);
                vB.fromArray(src, b);
                vC.fromArray(src, c);

                cb.subVectors(vC, vB);
                ab.subVectors(vA, vB);
                cb.cross(ab);
                cb.normalize();

                dst.push(cb.x, cb.y, cb.z);
                dst.push(cb.x, cb.y, cb.z);
                dst.push(cb.x, cb.y, cb.z);
            },

            addColor: function (a, b, c) {
                let src = this.colors;
                let dst = this.object.geometry.colors;
                if (src[a] !== undefined) dst.push(src[a + 0], src[a + 1], src[a + 2]);
                if (src[b] !== undefined) dst.push(src[b + 0], src[b + 1], src[b + 2]);
                if (src[c] !== undefined) dst.push(src[c + 0], src[c + 1], src[c + 2]);
            },

            addUV: function (a, b, c) {
                let src = this.uvs;
                let dst = this.object.geometry.uvs;
                dst.push(src[a + 0], src[a + 1]);
                dst.push(src[b + 0], src[b + 1]);
                dst.push(src[c + 0], src[c + 1]);
            },

            addDefaultUV: function () {
                let dst = this.object.geometry.uvs;
                dst.push(0, 0);
                dst.push(0, 0);
                dst.push(0, 0);
            },

            addUVLine: function (a) {
                let src = this.uvs;
                let dst = this.object.geometry.uvs;
                dst.push(src[a + 0], src[a + 1]);
            },

            addFace: function (a, b, c, ua, ub, uc, na, nb, nc) {
                let vLen = this.vertices.length;
                let ia = this.parseVertexIndex(a, vLen);
                let ib = this.parseVertexIndex(b, vLen);
                let ic = this.parseVertexIndex(c, vLen);
                this.addVertex(ia, ib, ic);
                this.addColor(ia, ib, ic);
                // normals
                if (na !== undefined && na !== '') {
                    let nLen = this.normals.length;
                    ia = this.parseNormalIndex(na, nLen);
                    ib = this.parseNormalIndex(nb, nLen);
                    ic = this.parseNormalIndex(nc, nLen);
                    this.addNormal(ia, ib, ic);
                } else {
                    this.addFaceNormal(ia, ib, ic);
                }

                // uvs
                if (ua !== undefined && ua !== '') {
                    let uvLen = this.uvs.length;
                    ia = this.parseUVIndex(ua, uvLen);
                    ib = this.parseUVIndex(ub, uvLen);
                    ic = this.parseUVIndex(uc, uvLen);
                    this.addUV(ia, ib, ic);
                    this.object.geometry.hasUVIndices = true;
                } else {
                    this.addDefaultUV();
                }

            },

            addPointGeometry: function (vertices) {
                this.object.geometry.type = 'Points';
                let vLen = this.vertices.length;
                for (let vertex of vertices) {
                    let index = this.parseVertexIndex(vertex, vLen);
                    this.addVertexPoint(index);
                    this.addColor(index);
                }
            },

            addLineGeometry: function (vertices, uvs) {
                this.object.geometry.type = 'Line';
                let vLen = this.vertices.length;
                let uvLen = this.uvs.length;
                for (let vertex of vertices) {
                    this.addVertexLine(this.parseVertexIndex(vertex, vLen));
                }

                for (let uv of uvs) {
                    this.addUVLine(this.parseUVIndex(uv, uvLen));
                }
            }
        };

        state.startObject('', false);
        return state;

    }


    function MyOBJLoader(manager) {
        Loader.call(this, manager);
        this.materials = null;
    }

    MyOBJLoader.prototype = Object.assign(Object.create(Loader.prototype), {

        constructor: MyOBJLoader,

        load: function (url, onLoad, onProgress, onError) {

            let self = this;

            let loader = new FileLoader(this.manager);
            loader.setPath(this.path);
            loader.setRequestHeader(this.requestHeader);
            loader.setWithCredentials(this.withCredentials);
            loader.load(url, text => {
                try {
                    onLoad(self.parse(text));
                } catch (e) {
                    if (onError) {
                        onError(e);
                    } else {
                        console.error(e);
                    }
                    self.manager.itemError(url);
                }
            }, onProgress, onError);
        },

        setMaterials: function (materials) {
            this.materials = materials;
            return this;
        },

        parse: function (text) {

            let state = new ParserState();

            if (text.indexOf('\r\n') !== - 1) {
                text = text.replace(/\r\n/g, '\n');
            }

            if (text.indexOf('\\\n') !== - 1) {
                text = text.replace(/\\\n/g, '');
            }

            let lines = text.split('\n');
            let type = '';
            let lineLength = 0;
            let result = [];


            for (let line of lines) {

                line = line.trim();
                lineLength = line.length;

                if (lineLength === 0) {
                    continue;
                }

                type = line.charAt(0);
                if (type === 'v') {
                    let data = line.split(/\s+/);
                    switch (data[0]) {
                        case 'v':
                            state.vertices.push(
                                parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3])
                            );
                            if (data.length >= 7) {
                                state.colors.push(parseFloat(data[4]), parseFloat(data[5]), parseFloat(data[6]));
                            } else {
                                state.colors.push(undefined, undefined, undefined);
                            }
                            break;
                        case 'vn':
                            state.normals.push(parseFloat(data[1]), parseFloat(data[2]), parseFloat(data[3]));
                            break;
                        case 'vt':
                            state.uvs.push(parseFloat(data[1]), parseFloat(data[2]));
                            break;
                    }
                } else if (type === 'f') {
                    // let lineData = line.substr(1).trim();
                    let vertexData = line.substr(1).trim().split(/\s+/);
                    let faceVertices = vertexData.filter(item => item.length > 0).map(item => item.split('/'));


                    // Draw an edge between the first vertex and all subsequent vertices to form an n-gon

                    let v1 = faceVertices[0];

                    for (let j = 1, jl = faceVertices.length - 1; j < jl; j++) {
                        let v2 = faceVertices[j];
                        let v3 = faceVertices[j + 1];
                        state.addFace(
                            v1[0], v2[0], v3[0],
                            v1[1], v2[1], v3[1],
                            v1[2], v2[2], v3[2]
                        );
                    }
                } else if ((result = object_pattern.exec(line)) !== null) {
                    let name = (' ' + result[0].substr(1).trim()).substr(1);
                    state.startObject(name);
                } else if (material_use_pattern.test(line)) {
                    // material
                    state.object.startMaterial(line.substring(7).trim(), state.materialLibraries);
                } else if (material_library_pattern.test(line)) {
                    // mtl file
                    state.materialLibraries.push(line.substring(7).trim());
                } else {
                    // Handle null terminated files without exception
                    if (line === '\0') continue;
                    console.warn('MyOBJLoader: Unexpected line: "' + line + '"');
                }

            }

            state.finalize();

            let container = new Group();
            container.materialLibraries = [].concat(state.materialLibraries);


            for (let object of state.objects) {

                let geometry = object.geometry;
                let materials = object.materials;
                let isLine = (geometry.type === 'Line');
                let isPoints = (geometry.type === 'Points');
                let hasVertexColors = false;

                // Skip o/g line declarations that did not follow with any faces
                if (geometry.vertices.length === 0) continue;

                let buffergeometry = new BufferGeometry();

                buffergeometry.setAttribute('position', new Float32BufferAttribute(geometry.vertices, 3));

                if (geometry.normals.length > 0) {
                    buffergeometry.setAttribute('normal', new Float32BufferAttribute(geometry.normals, 3));
                }

                if (geometry.colors.length > 0) {
                    hasVertexColors = true;
                    buffergeometry.setAttribute('color', new Float32BufferAttribute(geometry.colors, 3));
                }

                if (geometry.hasUVIndices === true) {
                    buffergeometry.setAttribute('uv', new Float32BufferAttribute(geometry.uvs, 2));
                }

                // Create materials

                let createdMaterials = [];

                for (let sourceMaterial of materials) {

                    let materialHash = sourceMaterial.name + '_' + sourceMaterial.smooth + '_' + hasVertexColors;
                    let material = state.materials[materialHash];

                    if (this.materials !== null) {

                        material = this.materials.create(sourceMaterial.name);
                        // mtl etc. loaders probably can't create line materials correctly, copy properties to a line material.
                        if (isLine && material && !(material instanceof LineBasicMaterial)) {
                            let materialLine = new LineBasicMaterial();
                            Material.prototype.copy.call(materialLine, material);
                            materialLine.color.copy(material.color);
                            material = materialLine;
                        } else if (isPoints && material && !(material instanceof PointsMaterial)) {
                            let materialPoints = new PointsMaterial({ size: 10, sizeAttenuation: false });
                            Material.prototype.copy.call(materialPoints, material);
                            materialPoints.color.copy(material.color);
                            materialPoints.map = material.map;
                            material = materialPoints;
                        }
                    }

                    if (material === undefined) {

                        if (isLine) {
                            material = new LineBasicMaterial();
                        } else if (isPoints) {
                            material = new PointsMaterial({ size: 1, sizeAttenuation: false });
                        } else {
                            material = new MeshPhongMaterial();
                        }

                        material.name = sourceMaterial.name;
                        material.flatShading = sourceMaterial.smooth ? false : true;
                        material.vertexColors = hasVertexColors;
                        state.materials[materialHash] = material;
                    }
                    createdMaterials.push(material);
                }

                // Create mesh

                let mesh;

                if (createdMaterials.length > 1) {

                    materials.forEach((item, idx) => {
                        buffergeometry.addGroup(item.groupStart, item.groupCount, idx)
                    });

                    if (isLine) {
                        mesh = new LineSegments(buffergeometry, createdMaterials);
                    } else if (isPoints) {
                        mesh = new Points(buffergeometry, createdMaterials);
                    } else {
                        mesh = new Mesh(buffergeometry, createdMaterials);
                    }

                } else {
                    if (isLine) {
                        mesh = new LineSegments(buffergeometry, createdMaterials[0]);
                    } else if (isPoints) {
                        mesh = new Points(buffergeometry, createdMaterials[0]);
                    } else {
                        mesh = new Mesh(buffergeometry, createdMaterials[0]);
                    }

                }

                mesh.name = object.name;
                container.add(mesh);
            }

            return container;
        }

    });

    return MyOBJLoader;

})();


var MyMTLLoader = function (manager) {
    Loader.call(this, manager);
};

MyMTLLoader.prototype = Object.assign(Object.create(Loader.prototype), {

    constructor: MyMTLLoader,

    load: function (url, onLoad, onProgress, onError) {
        var self = this;
        var path = ( this.path === '' ) ? LoaderUtils.extractUrlBase( url ) : this.path;
        var loader = new FileLoader(this.manager);
        loader.setPath(this.path);
        loader.setRequestHeader(this.requestHeader);
        loader.setWithCredentials(this.withCredentials);
        loader.load(url, function (text) {
            try {
                onLoad(self.parse(text, path));
            } catch (e) {
                if (onError) {
                    onError(e);
                } else {
                    console.error(e);
                }
                self.manager.itemError(url);
            }
        }, onProgress, onError);
    },

    setMaterialOptions: function (value) {
        this.materialOptions = value;
        return this;
    },


    parse: function (text, path) {

        var lines = text.split('\n');
        var info = {};
        var materialsInfo = {};

        for (let line of lines) {
            line = line.trim();

            if (line.length === 0 || line.charAt(0) === '#') {
                continue;
            }

            var idx = line.indexOf(' ');
            var key = ((idx >= 0) ? line.substring(0, idx) : line).toLowerCase();
            var value = ((idx >= 0) ? line.substring(idx + 1) : '').trim();

            if (key === 'newmtl') {
                info = { name: value };
                materialsInfo[value] = info;
            } else {
                if (key === 'ka' || key === 'kd' || key === 'ks' || key === 'ke') {
                    info[key] = value.split(/\s+/, 3).map(item => parseFloat(item));
                } else {
                    info[key] = value;
                }
            }
        }

        var materialCreator = new MTLLoader.MaterialCreator(this.resourcePath || path, this.materialOptions);
        materialCreator.setCrossOrigin(this.crossOrigin);
        materialCreator.setManager(this.manager);
        materialCreator.setMaterials(materialsInfo);
        return materialCreator;
    }

});

export { MyOBJLoader, MyMTLLoader };
