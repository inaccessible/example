define([], function () {
    var musicTabs = [
        { tabText: "Треки", viewName: "tracks" },
        { tabText: "Альбомы", viewName: "albums" },
        { tabText: "Плейлисты", viewName: "playlists" }
    ];
    
    var peopleTabs = [
        { tabText: "Исполнители", viewName: "artists" },
        { tabText: "Слушатели", viewName: "users" }
    ];

    function TabExtension(self, mode) {
        self.tabs = mode != "people" ? musicTabs : peopleTabs;

        self.onTabClick = function (tab) {
            // prevent navigation to selected tab
            if (self.name == tab.viewName)
                return;
                        
            self.navigate("/search/" + tab.viewName);
        };       
    }

    return TabExtension;
})