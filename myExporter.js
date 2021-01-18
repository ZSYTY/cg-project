import {
    Mesh,
    Line,
    Points
} from './three.js-master/three.js-master/build/three.module.js';

MyOBJExporter = function () { };

MyOBJExporter.prototype = {

    constructor: MyOBJExporter,

    parse: function (object) {

        let result = '';

        const parseMesh = mesh => {

        }

        const parseLine = line => {

        }

        const parsePoints = points => {

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
