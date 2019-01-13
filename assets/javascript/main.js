// ==================================================================================================================
// Variable Creation
//Crossword Variables
var indexedLetters = [];
var answersDown = [];
var answersAcross = [];
var cols = -1;
var rows = -1;

// Day in History
var year;
var month;
var day;

if (
    sessionStorage.getItem("year") === null ||
    sessionStorage.getItem("month") === null ||
    sessionStorage.getItem("day") === null
) {
    randomDate();
} else {
    year = sessionStorage.getItem("year");
    month = sessionStorage.getItem("month");
    day = sessionStorage.getItem("day");

    newDate(`${month}-${day}-${year}`);
}


//Assign selected historic date on button click
$("#search").on("click", function () {
    var stringDate = $("#date-input").val();

    if (stringDate != "") {
        var date = moment(stringDate);
        newDate(date);

    } else {
        // console.log("Error: Not valid Date");
    }
});

//Get random historic date
function randomDate() {
    //Year range
    var yearMin = 1980;
    var yearMax = 2015;
    //Random year
    var year = Math.floor(Math.random() * (yearMax - yearMin) + yearMin);

    //Year range
    var monthMin = 1;
    var monthMax = 12;
    //Random month
    var month = Math.floor(Math.random() * (monthMax - monthMin) + monthMin);

    //Day range
    var dayMin = 1;
    var dayMax = 31;
    if (month === 2) {
        dayMax = 28;
    } else if (month === 4 || month === 6 || month === 9 || month === 11) {
        dayMax = 30;
    }
    //Random day
    var day = Math.floor(Math.random() * (dayMax - dayMin) + dayMin);

    var randomDate = `${month}-${day}-${year}`;
    newDate(randomDate);
}

//random historic date button on click
$("#random-date").on("click", function () {
    randomDate();
});

//Assign new historic date
function newDate(date) {
    var unixDate = moment(date).unix();
    var unixCurrentDate = moment().unix();
    if (unixDate > unixCurrentDate) {
        var currentYear = "" + moment().year();
        var currentMonth = "" + (moment().month() + 1);
        var currentDay = "" + moment().date();
        date = `${currentMonth}/${currentDay}/${currentYear}`;
    } else {
        // console.log("False");
    }
    $("#date-historic").text(moment(date).format("MM/DD/YYYY"));
    year = "" + moment(date).year();
    month = "" + (moment(date).month() + 1);
    if (month.length < 2) {
        month = "0" + month
    }

    day = "" + moment(date).date();
    if (day.length < 2) {
        day = "0" + day;
    }

    sessionStorage.setItem("month", month);
    sessionStorage.setItem("day", day);
    sessionStorage.setItem("year", year);

    if (sessionStorage.getItem("page") === "index") {
        generateCrossword();
    } else if (sessionStorage.getItem("page") === "weather") {
        weatherCall();
    } else if (sessionStorage.getItem("page") === "horoscope") {
        $("#date-current").text(moment().format("MM/DD/YYYY"))
    } else if (sessionStorage.getItem("page") === "article") {
        articleCall();
    } else {
        // console.log(`ERROR UNKNOWN PAGE: Session Storage 'page':${sessionStorage.getItem("page")}`)
    }

}

// ==================================================================================================================
// Retrieve weather info from the Dark Sky API

function weatherCall() {

    $(".loader").css("display", "block");

    // (Chicago) lattitude & longitude
    var weatherLattitude = "41.881832";
    var weatherLongitude = "-87.623177";

    // Day of weather (set to same date as crossword)
    var weatherYear = sessionStorage.getItem("year");
    var weatherMonth = sessionStorage.getItem("month");
    var weatherDay = sessionStorage.getItem("day");

    var weatherKey = "ec5b98b7b3c4b26cd294595db6f0a868"
    var weatherURL = `https://api.darksky.net/forecast/${weatherKey}/${weatherLattitude},${weatherLongitude},${weatherYear}-${weatherMonth}-${weatherDay}T12:00:00?exclude=currently,minutely,hourly,flags`;

    $.ajax({
        url: weatherURL,
        method: "GET",
        dataType: "jsonp"
    }).then(function (response) {
        var weather = response.daily.data[0];

        $("#weather-icon").css("display", "block");
        $(".weather").css("display", "block");
        $("#weather-failure").empty();

        $(".loader").css("display", "none");
        $("#weather-icon").html(`<img src="assets/images/weather-icons/${weather.icon}.jpg" alt="${weather.icon} icon">`);
        $("#weather-summary").text(`${weather.summary}`);

        $("#wind").text(`Wind Speed: ${weather.windSpeed} MPH`);
        var humidity = weather.humidity * 100

        $("#humidity").text(`${humidity}% Humidity`);
        var temp = Math.round((weather.temperatureHigh + weather.temperatureLow) / 2);
        $("#temp").html(`${temp}&#8457;`);
        var cloudCover = weather.cloudCover * 100;
        $("#cloud-cover").text(`${cloudCover}% Cloud Cover`);
        if (typeof weather.precipType != "undefined") {
            var precip = weather.precipProbability * 100;
            $("#precip").text(`${precip}% chance of ${weather.precipType}`);
        } else {
            $("#precip").empty();
        }

    }).fail(function (error) {
        $("#weather-icon").css("display", "none");
        $(".weather").css("display", "none");
        $("#weather-failure").html(`<h2 class="text-center">Sorry, the weather for that date is unavailable</h2>`);
    });
}

$("#weather-btn").on("click", function () {
    weatherCall();
});

// ==================================================================================================================
//Horoscopes

function horoscopeCall(signType) {
    var horoscopeURL = "https://www.horoscopes-and-astrology.com/json";
    $.ajax({
        url: horoscopeURL,
        method: "GET"
    }).then(function (response) {
        var signObj = response.dailyhoroscope[signType];
        $("#horoscope-name").text(signType);
        var horSum = signObj.split("<a");
        $("#horoscope-summary").text(horSum[0]);

        //Change Horoscope Image
        $("#card-img-hor").attr("src", `assets/images/horoscope cards/${signType.toLowerCase()}-card.png`);
    });
}

// Or with jQuery
$(document).ready(function () {
    $(".sign-btn").on("click", function () {
        var signType = $(this).attr("data-sign");
        horoscopeCall(signType);
    });

    $('#modal-horoscope').modal();
});


// ==================================================================================================================
//Crosswords

function generateCrossword() {
    //Reset Crossword Variables
    indexedLetters = [];
    answersDown = [];
    answersAcross = [];

    var crossWordURL = `https://raw.githubusercontent.com/doshea/nyt_crosswords/master/${sessionStorage.getItem("year")}/${sessionStorage.getItem("month")}/${sessionStorage.getItem("day")}.json`;
    $.ajax({
        url: crossWordURL,
        method: "GET"
    }).then(function (response) {
        // ===============================================================================================================
        // Crossword Display
        $("#failure-div").empty();
        $("#crossword").empty();

        response = JSON.parse(response);

        // Crossword Title
        $("#crossword-title").text(`${response.title} - ${response.author}`);

        rows = response.size.rows;
        cols = response.size.cols;

        //Figure out board dimensions
        var crosswordHolder = $("#crossword");
        //Calculate square sizes
        //Square Creation
        for (var i = 0; i < rows; i++) {
            var newRow = $("<div class='row-holder'>");
            newRow.css("width", `${rows * 40}px`);
            for (var j = 0; j < cols; j++) {
                var count = i * cols + j;
                //Assign Letter Value/Clue Number Value
                var letterHolder = $(`<div class='letter-holder'id='x${j}y${i}'>`);
                letterHolder.attr("data-index", count);
                letterHolder.attr("data-clue-number", response.gridnums[count]);

                indexedLetters.push({
                    id: `x${j}y${i}`,
                    letterValue: response.grid[count]
                });

                //Formating Cell
                if (response.grid[count] === "." || count >= response.grid.length) {
                    letterHolder.css("background-color", "black");
                }
                else if (response.gridnums[count] <= 0) {
                    letterHolder.html(`<div class='grid-letter'></div>` /*+ "<br>" + count*/);
                }
                else {
                    letterHolder.html(`<div class='grid-number'>${response.gridnums[count]}</div><div class='grid-letter'></div>` /*+ "<br>" + count*/);
                }

                newRow.append(letterHolder);
            }
            crosswordHolder.append(newRow);
        }


        //Crosswords Hints   
        var acrossClues = $("<div class='col s6' id='across-clues'>");
        acrossClues.html("<strong>Across</strong>");
        var downClues = $("<div class='col s6' id='down-clues'>");
        downClues.html("<strong>Down</strong>");

        for (var i = 0; i < response.clues.across.length; i++) {
            var newClue = $("<div class='clue'>");
            var index = parseInt(response.clues.across[i]);

            answersAcross.push(response.answers.across[i]);


            newClue.html(`<a class="modal-trigger hint-btn" href="#hint-modal" data-num=${i} data-direction="across">${response.clues.across[i]}</a>`);
            newClue.attr("data-index", index);
            acrossClues.append(newClue);
        }

        for (var i = 0; i < response.clues.down.length; i++) {
            var newClue = $("<div class='clue'>");
            var index = parseInt(response.clues.down[i]);

            answersDown.push(response.answers.down[i]);

            newClue.html(`<a class="modal-trigger hint-btn" href="#hint-modal" data-num=${i} data-direction="down">${response.clues.down[i]}</a>`);
            newClue.attr("data-hint", index);
            downClues.append(newClue);
        }
        $("#hints").empty();
        $("#hints").append(acrossClues);
        $("#hints").append(downClues);
        crosswordResize();
    }).fail(function (error) {
        $("#crossword").empty();
        $("#hints").empty();
        $("#failure-div").html(`<h2 class="text-center">Sorry, we don't have the crossword for that date :-(</h2>`);
    });
}

function crosswordResize() {
    var width = $("#crossword").innerWidth() - 20;
    var newWidth = width / cols;
    $(".row-holder").css("width", `${width}`);
    $(".row-holder").css("height", `${newWidth}`);
    $(".letter-holder").css("width", `${newWidth}px`);
    $(".letter-holder").css("height", `${newWidth}px`);
}

crosswordResize();

$(document).ready(function () {
    //Hint Modals
    var ans = "";
    var hintArray;
    var direction;
    var hintNum;

    $(document).on("click", ".hint-btn", function (event) {
        event.preventDefault();
        $("#guess-input").focus();
        hintArray = $(this).text().split(". ");
        direction = $(this).attr("data-direction");
        hintNum = $(this).attr("data-num");

        // Fix those hints who had a ". " other than the one following the hint number
        if (hintArray.length > 2) {
            for (var i = 2; i < hintArray.length; i++) {
                hintArray[1] += ". " + hintArray[i];
            }
        }

        if (direction === "across") {
            ans = answersAcross[hintNum];
        }
        else {
            ans = answersDown[hintNum];
        }

        var partialAns = getPartialAns(ans, hintArray[0], direction);

        $("#hint-modal .modal-content").html(`
        <h2 class="text-center">${hintArray[1]}</h2>
        <h2 class="text-center">${partialAns}</h2>
        `);
    })

    $(document).on("click", "#modal-guess", function (event) {
        event.preventDefault();
        var guess = "";
        guess = $("#guess-input").val().trim().toUpperCase();
        $("#guess-input").val("");
        if (guess === ans) {
            fillCorrectAnswer(ans, hintArray[0], direction);
            $("#hint-modal").modal("close");

            crossOutHint(hintNum, direction);
        }
        else {
            $("#hint-modal").effect("shake");
        }
    })

    $('.modal').modal();

    //Crossword Resizing
    $(window).resize(crosswordResize);
});

function crossOutHint(hintNum, direction) {
    $(`[data-num=${hintNum}][data-direction="${direction}"]`).css("text-decoration", "line-through");
    $(`[data-num=${hintNum}][data-direction="${direction}"]`).attr("href", "#");
    $(`[data-num=${hintNum}][data-direction="${direction}"]`).addClass("clicked-clue");
}

function fillCorrectAnswer(ans, gridNum, direction) {
    var firstLetterHolder = $(`[data-clue-number=${gridNum}]`);
    var coords = firstLetterHolder.attr("id").split("y");
    coords[0] = coords[0].substr(1);

    if (direction === "across") {
        for (var i = 0; i < ans.length; i++) {
            $(`#x${parseInt(coords[0]) + i}y${parseInt(coords[1])} .grid-letter`).text(ans[i]);
        }
    }
    else {
        for (var i = 0; i < ans.length; i++) {
            $(`#x${parseInt(coords[0])}y${parseInt(coords[1]) + i} .grid-letter`).text(ans[i]);
        }
    }

    if (isGameOver()) {
        $("#failure-div").html(`<h2 class="text-center">You are very smart! :-)</h2>`).effect("slide");
    }
}

function getPartialAns(ans, gridNum, direction) {
    var firstLetterHolder = $(`[data-clue-number=${gridNum}]`);
    var coords = firstLetterHolder.attr("id").split("y");
    coords[0] = coords[0].substr(1);

    var partialString = "";

    if (direction === "across") {
        for (var i = 0; i < ans.length; i++) {
            var boxContent = $(`#x${parseInt(coords[0]) + i}y${parseInt(coords[1])} .grid-letter`).text();
            if (boxContent !== "") {
                partialString += boxContent;
                partialString += " ";
            }
            else {
                partialString += "_ ";
            }
        }
    }
    else {
        for (var i = 0; i < ans.length; i++) {
            var boxContent = $(`#x${parseInt(coords[0])}y${parseInt(coords[1]) + i} .grid-letter`).text();
            if (boxContent !== "") {
                partialString += boxContent;
                partialString += " ";
            }
            else {
                partialString += "_ ";
            }
        }
    }
    return partialString;
}

function isGameOver() {
    for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
            var currentBox = $(`#x${j}y${i}`);
            if (currentBox.css("background-color") !== "rgb(0, 0, 0)" && currentBox.find(".grid-letter").text() === "") {
                return false;
            }
        }
    }
    return true;
}
// ===============================================================================================================
//Articles

function articleCall() {
    var headlineYear = sessionStorage.getItem("year");
    var headlineMonth = sessionStorage.getItem("month");
    var headlineDay = sessionStorage.getItem("day");

    //Create loading image
    $("#article-holder").empty();
    $("#article-holder").html("<div class='loader'></div>");

    var nytURL = "https://cors-anywhere.herokuapp.com/https://api.nytimes.com/svc/search/v2/articlesearch.json";
    nytURL += '?' + $.param({
        'api-key': "38cde8a8164048079300ba0c929f5022",
        'fl': "web_url,headline,snippet",
        'begin_date': (headlineYear + headlineMonth + headlineDay),
        'end_date': (headlineYear + headlineMonth + headlineDay)
    });
    $.ajax({
        url: nytURL,
        method: "GET",
    }).then(function (response) {
        $("#article-holder").empty();
        for (let i = 0; i < response.response.docs.length; i++) {
            if (response.response.docs[i].news_desk !== "Classified") {
                var article = $("<div class='card-body'>")
                var snippet = $("<div>");
                snippet.text(response.response.docs[i].snippet);

                article.html("<a href=" + response.response.docs[i].web_url + " target='_blank'>" + response.response.docs[i].headline.main + "</a>");
                article.append(snippet);
                $("#article-holder").append(article);
            }

        }
    }).fail(function (err) {
        throw err;
    });
}
