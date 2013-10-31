define(["ko", "pubSub", "elixir", "Types/GenreSelector", "Types/Track", "Types/Album"], function (ko, pubSub, elixir, GenreSelector, Track, Album) {

    function ensureDeps() {
        if (!ensureDeps.ensured) {
            ensureDeps.ensured = true;
            Album = $.ensureDep("Album", "Artist");
            Track = $.ensureDep("Track", "Artist");
        }
    }

    var cache = {};        

    Artist.get = function(idOrMeta) {
        if (!idOrMeta)
            throw "To get an artist you have to pass 'id' or 'metadata'";

        var id = typeof idOrMeta != "object" ? idOrMeta : idOrMeta.id,
            metadata = typeof idOrMeta != "object" ? { id: id } : idOrMeta,
            person = cache[id];

        if (!person)
            cache[metadata.id] = (person = new Artist(metadata));
        else if (!person.isFullyLoaded)
            Artist.call(person, metadata);

        return person;
    };


    // LOAD LEVELS:
    // atrist for track:    id, name
    // similar item:        id, name, image
    // search result:       id, name, image, info, stats, styles
    // full                 id, name, image, info, stats, styles, tracks, albums, similar
    function Artist(metadata) {
        ensureDeps();
        
        // DATA
        var self = this;

        self.isFullyLoaded = metadata.hasOwnProperty("tracks") || metadata.hasOwnProperty("albums") || metadata.hasOwnProperty("similar");
            
        var simpleProps = ["id", "name", "image", "info", "stats"];
        $.copyProps(self, metadata, simpleProps);

        var styleIds = $.getNamedArray(metadata, "styles");
        GenreSelector.extendWithStyleAndGenres(self, styleIds);

        self.tracks = [];
        $.each($.getNamedArray(metadata, "tracks"), function () {
            self.tracks.push(new Track(this));
        });

        self.albums = [];
        if (metadata.albums) {
            var albums = $.getNamedArray(metadata, "albums");
            $.each(albums, function() { self.albums.push(Album.get(this)); });
        }

        self.similars = [];
        if (metadata.similar) {
            var similars = $.getNamedArray(metadata, "similar", "artist");
            $.each(similars, function() { self.similars.push(Artist.get(this)); });
        }

        // BEHAVIOR
        self.imageUrl = function (size) {
            return window.global.imageUrl + "?id=" + self.image + "&size=" + size;
        };
        
        self.load = function (onComplete) {
            if (self.load.started || self.isFullyLoaded) {
                onComplete(self);
            } else {
                self.load.started = true;
                elixir.get("artistInfo", { id: self.id }, function (response) {
                    Artist.call(self, response.artist);

                    vk.appendVkData(self.tracks, function () {
                        onComplete(self);
                    });
                });
            }
        };
        
        self.play = function () {
            self.load(function () {
                pubSub.pub("player.addToStart", self.tracks);
            });
        };

        self.append = function () {
            self.load(function () {
                pubSub.pub("player.addToEnd", self.tracks);
            });
        };
        
        self.openCleanDetails = function () {
            global.router.navigate("/artist?clean=true&id=" + self.id);
        };

        self.openDetails = function () {
            global.router.navigate("/artist?id=" + self.id);
        };
    }

    return {
        get: Artist.get,
        load: function (id, onComplete) {
            var artist = Artist.get(id);
            artist.load(onComplete);
        }
    };
})


