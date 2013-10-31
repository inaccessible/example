define(["ko", "elixir", "Types/Genre"], function (ko, elixir, Genre) {

    var preloadedDtos;
    var genreDict = {};
    var styleDict = {};

    function GenreSelector(searchParams) {
        var self = this;
        
        // DATA
        self.genres = [];
        $.each(preloadedDtos, function() {
            var genre = new Genre(this, searchParams);
            self.genres.push(genre);                                                // add genre to GenreSelector         
            genreDict[genre.id] = genre;                                            // add genre to genreDict
            $.each(genre.styles, function () { styleDict[this.id] = this; });       // add styles to styleDict
        });
        
        // Behavior
        self.getGenre = function (id) {
            return genreDict[id];
        };

        self.getStyle = function (id) {
            return styleDict[id];
        };
        
        self.onGenreClick = function (genre) {
            searchParams.styleId(0);         // !!!keep this line first
            searchParams.genreId(genre.id);
            console.log("genre seleted: " + genre.name);
        };

        self.onStyleClick = function (style) {
            searchParams.styleId(style.id);
            searchParams.genreId(style.genre.id);
            console.log("style seleted: " + style.name);
        };
    }
    
    GenreSelector.preloadGenres = function (onComplete) {
        elixir.getGenres(function (response) {
            preloadedDtos = $.getNamedArray(response, "genres");
            preloadedDtos.splice(0, 0, { id: 0, name: "Все жанры", styles: { style: [] } });
            
            onComplete();
        });
    };    

    GenreSelector.extendWithStyleAndGenres = function(target, styleIds) {
        target.styles = [];
        target.genres = [];
        
        $.each(styleIds, function () {
            // add style
            var style = styleDict[this];            
            target.styles.push(style);
            
            // add genre
            if ($.inArray(style.genre, target.genres) == -1)
                target.genres.push(style.genre);
        });

    };

    return GenreSelector;
})