define(["knockout", "pubSub"], function (ko, pubSub) {

    ko.bindingHandlers['dialog'] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
            
            var options = valueAccessor();
            var defaults = {
                dialogClass: 'customDialog',
                draggable: false,
                resizable: false,
                autoOpen: false,
                modal: true,
                width: 501,
                height: 483,
                open: function (event, ui) {
                    $('.ui-widget-overlay').bind('click', function () {
                        $(global.dialog).dialog('close');
                    });
                },
                create: function (event, ui) {
                    var rollbar = $('#dialogScroller').rollbar({
                        pathPadding: '3px'
                    });

                    pubSub.sub("dialog.rollbar.update", function () {
                        rollbar.reset();
                        rollbar.update();
                    });
                }
            };

            $.extend(options, defaults);
            


            $('.aboutTab').trigger('click');
            
            $('body').on('click', '.helpTab', function () {
                $('.helpTab').removeClass('active');
                
                $(this).addClass('active');
                $('.helpContent div.tabContent').hide();
                global.dialog.dialog('option', 'title', $(this).attr('data-title'));
                $('.' + $(this).attr('data-block')).show();

                pubSub.pub("dialog.rollbar.update");
            });

            
            global.dialog = $(element).dialog(options);

        }
    };       
})