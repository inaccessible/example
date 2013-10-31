// this wrapper is used in main.js
// add here anything what is need every time when knockout is passed to AMD
define(["knockout",
        "Libs/knockout/knockout.mapping.debug",
        "Libs/knockout/customBindings/class",
        "Libs/knockout/customBindings/visibleExt",
        "Libs/knockout/customBindings/fancyDrop",
        "Libs/knockout/customBindings/toggleButton",
        "Libs/knockout/customBindings/fadeinOrHide",
        "Libs/knockout/customBindings/fadeoutOrShow",
        "Libs/knockout/customBindings/slider",
        "Libs/knockout/customBindings/slideVisible",
        "Libs/knockout/customBindings/dialog",
    ], function (ko, mapping) {
        ko.mapping = mapping;
        return ko;
    })