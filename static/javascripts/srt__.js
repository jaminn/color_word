    ////
        function from_srt(data, ms) {
            var useMs = ms ? true : false;
            data = data.replace(/\r/g, '');
            var regex = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;
            data = data.split(regex);
            data.shift();

            var items = [];
            for (var i = 0; i < data.length; i += 4) {
                items.push({
                    id: data[i].trim(),
                    startTime: useMs ? timeMs(data[i + 1].trim()) : data[i + 1].trim(),
                    endTime: useMs ? timeMs(data[i + 2].trim()) : data[i + 2].trim(),
                    text: data[i + 3].trim()
                });
            }

            return items;
        }

    var timeMs = function(val) {
        var regex = /(\d+):(\d{2}):(\d{2}),(\d{3})/;
        var parts = regex.exec(val);

        if (parts === null) {
            return 0;
        }

        for (var i = 1; i < 5; i++) {
            parts[i] = parseInt(parts[i], 10);
            if (isNaN(parts[i])) parts[i] = 0;
        }

        // hours + minutes + seconds + ms
        return parts[1] * 3600000 + parts[2] * 60000 + parts[3] * 1000 + parts[4];
    };

     function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
     while (0 !== currentIndex) {

      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
    }