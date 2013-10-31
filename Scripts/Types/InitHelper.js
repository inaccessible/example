define(["pubSub"], function (pubSub) {
    function InitHelper(componentName, initLogic) {
        var self = this;

        self.retryAmount = 3;
        self.retryTimeout = 2000;
        self.initCompleted = false;
        
        self.onComplete = function () {
            if (self.initCompleted) return;
            
            self.initCompleted = true;
            pubSub.pub("componentInited", componentName);            
        };

        self.initWithRetry = function () {
            try {
                initLogic(self);
            }
            catch (e) {
                console.log("Exception in " + componentName + ".init: " + e);
            }

            setTimeout(function () {
                self.retryAmount -= 1;
                if (self.retryAmount == 0) return;
                if (self.initCompleted) return;

                console.error(componentName + " failed to init. Retrying init proccess...");
                self.initWithRetry();
            }, 2000);
        };        
    }
    
    
    return {
        init: function(componentName, initLogic) {
            var initer = new InitHelper(componentName, initLogic);
            initer.initWithRetry();
        }
    };
})