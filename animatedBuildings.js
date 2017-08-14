"use strict";

const types = ['lab', 'office', 'hospital', 'multifamily'];
const topNum = 10;

const typeColors = {
    'office': '#ffa827',
    'lab': '#e68dac',
    'hospital': '#43e6b2',
    'multifamily': '#cb74ff',
};

const materialExBldgs = new THREE.MeshLambertMaterial({
    color: '#595b6d',
    side: THREE.FrontSide,
    // emissive: '#707287'
});

const backgroundColor = '#333333';

const padSize = {left: 800, right: 200, top: 600, bottom: 200};
const gridSize = {x: 800, y: 800};

// const typeMaterials = {
//     'office': new THREE.MeshLambertMaterial({color: '#ffa827', emissive: '#ffa827', side: THREE.DoubleSide}),
//     'lab': new THREE.MeshLambertMaterial({color: '#e68dac', side: THREE.DoubleSide}),
//     'hospital': new THREE.MeshLambertMaterial({color: '#43e6b2', side: THREE.DoubleSide}),
//     'multifamily': new THREE.MeshLambertMaterial({color: '#cb74ff', side: THREE.DoubleSide}),
// };

/*
Hospital
Hotel
K-12 School
Laboratory
Multifamily Housing
Office
Residence Hall/Dormitory
 */

const animationHelper = function (currentVal) {
    this.currentVal = currentVal || 0;

    var _approachTarget = function (targetVal, currentVal) {
        /** @type {Number} */
        var stepsToCatchUp = (inter.gridMode) ? 18 : 10; //when city background is on, the framerate drops
        /** @type {Number} */
        var maxDist = (inter.gridMode) ? 300 : 450;

        if (targetVal === null || isNaN(targetVal)) {
            return currentVal;
        }
        if (currentVal === null || isNaN(currentVal)) {
            return targetVal;
        }
        var tol = Math.max(0.000001, Math.abs(targetVal / 10000));//base tolerance on size of target...
        var diff = (targetVal - currentVal);
        if (Math.abs(diff) < tol) return targetVal;
        var dist = diff / stepsToCatchUp;
        if (dist > maxDist) {
            dist = maxDist;
        }
        if (dist < -maxDist) {
            dist = -maxDist;
        }
        return currentVal + dist;
    };

    this.approachTarget = function (targetVal) {
        // console.log(this.currentVal, targetVal);
        this.currentVal = _approachTarget(targetVal, this.currentVal);
        return this.currentVal;
    };
};

const application = function (app) {
    app.onTick = function () {
        if (app.cityModel) {
            app.cityModel.visible = !inter.gridMode;
        }
        app.matrixCanvas.geometry.visible = inter.gridMode;
        if (!app.typeModels) return;
        const mode = inter.gridMode ? 'grid' : 'city';
        Object.keys(app.typeModels).forEach(function (id) {
            var typeModel = app.typeModels[id];
            const position = typeModel.modePositions[mode];

            typeModel.object.position.x = typeModel.animationHelpers.x.approachTarget(position.x);
            typeModel.object.position.y = typeModel.animationHelpers.y.approachTarget(position.y);
            typeModel.object.position.z = typeModel.animationHelpers.z.approachTarget(position.z);
        });
    };
    app.setup = function () {
        app.scene = new THREE.Scene();
        // app.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.3, 2000);

        app.mouse = new THREE.Vector2();
        app.mouseDown = new THREE.Vector2();

        var aspect = window.innerWidth / window.innerHeight;

        //left, right, top, bottom, near, far
        // app.camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 5000);
        app.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 100, 80000);
        // app.camera.position.set(0, 0, 100); // all components equal
        // app.camera.lookAt(app.scene.position); // or the origin
        // app.camera.position.z = 1000;

        app.renderer = new THREE.WebGLRenderer();
        app.renderer.setClearColor(backgroundColor);
        app.renderer.setSize(window.innerWidth, window.innerHeight);

        app.controls = new THREE.OrbitControls(app.camera, app.renderer.domElement);
//        controls.zoomSpeed = 5.0;
        app.controls.enableKeys = false;

        document.body.appendChild(app.renderer.domElement);

        app.restoreCameraPos();
        app.addLights();
        app.loadModels();

        // app.axesMouse = new THREE.AxisHelper(5);
        // app.scene.add(app.axesMouse);

        // app.axes = new THREE.AxisHelper(100);
        // app.scene.add(app.axes);

        app.domEvents = new THREEx.DomEvents(app.camera, app.renderer.domElement);

        const labelsY = [];
        for (var j = 1; j <= topNum; j++) {
            labelsY.push(j);
        }
        app.matrixCanvas = matrixCanvasTexture(types, labelsY);
        app.scene.add(app.matrixCanvas.geometry);

        app.render();
    };

    app.addLights = function () {
        const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
        light1.position.set(0, 1, 0).normalize();
        app.scene.add(light1);

        const light2 = new THREE.DirectionalLight(0xffffff, 0.8);
        light2.position.set(1, 1, -1).normalize();
        app.scene.add(light2);
    };

    app.loadModels = function () {
        const manager = new THREE.LoadingManager();
        manager.onProgress = function (item, loaded, total) {

            console.log(item, loaded, total);

        };

        const setMaterials = function (object, material, cast, receive) {
            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material = material;
                    child.castShadow = cast;
                    child.receiveShadow = receive;
                }
            });
            if (receive) {
                // shadowMaterials.push(material);
            }
        };

        const offset = {x: 0, y: 0, z: 0};

        const scale = 1;
        const loader = new THREE.OBJLoader(manager);
        //
        // loader.load('obj/city.obj', function (object) {
        //     setMaterials(object, materialExBldgs, false, false);
        //     object.scale.set(scale, scale, scale);
        //
        //     object.position.x = offset.x;
        //     object.position.y = offset.y;
        //     object.position.z = offset.z;
        //
        //     app.scene.add(object);
        //     app.cityModel = object;
        // });

        const typeMaterials = {};
        const typeMaterialsSelected = {};
        Object.keys(typeColors).forEach(function (type) {
            typeMaterials[type] = new THREE.MeshLambertMaterial({
                color: typeColors[type],
                emissive: chroma(typeColors[type]).darken().darken().hex(),
                side: THREE.DoubleSide
            });
            typeMaterialsSelected[type] = new THREE.MeshLambertMaterial({
                color: typeColors[type],
                emissive: typeColors[type],
                side: THREE.DoubleSide
            });
        });

        app.typeModels = {};
        types.forEach(function (type, i) {
            for (var j = 1; j <= topNum; j++) {
                const zPos = j - 1;
                const id = type + '_' + j;
                loader.load('obj/' + id + '.obj', function (object) {
                    const bounds = new THREE.Box3().setFromObject(object);
                    setMaterials(object, typeMaterials[type], false, false);
                    object.scale.set(scale, scale, scale);

                    object.position.x = offset.x;
                    object.position.y = offset.y;
                    object.position.z = offset.z;

                    app.scene.add(object);

                    app.domEvents.addEventListener(object, 'click', function (event) {
                        if (!app.selectedObject) app.selectedObject = {};//init

                        if (app.selectedObject.object) {
                            setMaterials(app.selectedObject.object, typeMaterials[app.selectedObject.type], false, false);
                        }
                        if (app.selectedObject.object !== object) {
                            setMaterials(object, typeMaterialsSelected[type], false, false);
                            showInfo(id);
                            app.selectedObject = {object:object, type: type};
                        } else {
                            app.selectedObject = {};
                            showInfo()
                        }

                    }, false);

                    app.typeModels[id] = {
                        object: object,
                        modePositions: {
                            city: offset,
                            grid: {
                                x: padSize.left + gridSize.x * i - bounds.min.x + (gridSize.x - (bounds.max.x - bounds.min.x)) / 2,
                                y: -bounds.min.y,
                                z: padSize.top + gridSize.y * zPos - bounds.min.z + (gridSize.y - (bounds.max.z - bounds.min.z)) / 2
                            }
                        },
                        animationHelpers: {
                            x: new animationHelper(0),
                            y: new animationHelper(0),
                            z: new animationHelper(0)
                        }
                    };

                });
            }
        });
    };

    app.render = function () {
        requestAnimationFrame(function () {
            app.render();
            app.onTick();
        });

        app.controls.update();
        // app.renderViews(0.75);
        app.renderViews();

        // app.renderer.render(app.scene, app.camera);
    };

    app.renderViews = function () {
        const views = [
            {// main view - points etc.
                left: 0,
                bottom: 0,
                width: 1,
                height: 1,
                render: function (width, height) {
                    if (app.perspectiveMode) app.perspectiveMode(false);
                    app.camera.aspect = width / height;
                    app.camera.updateProjectionMatrix();
                    app.renderer.render(app.scene, app.camera);
                }
            }
        ];

        views.forEach(function (view, i) {
            const left = view.left * window.innerWidth;
            const width = view.width * window.innerWidth;
            const bottom = view.bottom * window.innerHeight;
            var height = view.height * window.innerHeight;

            if (!height) { //noinspection JSSuspiciousNameCombination
                height = width;
            }

            app.renderer.setViewport(left, bottom, width, height);
            app.renderer.setScissor(left, bottom, width, height);
            app.renderer.setScissorTest(true);
            view.render(width, height);
        });
    };

    app.restoreCameraPos = function (savedState) {
        //can be saved with Q key debug log
        savedState = {
            "position": {"x": 631.5208780211974, "y": 754.9442096008233, "z": 9000},
            "rotation": {
                "_x": -2.239196402239001,
                "_y": -0.14200123994430297,
                "_z": -2.9642518662556103,
                "_order": "XYZ"
            },
            "controlCenter": {"x": 0, "y": 0, "z": 0}
        };
        app.camera.position.set(savedState.position.x, savedState.position.y, savedState.position.z);
        app.camera.rotation.set(savedState.rotation._x, savedState.rotation._y, savedState.rotation._z);

        app.controls.center.set(savedState.controlCenter.x, savedState.controlCenter.y, savedState.controlCenter.z);
        app.controls.update();
    };

    app.setup();
};

const interfacer = function (inter) {
    inter.gridMode = false;

    inter.setup = function () {
        const gui = new dat.GUI();
        gui.add(inter, 'gridMode').onChange(inter.update);

        inter.update = function () {

        };

        if (inter.onUpdate) inter.onUpdate();
    };

    inter.setup();
};

const app = {};
new application(app);
const inter = {};
new interfacer(inter);
