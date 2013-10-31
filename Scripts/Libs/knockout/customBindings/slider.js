define(["knockout"], function (ko) {

    ko.bindingHandlers['slider'] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            var sliderOptions = valueAccessor();            
            viewModel[sliderOptions.vmPropName] =  $(element).slider(sliderOptions);
        }
    };       
})