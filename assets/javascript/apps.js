$(document).ready(function () {
    var maxLimit = 10;
    var myOffset = 0;

    var countryCodeObjectArray = [];

    /* this is an array of objects
    var liveWebCams = {
    countryCode: "",
    countryName: "",
    totalCams: 0,
    webcams: []
    };
    */
    var countryWithLiveWebCams = [];
    var currentCountryObject = {};
    var timer = undefined;
    var timerTick = 0;

    // update progress for loading page data
    function updateProgress() {
        var text = "Please wait while loading Country Options: ";
        if (timerTick === 20) {
            timerTick = 0;
        } else {
            timerTick++;
        }

        for (var i = 0; i < timerTick; i++) {
            text = text + ".";
        }
        $("#progress").text(text);
    }

    function clearProgress() {
        clearInterval(timer);
        $("#progress").text("");
    }

    // disable the Back button on the page so it is not clickable
    function disableBackButton() {
        $("#back-button").prop("disabled", true);
    }

    // enable the Back button on the page so it is clickable
    function enableBackButton() {
        $("#back-button").prop("disabled", false);
    }

    // disable the Next button on the page so it is not clickable
    function disableNextButton() {
        $("#next-button").prop("disabled", true);
    }

    // enable the Next button on the page so it is clickable
    function enableNextButton() {
        $("#next-button").prop("disabled", false);
    }

    // determine if the next button should be enabled or disabled
    function setNextButtonState(currentPage, totalPages) {
        if ((totalPages > 1) && (currentPage !== totalPages)) {
            console.log("enable Next Button");
            enableNextButton();
        } else {
            console.log("disable Next Button");
            disableNextButton();
        }
    }

    // determine if the next button should be enabled or disabled
    function setBackButtonState(currentPage) {
        if (currentPage > 1) {
            console.log("enable Back Button");
            enableBackButton();
        } else {
            console.log("disable Back Button");
            disableBackButton();
        }
    }
    $(function () {
        $('[data-toggle="popover"]').popover()
    })

    function hideButtons() {
        $("#back-button").hide();
        $("#next-button").hide();
    }

    function showButtons() {
        $("#back-button").show();
        $("#next-button").show();
    }

    //hiding the button on webpage load, need to .show() when user clicks on webcam country

　
    $(".dropdown-item").on("click", function () {
        showButtons();
        $("iframe").slideUp(900);
        $("#pageDescription").fadeOut(1000);

　
        // need to write an if statement depending on amount of cameras the buttons will display
        if (maxLimit < 10) {
            hideButtons();
        } else if (maxLimit > 10) {

            $("#next-button").show();

        }
    });

    // display initial webcam after page loads
    function displayInitialWebCam() {

        var key = "JPZH8HA6lBmshdutMhV7vXqrSTydp1Ov8CljsnUVWnKklt18RP";
        var webCamId = 1384609657;
        $.ajax({
            url: "https://webcamstravel.p.mashape.com/webcams/list/webcam=" + webCamId + "?lang=en&show=webcams%3Aimage%2Clocation%2Curl%2Cplayer",
            headers: {
                "X-Mashape-Key": key
            },
            type: "GET",
            success: function (response) {
                console.log(response);

                if (response.result.total > 0) {
                    renderWebCamVideo(webCamId, response.result.webcams[0], false);
                }
            },

            error: function () {
                console.log("no webcam");
            }

        });
    }

　
    // ISO 3166-1-alpha-2 - country codes
    function getCountryCodes() {
        var offset = myOffset;
        var limit = maxLimit;
        timer = setInterval(function () { updateProgress() }, 100);
        $.ajax({
            url: "https://restcountries.eu/rest/v2/all",
            type: "GET",
            success: function (data) {
                console.log(data);
                console.log("country Code Count: " + data.length);

                var requests = [];

                for (var i = 0; i < data.length; i++) {
                    var countryObject = {
                        name: "",
                        code: ""
                    };
                    // only interested in the alpha 2 country code
                    // for the webcams travel api
                    countryObject.name = data[i].name;
                    countryObject.code = data[i].alpha2Code;
                    countryCodeObjectArray.push(countryObject);
                    requests.push(queryWebCamsByCountry(countryCodeObjectArray[i], offset, limit));
                }

                $.when.apply($, requests).then(function () {
                    countryWithLiveWebCams.sort(function (a, b) {
                        var nameA = a.countryName.toLowerCase();
                        var nameB = b.countryName.toLowerCase();

                        if (nameA < nameB) { //sort string ascending
                            return -1
                        } else if (nameA > nameB) {
                            return 1
                        }
                        return 0 //default return value (no sorting)
                    });

                    for (var i = 0; i < countryWithLiveWebCams.length; i++) {
                        renderCountryOptions(countryWithLiveWebCams[i], i);
                    }
                    clearProgress();
                    displayInitialWebCam();
                });
            },
            error: function () {
                console.log("error getting country codes");
            }
        });
    }

    // curl --get --include 'https://webcamstravel.p.mashape.com/webcams/list/category=beach?lang=en&show=webcams%3Aimage%2Clocation' -H 'X-Mashape-Key: JPZH8HA6lBmshdutMhV7vXqrSTydp1Ov8CljsnUVWnKklt18RP'

　
    function queryWebCamsByCountry(countryObject, limit) {
        //curl --get --include 'https://webcamstravel.p.mashape.com/webcams/list/continent=AF?lang=en&show=webcams:player%3Aimage%2Clocation' -H 'X-Mashape-Key: JPZH8HA6lBmshdutMhV7vXqrSTydp1Ov8CljsnUVWnKklt18RP'
        var key = "JPZH8HA6lBmshdutMhV7vXqrSTydp1Ov8CljsnUVWnKklt18RP";
        return $.ajax({
            url: "https://webcamstravel.p.mashape.com/webcams/list/country=" +
                countryObject.code +
                "/property=live/limit=" +
                limit +
                ",0" + // offset
                "?lang=en&show=webcams%3Aimage%2Clocation%2Curl%2Cplayer",

            headers: {
                "X-Mashape-Key": key
            },
            type: "GET",
            dataType: "json",
            processData: false,
            success: function (data) {

                if (data.result.total) {
                    console.log(data);
                    var liveWebCams = {
                        countryCode: "",
                        countryName: "",
                        totalCams: 0,
                        webcams: []
                    };
                    liveWebCams.countryCode = countryObject.code;
                    liveWebCams.countryName = countryObject.name;
                    liveWebCams.totalCams = data.result.total;
                    liveWebCams.webcams = data.result.webcams;
                    countryWithLiveWebCams.push(liveWebCams);
                }
            },
            error: function () {
                console.log("Cannot get data");
            }
        });
    }

    function queryWebcamsByOffset(webcamObject, offset, limit) {
        var success = false;

        //curl --get --include 'https://webcamstravel.p.mashape.com/webcams/list/continent=AF?lang=en&show=webcams%3Aimage%2Clocation' -H 'X-Mashape-Key: JPZH8HA6lBmshdutMhV7vXqrSTydp1Ov8CljsnUVWnKklt18RP'
        var key = "JPZH8HA6lBmshdutMhV7vXqrSTydp1Ov8CljsnUVWnKklt18RP";
        $.ajax({
            url: "https://webcamstravel.p.mashape.com/webcams/list/country=" +
                webcamObject.countryCode +
                "/property=live/limit=" +
                limit +
                "," +
                offset +
                "?lang=en&show=webcams%3Aimage%2Clocation%2Curl%2Cplayer",

            headers: {
                "X-Mashape-Key": key
            },
            type: "GET",
            dataType: "json",
            processData: false,
            async: false, // make this call a synchronous call rather than a ansynchronous
            success: function (data) {

                webcamObject.webcams = [];
                webcamObject.webcams = data.result.webcams;
                success = true;
            },
            error: function () {
                console.log("Cannot reach data");

                success = false;
            }
        });

        console.log("request complete");
        return success;
    }

    function renderCountryOptions(webcamObject, index) {
        var offset = 0;
        var limit = maxLimit;
        console.log(JSON.stringify(webcamObject));

        var $list = $("<a>");
        // set the class
        $list.addClass("dropdown-item country-code m-1");
        $list.attr("href", "#");
        // Adding a data-attribute
        $list.attr("data-name", webcamObject.countryCode);
        $list.attr("value", index);
        // Providing the initial button text
        $list.text(webcamObject.countryName);
        // Adding the list to the list div
        $("#list").append($list)

    }

    // {"countryCode":"AL","countryName":"Albania","totalCams":1,"webcams":[{"id":"1496005860","status":"active","title":"Tirana: Skanderbeg Square","image":{"current":{"icon":"https://images.webcams.travel/icon/1496005860.jpg","thumbnail":"https://images.webcams.travel/thumbnail/1496005860.jpg","preview":"https://images.webcams.travel/preview/1496005860.jpg","toenail":"https://images.webcams.travel/thumbnail/1496005860.jpg"},"daylight":{"icon":"https://images.webcams.travel/daylight/icon/1496005860.jpg","thumbnail":"https://images.webcams.travel/daylight/thumbnail/1496005860.jpg","preview":"https://images.webcams.travel/daylight/preview/1496005860.jpg","toenail":"https://images.webcams.travel/daylight/thumbnail/1496005860.jpg"},"sizes":{"icon":{"width":48,"height":48},"thumbnail":{"width":200,"height":112},"preview":{"width":400,"height":224},"toenail":{"width":200,"height":112}},"update":1512921712},"location":{"city":"Tirana","region":"Tiranë","region_code":"AL.50","country":"Albania","country_code":"AL","continent":"Europe","continent_code":"EU","latitude":41.327398,"longitude":19.818828,"timezone":"Europe/Tirane"},"url":{"current":{"desktop":"https://www.webcams.travel/webcam/1496005860-tirana-skanderbeg-square","mobile":"https://m.webcams.travel/webcam/1496005860-tirana-skanderbeg-square"},"daylight":{"desktop":"https://www.webcams.travel/webcam/1496005860-tirana-skanderbeg-square/daylight","mobile":"https://m.webcams.travel/webcam/1496005860-tirana-skanderbeg-square/daylight"},"edit":"https://lookr.com/edit/1496005860"}}]}
    function renderTableSummary(webcamObject) {
        var tableHeadingArray = ["Country", "Total Live Cameras"];
        var tableDataArray = [webcamObject.countryName, webcamObject.totalCams];
        var $table = $("<table>");
        var $tableHeadRow = $("<tr>");

        // generate table headers
        for (var i = 0; i < tableHeadingArray.length; i++) {
            var $tableHead = $("<th>");
            $tableHead.attr("id", "tableSumHead");

            $tableHead.attr("scope", "col");
            $tableHead.text(tableHeadingArray[i]);
            $tableHeadRow.append($tableHead);
        }
        $table.append($tableHeadRow);

        // generate table data
        var $tableDataRow = $("<tr>");
        for (var i = 0; i < tableDataArray.length; i++) {
            var $tableCol = $("<td>");
            $tableCol.text(tableDataArray[i]);
            $tableDataRow.append($tableCol);
        }
        $table.append($tableDataRow);

        $("#table-summary").empty();
        $("#table-summary").append($table);
    }
    // for the current country, this table will show details for each web camera available
    // sample JSON: {"countryCode":"AL","countryName":"Albania","totalCams":1,"webcams":[{"id":"1496005860","status":"active","title":"Tirana: Skanderbeg Square","image":{"current":{"icon":"https://images.webcams.travel/icon/1496005860.jpg","thumbnail":"https://images.webcams.travel/thumbnail/1496005860.jpg","preview":"https://images.webcams.travel/preview/1496005860.jpg","toenail":"https://images.webcams.travel/thumbnail/1496005860.jpg"},"daylight":{"icon":"https://images.webcams.travel/daylight/icon/1496005860.jpg","thumbnail":"https://images.webcams.travel/daylight/thumbnail/1496005860.jpg","preview":"https://images.webcams.travel/daylight/preview/1496005860.jpg","toenail":"https://images.webcams.travel/daylight/thumbnail/1496005860.jpg"},"sizes":{"icon":{"width":48,"height":48},"thumbnail":{"width":200,"height":112},"preview":{"width":400,"height":224},"toenail":{"width":200,"height":112}},"update":1512921712},"location":{"city":"Tirana","region":"Tiranë","region_code":"AL.50","country":"Albania","country_code":"AL","continent":"Europe","continent_code":"EU","latitude":41.327398,"longitude":19.818828,"timezone":"Europe/Tirane"},"url":{"current":{"desktop":"https://www.webcams.travel/webcam/1496005860-tirana-skanderbeg-square","mobile":"https://m.webcams.travel/webcam/1496005860-tirana-skanderbeg-square"},"daylight":{"desktop":"https://www.webcams.travel/webcam/1496005860-tirana-skanderbeg-square/daylight","mobile":"https://m.webcams.travel/webcam/1496005860-tirana-skanderbeg-square/daylight"},"edit":"https://lookr.com/edit/1496005860"}}]}

    function renderTableDetails(webcamObject) {
        var tableHeadingArray = ["Number", "Status", "Title", "City", "Map", "Actions"];
        var maxTableColumns = 6;
        var $table = $("<table>");
        var $tableHeadRow = $("<tr>");

        // generate table headers
        for (var i = 0; i < tableHeadingArray.length; i++) {
            var $tableHead = $("<th>");
            $tableHead.attr("scope", "col");
            $tableHead.text(tableHeadingArray[i]);
            $tableHeadRow.append($tableHead);
        }
        $table.append($tableHeadRow);

        // generate table data
        for (var row = 0; row < webcamObject.webcams.length; row++) {
            var $tableRow = $("<tr>");
            $tableRow.attr("height", "100%");
            for (var col = 1; col <= maxTableColumns; col++) {
                var $tableCol = $("<td>");

                switch (col) {
                    case 1: // column 1
                        var page = webcamObject.pages.current;
                        var totalCams = webcamObject.totalCams;
                        var webCamNumber = (row + 1) + (page - 1) * maxLimit;
                        console.log("page: " + page);
                        console.log("webCamNumber: " + webCamNumber);
                        $tableCol.text(webCamNumber);
                        break;
                    case 2: // column 2
                        $tableCol.text(webcamObject.webcams[row].status);
                        break;
                    case 3: // column 3
                        $tableCol.text(webcamObject.webcams[row].title);
                        break;
                    case 4: // column 4
                        $tableCol.text(webcamObject.webcams[row].location.city);
                        break;
                    case 5: // column 5
                        $tableCol.attr("height", "200px");
                        $tableCol.attr("width", "auto");
                        var $mapImage = $("<div>");
                        $mapImage.addClass("map-image");
                        var $mapDiv = $("<div>");
                        $mapDiv.attr("id", "map-" + row);
                        $mapDiv.attr("style", "position: relative; overflow: hidden; width: auto; height: 200px;");
                        $($mapImage).append($mapDiv);
                        $($tableCol).append($mapImage);
                        break;
                    default: // column 6
                        var $tableCol = $("<td>");
                        if (webcamObject.webcams[row].player.live.available) {
                            var $button = $("<button>");
                            // set the class
                            $button.addClass("btn btn-primary view-webcam m-1");
                            $button.attr("id", "live-webcam");
                            $button.attr("type", "button");
                            // Adding a data-attribute
                            $button.attr("value", webcamObject.webcams[row].id);
                            $button.attr("name", webcamObject.webcams[row].title);
                            // Providing the initial button text
                            $button.text("Live");
                            $tableCol.append($button);
                        }

                        if (webcamObject.webcams[row].player.day.available) {
                            var $button = $("<button>");
                            // set the class
                            $button.addClass("btn btn-primary m-1");
                            $button.attr("id", "day-webcam");
                            $button.attr("type", "button");
                            // Adding a data-attribute
                            $button.attr("value", webcamObject.webcams[row].id);
                            $button.attr("name", webcamObject.webcams[row].title);
                            // Providing the initial button text
                            $button.text("Replay");
                            $tableCol.append($button);
                        }
                } // end switch

                $tableRow.append($tableCol);

            } // end for col loop

            $table.append($tableRow);
        } // end for row loop
        $("#table-details").empty();
        $("#table-details").append($table);
    }

    function getWebcamById(id) {
        var webcamObject = undefined;

        for (var i = 0; i < currentCountryObject.webcams.length; i++) {
            if (currentCountryObject.webcams[i].id === id) {
                webcamObject = currentCountryObject.webcams[i];
                break;
            }
        }
        return webcamObject;
    }

    function initMap(lat, lng, elementId) {
        var position = {
            lat: lat,
            lng: lng
        };

        var map = new google.maps.Map(document.getElementById(elementId), {
            center: position,
            zoom: 12
        });

        var marker = new google.maps.Marker({
            position: position,
            map: map
        });
    }

    function renderMap(webcamObject) {
        for (var i = 0; i < webcamObject.webcams.length; i++) {
            var id = "map-" + i;
            var lat = webcamObject.webcams[i].location.latitude;
            var lng = webcamObject.webcams[i].location.longitude;
            initMap(lat, lng, id);
        }
    }

    function renderWebCamVideo(webcamId, webcamObject, live) {
        // sample: <a name="lkr-timelapse-player" data-id="1010244116" data-play="live" href="https://lookr.com/1010244116" target="_blank">Lausanne › South-East: Place de la Palud</a><script async type="text/javascript" src="https://api.lookr.com/embed/script/player.js"></script>
        var $webCam = $("<a>");
        $webCam.attr("name", "lkr-timelapse-player");
        $webCam.attr("data-id", webcamId);
        $webCam.attr("data-play", (live) ? "live" : "day");
        $webCam.attr("href", (live) ? webcamObject.player.live.embed : webcamObject.player.day.embed);
        $webCam.attr("target", "_blank");
        $webCam.text(webcamObject.title);

        $("#embedded-video").empty();
        $("#embedded-video").append($webCam);
        $("#embedded-video").append('<script async type="text/javascript" src="https://api.lookr.com/embed/script/player.js"></script>');

        $("#video-title").text(webcamObject.title);
        $("#video-city-country").text(webcamObject.location.city + ", " + webcamObject.location.country);

        scrollTo(0, 0); ///=======scrolling to top after button pressed
    }

    getCountryCodes();

    // Adding a click event listener to all elements with a class of "country-code"
    $(document).on("click", ".country-code", function () {
        var value = $(this).attr("value");
        // clear some elements on the page
        $("#embedded-video").empty();
        $("#video-title").text("");
        $("#video-city-country").text("");

        // get webcam data for selected country
        currentCountryObject.countryCode = countryWithLiveWebCams[value].countryCode;
        currentCountryObject.countryName = countryWithLiveWebCams[value].countryName;
        currentCountryObject.totalCams = countryWithLiveWebCams[value].totalCams;
        currentCountryObject.webcams = [];
        currentCountryObject.webcams = countryWithLiveWebCams[value].webcams;

        // a table will display upto maxLimit camera's in a table.  call each table a 
        // page.  determine how many pages will be available for display.
        currentCountryObject.pages = {
            total: 0,
            current: 1
        };

        if (currentCountryObject.totalCams % maxLimit) {
            currentCountryObject.pages.total = Math.floor(currentCountryObject.totalCams / maxLimit) + 1;
        } else {
            currentCountryObject.pages.total = currentCountryObject.totalCams / maxLimit;
        }

        renderTableSummary(currentCountryObject);
        renderTableDetails(currentCountryObject);
        renderMap(currentCountryObject);

        setBackButtonState(currentCountryObject.pages.page);
        setNextButtonState(currentCountryObject.pages.page, currentCountryObject.pages.total);
    });

    $(document).on("click", "#back-button", function () {
        var limit = maxLimit;
        var offset = myOffset - maxLimit;

        if (queryWebcamsByOffset(currentCountryObject, offset, limit)) {
            myOffset = offset; // update global offset when successfull
            currentCountryObject.pages.current--; // update current page count
            renderTableDetails(currentCountryObject);
            renderMap(currentCountryObject);
            scrollTo(0, 0); ///=======scrolling to top after button pressed
        } else {
            // TODO:  show error on web page
        }
        console.log("current page: " + currentCountryObject.pages.current);
        setBackButtonState(currentCountryObject.pages.current);
        setNextButtonState(currentCountryObject.pages.current, currentCountryObject.pages.total);
    });

    $(document).on("click", "#next-button", function () {
        var limit = maxLimit;
        var offset = myOffset + maxLimit;

        if (queryWebcamsByOffset(currentCountryObject, offset, limit)) {
            myOffset = offset; // update global offset when successfull
            currentCountryObject.pages.current++; // update current page count
            renderTableDetails(currentCountryObject);
            renderMap(currentCountryObject);
            scrollTo(0, 0); ///=======scrolling to top after button pressed
        } else {
            // TODO:  show error on web page
        }
        console.log("current page: " + currentCountryObject.pages.current);
        setBackButtonState(currentCountryObject.pages.current);
        setNextButtonState(currentCountryObject.pages.current, currentCountryObject.pages.total);
    });

    $(document).on("click", "#live-webcam", function () {
        var webCamId = $(this).attr("value");
        var webCamObject = getWebcamById(webCamId);
        if (webCamObject !== undefined) {
            renderWebCamVideo(webCamId, webCamObject, true);
        }
    });

    $(document).on("click", "#day-webcam", function () {
        var webCamId = $(this).attr("value");
        var webCamObject = getWebcamById(webCamId);
        if (webCamObject !== undefined) {
            renderWebCamVideo(webCamId, webCamObject, false);
        }
    });

});

　
