define(["pubSub"], function (pubSub) {
    var blocksDictionary = {
        'help': '#helpContainer',
        'event': '#eventsDialogContainer'
    };

    var defaultButton = [{
            text: 'закрыть',
            icons: {
                primary: 'close'
            },

            click: function() {
                $(this).dialog("close");
            }
        }
    ];

    function validateBeforeClose() {
        var oldDialog = global.dialog.dialog('option', 'resoreAfterClose');
        if (typeof(oldDialog) == 'undefined' || oldDialog == null) {
            return true; // nothing to do, just close
        } else {
            global.dialog.dialog('option', 'resoreAfterClose', null);

            oldDialog.skipCloseValidation = true;
            open(oldDialog);
            return false;
        }
    }

    function open(params) {
        if (typeof params == 'undefined' || typeof params.type == 'undefined') {
            console.error('No type for dialog specified');
            return false;
        }

        var mainDialog = global.dialog;

        if (mainDialog.dialog("isOpen") && params.skipCloseValidation !== true) {
            mainDialog.dialog('option', 'resoreAfterClose', mainDialog.dialog('option', 'lastActivity'));
        }

        var container = $(blocksDictionary[params.type]);
        hideAll();

        if (typeof params.title != 'undefined')
            mainDialog.dialog("option", 'title', params.title);

        if (typeof params.data != 'undefined')
            container.html(params.data);

        if (typeof params.data != 'undefined')
            container.html(params.data);

        var buttons = defaultButton;
        var copiedArray = [];
        if (jQuery.isArray(params.buttons)) {
            $.merge(copiedArray, params.buttons); //make copy of original array to save order and leave it fo future use
        }

        mainDialog.on("dialogbeforeclose", validateBeforeClose);

        $.merge(copiedArray, buttons);
        mainDialog.dialog("option", "buttons", copiedArray);
        
        container.html(params.data);


        mainDialog.on("dialogopen", params.onOpen);
        mainDialog.on("dialogclose", params.onClose);

        container.show();
        mainDialog.dialog('open');


        //backup last activity
        mainDialog.dialog('option', 'lastActivity', params);


        pubSub.pub("dialog.rollbar.update");
    };

    function hideAll() {
        $.each(blocksDictionary, function (name, container) {
            $(container).hide();
        });
    }


    var dialog = {
        open: function (params) {
            open(params);
        },
    };
    
    return dialog;
})