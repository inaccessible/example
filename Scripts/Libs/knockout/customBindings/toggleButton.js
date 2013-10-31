define(["knockout"], function (ko) {

    ko.bindingHandlers['toggleButton'] = {
        init: function (element, valueAccessor, allBindingsAccessor) {
            var $element = $(element);
            var value = valueAccessor();
            var tooltipText = allBindingsAccessor().tooltipText && allBindingsAccessor().tooltipText();

            $(element)
                .click(function() {
                    value(!value());
                })
                .data("activeCssClass", allBindingsAccessor().activeCss || "active")
                .data("inactiveCssClass", allBindingsAccessor().inactiveCss || "inactive");
            
            setState($element, value(), tooltipText);
        },
        update: function (element, valueAccessor, allBindingsAccessor) {
            var $element = $(element);
            var value = valueAccessor();
            var toggleCallback = allBindingsAccessor().onToggle;
            var tooltipText = allBindingsAccessor().tooltipText && allBindingsAccessor().tooltipText();
            
            setState($element, value(), tooltipText);

            if (typeof toggleCallback == "function")
                toggleCallback();
        }
    };
    
    function setState($elem, state, tooltipText) {
        if (state) 
            $elem.addClass($elem.data("activeCssClass")).removeClass($elem.data("inactiveCssClass"));
        else
            $elem.addClass($elem.data("inactiveCssClass")).removeClass($elem.data("activeCssClass"));

        if (tooltipText) $elem.tooltip("option", "content", tooltipText);
    }
})