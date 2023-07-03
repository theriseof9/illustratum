var simulation = (function() {
    // The method is called 60 times per second
    function animate() {
        physics.updatePosition();
        graphics.drawScene(physics.state.positions);
        window.requestAnimationFrame(animate);
    }

    function start() {
        graphics.init(function() {
            // Use the initial conditions for the simulation
            physics.resetStateToInitialConditions();
            graphics.updateObjectSizes(physics.initialConditions.q, physics.separationBetweenObjects());

            // Redraw the scene if page is resized
            window.addEventListener('resize', function(event){
                graphics.fitToContainer();
                graphics.clearScene();
                graphics.drawScene(physics.state.positions);
            });

            animate();
        });
    }

    return {
        start: start
    };
})();
