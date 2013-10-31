define([], function() {
    function FancyDropItem(value, text, tooltip, iconClass) {
        var self = this;

        self.value = value;
        self.text = text;
        self.tooltip = tooltip;
        self.iconClass = iconClass;
    }

    return FancyDropItem;
})