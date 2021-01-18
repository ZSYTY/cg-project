import {
    Mesh,
    Line,
    Points,
    Vector3,
    Color,
    Vector2,
    Matrix3,
    Geometry,
    BufferGeometry
} from './three.js-master/three.js-master/build/three.module.js';

var MyOBJExporter = function () { };

MyOBJExporter.prototype = {

    constructor: MyOBJExporter,

    parse: function (object) {

        let result          = '';
        let vertexIdx       = 0;
        let vertexUvsIdx    = 0;
        let normalsIdx      = 0;

        let vertex  = new Vector3();
        let color   = new Color();
        let normal  = new Vector3();
        let face    = [];

        const parseMesh = mesh => {
            let vertexCnt       = 0;
            let normalsCnt      = 0;
            let vertexUvsCnt    = 0;
            let { geometry }    = mesh;
            let normalMatrix    = new Matrix3();

            if (geometry instanceof Geometry) {
                geometry = BufferGeometry.setFromObject(mesh);
            }

            if (geometry instanceof BufferGeometry) {
                let vertices = geometry.getAttribute('position');
                let normals = geometry.getAttribute('normal');
                let uvs = geometry.getAttribute('uv');
                let indices = geometry.getIndex();

                result += `o ${mesh.name}\n`;

                if (mesh.material && mesh.material.name) {
                    result += `usemtl ${mesh.material.name}\n`;
                }

                if (vertices !== undefined) {
                    console.log(vertices);
                    for (let i in vertices) {
                        console.log(vertices.getX(i));
                        vertex.x = vertices.getX(i);
                        vertex.y = vertices.getY(i);
                        vertex.z = vertices.getZ(i);
                        console.log(vertex);
                        vertex.applyMatrix4(mesh.matrixWorld);

                        result += `v ${vertex.x} ${vertex.y} ${vertex.z}\n`;
                        vertexCnt++;
                    }
                }

                if (uvs !== undefined) {
                    for (let i in uvs) {
                        result += `vt ${uvs.getX(i)} ${uvs.getY(i)}\n`;
                        vertexUvsCnt++;
                    }
                }

                if (normals !== undefined) {
                    normalMatrix.getNormalMatrix(mesh.matrixWorld);
                    for (let i in normals) {
                        normal.x = normals.getX(i);
                        normal.y = normals.getY(i);
                        normal.z = normals.getZ(i);

                        normal.applyMatrix3(normalMatrix).normalize();

                        result += `vn ${normal.x} ${normal.y} ${normal.z}\n`;

                        normalsCnt++;
                    }
                }

                if (indices !== null) {
                    for (let i = 0; i < indices.count; i += 3) {
                        for (let j = 0; j < 3; j++) {
                            let k = indices.getX(i + j) + 1;
                            face[j] = (vertexIdx + k) + (normals || uvs ? '/' + (uvs ? (vertexUvsIdx + k) : '') + (normals ? '/' + (normalsIdx + k) : '' ) : '');

                            result += `f ${face.join(' ')}\n`;
                        }
                    }
                } else {
                    for (let i = 0; i < vertices.count; i += 3) {
                        for (let j = 0; j < 3; j++) {
                            let k = i + j + 1;
                            face[j] = (vertexIdx + k) + (normals || uvs ? '/' + (uvs ? (vertexUvsIdx + k) : '') + (normals ? '/' + (normalsIdx + k) : '' ) : '');

                            result += `f ${face.join(' ')}\n`;
                        }
                    }
                }
            } else {
                console.error('Invalid geometry: ', geometry);
            }

            vertexIdx       += vertexCnt;
            vertexUvsIdx    += vertexUvsCnt;
            normalsIdx      += normalsCnt;
        }

        const parseLine = line => {
            let vertexCnt = 0;
            let { geometry, type } = line;

            if (geometry instanceof Geometry) {
                geometry = new BufferGeometry().setFromObject(line);
            }

            if (geometry instanceof BufferGeometry) {
                let vertices = geometry.getAttribute('position');

                result += `o ${line.name}\n`;

                if (vertices !== undefined) {
                    for (let i in vertices) {
                        vertex.x = vertices.getX(i);
                        vertex.y = vertices.getY(i);
                        vertex.z = vertices.getZ(i);

                        vertex.applyMatrix4(line.matrixWorld);

                        result += `v ${vertex.x} ${vertex.y} ${vertex.z}\n`;
                        vertexCnt++;
                    }
                }

                if (type === 'Line') {
                    result += `l ${vertices.map((_, idx) => idx + vertexIdx + 1).join(' ')}\n`;
                }

                if (type === 'LineSegments') {
                    for (let i = 1; i <= vertices.count; i += 2) {
                        result += `l ${vertexIdx + i} ${vertexIdx + i + 1}\n`;
                    }
                }
            } else {
                console.log('Invalid geometry: ', geometry);
            }
            vertexIdx += vertexCnt;
        }

        const parsePoints = points => {
            let vertexCnt = 0;
            let { geometry } = points;

            if (geometry instanceof Geometry) {
                geometry = new BufferGeometry().setFromObject(points);
            }

            if (geometry instanceof BufferGeometry) {
                let vertices    = geometry.getAttribute('position');
                let colors      = geometry.getAttribute('color');
                result += `o ${points.name}\n`;

                if (vertices !== undefined) {
                    for (let i in vertices) {
                        vertex.fromBufferAttribute(vertices, i);
                        vertex.applyMatrix4(points.matrixWorld);

                        result += `v ${vertex.x} ${vertex.y} ${vertex.z}`;

                        if (colors !== undefined) {
                            color.fromBufferAttribute(colors, i);
                            result += ` ${color.r} ${color.g} ${color.b}`;
                        }

                        result += '\n';
                        vertexCnt++;
                    }
                }

                result += `p ${vertices.map((_, idx) => idx + vertexIdx + 1).join(' ')}\n`;
                
            } else {
                console.log('Invalid geometry: ', geometry);
            }
            vertexIdx += vertexCnt;
        }

        object.traverse( item => {
            if (item instanceof Mesh) {
                parseMesh(item);
            }
            if (item instanceof Line) {
                parseLine(item);
            }
            if (item instanceof Points) {
                parsePoints(item);
            }
        });

        return result;

    }
};

export { MyOBJExporter };