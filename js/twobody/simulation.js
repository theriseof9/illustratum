var simulation_twobody = (function() {
    function animate() {
        physics_twobody.updatePosition();
        graphics_twobody.drawScene(physics_twobody.state.positions);
        window.requestAnimationFrame(animate);
    }

    function start() {
        graphics_twobody.init(function() {
            physics_twobody.resetStateToInitialConditions();
            graphics_twobody.updateObjectSizes(physics_twobody.initialConditions.q, physics_twobody.separationBetweenObjects());
            window.addEventListener('resize', function(event){
                graphics_twobody.fitToContainer();
                graphics_twobody.clearScene();
                graphics_twobody.drawScene(physics_twobody.state.positions);
            });

            animate();
        });
    }

    return {
        start: start
    };
})();
