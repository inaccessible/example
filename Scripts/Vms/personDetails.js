define(["ko", "pubSub", "Vms/Extensions/Routing", "Types/Artist", "Types/User", "Vms/search"],
    function (ko, pubSub, RoutingExtension, Artist, User, searchVm) {

        var detailPageSelector = "#artistDetailVm .personInfoBlock";
        var infoPageSelector = "#artistDetailVm .artistDetails";

        function PersonDetailsVm(mode) {
            var self = this,
                carouselSelector,
                carouselSettings;

            if (mode == "artist") {
                carouselSelector = detailPageSelector + " .sliderBlock",
                carouselSettings = {
                    circular: false,
                    width: 559,
                    height: 150,
                    infinite: false,
                    auto: false,
                    align: "left",
                    scroll: { items: 2, visible: 5 },
                    prev: { key: "left", button: detailPageSelector + " .slider_prev" },
                    next: { key: "right", button: detailPageSelector + " .slider_next" }
                };
            }

            // Data
            self.mode = mode;
            self.isPlayerVisible = true;
            RoutingExtension(self, mode, "Люди");
            self.person = ko.observable();

            // Behavior
            self.searchByStyle = function (style) {
                self.navigate("/search/artists?clean=true&styleId=" + style.id);
            };

            self.toggleInfo = function () {
                //$(detailPageSelector + ", " + infoPageSelector).toggle("slide", { direction: "left" }, 200);
            };


            self.openTracks = function () {
                self.navigate("/search/tracks");
            };

            self.openAlbums = function () {
                self.navigate("/search/albums");
            };

            self.openAlbum = function (album) {
                self.navigate("/search/album?clean=true&id=" + album.id);
            };

            // Events
            self.onShow = function (args) {
                if (!args) throw "detail view can't be opened w/o args";
                if (!args.id) throw "id is mandatory parameter";

                //$(detailPageSelector).show();
                //$(infoPageSelector).hide();

                if (args.clean == "true") {
                    self.person(null);
                    pubSub.pub("scroll.reset");
                    pubSub.pub("scroll.update");
                }

                var Ctor = mode == "artist" ? Artist : User;

                Ctor.load(args.id, function (person) {
                    searchVm[mode](person);

                    $(carouselSelector).trigger("destroy");
                    self.person(person);
                    $(carouselSelector).carouFredSel(carouselSettings);

                    pubSub.pub("scroll.reset");
                    pubSub.pub("scroll.update");
                });
            };
        }

        return PersonDetailsVm;
    })