var graphics = (function() {
    var canvas = null, // Canvas DOM element.
        context = null, // Canvas context for drawing.
        canvasHeight = 600,
        // The scaling factor used to draw dists between the objects and their sizes
        // Updated automatically on first draw
        metersPerPixel = 100,
        minimumSizePixels=10, // Minimum size of an object in pixels.
        maximumSizePixels=80, // Maximum size of an object in pixels.
        colors = {
            orbitalPaths: ["#ff2222","#3956ff","#8938ff"],
        },
        // Positions of three bodies in pixels on screen
        bodyPositions = [
            {x: null, y: null},
            {x: null, y: null},
            {x: null, y: null}
        ],
        // Previously drawn positions of the two bodies. Used to draw orbital line.
        previousBodyPositions = [
            {x: null, y: null},
            {x: null, y: null},
            {x: null, y: null}
        ],
        // Contains the DOM elements of the bodies
        bodyElemenets = [],
        // Body sizes in pixels
        currentBodySizes = [
            10, 10, 10
        ],
        middleX = 1,
        middleY = 1;


    function drawBody(position, size, bodyElement) {
        var left = (position.x - size/2) + 1000;
        var top = (position.y - size/2) + 1000;
        bodyElement.style.transform = "translate(" + left + "px," + top + "px)";

    }

    function updateObjectSizes(sizes) {
        for (var iBody = 0; iBody < sizes.length; iBody++) {
            currentBodySizes[iBody] =  sizes[iBody] / metersPerPixel;

            if (currentBodySizes[iBody] < minimumSizePixels) {
                currentBodySizes[iBody] = minimumSizePixels;
            }

            if (currentBodySizes[iBody] > maximumSizePixels) {
                currentBodySizes[iBody] = maximumSizePixels;
            }

            bodyElemenets[iBody].style.width = currentBodySizes[iBody] + "px";
        }
    }

    function drawOrbitalLine(newPosition, previousPosition, color) {
        if (previousPosition.x === null) {
            previousPosition.x = newPosition.x;
            previousPosition.y = newPosition.y;
            return;
        }

        context.beginPath();
        context.strokeStyle = color;
        context.moveTo(previousPosition.x, previousPosition.y);
        context.lineTo(newPosition.x, newPosition.y);
        context.stroke();

        previousPosition.x = newPosition.x;
        previousPosition.y = newPosition.y;
    }

    // Calculates the new positions of the bodies on screen
    // from the given state variables
    function calculateNewPositions(statePositions) {
        // Loop through the bodies
        for (var iBody = 0; iBody < statePositions.length / 4; iBody++) {
            var bodyStart = iBody * 4; // Starting index for current body in the u array

            var x = statePositions[bodyStart];
            var y = statePositions[bodyStart + 1];

            middleX = Math.floor(canvas.width / 2);
            middleY = Math.floor(canvas.height / 2);
            bodyPositions[iBody].x = x / metersPerPixel + middleX;
            bodyPositions[iBody].y = -y / metersPerPixel + middleY;
        }
    }

    function drawBodies() {
        // Loop through the bodies
        for (var iBody = 0; iBody < bodyPositions.length; iBody++) {
            var bodyPosition = bodyPositions[iBody];
            drawBody(bodyPosition, currentBodySizes[iBody], bodyElemenets[iBody]);
        }
    }

    function drawOrbitalLines() {
        // Loop through the bodies
        for (var iBody = 0; iBody < bodyPositions.length; iBody++) {
            var bodyPosition = bodyPositions[iBody];
            drawOrbitalLine(bodyPosition, previousBodyPositions[iBody], colors.orbitalPaths[iBody]);
        }
    }

    // Resize canvas to will the width of container
    function fitToContainer(){

        // Adjust the canvas to the size of the screen
        canvasHeight = Math.min(window.innerHeight, window.innerWidth) - 100;
        document.querySelector(".TBP-container").style.height = canvasHeight + 'px';

        canvas.style.width='100%';
        canvas.style.height= canvasHeight + 'px';
        canvas.width  = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    // Returns true on error and false on success
    function initCanvas() {
        // Find the canvas HTML element
        canvas = document.querySelector(".TBP-canvas");

        // Check if the browser supports canvas drawing
        if (!(window.requestAnimationFrame && canvas && canvas.getContext)) { return true; }

        // Get canvas context for drawing
        context = canvas.getContext("2d");
        return false;
    }

    // Create canvas for drawing and call success argument
    function init(success) {

        initCanvas();
        fitToContainer();

        const mass1Element = document.querySelector(".TBP-mass1");
        const mass2Element = document.querySelector(".TBP-mass2");
        const mass3Element = document.querySelector(".TBP-mass3");

        bodyElemenets = [];
        bodyElemenets.push(mass1Element);
        bodyElemenets.push(mass2Element);
        bodyElemenets.push(mass3Element);

        success();
    }

    function clearScene(largestdistMeters) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        previousBodyPositions = [
            {x: null, y: null},
            {x: null, y: null},
            {x: null, y: null}
        ];

        // Update the scaling
        metersPerPixel = 2.3 * largestdistMeters / Math.min(canvas.offsetWidth, canvas.offsetHeight, window.innerHeight);
    }

    return {
        fitToContainer: fitToContainer,
        drawOrbitalLines: drawOrbitalLines,
        drawBodies: drawBodies,
        updateObjectSizes: updateObjectSizes,
        clearScene: clearScene,
        calculateNewPositions: calculateNewPositions,
        init: init
    };
})();
