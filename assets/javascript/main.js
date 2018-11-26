// ==================================================================================================================
// Retrieve crossword info from the GitHub archive

// Day of crossword
var year = "2000";
var month = "06";
var day = "15";

var crossWordURL = `https://raw.githubusercontent.com/doshea/nyt_crosswords/master/${year}/${month}/${day}.json`;

$.ajax({
    url: crossWordURL,
    method: "GET"
}).then(function (response) {
    // ===============================================================================================================
    // Crossword Display
    response = JSON.parse(response);
    console.log("CrossWord Creation:")
    var rows = response.size.rows;
    var cols = response.size.cols;

    console.log(response);
    console.log(`rows: ${rows}`);
    console.log(`cols: ${cols}`);

    //Figure out board dimensions
    var crosswordHolder = $("<div class='grid-holder'>");
    //Calculate square sizes
    //Square Creation
    for (var i = 0; i < rows; i++) {
        var newRow = $("<div class='row-holder'>");
        for (var j = 0; j < cols; j++) {
            var count = i * cols + j;
            //Assign Letter Value/Clue Number Value
            var letterHolder = $("<div class='letter-holder'>");
            letterHolder.attr("data-letter", response.grid[count]);
            letterHolder.attr("data-clue-number", response.gridnums[count]);

            //Formating Cell
            if (response.grid[count] === "." || count >= response.grid.length) {
                letterHolder.css("background-color", "black");
            } else if (response.gridnums[count] <= 0) {
                letterHolder.html(`<div class='grid-letter'>${response.grid[count]}</div>`/*+ "<br>" + count*/);
            } else {
                letterHolder.html(`<div class='grid-number'>${response.gridnums[count]}</div><div class='grid-letter'>${response.grid[count]}</div>` /*+ "<br>" + count*/);
            }

            newRow.append(letterHolder);
        }
        crosswordHolder.append(newRow);
    }
    $("#crossword").append(crosswordHolder);

    //Crosswords Hints   
    var acrossClues = $("<div class='col s6' id='across-clues'>");
    acrossClues.html("<strong>Across</strong>");

    var downClues = $("<div class='col s6' id='down-clues'>");
    downClues.html("<strong>Down</strong>");

    for (var i = 0; i < response.clues.across.length; i++) {
        var newClue = $("<div class='clue'>");
        newClue.attr("data-answer", response.answers.across[i]);
        newClue.text(response.clues.across[i]);
        acrossClues.append(newClue);
    }

    for (var i = 0; i < response.clues.down.length; i++) {
        var newClue = $("<div class='clue'>");
        newClue.attr("data-answer", response.answers.down[i]);
        newClue.text(response.clues.down[i]);
        downClues.append(newClue);
    }

    $("#hints").append(acrossClues);
    $("#hints").append(downClues);
});


// ==================================================================================================================
// Retrieve weather info from the Dark Sky API

// (Chicago) lattitude & longitude
var weatherLattitude = "41.881832";
var weatherLongitude = "-87.623177";

// Day of weather (set to same date as crossword)
var weatherYear = year;
var weatherMonth = month;
var weatherDay = day;


var weatherKey = "ec5b98b7b3c4b26cd294595db6f0a868"
var weatherURL = `https://api.darksky.net/forecast/${weatherKey}/${weatherLattitude},${weatherLongitude},${weatherYear}-${weatherMonth}-${weatherDay}T12:00:00?exclude=currently,minutely,hourly,flags`;

$.ajax({
    url: weatherURL,
    method: "GET",
    dataType: "jsonp"
}).then(function (response) {
    // Console log the response object for testing purposes
    console.log(response);
});

// ==================================================================================================================
// Retrieve article info from the New York Times Article Search API

// Day of headline (set to same date as crossword & weather)
var headlineYear = year;
var headlineMonth = month;
var headlineDay = day;

var nytURL = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
nytURL += '?' + $.param({
    'api-key': "b9f91d369ff59547cd47b931d8cbc56b:0:74623931",
    'fl': "headline",
    'begin_date': (headlineYear + headlineMonth + headlineDay),
    'end_date': (headlineYear + headlineMonth + headlineDay)
});

$.ajax({
    url: nytURL,
    method: "GET",
}).then(function (response) {
    // Console log response for testing purposes
    console.log(response);
}).fail(function (err) {
    throw err;
});

// ==================================================================================================================

var horoscopeURL = "https://www.horoscopes-and-astrology.com/json";

$.ajax({
    url: horoscopeURL,
    method: "GET"
}).then(function (response) {
    // Console log response for testing purposes
    console.log(response);
});