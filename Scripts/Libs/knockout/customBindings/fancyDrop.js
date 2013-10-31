define(["knockout"], function (ko) {
    ko.bindingHandlers["fancyDrop"] = {
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var i,
                dropItems = ko.utils.unwrapObservable(valueAccessor()),
                selectedItemValue = allBindingsAccessor().value(),
                selectedItem = getItemByValue(dropItems, selectedItemValue);

            // Generate HTML
            var $dropContainer = $(element).attr("title", selectedItem.tooltip);
            
            $("<div class='selectedText' style='float: left;'/>")
                .text(selectedItem.text)
                
                .appendTo($dropContainer);

            $("<div class='triangleblock'/>")
                .appendTo($dropContainer);

            $("<div class='dropDownHoverFix'/>")
                .appendTo($dropContainer);

            var $dropDownBlock = $("<div class='dropDownBlock' style='width: 120px; display: none'/>")
                .appendTo($dropContainer);

            $("<div class='dropmenuArrow'/>")
                .appendTo($dropDownBlock);

            var $itemList = $("<ul class='subNavigation'/>")
                .appendTo($dropDownBlock);

            for (i = 0; i < dropItems.length; i++) {
                var $icon = !dropItems[i].iconClass ? null : $("<div class='subnavIcons " + dropItems[i].iconClass + "'/>"),
                    $a = $("<a href='#'/>"),
                    $li = $("<li/>");

                if ($icon) $a.append($icon);
                $a.append(dropItems[i].text);

                $li.data("obj", dropItems[i])
                    .append($a)
                    .click(onItemSelected)
                    .appendTo($itemList);
            }

            // Events            
            function onItemSelected() {
                var selectedObj = $(this).data("obj");
                allBindingsAccessor().value(selectedObj.value);
                //$dropContainer.attr("title", selectedObj.tooltip);
                $dropContainer.tooltip("option", "content", selectedObj.tooltip);

                $dropDownBlock.fadeOut("fast");                
            }

            var isOpened = false;
            $dropContainer
                .click(function () {
                    if (!isOpened) {
                        $dropDownBlock.fadeIn("fast");
                        $('.ui-tooltip.ui-widget').hide();
                    }
                    else
                        $dropDownBlock.fadeOut("fast");

                    isOpened = !isOpened;
                })
                .mouseleave(function () {
                    $dropDownBlock.fadeOut("fast");
                    isOpened = false;
                });
        },
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            var dropItems = ko.utils.unwrapObservable(valueAccessor()),
                selectedItemValue = allBindingsAccessor().value(),
                selectedItem = getItemByValue(dropItems, selectedItemValue);

            $("div.selectedText", element).text(selectedItem.text);
        }
    };

    function getItemByValue(items, value) {
        if (items.length == 0)
            return null;

        var selectedItem;
        for (i = 0; i < items.length; i++)
            if (items[i].value == value)
                selectedItem = items[i];

        return selectedItem || items[0];
    }
})