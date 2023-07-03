var figure8Position = {x: 0.97000436, y: -0.24308753};
var figure8Velocity = {x: -0.93240737, y: -0.86473146};

function polarFromCartesian(coordinates) {
    var angle;

    if (coordinates.x === 0) {
        angle = 0;
    } else {
        angle = Math.atan2(coordinates.y, coordinates.x);
    }

    return {
        r: Math.sqrt(Math.pow(coordinates.x, 2) + Math.pow(coordinates.y, 2)),
        theta: angle
    };
}

var oddPowerCurve = (function(){
    function calcualteL(defaultOutput, power) {
        if (power === 0) return 1;
        return -Math.pow(defaultOutput, 1 / power);
    }

    function calcualteA(defaultOutput, power) {
        if (power === 0) return 1;
        return Math.pow(1 - defaultOutput, 1 / power) - calcualteL(defaultOutput, power);
    }

    // Return the slider input value based on the output and default output values
    function sliderInputValue(defaultOutput, output, power) {
        if (power === 0) return 1;
        var a = calcualteA(defaultOutput, power);
        if (a === 0) { a = 1; }
        var l = calcualteL(defaultOutput, power);
        var sign = (output - defaultOutput) < 0 ? -1 : 1;
        return (sign * Math.pow(Math.abs(output - defaultOutput), 1 / power) - l) / a;
    }

    // Return the slider output value based on the input and default output values
    function sliderOutputValue(defaultOutput, intput, power) {
        if (power === 0) return 1;
        var a = calcualteA(defaultOutput, power);
        var l = calcualteL(defaultOutput, power);

        var result = Math.pow(a * intput + l, power) + defaultOutput;
        if (result < 0) { result = 0; }
        return result;
    }

    return {
        sliderInputValue: sliderInputValue,
        sliderOutputValue: sliderOutputValue
    };
})();

var classHelper = (function(){
    function hasClass(element, className) {
        return (' ' + element.className + ' ').indexOf(' ' + className+ ' ') > -1;
    }

    function removeClass(element, className) {
        element.className = element.className
            .replace(new RegExp('(?:^|\\s)'+ className + '(?:\\s|$)'), ' ');
    }

    function addClass(element, className) {
        if (hasClass(element, className)) return;
        element.className += " " + className;
    }

    return {
        hasClass: hasClass,
        removeClass: removeClass,
        addClass: addClass
    };
})();
