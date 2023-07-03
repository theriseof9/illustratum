var userInput = (function(){
    var massSlider, eccentricitySlider, sunsMassElement, eccentricityElement;

    function didUpdateMassSlider(sliderValue) {
        if (sliderValue === 0) { sliderValue = 0.005; }
        var oldEccentricity = physics.state.eccentricity;
        physics.resetStateToInitialConditions();
        graphics.clearScene();
        physics.updateMassRatioFromUserInput(sliderValue);
        physics.updateEccentricityFromUserInput(oldEccentricity);
        graphics.updateObjectSizes(physics.state.masses.q, physics.separationBetweenObjects());
        showMassRatio(sliderValue);
    }

    function showMassRatio(ratio) {
        sunsMassElement.innerHTML = parseFloat(Math.round(ratio * 100) / 100).toFixed(2);
    }

    function didUpdateEccentricitySlider(sliderValue) {
        var oldMassRatio = physics.state.masses.q;
        physics.resetStateToInitialConditions();
        graphics.clearScene();
        physics.updateMassRatioFromUserInput(oldMassRatio);
        physics.updateEccentricityFromUserInput(sliderValue);
        showEccentricity(sliderValue);
        graphics.updateObjectSizes(physics.state.masses.q, physics.separationBetweenObjects());
    }

    function showEccentricity(ratio) {
        eccentricityElement.innerHTML = parseFloat(Math.round(ratio * 100) / 100).toFixed(2);
    }

    function didClickRestart() {
        physics.resetStateToInitialConditions();
        graphics.clearScene();
        showMassRatio(physics.initialConditions.q);
        showEccentricity(physics.initialConditions.eccentricity);
        massSlider.changePosition(physics.initialConditions.q);
        eccentricitySlider.changePosition(physics.initialConditions.eccentricity);
        graphics.updateObjectSizes(physics.initialConditions.q, physics.separationBetweenObjects());
        return false; // Prevent default
    }

    function init() {
        sunsMassElement = document.querySelector(".EarthOrbitSimulation-sunsMass");
        eccentricityElement = document.querySelector(".EarthOrbitSimulation-eccentricity");
        massSlider = document.getElementById("mass-ratio");
        eccentricitySlider = document.getElementById("eccentricity");
        massSlider.onSliderChange = didUpdateMassSlider;
        showMassRatio(physics.initialConditions.q);
        massSlider.value = physics.initialConditions.q;
        eccentricitySlider.onSliderChange = didUpdateEccentricitySlider;
        showEccentricity(physics.initialConditions.eccentricity);
        eccentricitySlider.value = physics.initialConditions.eccentricity;
    }

    return {
        init: init
    };
})();
