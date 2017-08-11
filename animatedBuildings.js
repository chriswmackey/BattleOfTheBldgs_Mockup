"use strict";

const types = ['lab', 'office'];
const topNum = 2;

const typeMaterials = {
    'office': new THREE.MeshLambertMaterial({color: '#ffa827', side: THREE.DoubleSide}),
    'lab': new THREE.MeshLambertMaterial({color: '#e68dac', side: THREE.DoubleSide}),
};

const animationHelper = function (currentVal) {
    this.currentVal = currentVal || 0;

    /** @type {Number} */
    var _stepsToCatchUp = 18;
    /** @type {Number} */
    var _maxDist = 80;

    var _approachTarget = function (targetVal, currentVal) {
        if (targetVal === null || isNaN(targetVal)) {
            return currentVal;
        }
        if (currentVal === null || isNaN(currentVal)) {
            return targetVal;
        }
        var tol = Math.max(0.000001, Math.abs(targetVal / 10000));//base tolerance on size of target...
        var diff = (targetVal - currentVal);
        if (Math.abs(diff) < tol) return targetVal;
        var dist = diff / _stepsToCatchUp;
        if (dist > _maxDist) {
            dist = _maxDist;
        }
        if (dist < -_maxDist) {
            dist = -_maxDist;
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
    const _split = 0.5;
    const xVector = new THREE.Vector3(1, 0, 0);
    const yVector = new THREE.Vector3(0, 1, 0);
    const zVector = new THREE.Vector3(0, 0, 1);


    app.onTick = function () {
        if (!app.cityModel) return;
        app.cityModel.visible = !inter.gridMode;
        if (!app.typeModels) return;
        const mode = inter.gridMode ? 'grid' : 'city';
        Object.keys(app.typeModels).forEach(function (id) {
            var typeModel = app.typeModels[id];
            const position = typeModel.modePositions[mode];

            typeModel.object.position.x = typeModel.animationHelpers.x.approachTarget(position.x) ;
            typeModel.object.position.y = typeModel.animationHelpers.y.approachTarget(position.y) ;
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
        app.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 10000);
        // app.camera.position.set(0, 0, 100); // all components equal
        // app.camera.lookAt(app.scene.position); // or the origin
        // app.camera.position.z = 1000;

        app.renderer = new THREE.WebGLRenderer();
        app.renderer.setClearColor('#ffffff');
        app.renderer.setSize(window.innerWidth, window.innerHeight);

        app.controls = new THREE.OrbitControls(app.camera, app.renderer.domElement);
//        controls.zoomSpeed = 5.0;
        app.controls.enableKeys = false;

        document.body.appendChild(app.renderer.domElement);

        app.restoreCameraPos();
        app.addLights();
        app.loadModels();

        // const onDocumentMouseDown = function (e) {
        //     app.mouseDown.x = ( event.clientX / (window.innerWidth) ) * 2 - 1;// * _split NB: if not overlapping camera view, use window.innerWidth * _split
        //     app.mouseDown.y = -( event.clientY / window.innerHeight ) * 2 + 1;
        // };
        // const onDocumentMouseMove = function (event) {
        //     event.preventDefault();
        //     app.mouse.x = ( event.clientX / (window.innerWidth) ) * 2 - 1;
        //     app.mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
        // };
        // const onDocumentMouseUp = function (e) {
        //     if (app.mouse.distanceTo(app.mouseDown) < 0.001) {//ignore drags
        //         // app.viewCamera.position.copy(app.axesMouse.position);
        //         // app.axes.position.copy(app.axesMouse.position);
        //     }
        // };
        // app.renderer.domElement.addEventListener('mousedown', onDocumentMouseDown, false);
        // app.renderer.domElement.addEventListener('mouseup', onDocumentMouseUp, false);
        // app.renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false);

        // var cube;
        // cube = new THREE.Mesh(new THREE.CubeGeometry(100, 100, 100), new THREE.MeshNormalMaterial());
        // app.scene.add(cube);
        app.axesMouse = new THREE.AxisHelper(5);
        app.scene.add(app.axesMouse);

        app.axes = new THREE.AxisHelper(100);
        app.scene.add(app.axes);

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

        const materialExBldgs = new THREE.MeshLambertMaterial({
            color: '#a1a6c6',
            side: THREE.FrontSide,
            emissive: '#707287'
        });

        const scale = 1;
        const loader = new THREE.OBJLoader(manager);

        loader.load('obj/city.obj', function (object) {
            setMaterials(object, materialExBldgs, false, false);
            object.scale.set(scale, scale, scale);

            object.position.x = offset.x;
            object.position.y = offset.y;
            object.position.z = offset.z;

            app.scene.add(object);
            app.cityModel = object;
        });

        const gridSize = {x: 100, y: 150};
        app.typeModels = {};
        types.forEach(function (type, i) {
            for (var j = 1; j <= topNum; j++) {
                const zPos = j;
                const id = type + '_' + j;
                loader.load('obj/' + id + '.obj', function (object) {
                    const bounds = new THREE.Box3().setFromObject(object);
                    setMaterials(object, typeMaterials[type], false, false);
                    object.scale.set(scale, scale, scale);

                    object.position.x = offset.x;
                    object.position.y = offset.y;
                    object.position.z = offset.z;

                    app.scene.add(object);

                    app.typeModels[id] = {
                        object: object,
                        modePositions: {
                            city: offset,
                            grid: {
                                x: gridSize.x * i - bounds.min.x,
                                y: -bounds.min.y,
                                z: gridSize.y * zPos - bounds.min.z
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
        app.renderViews(_split);

        // app.renderer.render(app.scene, app.camera);
    };

    app.renderViews = function (split) {
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
            "position": {"x": 631.5208780211974, "y": 754.9442096008233, "z": 726.4740187945285},
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
