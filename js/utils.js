var userInput = (function(){
    var sliderLabelElement, sliderDropdown, sliderElement, slider, currentModel;
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
        classHelper.removeClass(sliderElement, "TBP-sliderMass1");
        classHelper.removeClass(sliderElement, "TBP-sliderMass2");
        classHelper.removeClass(sliderElement, "TBP-sliderMass3");

        var sliderSettings = getCurrentSliderSettings();
        var simulationValue = getCurrentSimulationValue(physics.initialConditions);
        var sliderText;

        if (currentSlider === "mass") {
            sliderText = formatMassForSlider(physics.initialConditions.masses[currentMassSliderIndex]);
            switch(currentMassSliderIndex) {
                case 0:
                    classHelper.addClass(sliderElement, "TBP-sliderMass1");
                    break;
                case 1:
                    classHelper.addClass(sliderElement, "TBP-sliderMass2");
                    break;
                default:
                    classHelper.addClass(sliderElement, "TBP-sliderMass3");
            }
        } else {
            sliderText = formatTimescaleForSlider(physics.initialConditions.timeScaleFactor);
        }

        sliderLabelElement.innerText = sliderText;
        var sliderPosition = (simulationValue - sliderSettings.min) / (sliderSettings.max - sliderSettings.min);

        if (sliderSettings.power !== undefined) {
            if (sliderSettings.power % 2 === 1) { // Odd power
                var defaultOutput = calculateDefaultSliderOutput(sliderSettings);
                sliderPosition = oddPowerCurve.sliderInputValue(defaultOutput, sliderPosition, sliderSettings.power);
            } else {
                sliderPosition = Math.pow(sliderPosition, 1 / sliderSettings.power);
            }
        }

        slider.changePosition(sliderPosition);
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
        currentMassSliderIndex = sliderDropdown.selectedIndex
        resetSlider()
    }

    function init() {
        sliderLabelElement = document.querySelector(".TBP-sliderLabel");
        sliderDropdown = document.querySelector(".TBP-sliderDropdown");
        sliderElement = document.querySelector(".TBP-slider");

        currentModel = simulations.init();
        physics.changeInitialConditions(currentModel);
        simulations.content.didChangeModel = didChangeModel;

        slider = SickSlider(".TBP-slider");
        slider.onSliderChange = didUpdateSlider;
        resetSlider();

        sliderDropdown.onchange = didClickSliderDropdown;
    }

    return {
        init: init
    };
})();
