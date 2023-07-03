var simulations = (function(){
    var content = {
        didChangeModel: null // function handler that is called when user changes a model
    };

    function didClickElement(element) {
        if (!classHelper.hasClass(element, "preset")) {
            didClickElement(element.parentElement);
            return;
        }

        var name = element[element.selectedIndex].getAttribute("value");
        var preset = allPresets[name];

        if (content.didChangeModel !== null) {
            content.didChangeModel(preset);
        }
        console.log("Selected")
    }

    function didClick(e) {
        if (!e) { e = window.event; }
        didClickElement(e.target);
    }

    function init() {
        var presetElement = document.querySelector(".preset");
        presetElement.onchange = didClick;
        return allPresets.FigureEight;
    }

    return {
        init: init,
        content: content
    };
})();
