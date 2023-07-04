var physics_twobody = (function() {
    var state = {
        u: [0, 0, 0, 0],
        masses: {
            q: 0, // Current mass ratio m2 / m1
            m1: 1,
            m2: 0, // Will be set to q
            m12: 0 // Will be set to m1 + m2
        },
        eccentricity: 0, // Current eccentricity of the orbit
        positions: [
            {
                x: 0,
                y: 0
            },
            {
                x: 0,
                y: 0
            }
        ],
        iteration: 0 // Temporary REMOVE THIS!!!
    };

    var initialConditions = {
        eccentricity: 0.7, // Eccentricity of the orbit
        q: 0.5, // Mass ratio m2 / m1
        position: {
            x: 1,
            y: 0
        },
        velocity: {
            u: 0
        }
    };


    // Calculate the initial velocity of the seconf body
    // in vertical direction based on mass ratio q and eccentricity
    function initialVelocity(q, eccentricity) {
        return Math.sqrt( (1 + q) * (1 + eccentricity) );
    }

    // Update parameters that depend on mass ratio and eccentricity
    function updateParametersDependentOnUserInput() {
        console.log("curr ecc", state.eccentricity)
        console.log("curr mass", state.masses.m12)
        state.masses.m2 = state.masses.q;
        state.masses.m12 = state.masses.m1 + state.masses.m2;
        state.u[3] = initialVelocity(state.masses.q, state.eccentricity);
    }

    function resetStateToInitialConditions() {
        state.masses.q = initialConditions.q;
        state.eccentricity = initialConditions.eccentricity;

        state.u[0] = initialConditions.position.x;
        state.u[1] = initialConditions.position.y;
        state.u[2] = initialConditions.velocity.u;

        updateParametersDependentOnUserInput();
    }

    // Calculate the derivatives of the system of ODEs that describe equation of motion of two bodies
    function derivative() {
        var du = new Array(state.u.length);

        // x and y coordinates
        var r = state.u.slice(0,2);

        // Distance between bodies
        var rr = Math.sqrt( Math.pow(r[0],2) + Math.pow(r[1],2) );

        for (var i = 0; i < 2; i++) {
            du[i] = state.u[i + 2];
            du[i + 2] = -(1 + state.masses.q) * r[i] / (Math.pow(rr,3));
        }

        return du;
    }

    // The main function that is called on every animation frame.
    // It calculates and updates the current positions of the bodies
    function updatePosition() {
        var timestep = 0.15;
        rungeKutta.calculate(timestep, state.u, derivative);
        calculateNewPosition();
    }

    function calculateNewPosition() {
        r = 1; // Distance between two bodies
        // m12 is the sum of two massses
        var a1 = (state.masses.m2 / state.masses.m12) * r;
        var a2 = (state.masses.m1 / state.masses.m12) * r;

        state.positions[0].x = -a2 * state.u[0];
        state.positions[0].y = -a2 * state.u[1];

        state.positions[1].x = a1 * state.u[0];
        state.positions[1].y = a1 * state.u[1];
    }

    // Returns the separatation between two objects
    // This is a value from 1 and larger
    function separationBetweenObjects() {
        return initialConditions.position.x / (1 - state.eccentricity);
    }

    function updateMassRatioFromUserInput(massRatio) {
        state.masses.q = massRatio;
        updateParametersDependentOnUserInput();
    }

    function updateEccentricityFromUserInput(eccentricity) {
        state.eccentricity = eccentricity;
        updateParametersDependentOnUserInput();
    }

    return {
        resetStateToInitialConditions: resetStateToInitialConditions,
        updatePosition: updatePosition,
        initialConditions: initialConditions,
        updateMassRatioFromUserInput: updateMassRatioFromUserInput,
        updateEccentricityFromUserInput: updateEccentricityFromUserInput,
        state: state,
        separationBetweenObjects: separationBetweenObjects
    };
})();
