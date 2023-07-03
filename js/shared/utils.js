var userInput = (function(){
    var sliderLabelElement, sliderDropdown, sliderElement, currentModel, lineWidthSlider;
    var currentSlider = "mass";
    var currentMassSliderIndex = 0;

    function calculateDefaultSliderOutput(sliderSettings) {
        var defaultValue = getCurrentSimulationValue(currentModel);
        return (defaultValue - sliderSettings.min) / (sliderSettings.max - sliderSettings.min);
    }

    function didUpdateSliderLog(sliderValue) {
        var sliderText;
        var sliderSettings = getCurrentSliderSettings();
        console.log('updated to', sliderValue)

        if (sliderSettings.power !== undefined) {

            if (sliderSettings.power % 2 === 1) {
                var defaultOutput = calculateDefaultSliderOutput(sliderSettings);
                sliderValue = oddPowerCurve.sliderOutputValue(defaultOutput, sliderValue, sliderSettings.power);
            } else {
                sliderValue = Math.pow(sliderValue, sliderSettings.power);
            }
        }

        var newValue = sliderSettings.min + (sliderSettings.max - sliderSettings.min) * sliderValue;
        newValue = roundSliderValue(newValue);

        if (currentSlider === "mass") {
            physics.initialConditions.masses[currentMassSliderIndex] = newValue;
            graphics.updateObjectSizes(physics.calculateDiameters());
            sliderText = formatMassForSlider(newValue);
        } else {
            physics.initialConditions.timeScaleFactor = newValue;
            sliderText = formatTimescaleForSlider(newValue);
        }

        sliderLabelElement.innerText = sliderText;
    }

    function didUpdateLineWidthSlider(sliderValue) {
        console.log(sliderValue);
        graphics.lineWidth = 5
    }

    function getCurrentSliderSettings() {
        var sliderSettings;

        if (currentSlider === "mass") {
            sliderSettings = physics.initialConditions.massSlider;
        } else {
            sliderSettings = physics.initialConditions.timeScaleFactorSlider;
        }

        return sliderSettings;
    }

    function roundSliderValue(value) {
        return Math.round(value * 10000) / 10000;
    }

    function roundSliderValueText(value) {
        return parseFloat(Math.round(value * 10000) / 10000).toFixed(4);
    }

    function formatMassForSlider(mass) {
        var formatted = roundSliderValueText(mass);

        if (mass > 10000) {
            formatted = mass.toExponential(4);
        }

        formatted = ": " + formatted;

        if (physics.initialConditions.dimensionless !== true) {
            formatted += " kg";
        }

        return formatted;
    }

    function formatTimescaleForSlider(value) {
        var timeHumanized = timeHumanReadable(value);
        var formatted = roundSliderValueText(timeHumanized.value);

        if (timeHumanized.value > 10000) {
            formatted = timeHumanized.value.toExponential(4);
        }

        formatted = ": " + formatted + " " + timeHumanized.unit + " per second";

        return formatted;
    }

    function timeHumanReadable(time) {
        const units = [
            {unit: 'second', factor: 1},
            {unit: 'minute', factor: 60},
            {unit: 'hour', factor: 60},
            {unit: 'day', factor: 24},
            {unit: 'year', factor: 365},
            {unit: 'century', factor: 100}
        ];
        for (let i = 0; i < units.length; i++) {
            let unit = units[i];
            if (time < unit.factor) {
                return {unit: unit.unit, value: time};
            }
            time /= unit.factor;
        }
        return {unit: 'century', value: time};
    }

    function didClickRestart() {
        physics.resetStateToInitialConditions();
        graphics.clearScene(physics.largestDistMeters());
        graphics.updateObjectSizes(physics.calculateDiameters());
        return false;
    }

    function getCurrentSimulationValue(model) {
        var simulationValue;
        if (currentSlider === "mass") {
            simulationValue = model.masses[currentMassSliderIndex];
        } else {
            simulationValue = model.timeScaleFactor;
        }
        return simulationValue;
    }

    function resetSlider() {
        classHelper.removeClass(sliderElement, "sliderMass1");
        classHelper.removeClass(sliderElement, "sliderMass2");
        classHelper.removeClass(sliderElement, "sliderMass3");

        var sliderSettings = getCurrentSliderSettings();
        var simulationValue = getCurrentSimulationValue(physics.initialConditions);
        var sliderText;

        if (currentSlider === "mass") {
            sliderText = formatMassForSlider(physics.initialConditions.masses[currentMassSliderIndex]);
            switch(currentMassSliderIndex) {
                case 0:
                    classHelper.addClass(sliderElement, "sliderMass1");
                    break;
                case 1:
                    classHelper.addClass(sliderElement, "sliderMass2");
                    break;
                default:
                    classHelper.addClass(sliderElement, "sliderMass3");
            }
        } else {
            console.log("time")
            sliderText = formatTimescaleForSlider(physics.initialConditions.timeScaleFactor);
        }

        sliderLabelElement.innerText = sliderText;
        let sliderPosition = (simulationValue - sliderSettings.min) / (sliderSettings.max - sliderSettings.min);

        if (sliderSettings.power !== undefined) {
            if (sliderSettings.power % 2 === 1) { // Odd power
                const defaultOutput = calculateDefaultSliderOutput(sliderSettings);
                sliderPosition = oddPowerCurve.sliderInputValue(defaultOutput, sliderPosition, sliderSettings.power);
            } else {
                sliderPosition = Math.pow(sliderPosition, 1 / sliderSettings.power);
            }
            console.log(sliderSettings.power)
        }

        console.log('resetting val to:', sliderPosition)
        sliderElement.value = sliderPosition
    }

    function didChangeModel(model) {
        currentModel = model;
        physics.changeInitialConditions(currentModel);
        didClickRestart();
        resetSlider();
    }

    function didClickSliderDropdown() {
        console.log("Clicked slider")
        console.log(sliderDropdown.selectedIndex)
        currentSlider = "mass"
        if (sliderDropdown.selectedIndex === 3) currentSlider = "time"
        currentMassSliderIndex = sliderDropdown.selectedIndex
        resetSlider()
    }

    // Two body functions
    var massSlider, eccentricitySlider, sunsMassElement, eccentricityElement;

    function didUpdateMassSlider(sliderValue) {
        if (sliderValue === 0) { sliderValue = 0.005; }
        var oldEccentricity = physics_twobody.state.eccentricity;
        physics_twobody.resetStateToInitialConditions();
        graphics.clearScene();
        physics_twobody.updateMassRatioFromUserInput(sliderValue);
        physics_twobody.updateEccentricityFromUserInput(oldEccentricity);
        graphics.updateObjectSizes(physics_twobody.state.masses.q, physics_twobody.separationBetweenObjects());
        showMassRatio(sliderValue);
    }

    function didUpdateEccentricitySlider(sliderValue) {
        var oldMassRatio = physics_twobody.state.masses.q;
        physics_twobody.resetStateToInitialConditions();
        graphics.clearScene();
        physics_twobody.updateMassRatioFromUserInput(oldMassRatio);
        physics_twobody.updateEccentricityFromUserInput(sliderValue);
        showEccentricity(sliderValue);
        graphics.updateObjectSizes(physics_twobody.state.masses.q, physics_twobody.separationBetweenObjects());
    }

    function showMassRatio(ratio) {
        sunsMassElement.innerHTML = parseFloat(Math.round(ratio*100)/100).toFixed(2);
    }

    function showEccentricity(ratio) {
        eccentricityElement.innerHTML = parseFloat(Math.round(ratio * 100) / 100).toFixed(2);
    }

    function didClickRestartTwoBody() {
        physics_twobody.resetStateToInitialConditions();
        graphics.clearScene();
        showMassRatio(physics_twobody.initialConditions.q);
        showEccentricity(physics_twobody.initialConditions.eccentricity);
        massSlider.changePosition(physics_twobody.initialConditions.q);
        eccentricitySlider.changePosition(physics_twobody.initialConditions.eccentricity);
        graphics.updateObjectSizes(physics_twobody.initialConditions.q, physics_twobody.separationBetweenObjects());
        return false;
    }

    function init() {
        sliderLabelElement = document.querySelector(".sliderLabel");
        sliderDropdown = document.querySelector(".sliderDropdown");
        sliderElement = document.getElementById('ok-but');
        lineWidthSlider = document.getElementById("ok-but-width")

        currentModel = simulations.init();
        physics.changeInitialConditions(currentModel);
        simulations.content.didChangeModel = didChangeModel;

        sliderElement.oninput = e => didUpdateSliderLog(e.currentTarget.value)
        lineWidthSlider.oninput = e => didUpdateLineWidthSlider(e.currentTarget.value)
        resetSlider();
        sliderDropdown.onchange = didClickSliderDropdown;

        sunsMassElement = document.querySelector(".EarthOrbitSimulation-sunsMass");
        eccentricityElement = document.querySelector(".EarthOrbitSimulation-eccentricity");
        massSlider = document.getElementById("mass-ratio");
        eccentricitySlider = document.getElementById("eccentricity");

        massSlider.oninput = e => didUpdateMassSlider(e.currentTarget.value)
        eccentricitySlider.oninput = e => didUpdateEccentricitySlider(e.currentTarget.value)

        showMassRatio(physics_twobody.initialConditions.q);
        massSlider.value = physics_twobody.initialConditions.q;
        showEccentricity(physics_twobody.initialConditions.eccentricity);
        eccentricitySlider.value = physics_twobody.initialConditions.eccentricity;
    }

    return {
        init: init
    };
})();

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
