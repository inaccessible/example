define(["ko", "pubSub", "Modules/dal", "Vms/Extensions/Routing", "Vms/Extensions/Tabs"],
    function (ko, pubSub, dal, RoutingExtension, TabsExtension) {
        function TrackVm(searchVm) {
            var self = this;

            // Data
            self.isPlayerVisible = true;
            RoutingExtension(self, "track", "Музыка");
            TabsExtension(self, "music");
            self.track = ko.observable();
            self.showAll = ko.observable();
            self.similars = ko.observableArray();

            // Behavior
            self.toggleShowAll = function () {
                self.showAll(!self.showAll());
                pubSub.pub("scroll.update");
            };

            self.playSimilars = function () {
                pubSub.pub("player.addToStart", self.track().similars);
            };

            self.playAlbum = function () {
                if (!self.track()) return;
                self.track().album.play();
            };

            self.appendAlbum = function() {
                if (!self.track()) return;                
                self.track().album.append();
            };

            self.searchByGenre = function (genre) {
                self.navigate("/search/tracks?genreId=" + genre.id);
            };
            
            self.searchByStyle = function (style) {
                self.navigate("/search/tracks?styleId=" + style.id);
            };

            // Events
            pubSub.sub("search.changed", function (propName) {
                if (self.isVisible() && (propName == "genreId" || propName == "styleId"))
                    self.navigate("/search/tracks");
            });
            
            self.onShow = function (args) {
                if (!args) throw "track view can't be opened w/o args";
                if (!args.id) throw "id is mandatory parameter";

                if (args.clean == "true") {
                    self.track(null);                                        
                    self.showAll(false);

                    pubSub.pub("scroll.reset");
                    pubSub.pub("scroll.update");
                }
                


                dal.trackInfo(args.id, function (track) {
                    self.track(track);

                    self.similars.removeAll();
                    $.each(track.similars, function() { self.similars.push(this); });                    

                    pubSub.pub("scroll.reset");
                    pubSub.pub("scroll.update");
                });
            };
        }

        return TrackVm;
    })