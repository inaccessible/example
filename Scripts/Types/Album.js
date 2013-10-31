define(["ko", "pubSub", "vk", "elixir", "Types/GenreSelector", "Types/Track", "Types/Artist"],
    function (ko, pubSub, vk, elixir, GenreSelector, Track, Artist) {
       
        function ensureDeps() {
            if (!ensureDeps.ensured) {
                ensureDeps.ensured = true;

                GenreSelector = $.ensureDep("GenreSelector", "Album");
                Track = $.ensureDep("Track", "Album");
                Artist = $.ensureDep("Artist", "Album");
            }
        }


        var cache = {};

        var maturities = [
            {
                level: 0,
                props: ["id"],
                optionalProps: [],
                description: "album with ID only"
            }, {
                level: 1,
                props: ["name", "image"],
                optionalProps: [],
                description: "album for similar collection"
            }, {
                level: 2,
                props: ["artists", "styles", "stats"],
                optionalProps: ["release"],
                description: "album for search result"

            }, {
                level: 3,
                props: ["similar", "tracks"],
                optionalProps: [],
                description: "album with all details"
            }
        ];


        function Album(metadata) {
            var self = this;
            ensureDeps();

            // DATA        
            self.maturity = $.getMaturity(metadata, maturities);
            $.parseSimpleMetadata(self, metadata, maturities);

            if (typeof metadata.release == "string" && metadata.release.length > 0) {
                var end = metadata.release.indexOf(",") != -1 ? metadata.release.indexOf(",") : metadata.release.length;
                self.release = metadata.release.substring(0, end);
            } else {
                self.release = "не известна";
            }

            self.artists = [];
            if (metadata.artists) {
                var artists = $.getNamedArray(metadata, "artists");
                $.each(artists, function () { self.artists.push(Artist.get(this)); });
            }

            self.similars = [];
            if (metadata.similar) {
                var similars = $.getNamedArray(metadata, "similar", "album");
                $.each(similars, function () {
                    self.similars.push(Album.get(this));
                });
            }

            var styleIds = $.getNamedArray(metadata, "styles");
            GenreSelector.extendWithStyleAndGenres(self, styleIds);

            self.tracks = [];
            $.each($.getNamedArray(metadata, "tracks"), function () {
                self.tracks.push(new Track(this));
            });

            // BEHAVIOR
            self.load = function (onComplete) {
                if (self.load.started || self.maturity.level == maturities.length - 1) {
                    onComplete(self);
                } else {
                    self.load.started = true;
                    elixir.get("albumInfo", { id: self.id }, function (response) {
                        Album.call(self, response.album);

                        vk.appendVkData(self.tracks, function () {
                            onComplete(self);
                        });
                    });
                }
            };

            self.imageUrl = function (size) {
                return window.global.imageUrl + "?id=" + self.image + "&size=" + size;
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
                global.router.navigate("/search/album?clean=true&id=" + self.id);
            };
            
            self.openDetails = function () {
                global.router.navigate("/search/album?id=" + self.id);
            };
        }



        Album.get = function (idOrMeta) {
            if (!idOrMeta)
                throw "To get an album you have to pass 'id' or 'metadata'";

            var id = typeof idOrMeta != "object" ? idOrMeta : idOrMeta.id,
                metadata = typeof idOrMeta != "object" ? { id: id } : idOrMeta,
                album = cache[id];

            if (!album) {
                album = new Album(metadata);
                cache[album.id] = album;
                return album;
            } else {
                var metaMaturity = $.getMaturity(metadata, maturities);
                if (metaMaturity.level > album.maturity.level) Album.call(album, metadata);
                return album;
            }
        };

        return {
            get: Album.get,
            load: function (id, onComplete) {
                var album = Album.get(id);
                album.load(onComplete);
            }
        };
    })


