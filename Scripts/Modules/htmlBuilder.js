define([], function () {
    var traceNeeded;
    var builder = {
        build: function (onComplete) {
            var $allStubs = $(".stub");
            var stubToReplace = $allStubs.length;

            if (traceNeeded) console.warn(stubToReplace + " stubs found");
            if (stubToReplace == 0) {
                onComplete();
                return;
            }

            
            $allStubs.each(function () {
                var $domStub = $(this);
                $domStub.removeClass("stub");
                var sourceName = "Html/" + $domStub.attr("class") + ".html";

                if (traceNeeded) console.warn(sourceName + " source is requested");
                
                $.get(sourceName, function (html) {
                    if (traceNeeded) console.warn(sourceName + " source is retreived");
                    $domStub.replaceWith(html);
                    if (traceNeeded) console.warn(sourceName + " source is replaced (stub to replace left: " + (stubToReplace - 1) + ")");
                    if (--stubToReplace == 0) onComplete();                   
                });
            });            
        }
    };

    return builder;
});