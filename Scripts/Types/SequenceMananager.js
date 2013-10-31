define([], function () {
    function SequenceMananager() {
        var self = this,
            i,
            shuffledIndexes = []; // values are indexes of tracks. Iterating those values from 0 index to last index gives us random sequence of tracks' indexes.

        function init(size) {
            // create source array
            var sequentialArray = [];
            for (i = 0; i < size; i++) sequentialArray.push(i);

            // clean up dest array
            shuffledIndexes.length = 0;

            // fill up dest array with randomly pulled values from sequential source array
            while (sequentialArray.length > 0) {
                var maxIndexToPull = sequentialArray.length - 1;
                var indexToPull = Math.floor((Math.random() * maxIndexToPull));
                var pulledValue = sequentialArray.splice(indexToPull, 1)[0];

                shuffledIndexes.push(pulledValue);
            }
        }

        self.getNext = function(curIndex, sequenceLength, isShuffled) {
            if (!isShuffled) {
                curIndex++;
                return curIndex < sequenceLength ? curIndex : 0;
            } else {
                if (shuffledIndexes.length != sequenceLength) init(sequenceLength);

                var position = $.inArray(curIndex, shuffledIndexes) + 1;
                position = position < sequenceLength ? position : 0;
                return shuffledIndexes[position];
            }
        };

        self.getPrev = function(curIndex, sequenceLength, isShuffled) {
            if (!isShuffled) {
                curIndex--;
                return curIndex >= 0 ? curIndex : sequenceLength - 1;
            } else {
                if (shuffledIndexes.length != sequenceLength) init(sequenceLength);

                var position = $.inArray(curIndex, shuffledIndexes) - 1;
                position = position >= 0 ? position : sequenceLength - 1;
                return shuffledIndexes[position];
            }
        };
    }

    return new SequenceMananager(); //works as singleton
})