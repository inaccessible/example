define(["knockout"], function (ko) {
    ko.bindingHandlers['visibleExt'] = {
        'update': function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var value = ko.utils.unwrapObservable(valueAccessor());
            var isCurrentlyVisible = !(element.style.display == "none");
            if (value && !isCurrentlyVisible)
                element.style.display = "";
            else if ((!value) && isCurrentlyVisible)
                element.style.display = "none";

            var callback = allBindingsAccessor().afterVisibleApplied;
            if (typeof callback == "function") {
                callback.apply(viewModel, [element.style.display != "none"]);
            }
        }
    };
})