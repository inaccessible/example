define(["ko", "pubSub", "elixir", "Types/GenreSelector", "Types/Track", "Types/Album"], function (ko, pubSub, elixir, GenreSelector, Track, Album) {

    var deps = arguments;
    function ensureDeps() {
        if (!ensureDeps.ensured) {
            ensureDeps.ensured = true;
            Album = require("Types/Album");
            Track = require("Types/Track");
            for (var key in deps) {
                if (!deps[key]) throw "User module invoked ensureDeps, but coundn't resolve '" + key + "'";
            }
        }
    }

    var cache = {};        

    User.get = function(idOrMeta) {
        if (!idOrMeta)
            throw "To get an user you have to pass 'id' or 'metadata'";

        var id = typeof idOrMeta != "object" ? idOrMeta : idOrMeta.id,
            metadata = typeof idOrMeta != "object" ? { id: id } : idOrMeta,
            person = cache[id];

        if (!person)
            cache[metadata.id] = (person = new User(metadata));
        //else if (!person.isFullyLoaded)
        //    User.call(person, metadata);

        return person;
    };


    // LOAD LEVELS:
    // atrist for track:    id, name
    // similar item:        id, name, image
    // search result:       id, name, image, info, stats, styles
    // full                 id, name, image, info, stats, styles, tracks, albums, similar
    function User(metadata) {
        ensureDeps();
        
        // DATA
        var self = this;

        self.isFullyLoaded = metadata.hasOwnProperty("tracks") || metadata.hasOwnProperty("albums") || metadata.hasOwnProperty("similar");
            
        var simpleProps = ["id", "name", "info", "stats"];
        $.copyProps(self, metadata, simpleProps);
        
        //parse Big and Small image properly
        if (metadata.image) {
            self.image = true;
            if (metadata.tracks) self.bigImage = metadata.image;
            else self.smallImage = metadata.image;
        }                   

        var styleIds = $.getNamedArray(metadata, "styles");
        GenreSelector.extendWithStyleAndGenres(self, styleIds);

        self.tracks = [];
        $.each($.getNamedArray(metadata, "tracks"), function () {
            self.tracks.push(new Track(this));
        });

        self.albums = [];        
        self.similars = [];        

        // BEHAVIOR
        self.imageUrl = function (size) {
            if (size == "large") return self.smallImage;
            if (size == "big") return self.bigImage;
        };
        
        self.load = function (onComplete) {
            if (self.load.started || self.isFullyLoaded) {
                onComplete(self);
            } else {
                self.load.started = true;
                elixir.get("userInfo", { id: self.id }, function (response) {
                    User.call(self, response.listener);

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
            global.router.navigate("/user?clean=true&id=" + self.id);
        };

        self.openDetails = function () {
            global.router.navigate("/user?id=" + self.id);
        };
    }

    return {
        get: User.get,
        load: function (id, onComplete) {
            var artist = User.get(id);
            artist.load(onComplete);
        }
    };
})


