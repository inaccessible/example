var config = {
    waitSeconds: 60,
    paths: {
        knockout: 'Libs/knockout/knockout-2.2.1.debug',                 //don't remove that alias as it is needed for custom bindings
        ko: 'Libs/knockout/knockoutWrapper',                            //<- use this alias for Knockout
        autoNumeric: 'Libs/autoNumeric',
        pubSub: 'Libs/pubSub',
        json: 'Libs/json',
        tristate: 'Libs/tristate',
        vistaTextbox: 'Libs/vistaTextbox',
        Plupload: 'Libs/Plupload',
        soundManager: 'Libs/soundmanager/soundmanager2',        
        vkApiSource: 'http://vk.com/js/api/xd_connection.js?2',
        vk: 'Modules/vk',                                               //<- use this alias for VK Api
        elixir: 'Modules/elixir',
        htmlBuilder: 'Modules/htmlBuilder',
        jqueryui: 'Libs/jquery-ui-1.10.0',
        customFormElem: 'Libs/customFormElements',        
        rollbar: "Libs/scroll/jquery.rollbar",
        carousel: 'Libs/jquery.carouFredSel-6.2.0',
        welcomeHtml: 'Modules/welcomeHtml',
        dialog: 'Modules/dialog',
        placeHolder: ""
    },
    shim: {
        vkApiSource: {
            deps: [],
            exports: 'VK'
        }
    }
};

if (global.mode == "dev") {
    config.paths.vk = 'Modules/vkStub';
    config.paths.elixir = 'Modules/elixirStub';
}

if (global && global.appVer)
    config.urlArgs = "cacheFix=" + global.appVer;

require.config(config);