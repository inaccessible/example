define([], function () {
    var apiUrl = "http://api.elixirvk.com/services/";
    //var apiUrl = "http://elexircp.evo-studio.com/request/";

    var urls = {
        genres: getUrl("genres"),

        searchTracks: getUrl("tracks"),
        searchAlbums: getUrl("albums"),
        searchArtists: getUrl("artists"),
        searchUsers: getUrl("users"),
        
        trackInfo: getUrl("track"),        
        albumInfo: getUrl("album"),        
        artistInfo: getUrl("artist"),
        userInfo: getUrl("user")
    };

    function getUrl(name) {
        return apiUrl + name + "/?json=1";
    }


    function ajax(url, params, onSuccess) {
        if (typeof params == "function") {
            onSuccess = params;
            params = null;
        }

        $.ajax({
            url: url,
            data: params,
            error: function (jqXHR, textStatus, errorThrown) {
                throw "ajax error in elixirApi.getTracksMetadata. Status: " + textStatus + "; error: " + errorThrown;
            },
            success: function (response) {
                if (response.error)
                    throw "error has occured on the server (code: " + response.error["-code"] + ")";
                else if (!response)
                    throw "server returned neither results nor error";

                onSuccess(response.results || response);
            }
        });
    }

    var elixirApi = {
        get: function (requestType, params, onSuccess) {
            ajax(urls[requestType], params, onSuccess);
        },
        searchTracks: function (params, onSuccess) {
            ajax(urls.tracks, params, onSuccess);
        },
        getGenres: function (onSuccess) {
            ajax(urls.genres, onSuccess);
        }
    };

    return elixirApi;
})