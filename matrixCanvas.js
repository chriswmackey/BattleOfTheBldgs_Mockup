function matrixCanvasTexture(width, height, xLabels, yLabels) {
    var canvas = document.getElementById('matrix-texture');
    var ctx = canvas.getContext('2d');

    function changeCanvas() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = '32pt Arial';
        ctx.fillStyle = '#333333';

        yLabels.forEach(function (label, i) {
            ctx.fillText(label, 20, 200 + i * 100);
        });

        xLabels.forEach(function (label, i) {
            ctx.fillText(label, 100 + i * 100, 100);
        });

        texture.needsUpdate = true;

    }


    var texture = new THREE.Texture(canvas);
    var material = new THREE.MeshBasicMaterial({map: texture});
    var plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 4, 4), material);
    plane.rotation.x = -Math.PI / 2;

    plane.position.x = width / 2;
    // plane.position.y = -20;
    plane.position.z = height / 2;

    changeCanvas();

    return {geometry: plane, changeCanvas: changeCanvas};
}