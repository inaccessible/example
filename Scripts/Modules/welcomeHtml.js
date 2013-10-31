define([], function () {
    var welcomeHtmlBuilder = {
        build: function (onComplete) {
            var sliderImagesPath = "Images/events/sliderImages/";

            global.welcomeData = [
                {
                    imageUrl: sliderImagesPath + 'rihanna.png',
                    title: 'Концерт Рианы  в Барселоне',
                    fileName: 'rihanna.html'
                    
                },
                {
                    imageUrl: sliderImagesPath + 'novarock.png',
                    title: 'Феситваль Novarock в Германии',
                    fileName: 'novarock.html'
                },
                {
                    imageUrl: sliderImagesPath + 'sensation.png',
                    title: 'Sensation White в Амстердаме',
                    fileName: 'sensation.html'
                }
            ];            

            var imagesLoaded = 0;
            $.each(global.welcomeData, function (i, data) {
                $.ajax({
                    url: data.imageUrl,
                    complete: function() {
                        imagesLoaded++;
                        if (imagesLoaded == global.welcomeData.length) {
                            onComplete();
                        }
                    }
                });
            });
        }
    };

    return welcomeHtmlBuilder;
});