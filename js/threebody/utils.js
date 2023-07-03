var userInput = (function(){
    var sliderLabelElement, sliderDropdown, sliderElement, currentModel, lineWidthSlider;
    var currentSlider = "mass";
    var currentMassSliderIndex = 0;

    // Returns the output value of the slider between 0 to 1 corresponding to the
    // default value of the variable (such as default mass for an object)
    function calculateDefaultSliderOutput(sliderSettings) {
        var defaultValue = getCurrentSimulationValue(currentModel);
        return (defaultValue - sliderSettings.min) / (sliderSettings.max - sliderSettings.min);
    }

    function didUpdateSlider(sliderValue) {
        var sliderText;
        var sliderSettings = getCurrentSliderSettings();
        console.log('updated to', sliderValue)

        if (sliderSettings.power !== undefined) {

            if (sliderSettings.power % 2 === 1) { // Odd power
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
        return false; // Prevent default
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

    function init() {
        sliderLabelElement = document.querySelector(".sliderLabel");
        sliderDropdown = document.querySelector(".sliderDropdown");
        sliderElement = document.getElementById('ok-but');
        lineWidthSlider = document.getElementById("ok-but-width")

        currentModel = simulations.init();
        physics.changeInitialConditions(currentModel);
        simulations.content.didChangeModel = didChangeModel;

        sliderElement.oninput = e => didUpdateSlider(e.currentTarget.value)
        lineWidthSlider.oninput = e => didUpdateLineWidthSlider(e.currentTarget.value)
        resetSlider();
        sliderDropdown.onchange = didClickSliderDropdown;
    }

    return {
        init: init
    };
})();
