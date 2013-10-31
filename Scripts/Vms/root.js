define(["ko", "pubSub", "Vms/Extensions/Routing", "Vms/welcome", "Vms/news", "Vms/search", "Vms/personDetails", "Vms/Search/player"],
    function (ko, pubSub, RoutingExtension, welcomeVm, newsVm, searchVm, PersonDetailsVm, playerVm) {


        $('a.tooltipTrack').tooltip({
            track: true,
            position: {
                my: "left+15 center",
                at: "right center"
            }
        });
        $
        ('div').tooltip();
        
        /* disable ctra + a combination */
        $(document).keydown(function (objEvent) {
            if (objEvent.ctrlKey) {
                if (objEvent.keyCode == 65) {
                    objEvent.preventDefault();
                }
            }
        });


        $("#rootVm")
            .on("mouseenter", '.hiddenPanelContainer', function () {
                var $slidePanel = $(this).find(".slidePanel");
                $slidePanel.animate({ marginTop: 0 }, 300);

                $(this).find(".fadePanel").fadeIn(300);
            })
            .on("mouseleave", '.hiddenPanelContainer', function () {
                var $slidePanel = $(this).find(".slidePanel");
                $slidePanel.animate({ marginTop: $slidePanel.height() }, 300);

                $(this).find(".fadePanel").fadeOut(300);
            });

        $('#rootVm .topNavigationExpandeble')
            .on('click', function () {
                var menu = $(this).find('.dropDownBlock');

                menu.show();
                $(this).on('mouseleave', function () {
                    menu.hide();
                });
            })
            .on('click', "li", function () {
                var menu = $(this).closest('.dropDownBlock');
                menu.hide();
                return false;
            });


        function RootVm() {
            var self = this;

            //$.extend(self, new BaseVm("root"));
            RoutingExtension(self, "root");

            // data
            self.isGoUpVisible = ko.observable(false);

            // init
            self.addVm(searchVm);
            self.addVm(welcomeVm);
            self.addVm(newsVm);
            self.addVm(new PersonDetailsVm("artist"));
            self.addVm(new PersonDetailsVm("user"));
            self.player = window.player = playerVm; // make player global to have access to its properties from some vms

            // behavior
            self.goToWelcome = function () {
                searchVm.artist(null);
                searchVm.user(null);
                self.navigate("/welcome");
            };

            self.goToEvents = function () {
                searchVm.artist(null);
                searchVm.user(null);
                self.navigate("/welcome?type=event");
            };

            self.goToMusic = function () {
                searchVm.artist(null);
                searchVm.user(null);
                self.navigate("/search/tracks");
            };

            self.goToPeople = function () {
                searchVm.artist(null);
                searchVm.user(null);
                self.navigate("/search/artists");
            };

            self.goToHome = function () {
                searchVm.artist(null);
                searchVm.user({ id: 2, name: "Александр Попов" });
                self.navigate("/user?id=2");
            };

            self.goToHomeMusic = function () {
                searchVm.artist(null);
                searchVm.user({ id: 2, name: "Александр Попов" });
                self.navigate("/search/tracks");
            };

            self.goToNews = function () {
                searchVm.artist(null);
                searchVm.user(null);
                self.navigate("/news");
            };

            self.onFavoriteClick = function (data, event) {
                $(event.currentTarget)
                    .addClass("clicked")
                    .one("mouseleave", function () {
                        $(this).removeClass("clicked");
                    });
            };

            // deal with scroll
            var rollbar = $("#scrolledContent").rollbar({
                minThumbSize: '10%',
                pathPadding: '3px',
                zIndex: 100,
                onScroll: function (scrollState) {
                    pubSub.pub("scroll.moved", scrollState);
                    refreshGoUpVisibility();
                }
            });

            self.goUp = function () {
                rollbar.scroll(0, 0);
                refreshGoUpVisibility();
            };

            pubSub.sub("scroll.reset", function () {
                rollbar.reset();
                refreshGoUpVisibility();
            });
            pubSub.sub("scroll.update", function () {
                rollbar.update();
                refreshGoUpVisibility();
            });

            function refreshGoUpVisibility() {
                self.isGoUpVisible(rollbar.state.vPxl > 560);
            }
        }

        // return singleton
        return new RootVm();
    })