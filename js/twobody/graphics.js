var graphics_twobody = (function() {
    var canvas = null, // Canvas DOM element.
        context = null, // Canvas context for drawing.
        canvasHeight = 400,
        defaultBodySize = 80,
        colors = {
            orbitalPath: "#5555FF"
        },
        // Previously drawn positions of the two bodies. Used to draw orbital line.
        previousBodyPositions = [
            {x: null, y: null},
            {x: null, y: null}
        ],
        earthElement,
        sunElement,
        currentBodySizes = [
            defaultBodySize, defaultBodySize
        ],
        middleX = 1,
        middleY = 1;

    function drawBody(position, size, bodyElement) {
        var left = (position.x - size/2) + "px";
        var top = (position.y - size/2) + "px";
        bodyElement.style.left = left;
        bodyElement.style.top = top;
    }

    // Updates the sizes of the two object based on the mass ratio (value from 0 to 1)
    // and the scale factor (value from 1 and larger).
    function updateObjectSizes(massRatio, scaleFactor) {
        currentBodySizes[1] = defaultBodySize / scaleFactor;
        sunElement.style.width = currentBodySizes[1] + "px";

        // Assuming same density of two bodies, mass ratio is proportional to the cube of radii ratio
        massRatio = Math.pow(massRatio, 1/3);
        currentBodySizes[0] = defaultBodySize * massRatio / scaleFactor;
        earthElement.style.width = currentBodySizes[0] + "px";
    }

    function drawOrbitalLine(newPosition, previousPosition) {
        if (previousPosition.x === null) {
            previousPosition.x = newPosition.x;
            previousPosition.y = newPosition.y;
            return;
        }

        context.beginPath();
        context.strokeStyle = colors.orbitalPath;
        context.moveTo(previousPosition.x, previousPosition.y);
        context.lineTo(newPosition.x, newPosition.y);
        context.stroke();

        previousPosition.x = newPosition.x;
        previousPosition.y = newPosition.y;
    }

    function calculatePosition(position) {
        middleX = Math.floor(canvas.width / 2);
        middleY = Math.floor(canvas.height / 2);
        var scale = 100;
        var centerX = position.x * scale + middleX;
        var centerY = position.y * scale + middleY;

        return {
            x: centerX,
            y: centerY
        };
    }

    // Draws the scene
    function drawScene(positions) {
        var body1Position = calculatePosition(positions[0]);
        drawBody(body1Position, currentBodySizes[0], earthElement);
        drawOrbitalLine(body1Position, previousBodyPositions[0]);

        var body2Position = calculatePosition(positions[1]);
        drawBody(body2Position, currentBodySizes[1], sunElement);
        drawOrbitalLine(body2Position, previousBodyPositions[1]);
    }

    function showCanvasNotSupportedMessage() {
        document.getElementById("EarthOrbitSimulation-notSupportedMessage").style.display ='block';
    }

    // Resize canvas to will the width of container
    function fitToContainer(){
        canvas.style.width='100%';
        canvas.style.height= canvasHeight + 'px';
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    // Returns true on error and false on success
    function initCanvas() {
        // Find the canvas HTML element
        canvas = document.querySelector(".EarthOrbitSimulation-canvas");

        // Check if the browser supports canvas drawing
        if (!(window.requestAnimationFrame && canvas && canvas.getContext)) { return true; }

        // Get canvas context for drawing
        context = canvas.getContext("2d");
        if (!context) { return true; } // Error, browser does not support canvas
        return false;
    }

    // Create canvas for drawing and call success argument
    function init(success) {
        if (initCanvas()) {
            // The browser can not use canvas. Show a warning message.
            showCanvasNotSupportedMessage();
            return;
        }

        // Update the size of the canvas
        fitToContainer();
        sunElement = document.querySelector(".mass1-twobody");
        earthElement = document.querySelector(".mass2-twobody");

        // Execute success callback function
        success();
    }

    function clearScene() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        previousBodyPositions = [
            {x: null, y: null},
            {x: null, y: null}
        ];
    }

    return {
        fitToContainer: fitToContainer,
        drawScene: drawScene,
        updateObjectSizes: updateObjectSizes,
        clearScene: clearScene,
        init: init
    };
})();
