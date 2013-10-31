define(["ko", "pubSub", "Vms/Extensions/Routing", "Vms/Extensions/Tabs", "Types/Album"],
    function (ko, pubSub, RoutingExtension, TabsExtension, Album) {
        function AlbumDetailsVm(searchVm, options) {
            var self = this,
                carouselSelector = "#" + options.containerId + " .sliderBlock",
                carouselSettings = {
                    circular: false,
                    width: 559,
                    height: 150,
                    infinite: false,
                    auto: false,
                    align: "left",
                    scroll: { items: 2, visible: 5 }                    
                };

            carouselSettings.prev = { key: "left", button: "#" + options.containerId + " .slider_prev" };
            carouselSettings.next = { key: "right", button: "#" + options.containerId + " .slider_next" };

            // Data
            self.isPlayerVisible = true;
            RoutingExtension(self, options.vmId, "Музыка");
            TabsExtension(self, "music");
            self.album = ko.observable();            

            // Behavior
            self.toggleShowAll = function () {
                self.showAll(!self.showAll());
                pubSub.pub("scroll.update");
            };

            self.playAlbum = function () {
                if (!self.album()) return;
                self.album().play();
            };

            self.appendAlbum = function () {
                if (!self.album()) return;
                self.album().append();
            };

            self.searchByGenre = function (genre) {
                self.navigate("/search/albums?genreId=" + genre.id);
            };

            self.searchByStyle = function (style) {
                self.navigate("/search/albums?styleId=" + style.id);
            };                       

            // Events
            pubSub.sub("search.changed", function (propName) {
                if (self.isVisible() && (propName == "genreId" || propName == "styleId"))
                    self.navigate("/search/albums");
            });
            
            self.onShow = function (args) {
                if (!args) throw "detail view can't be opened w/o args";
                if (!args.id) throw "id is mandatory parameter";

                if (args.clean == "true") {
                    self.album(null);
                    pubSub.pub("scroll.reset");
                    pubSub.pub("scroll.update");
                }

                Album.load(args.id, function (album) {
                    $(carouselSelector).trigger("destroy");
                    self.album(album);                    
                    $(carouselSelector).carouFredSel(carouselSettings);

                    pubSub.pub("scroll.reset");
                    pubSub.pub("scroll.update");
                });
            };
        }

        return AlbumDetailsVm;
    })