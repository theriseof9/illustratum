function SickSlider(sliderElementSelector) {
    var that = {
        // A function that will be called when user changes the slider position.
        // The function will be passed the slider position: a number between 0 and 1.
        onSliderChange: null,
        // Store the previous slider value in order to prevent calling onSliderChange function with the same argument
        previousSliderValue: -42,
        didRequestUpdateOnNextFrame: false
    };

    // Initializes the slider element
    //
    // Arguments:
    //   sliderElementSelector: A CSS selector of the SickSlider element.
    that.init = function(sliderElementSelector) {
        that.slider = document.querySelector(sliderElementSelector);
        that.sliderHead = that.slider.querySelector(".SickSlider-head");
        var sliding = false;

        // Start dragging slider
        // -----------------

        that.slider.addEventListener("mousedown", function(e) {
            sliding = true;
            that.updateHeadPositionOnTouch(e);
        });

        that.slider.addEventListener("touchstart", function(e) {
            sliding = true;
            that.updateHeadPositionOnTouch(e);
        });

        that.slider.onselectstart = function () { return false; };

        // End dragging slider
        // -----------------

        document.addEventListener("mouseup", function(){
            sliding = false;
        });

        document.addEventListener("dragend", function(){
            sliding = false;
        });

        document.addEventListener("touchend", function(e) {
            sliding = false;
        });

        // Drag slider
        // -----------------

        document.addEventListener("mousemove", function(e) {
            if (!sliding) { return; }
            that.updateHeadPositionOnTouch(e);
        });

        document.addEventListener("touchmove", function(e) {
            if (!sliding) { return; }
            that.updateHeadPositionOnTouch(e);
        });

        that.slider.addEventListener("touchmove", function(e) {
            if (typeof e.preventDefault !== 'undefined' && e.preventDefault !== null) {
                e.preventDefault(); // Prevent screen from sliding on touch devices when the element is dragged.
            }
        });
    };

    // Returns the slider value (a number form 0 to 1) from the cursor position
    //
    // Arguments:
    //
    //   e: a touch event.
    //
    that.sliderValueFromCursor = function(e) {
        var pointerX = e.pageX;

        if (e.touches && e.touches.length > 0) {
            pointerX = e.touches[0].pageX;
        }

        pointerX = pointerX - that.slider.offsetLeft;
        var headLeft = (pointerX - 16);
        if (headLeft < 0) { headLeft = 0; }

        if ((headLeft + that.sliderHead.offsetWidth) > that.slider.offsetWidth) {
            headLeft = that.slider.offsetWidth - that.sliderHead.offsetWidth;
        }

        // Calculate slider value from head position
        var sliderWidthWithoutHead = that.slider.offsetWidth - that.sliderHead.offsetWidth;
        var sliderValue = 1;

        if (sliderWidthWithoutHead !== 0) {
            sliderValue = headLeft / sliderWidthWithoutHead;
        }

        return sliderValue;
    };


    // Changes the position of the slider
    //
    // Arguments:
    //
    //   sliderValue: a value between 0 and 1.
    //
    that.changePosition = function(sliderValue) {
        var headLeft = (that.slider.offsetWidth - that.sliderHead.offsetWidth) * sliderValue;
        that.sliderHead.style.left = headLeft + "px";
    };

    // Update the slider position and call the callback function
    //
    // Arguments:
    //
    //   e: a touch event.
    //
    that.updateHeadPositionOnTouch = function(e) {
        var sliderValue = that.sliderValueFromCursor(e);

        // Handle the head change only if it changed significantly (more than 0.1%)
        if (Math.round(that.previousSliderValue * 10000) === Math.round(sliderValue * 10000)) { return; }
        that.previousSliderValue = sliderValue;

        if (!that.didRequestUpdateOnNextFrame) {
            // Update the slider on next redraw, to improve performance
            that.didRequestUpdateOnNextFrame = true;
            window.requestAnimationFrame(that.updateOnFrame);
        }
    };

    that.updateOnFrame = function() {
        that.changePosition(that.previousSliderValue);

        if (that.onSliderChange) {
            that.onSliderChange(that.previousSliderValue);
        }

        that.didRequestUpdateOnNextFrame = false;
    };

    that.init(sliderElementSelector);

    return that;
}
