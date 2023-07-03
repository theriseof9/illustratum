var simulation = (function() {
    var calculationsPerFrame = 250;
    var framesPerSecond = 60;
    var drawTimesPerFrame = 10;
    var drawIndex =  Math.ceil(calculationsPerFrame / drawTimesPerFrame);
    function animate() {
        var timestep = physics.initialConditions.timeScaleFactor / framesPerSecond / calculationsPerFrame;
        for (var i = 0; i < calculationsPerFrame; i++) {
            physics.updatePosition(timestep);
            if (i % drawIndex === 0) {
                graphics.calculateNewPositions(physics.state.u);
                graphics.drawOrbitalLines(physics.initialConditions.paleOrbitalPaths);
            }
        }
        graphics.drawBodies();
        window.requestAnimationFrame(animate);
    }

    function start() {
        graphics.init(function() {
            physics.resetStateToInitialConditions();
            graphics.clearScene(physics.largestDistMeters());
            graphics.updateObjectSizes(physics.calculateDiameters());
            window.addEventListener('resize', function(event){
                graphics.fitToContainer();
                graphics.clearScene(physics.largestDistMeters());
                graphics.calculateNewPositions(physics.state.u);
                graphics.drawOrbitalLines(physics.initialConditions.paleOrbitalPaths);
                graphics.drawBodies();
            });

            animate();
        });
    }

    return {
        start: start
    };
})();