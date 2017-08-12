function matrixCanvasTexture(xLabels, yLabels) {
    var canvas = document.getElementById('matrix-texture');
    var ctx = canvas.getContext('2d');

    const matrixW = padSize.left + gridSize.x * types.length + padSize.right;
    const matrixH = padSize.top + gridSize.y * topNum + +padSize.bottom;

    const planeSize = Math.max(matrixW, matrixH);//web gl textures work better when square

    function toCanvasPos(threePos) {
        return {
            x: canvas.width * threePos.x / planeSize,
            y: canvas.height * threePos.y / planeSize,
        }
    }

    function drawLine(ctx, pt1, pt2) {
        ctx.save();
        ctx.strokeStyle = '#aaaaaa';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
        ctx.stroke();
        ctx.restore();
    }

    function changeCanvas() {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        //Horizontal Grid Lines
        for (var j = 0; j <= topNum; j++) {
            const y = padSize.top + j * gridSize.y;
            const pos1 = toCanvasPos({
                x: padSize.left,
                y: y
            });
            const pos2 = toCanvasPos({
                x: padSize.left + gridSize.x * types.length,
                y: y
            });
            drawLine(ctx, pos1, pos2);
            // ctx.lineTo(label, pos.x, pos.y);
        }

        //Vertical Grid Lines
        for (j = 0; j <= types.length; j++) {
            const x = padSize.left + j * gridSize.x;
            const pos1 = toCanvasPos({
                x: x,
                y: padSize.top
            });
            const pos2 = toCanvasPos({
                x: x,
                y: padSize.top + gridSize.y * topNum
            });
            drawLine(ctx, pos1, pos2);
            // ctx.lineTo(label, pos.x, pos.y);
        }


        ctx.font = '50pt Arial';
        ctx.fillStyle = '#eeeeee';

        yLabels.forEach(function (label, i) {
            const pos = toCanvasPos({
                x: 100,
                y: padSize.top + (i + 0.5) * gridSize.y,
            });
            ctx.fillText(label, pos.x, pos.y);
        });


        ctx.font = '30pt Arial';
        ctx.fillStyle = '#eeeeee';

        xLabels.forEach(function (label, i) {
            const pos = toCanvasPos({
                x: padSize.left + i * gridSize.x,
                y: padSize.top - 200,
            });
            ctx.fillText(label, pos.x, pos.y);
        });

        texture.needsUpdate = true;

    }


    var texture = new THREE.Texture(canvas);
    var material = new THREE.MeshBasicMaterial({map: texture});

    var plane = new THREE.Mesh(new THREE.PlaneGeometry(planeSize, planeSize, 4, 4), material);
    plane.rotation.x = -Math.PI / 2;

    plane.position.x = planeSize / 2;
    // plane.position.y = -20;
    plane.position.z = planeSize / 2;

    changeCanvas();

    return {geometry: plane, changeCanvas: changeCanvas};
}