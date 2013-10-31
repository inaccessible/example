define(function () {
    var cache = {};
    //var regexSubs = []; // contains an array of subscribtion pairs ([eventRegex,callback],[eventRegex,callback],...]
    //var globalSubs = []; // contains just array of callbacks which are invloked every time and context is set to event name

    return {
        pub: function (eventName) {
            /// <summary>
            /// Trigger some event.
            /// Event Args can be passed after eventName parameter
            /// </summary>
            /// <param name="eventName" type="String">Name of event to trigger</param>            

            var args = Array.prototype.slice.call(arguments, 1);

            if (!cache[eventName]) {
                cache[eventName] = [];
            }

            // send to regular subs
            var subAmount = cache[eventName].length;
            for (var i = 0; i < subAmount; i++) {
                cache[eventName][i].apply(null, args);
            }
            
            //// send to regex subs
            //var regexSubAmount = regexSubs.length;
            //for (var j = 0; j < regexSubAmount; j++) {                
            //    for (var event in cache) {
            //        var regex = regexSubs[j][0];
            //        var callback = regexSubs[j][1];
            //        if (regex.test(event))
            //            callback.apply(null, args);
            //    }
            //}
            
            //// send to globals subs            
            //for (var k = 0; k < globalSubs.length; k++) {
            //    globalSubs[k].apply(null, arguments); // pass arguments instead of args as in global subs we need event name
            //}
        },
        sub: function (eventName, callback) {
            if (!cache[eventName]) {
                cache[eventName] = [callback];
            } else {
                cache[eventName].push(callback);
            }
        },
        //subRegex: function(eventRegex, callback) {
        //    regexSubs.push([new RegExp(eventRegex), callback]);
        //},
        //subGlobal: function (callback) {
        //    globalSubs.push(callback);
        //},
        unsub: function (eventName, callback) {
            if (!eventName) return;

            //if (typeof eventName == "function")
            //    callback = eventName; // for global unsub

            if (!callback) {
                cache[eventName] = [];
            } else {
                // regular subs
                var index = $.inArray(callback, cache[eventName]);
                if (index > -1) {
                    cache[eventName].splice(index, 1);
                }
                
                //// regex subs
                //var regexSubAmount = regexSubs.length;
                //for (var i = 0; i < regexSubAmount; i++) {
                //    if (regexSubs[i][1] == callback) {
                //        regexSubs.splice(i, 1); // remove subscribtion pair
                //        break;
                //    }
                //}
                
                //// global subs
                //var globalSubAmount = globalSubs.length;
                //for (var j = 0; j < globalSubAmount; j++) {
                //    if (globalSubs[j] == callback)
                //        globalSubs.splice(j--, 1); //decrement j as removed item from globalSubs, so we need to step back
                //}
            }
        }
    };
});