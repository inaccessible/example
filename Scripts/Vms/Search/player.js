define(["ko", "pubSub", "Types/Track", "Types/TrackForPlayer", "Types/SequenceMananager", /*plugins w/o export*/ "jqueryui", "rollbar"],
function (ko, pubSub, Track, TrackForPlayer, sequenceManager) {

    $("#playerContent").bind('mousewheel DOMMouseScroll', function (e) {
        return false;
    });

    var rollbar = $(".trackListBlock").rollbar({
        minThumbSize: '10%',
        pathPadding: '3px',
        zIndex: 100
    });


    //View Player View Model
    function PlayerVm() {
        var self = this;

        // DATA
        self.isVisible = ko.observable();

        self.positionSliderOptions = {
            vmPropName: "positionSlider",
            range: "min",
            min: 0,
            max: 0,
            value: 0,
            animate: true,
            slide: function (event, ui) { self.refreshPosition(ui.value); }
        };
        self.sliderValue = function (value) {
            return typeof value == "undefined"
                ? self.positionSlider.slider("option", "value")
                : self.positionSlider.slider("option", "value", value);
        };
        self.sliderMaxValue = function (value) {
            return typeof value == "undefined"
                ? self.positionSlider.slider("option", "max")
                : self.positionSlider.slider("option", "max", value);
        };

        self.volumeSliderOptions = {
            vmPropName: "volumeSlider",
            range: "min",
            min: 0,
            max: 100,
            value: 100,
            animate: true,
            slide: function (event, ui) {
                self.isMuted(false);
                self.volume(ui.value);
                self.refreshVolume();
            }
        };
        self.volumeSilderValue = function (value) {
            // dirty fix as volume is updated because of toggle button initialization, 
            // but slider binding for volumeSlider is not applied at that moment
            if (!self.volumeSlider) return undefined;

            return typeof value == "undefined"
                ? self.volumeSlider.slider("option", "value")
                : self.volumeSlider.slider("option", "value", value);
        };


        self.track = ko.observable();
        self.tracks = ko.observableArray();
        self.state = ko.observable("paused"); //playing, paused, stoped
        self.position = ko.observable(0);
        self.volume = ko.observable(100);
        self.isElapsed = ko.observable(true);
        self.isShuffled = ko.observable(false);
        self.isLooped = ko.observable(false);
        self.isMuted = ko.observable(false);
        self.time = ko.computed(function () {
            if (!self.track()) return "0:00";

            var pos;
            if (!self.isElapsed()) {
                pos = self.position();
                return Track.toTimeString(pos);
            } else {
                pos = self.track().duration - self.position();
                return "-" + Track.toTimeString(pos);
            }
        });

        self.albumName = ko.computed(function () {
            if (!self.track()) return "";

            return self.track().data.album.name;
        });
        self.sound = function () {
            if (!self.track())
                return null;

            var id = self.track().id;
            var url = self.track().url;

            return soundManager.getSoundById(id)
                || soundManager.createSound({
                    id: id,
                    url: url,
                    whileloading: function () {
                        refreshLoadProgress(this);
                    },
                    onload: function () {
                        refreshLoadProgress(this);
                    },
                    whileplaying: function (a, b, c) {
                        var posInSecs = this.position / 1000;
                        self.refreshPosition(posInSecs, true /*skipSoundUpdate*/);
                    },
                    onfinish: function () {
                        onTrackComplete();

                        // see if we can play something
                        if (self.isLooped())
                            play();
                        else
                            self.next();

                        if (self.tracks().length == 0)
                            self.track(null);
                    }
                });
        };

        self.imageVisibility = ko.computed(function () {
            return self.track() && self.track().data.imageId();
        });
        self.imageUrl = function (size) {
            return self.state() != "stopped" && self.track()
                ? self.track().data.getImageUrl(size)
                : "";
        };
        self.trackCaption = ko.computed(function () {
            var title,
                i,
                track = self.track();

            if (!track)
                title = "";
            else {
                title = track.title + " - ";
                for (i = 0; i < track.artists.length; i++) {
                    var artist = track.artists[i];
                    var isLast = i == track.artists.length - 1;
                    title += artist.name;
                    if (!isLast) title += ", ";
                }
            }

            return title;
        });


        // BEHAVIOR        
        self.playPause = function () {
            if (self.state() != "playing")
                play();
            else
                pause();
        };

        self.next = function () {
            if (!self.track()) return;

            onTrackComplete();

            var curIndex = self.tracks.indexOf(self.track());
            var trackLength = self.tracks().length;
            var isShuffled = self.isShuffled();
            var newIndex = sequenceManager.getNext(curIndex, trackLength, isShuffled);

            self.track(self.tracks()[newIndex]);
            if (self.state() == "playing") play();
        };

        self.prev = function () {
            if (!self.track()) return;

            onTrackComplete();

            var curIndex = self.tracks.indexOf(self.track());
            var trackLength = self.tracks().length;
            var isShuffled = self.isShuffled();
            var newIndex = sequenceManager.getPrev(curIndex, trackLength, isShuffled);

            self.track(self.tracks()[newIndex]);
            if (self.state() == "playing") play();
        };

        self.refreshVolume = function () {
            var resolvedVolume = !self.isMuted()
                ? self.volume()
                : 0;

            // UI            
            if (self.volumeSilderValue() != resolvedVolume)
                self.volumeSilderValue(resolvedVolume);

            // functional update
            var sound = self.sound();
            if (sound && sound.volume != resolvedVolume) sound.setVolume(resolvedVolume);
        };

        self.refreshPosition = function (positionInSecs, skipSoundUpdate) {
            var sound = self.sound();
            if (!sound) return;

            // prevent sliding over the loaded part            
            var maxPosition = sound.duration / 1000;
            if (positionInSecs > maxPosition) positionInSecs = maxPosition;

            // UI
            if (self.sliderValue() != positionInSecs)
                self.sliderValue(positionInSecs);

            // functional update
            if (!skipSoundUpdate) sound.setPosition(positionInSecs * 1000);
            self.position(parseInt(positionInSecs));
        };

        self.clearPlaylist = function () {
            //stop();
            self.tracks.removeAll();
            //self.track(null);
            //refreshSliderLength();
        };

        self.expand = function () {
            if ($('.playerBlock').hasClass('fullView')) return;
            
            $('.playerHeader').animate(
            {
                height: ['toggle', 'swing'],
                opacity: 'toggle'
            },
            200,
            'linear',
            function () {
                rollbar.update();
            });


            $('.playerPlaylistBlock').animate({
                height: ['toggle', 'swing'],
                opacity: 'toggle'
            }, 200, 'linear');

            $('.lockBackground').show();
            $('.playerBlock').addClass('fullView');
        };

        self.collapse = function () {
            if ($('.playerBlock').hasClass('fullView')) {
                $('.playerHeader').animate({
                    height: ['toggle', 'swing'],
                    opacity: 'toggle'
                }, 200, 'linear');

                $('.playerPlaylistBlock').animate({
                    height: ['toggle', 'swing'],
                    opacity: 'toggle'
                }, 200, 'linear');
                $('.lockBackground').hide();
                $('.playerBlock').removeClass('fullView');
            }
        };

        self.openAlbumDetails = function () {
            if (!self.track() || !self.track().data.album) return;
            self.collapse();
            self.track().data.album.openCleanDetails();
        };

        self.openTrackDetails = function () {
            if (!self.track()) return;
            self.collapse();
            self.track().data.openCleanDetails();
        };

        self.openArtistDetails = function (artist) {
            self.collapse();
            artist.openCleanDetails();
        };

        self.setGenre = function (genre) {
            self.collapse();
            //global.genreSelector.onGenreClick(genre);
            global.router.navigate("/search/tracks?genreId=" + genre.id);
        };

        self.setStyle = function (style) {
            self.collapse();
            //global.genreSelector.onStyleClick(style);
            global.router.navigate("/search/tracks?styleId=" + style.id);
        };

        // EVENTS
        pubSub.sub("player.addToStart", function (tracks, playFirst) {
            if (!$.isArray(tracks)) tracks = [tracks];

            for (var i = tracks.length - 1; i >= 0; i--) {
                prependTrack(tracks[i]);
            }

            if (playFirst !== false) {
                self.track(self.tracks()[0]);
                play();
            }
        });

        pubSub.sub("player.addToEnd", function (tracks) {
            var wasPlaylistEmtpy = self.tracks().length == 0;

            if (!$.isArray(tracks)) tracks = [tracks];
            $.each(tracks, function () { appendTrack(this); });

            if (wasPlaylistEmtpy) {
                self.track(self.tracks()[0]);
                play();
            }
        });

        var hasPendingRedraw = false;
        self.tracks.subscribe(function () {
            if (hasPendingRedraw)
                return;

            hasPendingRedraw = true;

            setTimeout(function () {
                rollbar.update();
                hasPendingRedraw = false;
            }, 300);

        });

        pubSub.sub("trackForPlayer.onDeleteClick", function (deletedTrack) {
            var index = self.tracks.indexOf(deletedTrack);
            self.tracks.splice(index, 1);
        });

        pubSub.sub("trackForPlayer.onClick", function (track) {
            if (self.track() == track)
                return;

            self.track(track);
            play();
        });

        self.isMutedTooltip = ko.computed(function (val) {
            return (self.isMuted()) ? "Включить звук" : "Отключить звук";

        });

        self.isLoopedTooltip = ko.computed(function (val) {
            return (self.isLooped()) ? "Отключить повторение" : "Включить повторение";

        });


        // Helpers
        function prependTrack(track) {
            self.tracks.splice(0, 0, new TrackForPlayer(track));
        }

        function appendTrack(track) {
            self.tracks.push(new TrackForPlayer(track));
        }

        function play() {
            var sound = self.sound();
            if (!sound) return;

            refreshLoadProgress(sound);

            if (sound.paused) {
                sound.resume();
            } else {
                stop();
                sound.play();
                refreshSliderLength();
            }

            self.state("playing");
        }

        function stop() {
            self.state("stoped");
            if (!self.track()) return;

            soundManager.stopAll();
            refreshSliderLength();
        }

        function pause() {
            var sound = self.sound();
            if (!sound) return;

            sound.pause();
            self.state("paused");
        }

        function refreshSliderLength() {
            if (!self.track() || self.state() == "stopped")
                self.sliderMaxValue(0);
            else
                self.sliderMaxValue(self.track().duration);
        }

        function refreshLoadProgress(sound) {
            var progress = Math.round(sound.bytesLoaded / sound.bytesTotal * 100);
            $("#playerContent .trackLoaderBar").width(progress + "%");
        }

        function onTrackComplete() {
            if (!self.track()) return;

            var isGhostTrack = (0 == $.grep(self.tracks(), function (elem) { return elem.id == self.track().id; }).length);
            if (isGhostTrack) soundManager.destroySound(self.track().id);
        }
    }

    return new PlayerVm();
})
