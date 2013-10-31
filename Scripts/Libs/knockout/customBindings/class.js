define(["knockout"], function (ko) {
        ko.bindingHandlers['class'] = {        
            update: function (element, valueAccessor) {
                var oldClass = $(element).data("koClassBindingValue"),
                    newClass = ko.utils.unwrapObservable(valueAccessor());

                if (oldClass == newClass)
                    return;

                if (newClass) {
                    $(element).addClass(newClass);
                    $(element).data("koClassBindingValue", newClass);
                }
                
                if (oldClass && $(element).hasClass(oldClass)) {
                    $(element).removeClass(oldClass);
                }            
            }
        };
})