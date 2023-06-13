var rungeKutta = (function() {
    // h: timestep
    // u: variables
    // derivative: function that calculates the derivatives
    function calculate(h, u, derivative) {
        var a = [h/2, h/2, h, 0];
        var b = [h/6, h/3, h/3, h/6];
        var u0 = [];
        var ut = [];
        var dimension = u.length;

        for (var i = 0; i < dimension; i++) {
            u0.push(u[i]);
            ut.push(0);
        }

        for (var j = 0; j < 4; j++) {
            var du = derivative();

            for (i = 0; i < dimension; i++) {
                u[i] = u0[i] + a[j]*du[i];
                ut[i] = ut[i] + b[j]*du[i];
            }
        }

        for (i = 0; i < dimension; i++) {
            u[i] = u0[i] + ut[i];
        }
    }

    return {
        calculate: calculate
    };
})();

var physics = (function() {
    var constants = {
        gravitationalConstant: 6.67408 * Math.pow(10, -11),
        averageDensity: 1410
    };

    var state = {
        // State variables used in the differential equations
        // First two elements are x and y positions, and second two are x and y components of velocity
        // repeated for three bodies.
        u: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    };

    // Initial condition of the model. The conditions are loaded from the currently selected simulation.
    var initialConditions = {
        bodies: 3, // Number of bodies
    };

    // Calculate the radius of the body (in meters) based on its mass.
    function calculateRadiusFromMass(mass, density) {
        return Math.pow(3/4 * mass / ( Math.PI * density), 1/3);
    }

    // Returns the diameters of three bodies in meters
    function calculateDiameters() {
        var diameters = [];

        // Loop through the bodies
        for (var iBody = 0; iBody < initialConditions.bodies; iBody++) {
            if (initialConditions.densities !== undefined && initialConditions.densities.length >= initialConditions.bodies-1) {
                var density = initialConditions.densities[iBody];
            } else {
                density = constants.averageDensity;
            }

            diameters.push(2 * calculateRadiusFromMass(initialConditions.masses[iBody], density));
        }

        return diameters;
    }

    function calculateCenterOfMassVelocity(){
        var centerOfMassVelocity = {x: 0, y: 0};
        var sumOfMasses = 0;

        // Loop through the bodies
        for (var iBody = 0; iBody < initialConditions.bodies; iBody++) {
            var bodyStart = iBody * 4; // Starting index for current body in the u array
            centerOfMassVelocity.x += initialConditions.masses[iBody] * state.u[bodyStart + 2];
            centerOfMassVelocity.y += initialConditions.masses[iBody] * state.u[bodyStart + 3];
            sumOfMasses += initialConditions.masses[iBody];
        }

        centerOfMassVelocity.x /= sumOfMasses;
        centerOfMassVelocity.y /= sumOfMasses;

        return centerOfMassVelocity;
    }

    function calculateCenterOfMass(){
        var centerOfMass = {x: 0, y: 0};
        var sumOfMasses = 0;

        // Loop through the bodies
        for (var iBody = 0; iBody < initialConditions.bodies; iBody++) {
            var bodyStart = iBody * 4; // Starting index for current body in the u array
            centerOfMass.x += initialConditions.masses[iBody] * state.u[bodyStart + 0];
            centerOfMass.y += initialConditions.masses[iBody] * state.u[bodyStart + 1];
            sumOfMasses += initialConditions.masses[iBody];
        }

        centerOfMass.x /= sumOfMasses;
        centerOfMass.y /= sumOfMasses;

        return centerOfMass;
    }

    function resetStateToInitialConditions() {
        var iBody, bodyStart;

        // Loop through the bodies
        for (iBody = 0; iBody < initialConditions.bodies; iBody++) {
            bodyStart = iBody * 4; // Starting index for current body in the u array

            var position = initialConditions.positions[iBody];
            state.u[bodyStart + 0] = position.r * Math.cos(position.theta); // x
            state.u[bodyStart + 1] = position.r * Math.sin(position.theta); //y

            var velocity = initialConditions.velocities[iBody];
            state.u[bodyStart + 2] = velocity.r * Math.cos(velocity.theta); // velocity x
            state.u[bodyStart + 3] = velocity.r * Math.sin(velocity.theta); // velocity y
        }

        var centerOfMassVelocity = calculateCenterOfMassVelocity();
        var centerOfMass = calculateCenterOfMass();

        // Correct the velocities and positions of the bodies
        // to make the center of mass motionless at the middle of the screen
        for (iBody = 0; iBody < initialConditions.bodies; iBody++) {
            bodyStart = iBody * 4; // Starting index for current body in the u array
            state.u[bodyStart + 0] -= centerOfMass.x;
            state.u[bodyStart + 1] -= centerOfMass.y;
            state.u[bodyStart + 2] -= centerOfMassVelocity.x;
            state.u[bodyStart + 3] -= centerOfMassVelocity.y;
        }
    }

    // Calculates the acceleration of the body 'iFromBody'
    // due to gravity from other bodies,
    // using Newton's law of gravitation.
    //   iFromBody: the index of body. 0 is first body, 1 is second body.
    //   coordinate: 0 for x coordinate, 1 for y coordinate
    function acceleration(iFromBody, coordinate) {
        var result = 0;
        var iFromBodyStart = iFromBody * 4; // Starting index for the body in the u array

        // Loop through the bodies
        for (var iToBody = 0; iToBody < initialConditions.bodies; iToBody++) {
            if (iFromBody === iToBody) { continue; }
            var iToBodyStart = iToBody * 4; // Starting index for the body in the u array

            // Distance between the two bodies
            var distanceX = state.u[iToBodyStart + 0] -
                state.u[iFromBodyStart + 0];

            var distanceY = state.u[iToBodyStart + 1] -
                state.u[iFromBodyStart + 1];

            var distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
            var gravitationalConstant = 1;

            if (initialConditions.dimensionless !== true) {
                gravitationalConstant = constants.gravitationalConstant;
            }

            result += gravitationalConstant *
                initialConditions.masses[iToBody] *
                (state.u[iToBodyStart + coordinate] - state.u[iFromBodyStart + coordinate]) /
                (Math.pow(distance, 3));
        }

        return result;
    }

    // Calculate the derivatives of the system of ODEs that describe equation of motion of the bodies
    function derivative() {
        var du = new Array(initialConditions.bodies * 4);

        // Loop through the bodies
        for (var iBody = 0; iBody < initialConditions.bodies; iBody++) {
            // Starting index for current body in the u array
            var bodyStart = iBody * 4;

            du[bodyStart + 0] = state.u[bodyStart + 0 + 2]; // Velocity x
            du[bodyStart + 1] = state.u[bodyStart + 0 + 3]; // Velocity y
            du[bodyStart + 2] = acceleration(iBody, 0); // Acceleration x
            du[bodyStart + 3] = acceleration(iBody, 1); // Acceleration y
        }

        return du;
    }

    // The main function that is called on every animation frame.
    // It calculates and updates the current positions of the bodies
    function updatePosition(timestep) {
        rungeKutta.calculate(timestep, state.u, derivative);
    }

    function calculateNewPosition() {
        // Loop through the bodies
        for (var iBody = 0; iBody < initialConditions.bodies; iBody++) {
            var bodyStart = iBody * 4; // Starting index for current body in the u array

            state.positions[iBody].x = state.u[bodyStart + 0];
            state.positions[iBody].y = state.u[bodyStart + 1];
        }
    }

    // Returns the largest distance of an object from the center based on initial considitions
    function largestDistanceMeters() {
        var result = 0;

        // Loop through the bodies
        for (var iBody = 0; iBody < initialConditions.bodies; iBody++) {
            var position = initialConditions.positions[iBody];
            if (result < position.r) {
                result = position.r;
            }
        }

        return result;
    }

    function changeInitialConditions(conditions) {
        initialConditions.dimensionless = conditions.dimensionless;
        initialConditions.masses = conditions.masses.slice();
        initialConditions.positions = conditions.positions;
        initialConditions.velocities = conditions.velocities;
        initialConditions.timeScaleFactor = conditions.timeScaleFactor;
        initialConditions.massSlider = conditions.massSlider;
        initialConditions.timeScaleFactorSlider = conditions.timeScaleFactorSlider;
        initialConditions.densities = conditions.densities;
        initialConditions.paleOrbitalPaths = conditions.paleOrbitalPaths;
    }

    return {
        resetStateToInitialConditions: resetStateToInitialConditions,
        updatePosition: updatePosition,
        calculateNewPosition: calculateNewPosition,
        initialConditions: initialConditions,
        state: state,
        calculateDiameters: calculateDiameters,
        largestDistanceMeters: largestDistanceMeters,
        changeInitialConditions: changeInitialConditions,
        constants: constants
    };
})();
