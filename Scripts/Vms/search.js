define(["ko", "pubSub", "Vms/Extensions/Routing", "Types/FancyDropItem", "Types/GenreSelector", "Types/NavLink",
        "Vms/Search/tracks", "Vms/Search/track",
        "Vms/Search/searchAlbums", "Vms/Search/albumDetails",
        "Vms/Search/searchPersons", "dialog"],
    function (ko, pubSub, RoutingExtension, FancyDropItem, GenreSelector, NavLink,
        SearchTracksVm, TrackDetailsVm,
        SearchAlbumsVm, AlbumDetailsVm,
        SearchPersonsVm, dialog) {

        // Munu items  
        var timeRanges = [
            new FancyDropItem("all", "За все время", "За все время"),
            new FancyDropItem("year", "За год", "Поиск за год"),
            new FancyDropItem("month", "За месяц", "Поиск за месяц"),
            new FancyDropItem("week", "За неделю", "Поиск за неделю")
        ];

        var orderTypes = [
            new FancyDropItem("popular", "Популярное", " По популярности",/*cssClass*/"popular"),
            new FancyDropItem("interesting", "Рекомендации", "Рекомендуемое Эликсиром", /*cssClass*/"recomenadation"),
            new FancyDropItem("new", "Новинки", "По дате добавления", /*cssClass*/"new")
        ];

        var albumSearchModes = [
            new FancyDropItem("all", "по всему", "Поиск по альбомам и артистам"),
            new FancyDropItem("album_name", "по альбому", "Поиск только по альбомам"),
            new FancyDropItem("artist_name", "по исполнителю", "Поиск только по артистам")
        ];

        var playlistSearchModes = [
            new FancyDropItem("all", "по всему", "Поиск по плейлистами и исполнителям"),
            new FancyDropItem("playlist_name", "по плейлисту", "Поиск только по плейлистам"),
            new FancyDropItem("artist_name", "по исполнителю", "Поиск только по исполнителям")
        ];

        function setupVms(self) {
            // Tracks
            self.addVm(new SearchTracksVm(self));
            self.addVm(new TrackDetailsVm(self));

            // Albums
            var searchAlbumVm = new SearchAlbumsVm(self, {
                containerId: "searchAlbumsVm",
                vmId: "albums",
                searchModes: albumSearchModes,
                searchResultSuffix: " альбомов"
            });
            var albumDetailVm = new AlbumDetailsVm(self, {
                containerId: "albumDetailsVm",
                vmId: "album"
            });
            self.addVm(searchAlbumVm);
            self.addVm(albumDetailVm);

            // Playlists
            var searchPlaylistVm = new SearchAlbumsVm(self, {
                containerId: "playlistAlbumsVm",
                vmId: "playlists",
                searchModes: playlistSearchModes,
                searchResultSuffix: " плейлистов"
            });
            var playlistDetailVm = new AlbumDetailsVm(self, {
                containerId: "playlistDetailsVm",
                vmId: "playlist"
            });
            self.addVm(searchPlaylistVm);
            self.addVm(playlistDetailVm);

            // People
            self.addVm(new SearchPersonsVm(self, "artist"));
            self.addVm(new SearchPersonsVm(self, "user"));
        }

        function SearchVm() {
            var self = this;

            RoutingExtension(self, "search");
            setupVms(self);

            // DATA
            // Search params
            self.timeRange = ko.observable("all");
            self.orderType = ko.observable("popular");
            self.genreId = ko.observable(0);
            self.styleId = ko.observable(0);
            self.isHighQuality = ko.observable(false);

            self.artist = ko.observable();
            self.user = ko.observable();
            self.navLink = new NavLink(self);
            
            self.genreSelector = global.genreSelector = new GenreSelector(self);
            self.timeRanges = ko.observableArray(timeRanges);
            self.orderTypes = ko.observableArray(orderTypes);

            self.about = function() {
                dialog.open({
                    type: 'help'
                });
                $('.aboutTab').trigger('click');
            };

            // subscribe to param updates
            var searchParams = ["genreId", "styleId", "orderType", "timeRange", "isHighQuality", "artist", "user"];
            $.each(searchParams, function (i, propName) {
                self[propName].subscribe(function() {
                     pubSub.pub("search.changed", propName);
                });
            });

            self.getParams = function () {
                var params = {};

                $.each(searchParams, function (i, propName) {
                    params[propName] = self[propName]();
                });

                params["artist"] = self.artist() ? self.artist().id : 0;
                params["user"] = self.user() ? self.user().id : 0;

                return params;
            };
        }

        return new SearchVm();
    })