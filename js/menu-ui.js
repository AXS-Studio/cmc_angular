/** menu-ui.js
* Initialize app menu on bottom for Timeline, Survey and Settings
* Also handles interactivity in Timeline sliding menu on right hand side
*/

var graphMenuActive = false;
var graphColors = new Array();
var tagColors = new Array();
var timeline = new Timeline();

//------------------------------------------------------------------------------
//Main functions of app accessible on bottom row
//Called from index.php on document ready
var initAppMenu = (function() {

    $('#nav-survey').click(function() {
        $('.nav li a').removeClass('active');
        $(this).addClass('active');

        $('#page_login').hide();
        $('#page_graph').hide();
        $('#page_quiz').show();
        $('#page_settings').hide();

    });

    $('#nav-timeline').click(function() {

        if (quizInProgress) {
            $("#bgplate").show();
            $("#dialog-confirm").dialog({
                resizable: false,
                modal: true,
                buttons: {
                    "Leave Anyway": function() {
                        $(this).dialog("close");
                        quizInProgress = false;
                        $("#bgplate").hide();
                        GotoTimeline();
                    },
                    Cancel: function() {
                        $(this).dialog("close");
                        $("#bgplate").hide();
                        return;
                    }
                }
            });


        } else {
            GotoTimeline();
        }

    });

    $('#nav-settings').click(function() {
        if (quizInProgress) {
            $("#bgplate").show();
            $("#dialog-confirm").dialog({
                resizable: false,
                modal: true,
                buttons: {
                    "Leave Anyway": function() {
                        $(this).dialog("close");
                        quizInProgress = false;
                        $("#bgplate").hide();
                        GotoSettings();
                    },
                    Cancel: function() {
                        $(this).dialog("close");
                        $("#bgplate").hide();
                        return;
                    }
                }
            });
        } else {
            GotoSettings();
        }

    });


});

//Handle click on timeline button at the bottom
function GotoTimeline() {
    $('.nav li a').removeClass('active');
    $('#nav-timeline').addClass('active');
    $('#page_login').hide();
    $('#page_graph').show();
    $('#page_quiz').hide();
    $('#page_settings').hide();

    //Instruct timeline to load answers and create the graph
    timeline.loadAnswersInitial();
    // initGraphMenu();

    $('#art-loading').removeClass('o1').addClass('o0');
    setTimeout(function() {

        //$('#art-loading').remove();

        $('#art-timeline').removeClass('o0').addClass('o1').show();

        $('html').removeClass('no-js').addClass('js');

    }, 250);
}

//Handle click on settings button at the bottom
function GotoSettings() {
    $('.nav li a').removeClass('active');
    $('#nav-settings').addClass('active');

    $('#page_login').hide();
    $('#page_graph').hide();
    $('#page_quiz').hide();
    $('#page_settings').show();

    $('#art-settings').removeClass('o0').addClass('o1');

    settings();

}

//---Timeline/Graph functions---------------------------------------------------------------------------
var initGraphMenu = (function() {
    if (graphMenuActive) {
        RegenerateMenus();
        return;
    }
    graphMenuActive = true;

    var graphMenuWidth = $(document).width() - ($(document).width() * 0.15) + 10; // $('#graph-menu').width() + 10;
    graphMenuWidth = -graphMenuWidth;

    // if ($("html").hasClass("desktop")) {

    // } 
    // else
    // {
    $('#graph-menu').css({
        "right": graphMenuWidth,
        "display": "block"
    });
    // }

    $(".tab").click(function(e) {
        $(".tab").removeClass('selected');
        $(".tab_content").removeClass('active');

        $(this).addClass('selected');

        var modID = "#" + $(this).attr("id") + "_content";
        $(modID).addClass('active');
    })

    // if ($("html").hasClass("desktop")) {
    // 	$(".btnmenu.external").hide();
    // 	$(".btnmenu.internal").hide();
    // } 
    // else
    // {

    $(".btnmenu.external").click(function(e) {
        $('#graph-menu').animate({
            right: '0'
        });
        if ($(window).width() < 800) {
            $("#bgplate").show();
        }
    });

    $(".btnmenu.internal").click(function(e) {
        $('#graph-menu').animate({
            right: graphMenuWidth
        });
        $("#bgplate").hide();
    });

    //Hide menu if bgplate clicked
    $("#bgplate").click(function(e) {
        $('#graph-menu').animate({
            right: graphMenuWidth
        });
        $("#bgplate").hide();
        $("#legend-popup").hide();
    });

    // }

    $(".forgot").hide();

    $("footer .nav").show();


    $('#legend_content').html('<h3>Survey Questions</h3><ul class="swatches" id="swtchs-edit"></ul>');
    $('#edit_content').html('<h3>Tags</h3><ul class="swatches tags" id="tags-edit"></ul>');
    $('#share_content').html('<ul><li><button id="saveAsPdf">Save As PDF</button></li><li><button id="emailAsPdf">Email PDF</button></li></ul></div></ul></li>');

    $('#saveAsPdf').click(function(e) {
        console.log("Save as PDF");

        graphContent = $('#graph-header').html();
        graphContent = graphContent + $('.containerForGraphs').html();

        createPDF(false, graphContent); //params: sendEmail, html content
    });

    $('#emailAsPdf').click(function(e) {
        console.log("Email as PDF");

        graphContent = $('#graph-header').html();
        graphContent = graphContent + $('.containerForGraphs').html();

        /*
		graphContent = $('.containerForGraphs').html();
		graphContent = graphContent + $('#graph-header').html();
	*/
        createPDF(true, graphContent); //params: sendEmail, html content
    });

    GenerateSwatches().questionSwatches();

    //GenerateSwatches().tagSwatches(); //Calls updateGraph after done

    //GenerateSwatches().filterSwatches(); //Set null sets to transparent

    addPopUpLegend();

    AddSmoothingSlider();

    AddTagsHeading();

});

function RegenerateMenus() {
    $('#legend_content').html('<h3>Survey Questions</h3><ul class="swatches" id="swtchs-edit"></ul>');
    $('#edit_content').html('<h3>Tags</h3><ul class="swatches tags" id="tags-edit"></ul>');

    GenerateSwatches().questionSwatches();

    //GenerateSwatches().tagSwatches();

    //GenerateSwatches().filterSwatches();

    addPopUpLegend();

    AddSmoothingSlider();

}

//For PDF downloading via Save-As dialog
function post_to_url(path, params, method) {
    method = method || 'post'; // Set method to post by default if not specified.

    // The rest of this code assumes you are not using a library.
    // It can be made less wordy if you use one.
    var form = document.createElement('form');
    form.setAttribute('id', 'postForm');
    form.setAttribute('method', method);
    form.setAttribute('action', path);
    form.setAttribute('action', path);

    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            var hiddenField = document.createElement('input');
            hiddenField.setAttribute('type', 'hidden');
            hiddenField.setAttribute('name', key);
            hiddenField.setAttribute('value', params[key]);
            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
    $('#postForm').remove();
}

//Compile HTML page for printing purposes
function createPDF(sendEmail, graphCont) {
        var html = '<!DOCTYPE html>\
			<!--[if lt IE 7]> <html class="no-js lt-ie9 lt-ie8 lt-ie7" lang="en"> <![endif]-->\
			<!--[if IE 7]>    <html class="no-js lt-ie9 lt-ie8" lang="en"> <![endif]-->\
			<!--[if IE 8]>    <html class="no-js lt-ie9" lang="en"> <![endif]-->\
			<!--[if IE 9]>	  <html class="no-js ie9" lang="en"> <![endif]-->\
			<!--[if gt IE 8]><!--> <html class="no-js" lang="en"> <!--<![endif]-->\
				<head>\
					<meta charset="utf-8">\
					<title>MHTV Printout</title>\
					<meta name="robots" content="noindex, nofollow">\
					<link rel="stylesheet" media="all" href="../../css/stylesheet.css">\
					<link rel="stylesheet" media="all" href="../../css/graph-ui.css">\
					<link rel="stylesheet" media="all" href="../../css/timeline.css">\
					<link rel="stylesheet" media="all" href="../../css/spectrum.css">\
					<link rel="stylesheet" media="all" href="../../css/print.css">\
				</head>';
        html += '<body>\
					<header>\
						<h1><strong>MHTV Printout</strong></h1>\
					</header>';
        html += '<div id="content_graph">\
					' + graphCont + '</div>\
				</body>\
			</html>';

        //--Submit for conversion to pdf
        //if sendEmail=true, we use AJAX and return JSON response if email is successful
        //else sendEmail=false, php returns a header to trigger Save-As dialog
        if (sendEmail) {

            $.ajax({
                url: 'php/submit_print.php',
                type: 'POST',
                dataType: 'json',
                data: {
                    "sendEmail": sendEmail,
                    "html": html,
                    "userEmail": results.patientEmail,
                    "width": $(document).width(), //(window.innerWidth > 0) ? window.innerWidth : window.screen.width,
                    "height": $(document).height() //(window.innerHeight > 0) ? window.innerHeight : window.screen.height
                },
                beforeSend: function(response) {
                    window.alert('A PDF has been emailed to you');
                },
                success: function(response) {
                    console.log("PDF Email Sent " + response);
                },
                complete: function() {},
                error: function(response) {
                    window.alert('PDF Email Error: ' + response);
                    console.log(response);
                }
            }); //end ajax
        } else {
            // if success, triggers Save-As dialog for PDF donwload
            //console.log('Width: '+ (window.innerWidth > 0) ? window.innerWidth : window.screen.width);

            //http://stackoverflow.com/questions/7411662/simple-way-to-identify-ios-user-agent-in-a-jquery-if-then-statement
            if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
                if (window.confirm("Warning: This action will log you out of MHTV. Save PDF?")) {
                    post_to_url('php/submit_print.php', {
                        "sendEmail": sendEmail,
                        "html": html,
                        "userEmail": results.patientEmail,
                        "width": $(document).width(), //(window.innerWidth > 0) ? window.innerWidth : window.screen.width,
                        "height": $(document).height() //(window.innerHeight > 0) ? window.innerHeight : window.screen.height
                    });
                } //end window.confirm
            } else {

                post_to_url('php/submit_print.php', {
                    "sendEmail": sendEmail,
                    "html": html,
                    "userEmail": results.patientEmail,
                    "width": $(document).width(), //(window.innerWidth > 0) ? window.innerWidth : window.screen.width,
                    "height": $(document).height() //(window.innerHeight > 0) ? window.innerHeight : window.screen.height
                });
            }

        }
    } //end createPDF()

var GenerateSwatches = function() {

    // Trace stack for debugging
    // e = new Error();
    // console.log(e.stack);

    var filterSwatches = function() {

        answerData = timeline.getInitialData();
        patient = results.patientID;

        DisableSwatches();
    };

    var questionSwatches = function() {

        graphColors = JSON.parse(localStorage.getItem("graphColors"));

        $.ajax({
            url: 'php/query_questions.php',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                questions = response;
                addSwatches();
                ParseGraphColors();
            },
            complete: function() {
                /*AddColourPicker(); */
                AddColourPicker.questionSwatches();

                tagSwatches(); //Create tag swtaches. Calls updateGraph after done
                filterSwatches(); //Set null sets to transparent

            },
            error: function() {
                window.alert('Error: Could not retrieve questions to generate swatches!');
            }
        });
    };


    var tagSwatches = (function() {

        tagColors = JSON.parse(localStorage.getItem("tagColors"));
        console.log("tagSwatches start");
        $.ajax({
            type: 'GET',
            url: 'php/get_tags.php',
            data: {
                patientID: results.patientID
            },
            success: function(message) {
                tags = jQuery.parseJSON(message);
                addTagSwatches();
                ParseTagColors();
                //AddColourPickerTags();

            },
            complete: function() {
                AddColourPicker.tagSwatches();

                //Refresh graph after tag swatches created
                timeline.onEditGraph();
            },
            error: function() {
                window.alert('Error: Could not retrieve tags to generate swatches!');
            }
        });
    });

    return {
        questionSwatches: questionSwatches,
        tagSwatches: tagSwatches,
        filterSwatches: filterSwatches
    };

}; //end Generate swatches

var defaultQuestions = ["QIDS_0", "VAS_0", "ASRM_0"]; //"ASRM_4", "ASRM_0"
var defaultColors = ['rgba(85,98,112,1.0)', 'rgba(255,107,107,1.0)', 'rgba(199,244,100,1.0)', 'rgba(78,205,196,1.0)']; //,'rgba(78,205,196,1.0)'

var defaultColorIndex = 0;

function addSwatches() {
    if (questions == null) return;
    for (var i = 0; i < questions.length; i++) {
        var category = questions[i].category;
        if (category != 'Aggregate Scores' /* && (category != 'OTHER' || (category == 'OTHER' && otherCount == 0))*/ ) {
            for (var j = 0; j < questions[i].type.length; j++) {
                var id = questions[i].type[j].id;
                var name = questions[i].type[j].name;

                if (IsInGraphColors(id)) {

                    /// do.. nothing I suppose.

                } else {

                    var newGraphColor = new GraphColor(id);
                    newGraphColor.color = "rgba(0,0,0,0)";

                    if ($.inArray(id, defaultQuestions) != -1) {
                        newGraphColor.color = defaultColors[$.inArray(id, defaultQuestions)];
                    }

                    if (graphColors == null) graphColors = new Array();
                    graphColors.push(newGraphColor);
                }

                $('#legend-header').append('<li id="legend-' + id + '" class="legend-popup" style="display:none;"><span class="swatches" id="swatch-' + id + '"></span><span>' + name + '</span></li>');
                $('#swtchs-legend').append('<li id="legend-menu-' + id + '"><span class="swatches" id="swatch-' + id + '"></span><span>' + name + '</span></li>');
                $('#swtchs-edit').append('<li><a href="#" title="Change ' + name + '\'s colour" class="swatches" id="swatch-' + id + '"></a><span id="text-' + id + '">' + name + '</span></li>');

                // if(IsTransparent(id)) {
                // 	console.log(id + " is transparent");
                // 		$("#swatch-" + id).css('background-image', 'url(./images/visualizer_colour_select_transparent.gif)');	
                // }
            }
        }

        if (category == 'Aggregate Scores') {
            //$('#swtchs-edit').append('<li><a href="#" title="Change QIDS Score\'s colour" id="swatch-SCORE_0"></a> <span>QIDS Score</span></li>');


            if (IsInGraphColors("SCORE_0")) {
                /// do.. nothing I suppose.
            } else {
                var newGraphColor = new GraphColor("SCORE_0");
                newGraphColor.color = "rgba(0,0,0,0)";

                if ($.inArray("SCORE_0", defaultQuestions) != -1) {
                    newGraphColor.color = defaultColors[$.inArray("SCORE_0", defaultQuestions)];
                }

                if (graphColors == null) graphColors = new Array();
                graphColors.push(newGraphColor);
            }


            $('#legend-header').append('<li id="legend-SCORE_0" class="legend-popup" style="display:none;"><span class="swatches" id="swatch-SCORE_0"></span><span>QIDS Score</span></li>');
            $('#swtchs-legend').append('<li id="legend-menu-SCORE_0"><span class="swatches" id="swatch-SCORE_0"></span> <span>QIDS Score</span></li>');
            $('#swtchs-edit').append('<li><a href="#" title="Change QIDS Score\'s colour" class="swatches" id="swatch-SCORE_0"></a><span id="text-SCORE_0">QIDS Score</span></li>');
            //$('#swtchs-edit').append('<li><a href="#" title="Change ' + name + '\'s colour" id="swatch-' + id + '"></a> <span>' + name + '</span></li>');
        }

        $('#scs ul.swatches li a').click(function() {
            return false;
        });
    }
}

function addTagSwatches() {
    if (tags == null) return;

    if (tags.length > 0) {
        for (var j = 0; j < tags.length; j++) {
            //var id = tags[j];

            if (IsInTagColors(tags[j])) {
                /// do.. nothing I suppose.

            } else {

                var newTagColor = new GraphColor(tags[j]);
                newTagColor.color = defaultColors[defaultColorIndex]; //"rgba(0,0,0,0)";
                defaultColorIndex++;
                if (defaultColorIndex > defaultColors.length) defaultColorIndex = 0;
                if (tagColors == null) tagColors = new Array();
                tagColors.push(newTagColor);
            }


            $('.tags').append('<li id="swatch-menu-tag-' + tags[j] + '""\><a href="#" title="Change ' + tags[j] + '\'s colour" class="swatches tag" id="swatch-tag-' + tags[j] + '"\></a> <span>' + tags[j] + '</span></li>'); // style="background-color:#000"
            $('#swatch-tag' + j).css('background-image', 'none');

            $('#scs ul.swatches li a').click(function() {
                return false;
            });
        }

    }
}

var AddColourPicker = (function() {
    var questionSwatches = (function() {
        $("#swtchs-edit .swatches").spectrum({
            color: "rgb(119, 120, 49)",
            showPalette: true,
            allowEmpty: true,
            change: function(color) {

                id = $(this).attr('id').replace("swatch-", "");
                if (color == null) color = "rgba(0,0,0,0)";
                SetSwatchColor(id, color);
                StoreColor(id, color.toString());

                // if(color == null || color == "rgba(0,0,0,0)") {
                // 	$(this).css('background', 'rgba(0,0,0,0)');
                // 	$(this).css('background-image', 'url(./images/visualizer_colour_select_transparent.gif)');
                // 	StoreColor(id,"rgba(0,0,0,0)");
                // }
                // else {
                // 	$(this).css('background', color);
                // 	StoreColor(id,color.toString());
                // }

                timeline.onEditGraph();
            },
            show: function() {
                //$("#bgplate").show();
            },
            hide: function() {
                //$("#bgplate").hide();	
            }

        });
    });

    var tagSwatches = (function() {
        $("#tags-edit .swatches").spectrum({
            color: "red",
            showPalette: true,
            allowEmpty: true,
            change: function(color) {

                id = $(this).attr('id').replace("swatch-tag-", "");
                if (color == null) color = "rgba(0,0,0,0)";

                // $(this).css('background', color);

                SetTagColor(id, color)

                StoreTagColor(id, color.toString());

                timeline.onEditGraph();
            },
            show: function() {
                //	$("#bgplate").show();
            },
            hide: function() {
                //$("#bgplate").hide();	
            }
        });
    });

    return {
        questionSwatches: questionSwatches,
        tagSwatches: tagSwatches
    };

})();


function TurnOff(id) {
    var swatchID = '#swatch-' + id.toString();
    $('.swatches ' + swatchID).css('background', RGBA(0, 0, 0, 0));

}


var idName = function(id) {
    var result = $.grep(answerData, function(e) {
        return e.id == id;
    });
    return result[0].name;
}

var idColor = function(id) {
    var result = $.grep(graphColors, function(e) {
        return e.id == id;
    });
    return result[0].color;
}

var resultsFromSession = function(id, sessionID) {
    var loc = $.grep(answerData, function(e) {
        return e.id == id;
    });
    // // var loc = $.inArray(answerData,id);
    // alert(loc);
    // console.log(loc);
    alert(sessionID);
    for (var i = 0; i < loc[0].results.length; i++) {
        // console.log(Date.parse(loc[0].results[i].Date) + "==" + targetDate);
        if (loc[0].results[i].SessionID == sessionID) {
            return loc[0].results[i].Data;
        }
    }

    return "";
    // var result = $.grep(loc[0].results, function(e){return e.Date == date;});
    // console.log(result);
    // return result[0].Data;
}


var resultsFromDate = function(id, targetDate) {
    var loc = $.grep(answerData, function(e) {
        return e.id == id;
    });
    // // var loc = $.inArray(answerData,id);
    // alert(loc);
    // console.log(loc);
    // alert(targetDate);
    for (var i = 0; i < loc[0].results.length; i++) {

        var compareDate = Date.parse(loc[0].results[i].Date);
        compareDate.set({
            second: 00
        });
        console.log(compareDate + "==" + targetDate);
        if (compareDate.equals(targetDate)) {
            // Alert("Match found");
            return loc[0].results[i].Data;
        }
    }

    return "";
    // var result = $.grep(loc[0].results, function(e){return e.Date == date;});
    // console.log(result);
    // return result[0].Data;
}

function populatePopUpLegend(id) {
    var name = idName(id);
    var cleanName = name.split("_");
    name = cleanName[cleanName.length - 1];
    var getDate = $("#commentDateDiv").html();
    console.log("|" + getDate + "|");
    if (getDate != "Date") {
        var newDate = Date.parse(getDate);
        console.log("Parsed Date " + newDate);
        if (newDate != null) {
            newDate.set({
                second: 00
            });
            console.log(newDate);
            var data = resultsFromDate(id, newDate);
        } else {
            data = "";
            console.log("Date not parsed");
        }
    } else {
        data = "";
    }

    var color = idColor(id);

    var popupText = $.grep(PopUps, function(e) {
        return e.id == id;
    });

    if (data != "") {
        data = Math.round(data);
        var resultsIndex = $.inArray(parseFloat(data), popupText[0].responseIndex);
        console.log(popupText[0].responseIndex + "," + data + "," + resultsIndex);
    }

    var rangeText = "";
    if (popupText[0].description != "" && popupText[0].description != null) {
        rangeText = "<p class='popupHeading'>Range</p><p class='popupDescription'>" + popupText[0].description + "</p>";
    }

    var responseText = "";

    if (popupText[0].response[resultsIndex] != "" && popupText[0].response[resultsIndex] != null) {
        responseText = " = " + popupText[0].response[resultsIndex] + "";
    }

    var responseSection = "";
    if (data != "" || responseText != "") {
        responseSection = "<p class='popupHeading'>Response</p><p class='popupDescription'>" + data + responseText + " </p>";
    }

    //Cindy: Just removed the "+ data'" in the text, was showing 0 whenever it happened
    if (responseSection == "") responseSection = "<p class='popupHeading'>Response</p><p class='popupDescription'>No entry for this date" + "</p>"; // data + &&  rangeText == ""

    var newHtml = "<span class='popupColor' style='background:" + color + "'> </span><p>" + name + "</p>" + rangeText + responseSection;
    $("#legend-popup-content").html(newHtml);

}

function addPopUpLegend() {
    console.log("addPopUp start");

    setTimeout(function() {
        $("#legend-header .legend-popup").on('click', function(e) {
            var id = $(this).attr("id");
            var id = id.replace("legend-", "");
            populatePopUpLegend(id);
            $("#bgplate").show();
            $("#legend-popup").show();

        });

        $("#legend-popup .close-popup").on('click', function(e) {
            $("#legend-popup").hide();
            $("#bgplate").hide();
        });

    }, 250);


}

function AddSmoothingSlider() {
    console.log("addSmoothing start");
    var sliderHTML = '<h3>Graph smoothing</h3><input type="range" id="smoothGraph" min="0" max="100"><ul class="smoothLevels"><li>Off</li><li>Low</li><li>Middle</li><li>High</li></ul>';

    $("#legend_content").append(sliderHTML);

    $("#smoothGraph").rangeslider();

    var storedAlpha = JSON.parse(localStorage.getItem("graphSmoothing"));
    console.log("storedAlpha", storedAlpha + "," + localStorage.getItem("graphSmoothing"));
    if (storedAlpha == null) {
        $("#smoothGraph").val((1 - timeline.getAlpha()) * 100).change();
    } else {
        $("#smoothGraph").val((1 - storedAlpha) * 100).change();
        console.log("Changed value to " + storedAlpha * 100);
        //timeline.setAlpha(storedAlpha);
        //timeline.onEditGraph();
    }

    $("#smoothGraph").on("change", function() {
        var newAlpha = 1 - ($(this).val() / 100);
        // alert(newAlpha + "," + timeline.alpha );
        timeline.setAlpha(newAlpha);
        timeline.onEditGraph();
        localStorage.setItem('graphSmoothing', JSON.stringify(newAlpha));
        console.log(newAlpha);
        // alert("RAAAA");
    });


}


function AddTagsHeading() {
    var tagHeaderHTML = '<h4 class="graphSubheading" id="embededTagHeading">Tags</h4>';
    $("#cfgGraphs").append(tagHeaderHTML);


}

function ParseGraphColors() {
    for (i = 0; i < graphColors.length; i++) {
        // if(graphColors[i].color == "rgba(0,0,0,0)") {

        // 	graphColors[i].color = "rgba(128,128,128,128)"
        // }
        SetSwatchColor(graphColors[i].id, graphColors[i].color);
    }
}

function ParseTagColors() {
    if (tagColors == null) return false;

    for (i = 0; i < tagColors.length; i++) {
        SetTagColor(tagColors[i].id, tagColors[i].color);
    }
}



function SetTagColor(id, color) {
    var swatchID = '#swatch-tag-' + id.toString();
    var legendID = '#swatch-menu-tag-' + id.toString();
    $('.swatches ' + swatchID).css('background', color);
    if (color == "rgba(0,0,0,0)") {
        $('.swatches ' + swatchID).css('background-image', 'url(./img/visualizer_colour_select_transparent.gif)');
        $('#legend_content').find(legendID).hide();
    } else {
        $('#legend_content').find(legendID).show();
    }
}

function SetSwatchColor(id, color) {
    var swatchID = '#swatch-' + id.toString();
    var legendID = '#legend-menu-' + id.toString();
    var headerID = '#legend-' + id.toString();

    $('.swatches ' + swatchID).css('background', color);

    if (color == "rgba(0,0,0,0)") {
        $('.swatches ' + swatchID).css('background-image', 'url(./img/visualizer_colour_select_transparent.gif)');
        $('#swtchs-legend').find(legendID).hide();
        $('#legend-header').find(headerID).hide();
    } else {
        $('#swtchs-legend').find(legendID).show();
        $('#legend-header').find(headerID).show();
    }
}

//Set empty sets of data to transparent
function DisableSwatches() {
    for (var i = 0; i < answerData.length; i++) {
        if (answerData[i].id != 'comment' && answerData[i].id != 'tags' && answerData[i].id != 'uniqueTags' && answerData[i].id != 'notes' && answerData[i].id != 'sessions') {

            if (answerData[i].results == null || answerData[i].results.length <= 0) {
                DisableSwatch(answerData[i].id);
                SetSwatchColor(answerData[i].id, "rgba(0,0,0,0)")
            } else {

            }
        }
    }
}

function DisableSwatch(id) {
    var textID = '#text-' + id.toString();
    var swatchID = '#swatch-' + id.toString();
    // var legendID = '#legend-menu-' + id.toString();
    $(textID).css('color', 'grey');
    $("#swtchs-edit " + swatchID).spectrum("disable");
}



var IsInGraphColors = function(id) {
    if (graphColors == null) return false;
    for (i = 0; i < graphColors.length; i++) {
        if (graphColors[i].id == id) return true;
    }
    return false;
}

var IsInTagColors = function(id) {
    if (tagColors == null) return false;
    for (i = 0; i < tagColors.length; i++) {
        if (tagColors[i].id == id) return true;
    }
    return false;
}

var IsTransparent = function(id) {
    if (graphColors == null) return false;

    for (i = 0; i < graphColors.length; i++) {
        if (graphColors[i].color == null || graphColors[i].color == "rgba(0,0,0,0)") return true;
    }
    return false;
}

function PopUpObject() {
    this.id = "";
    this.description = "";
    this.responseDescription = "";
}


function GraphColor(id) {
    this.id = id;
    this.color = "";
}

function StoreColor(id, color) {

    for (i = 0; i < graphColors.length; i++) {
        if (graphColors[i].id == id) {
            graphColors[i].color = color;
        }
    }

    localStorage.setItem('graphColors', JSON.stringify(graphColors));
}

function StoreTagColor(id, color) {

    for (i = 0; i < tagColors.length; i++) {
        if (tagColors[i].id == id) {
            tagColors[i].color = color;
        }
    }

    localStorage.setItem('tagColors', JSON.stringify(tagColors));
}

function GetColor(id) {
    for (i = 0; i < graphColors.length; i++) {
        if (graphColors[i].id == id) {
            return graphColors[i].color;
        }
    }
    return null;
}

function GetTagColor(id) {
    for (i = 0; i < tagColors.length; i++) {
        if (tagColors[i].id == id) {
            return tagColors[i].color;
        }
    }
    return null;
}
