define(["ko", "Vms/Extensions/Routing", "carousel", "rollbar", "dialog"], function (ko, RoutingExtension, carousel, rollbal, dialog) {

    function WelcomeVm() {
        var self = this;

        //$('.topNavigationExpandeble').on('click', function () {
        //    var menu = $($(this).find('.dropDownBlock'));

        //    menu.show();
        //    $(this).on('mouseleave', function () {
        //        menu.hide();
        //    })
        //});


        //$.extend(self, new BaseVm("welcome"));
        RoutingExtension(self, "welcome");

        self.canSeeAdditionalNavigation = ko.observable();

        self.goToTrack = function () {
            if (!self.canSeeAdditionalNavigation()) return false;
            self.navigate("/search/track");
        };

        self.goToTracks = function () {
            if (!self.canSeeAdditionalNavigation()) return false;
            self.navigate("/search/tracks?query=dido");
        };

        self.goToNews = function () {
            if (!self.canSeeAdditionalNavigation()) return false;
            self.navigate("/news");
        };

        self.onShow = function (args) {
            self.agrs = args;
            self.canSeeAdditionalNavigation((args == null || args.type == 'welcome'));
            
            if (self.canSeeAdditionalNavigation()) {
                $('.welcomeBlock').addClass('welcomeView');
                $('.welcomeBlock').removeClass('eventsView');
                $('.rightPart, .leftPart, .topPart').attr('href', 'javascript:void(0);');

            } else {
                $('.welcomeBlock').removeClass('welcomeView');
                $('.welcomeBlock').addClass('eventsView');
                $('.rightPart, .leftPart, .topPart').removeAttr('href');
            }

            if (typeof self.carousel == 'undefined') {
                self.carousel = initCarousel();
            }
        };

        self.sliderData = global.welcomeData;

        self.showPopup = function () {
            var activeSlide = $($('ul#welcomeEventSilder li:first'));
            var title = activeSlide.attr('data-title');
            var fileName = activeSlide.attr('data-file');
            
            $.ajax({
                method: 'Get',
                url: 'Html/events/' + fileName,
                beforeSend: function () {
                    $(dialog).html("");
                },
                success: function (data) {
                    dialog.open({
                        type: 'event',
                        title: title,
                        data: data,
                        onOpen: function () {
                            $(self.carousel[0]).trigger("pause");
                        },
                        onClose: function () {
                            $(self.carousel[0]).trigger("play");
                        },
                        buttons: [{
                            text: "",
                            icons: {},
                            'class': 'giftButton'
                        }]
                    });
                }
            });
        };
        
        $('body').on('click', '.showHelpPopup', function () {
            
            dialog.open({
                type: 'help'
            });
            
            $('.aboutTab').trigger('click');

        });


        var carouselInited = false;
        function initCarousel() {
            if (carouselInited) return;

            carouselInited = true;

            $('.centerBlock').fadeIn(1500);
            
            return $('.welcomeSlider').carouFredSel({
                circular: true,
                infinite: true,
                auto: {
                    play: true,
                    timeoutDuration: 7000
                },
                prev: '.slider_prevBig',
                next: '.slider_nextBig',
                align: "left"
            });
        }


    };

    return new WelcomeVm();
})
