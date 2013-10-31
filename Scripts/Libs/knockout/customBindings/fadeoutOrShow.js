define(["knockout"], function(ko) {
    ko.bindingHandlers["fadeoutOrShow"] = {
        init: function(element, valueAccessor) {
            var value = valueAccessor();
            $(element).toggle(ko.utils.unwrapObservable(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
        },
        update: function(element, valueAccessor) {
            var value = valueAccessor();
            ko.utils.unwrapObservable(value) ? $(element).show() : $(element).fadeOut("fast");
        }
    };
});