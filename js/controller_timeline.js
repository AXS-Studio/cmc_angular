 //TimelineController and Directive
 //Handles all functionality in timeline

 //TODO:
 mhtControllers.controller('TimelineCtrl', ['$scope', '$http', '$location',

    function($scope, $http, $location) {

	    console.log("called in timeline");
		
		var initialData; //Stores data downloaded from server, also used by menu-ui.js to populate menu items

	    //Load answers from database (timeline.loadAnswersInitial())
	    //$scope.myData = [10,20,30,40,60, 80, 20, 50];
	    $scope.myData = [];
	    
	    //Load dataset from database for current user
	    results.patientID = "clau";
        ajaxPath = 'php/query_answers_timeline.php?patientID=' + results.patientID;
        patient = ajaxPath.split('=')[1];

        $.ajax({
            url: ajaxPath,
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                initialData = response;
            },
            complete: function(response) {

               //initGraphMenu();//in menu-ui.js

               //Manually update scope as change happened inside AJAX and outside of angular
	            $scope.$apply(function() {
	                $scope.myData = initialData;
	            });
            },
            error: function() {
                window.alert('Cannot connect to the MHTVP server to download data. Please check your internet connection.');
            }
        });

    }

]); //end TimelineCtrl

mhtApp.directive('timeline', function ( $parse ) {
  // define constants and helpers used for the directive

  return {
    restrict: 'E', // the directive can be invoked only by using <my-directive> tag in the template
    
    replace: false, //we don't want to overwrite our directive declaration in the HTML mark-up

    scope: { // attributes bound to the scope of the directive val: '=',    
      data: '=chartData'
    },//end scope

    link: function (scope, element, attrs) {
      // initialization, done once per my-directive tag in template. If my-directive is within an
      // ng-repeat-ed template then it will be called every time ngRepeat creates a new copy of the template.
      
      // ...
          //----------default colours for timeline graph----------
    var colours = [
        'rgba(85,98,112,1.0)', // Mighty Slate
        'rgba(255,107,107,1.0)', // Cheery Pink
        'rgba(199,244,100,1.0)', // Apple chic
        'rgba(78,205,196,1.0)', // Pacifica

        'rgba(255,0,0,1.0)', // Red
        'rgba(0,0,255,1.0)', // Blue
        'rgba(0,255,0,1.0)', // Green
        'rgba(255,165,0,1.0)', // Orange
        'rgba(80,48,137,1.0)', // Purple
        'rgba(222,36,229,1.0)', // Violet
        'rgba(128,104,74,1.0)', // Brown
        'rgba(212,201,137,1.0)', // Tan
        'rgba(235,152,152,1.0)', // Pink
        'rgba(116,212,216,1.0)' // Teal
    ];

    //-----------------------------------------------------------------------------
    //Set up graph layout parameters
    var focusMargin = {
        top: 20,
        right: 10,
        bottom: 20,
        left: 30
    };
    
    var focusDim = {
        width: window.innerWidth,
        height: Math.max(   document.body.scrollHeight, 
                            document.body.offsetHeight, 
                            document.documentElement.clientHeight,
                            document.documentElement.scrollHeight, 
                            document.documentElement.offsetHeight )

        //document.body.clientHeight*0.4
        //Above seems to work best across all browsers and mobile setups
        //width: document.body.clientWidth - focusMargin.right - focusMargin.left,
        //$(document).height() not used, hardcode height of graph to 0.4 of body height
    };

    var tagFocusDim = {
        width: focusDim.width,
        height: 50
    };

    var tagFocusMargin = {
        top: 10,
        right: 10,
        bottom: 20,
        left: 30
    };

    var svgDim = {
        width: focusDim.width + focusMargin.right + focusMargin.left,
        height: focusDim.height + tagFocusDim.height + focusMargin.top + focusMargin.bottom + tagFocusMargin.top + tagFocusMargin.bottom
    }

    var tagDim = {
        width: 3,
        height: 15
    }

    //----------parse functions for dates----------
    var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;
    var commentDateFormat = d3.time.format("%a, %d %b %Y, %-I:%M %p");

    //Set up scales (to map input data to output in pixels)
    //----------scales----------
    var xScale; //defined in defineGraphElements()
    var yScale;

    //----------axis----------
    var xAxis; //defined in defineGraphElements()
    var yAxis;

    //----------mean line----------
    //Graph smoothing constant set to localStorage, or default to 0.5 if NA
    var alpha = JSON.parse(localStorage.getItem("graphSmoothing"));
    if (alpha == null) alpha = 0.5;

    var ypre, xpre;
    var meanline; //defined in defineGraphElements()

    //----------area fill----------
    var areaFill; //defined in defineGraphElements()

    //Setup groups to organize layout, brush areas and perform clipping
    //----------svg container----------
    
    // //Sample code: in D3, any selection[0] contains the group selection[0][0] is the DOM node but we won't need that this time
   	// var chart = d3.select(element[0]);
   	// //to our original directive markup bars-chart we add a div with out chart stling and bind each data entry to the chart
    // chart.append("div").attr("class", "chart")
    //  .selectAll('div')
    //  .data(scope.data).enter().append("div")
    //  .transition().ease("elastic")
    //  .style("width", function(d) { return d + "%"; })
    //  .text(function(d) { return d + "%"; });
    // //a little of magic: setting it's width based on the data value (d) and text all with a smooth transition

    var svg = d3.select('#cfgGraphs svg');
    if (svg.empty()) {
        
        svg = d3.select("#cfgGraphs").append("svg")
        //.style("background-color", "rgba(0,0,0,0.1)")
        .attr("width", svgDim.width)
        .attr("height", svgDim.height);
    }

    //----------groups to contain elements for graph----------
    svg.append("defs")
        .append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", focusDim.width)
        .attr("height", focusDim.height);

    //Gradient for tagFocus_bg
    svg.append("defs")
        .append("linearGradient")
        .attr("id", "gray-gradient")
        .attr("gradientUnits", "objectBoundingBox")
        .attr("x1", "0").attr("y1","0")         
        .attr("x2", "0").attr("y2", "1")
        .selectAll("stop")
        .data([{
            offset: "0%",
            color: 'rgba(200,200,200,1)'
        }, {
            offset: "5%",
            color: 'rgba(240,240,240,1)'
        }, {
            offset: "90%",
            color: 'rgba(230,230,230,1)'
        }, {
            offset: "95%",
            color: 'rgba(200,200,200,1)'
        }])
        .enter().append("stop")
        .attr("offset", function(d) {
            return d.offset;
        })
        .attr("stop-color", function(d) {
            return d.color;
        });

    svg.append("rect")
        .attr("id", "tagFocus_bg")
        .attr("fill", "url(#gray-gradient)")
        .attr("transform", "translate(0," + (focusDim.height + focusMargin.top + focusMargin.bottom + tagFocusMargin.top) + ")")
        .attr("width", svgDim.width)
        .attr("height", tagFocusDim.height + tagFocusMargin.top + tagFocusMargin.bottom);

    //Focus is the timeline graph
    var focus = d3.select('#focus_g');
    if (focus.empty())
        focus = svg.append("g")
            .attr("id", "focus_g")
            .attr("transform", "translate(" + focusMargin.left + "," + focusMargin.top + ")");

    var tagFocus = d3.select('#tagFocus_g');
    if (tagFocus.empty()) {
        tagFocus = svg.append("g")
            .attr("id", "tagFocus_g")
            .attr("transform", "translate(" + focusMargin.left + "," + (focusDim.height + focusMargin.top + focusMargin.bottom + tagFocusMargin.top) + ")")
            .attr('clip-path', 'url(#clip)');
    }

    var overlay = d3.select('#overlay_g');
    if (overlay.empty())
        overlay = svg.append("g")
            .attr("id", "overlay_g");
    
    var x0; //This copy of x captures the original domain setup
    
	//-----------------------------------------------------------------------------------
	//Global variables carried over from last version
    var graphSettings = []; //Keep track of all graphs being plotted
    var tagRowcounter = 0;  //Keep track of number of tag rows
    var initialData;        //Stores data downloaded from server, also used by menu-ui.js to populate menu items

    var initialDataTagIndex;
    var initialDataCommentIndex;

	//Graph elements (axis, graphs scaling) change depending on window size
    //Hence call this on makeGraph() (and in the future when window resized)
    function defineGraphElements(){

        //Adjust dimensions of graph if changed
        focusDim.width = document.body.clientWidth - focusMargin.right - focusMargin.left; //$(document).width() not working in firefox
        focusDim.height = document.body.clientHeight*0.4;//$(document).height()*0.4;

        yScale = d3.scale.linear().range([focusDim.height, 0]);
        xScale = d3.time.scale().range([0, focusDim.width]);
        
        xAxis = d3.svg.axis().scale(xScale).ticks(4).orient("bottom");
        yAxis = d3.svg.axis().scale(yScale).ticks(5).orient("left").tickSize(-focusDim.width, 0);

        meanline = d3.svg.line()
        .interpolate("bundle")
        .tension(0.85)
        .x(function(d, i) {
            return xScale(d.date);
        })
        .y(function(d, i) {
            if (i == 0)
            ypre = yScale(d.Data);

            var ythis = alpha * yScale(d.Data) + (1.0 - alpha) * ypre;
            ypre = ythis;
            return ythis;
        });

        areaFill = d3.svg.area()
        .x(function(d) {
            return xScale(d.date);
        })
        .y0(focusDim.height)
        .y1(function(d) {
            return yScale(d.Data);
        });

        zoom = d3.behavior.zoom().x(xScale)
        .scaleExtent([0.1, 1000])
        .center([focusMargin.left + focusDim.width / 2, 0])
        .on("zoom", zoomed)
        .on("zoomend", zoomEnded);

        lastMidpointDate = xScale.invert(focusDim.width / 2);

       //focus
       d3.select('#focus_g')
       .attr("width", focusDim.width)
       .attr("height", focusDim.height);

    }

    function updateDimensions(){

        //Change height of tag area depending on number of tags
        tagFocusDim.height = tagRowcounter * tagDim.height;
        
        svgDim.height = focusDim.height + tagFocusDim.height + focusMargin.top + focusMargin.bottom + tagFocusMargin.top + tagFocusMargin.bottom;

        //Apply changes to SVG elements
        d3.select("#cfgGraphs svg")
        .attr("width", svgDim.width)
        .attr("height", svgDim.height);

        d3.select("#tagFocus_bg")
        .attr("height", tagFocusDim.height + tagFocusMargin.top + tagFocusMargin.bottom)
        .attr("width", svgDim.width)
        .attr("transform", "translate(0," + (focusDim.height + focusMargin.top + focusMargin.bottom + tagFocusMargin.top) + ")")
        .attr("fill", "url(#gray-gradient)");

       // d3.select("#tagFocus_g")
        tagFocus.attr("transform", "translate(" + focusMargin.left + "," + (focusDim.height + focusMargin.top + focusMargin.bottom + tagFocusMargin.top) + ")");
    }

	//Plot and render the graph from scratch
    function makeGraph() {

        //clear graph
        focus.selectAll("*").remove();
        tagFocus.selectAll("*").remove();
        tagRowcounter = 0;

        //var colourCount = 0;
        defineGraphElements();

		initialData = scope.data; //added here for Angular
		console.log("make graph called: ", initialData);
		
		if (initialData.length = 0)
		return;

        //For each survey item in the data 
        for (var i = 0; i < initialData.length; i++) {
            //console.log("plotting", initialData[i]);
            //---Plot survey data---------------------------------------------------------------------------
            if (initialData[i].id != 'comment' && initialData[i].id != 'tags' && initialData[i].id != 'uniqueTags' && initialData[i].id != 'notes' && initialData[i].id != 'sessions') {

                if (initialData[i].results != null && initialData[i].results.length>0) {

                    //Convert date in initialData to a d3 readable format
                    jQuery.each(initialData[i].results, function(i, d) {
                        d.date = d3.time.format('%Y-%m-%d %H:%M:%S').parse(d["Date"]);
                    });
                
                var thisColour;
                //simple loop to check if colour exists in LocalStorage's graphColor object, if yes sync
                if (graphColors!= null){
                    for (var k = 0; k < graphColors.length; k++) {
                        if (graphColors[k].id == initialData[i].id) {
                            thisColour = graphColors[k].color;
                        }
                    }
                }

                //If this graph is visible, add data to focus
                if (thisColour != "rgba(0,0,0,0)" && thisColour != null) {
                    //console.log("not pushed " + initialData[i].id);
                
                    // Create a settings object for the collected data.
                    graphSettings.push({
                        "id": initialData[i].id,
                        "name": initialData[i].name //,"colour": initialData[i].colour
                    });

                    //----------Add a filled svg path for data in Focus--------------
                    focus.append('path')
                        .datum(initialData[i]["results"]) //use datum to bind to single svg element
                        .attr("id", "data_" + initialData[i].id)
                        .classed('areaFill', true)
                        .attr('clip-path', 'url(#clip)');

                    focus.select("#data_" + initialData[i].id).attr("d", areaFill);

                    //----------Add a line path for smoothed data--------------
                    if (alpha!=1) {
                    focus.append("path")
                        .attr("id", "data_" + initialData[i].id + "_smoothed")
                        .classed('meanline', true)
                        .attr('clip-path', 'url(#clip)')
                        .datum(initialData[i]["results"])
                        .attr("d", meanline);
                    }

                    //-----------Append dots for datapoints on line graphs-------------
                    // var dots  = focus.selectAll(".dot_" + initialData[i].id)
                    // .data(initialData[i]["results"], function(d) {return d.date;});

                    // dots.enter().append('circle')
                    // .style('fill', initialData[i].colour)
                    // .attr('class', "dot_" + initialData[i].id)
                    // .attr('clip-path', 'url(#clip)')
                    // .attr('cx', function(d) {
                    //         return xScale(d.date);
                    //     })
                    // .attr('cy', function(d) {
                    //         return yScale(d.Data);
                    //     })
                    // .attr('r', function(d) {
                    //         return 1;
                    //     });

                    // dots.exit().remove();

                    }//end if thisColour...
                }
            } //end if initialData[i].id != comments, sessions, notes

            //---Plot tags--------------------- ------------------------------------------------------
            else if (initialData[i].id == 'uniqueTags') {
                initialDataTagIndex = i; //remember the index for the tags

                for (var j = 0; j < initialData[initialDataTagIndex].results.length; j++) {

                    //Convert date in initialData to a d3 readable format
                    jQuery.each(initialData[initialDataTagIndex].results[j].results, function(i, d) {
                        d.date = d3.time.format('%Y-%m-%d %H:%M:%S').parse(d["Date"]);
                    });

                    var thisTag = initialData[initialDataTagIndex].results[j].tag;
                    var thisColour;

                    //simple loop to check if colour exists in tag's graphColor object, if yes sync
                    for (var k = 0; k < tagColors.length; k++) {
                        if (tagColors[k].id == thisTag) {
                            thisColour = tagColors[k].color;
                        }
                    }

                    if (thisColour != "rgba(0,0,0,0)" && thisColour != null) {

                        //Create an object in graphSettings
                        graphSettings.push({
                            "id": "tag_" + thisTag,
                            "tag": thisTag,
                            "colour": thisColour
                        });

                        //graphSettings.tags.push(thisTag);//add to list of tags displayed

                        //append rects for each tag group. In d3 fashion first bind the data
                        var rects = tagFocus.selectAll(".rect_" + thisTag).data(initialData[initialDataTagIndex].results[j].results, function(d) {
                            return d.date;
                        });

                        //Append rects for all binded data entering the graph
                        rects.enter().append('rect')
                            .style('fill', thisColour)
                            .attr('class', "rect_" + thisTag)
                            .attr("data-sessionID", function(d) {
                                return d.SessionID;
                            })
                            .attr('x', function(d) {
                                return xScale(d.date) - tagDim.width / 2;
                            })
                            .attr('y', function(d) {
                                return tagRowcounter * tagDim.height;
                            })
                            .attr('width', function(d) {
                                return tagDim.width;
                            })
                            .attr('height', function(d) {
                                return tagDim.height;
                            });

                        rects.exit().remove();

                        tagRowcounter++;
                    }
                } //end for

                //Change height of tag area depending on number of tags
                //Moved to updateDimensions()
               updateDimensions();

            } //end if initialData[i].id == 'tags'

            //---Plot comments---------------------------------------------------------------------------
            else if (initialData[i].id == 'comment') {
                initialDataCommentIndex = i;

                //Convert date in initialData to a d3 readable format
                jQuery.each(initialData[i].results, function(i, d) {
                    d.date = d3.time.format('%Y-%m-%d %H:%M:%S').parse(d["Date"]);
                });
                //append rects for each tag group
                var commentRects = tagFocus.selectAll(".rect_comment")
                    .data(initialData[i]["results"], function(d) {
                        return d.date;
                    });

                //Opacity set to 0 to hide from patients per Jason's request
                commentRects.enter().append('rect')
                    .style('fill', 'rgba(100,100,100,0)')
                    .attr('class', "rect_comment")
                    .attr("data-sessionID", function(d) {
                        return d.SessionID;
                    })
                    .attr('x', function(d) {
                        return xScale(d.date) - tagDim.width / 2;
                    })
                    .attr('y', 0)
                    .attr('width', tagDim.width)
                    .attr('height', tagDim.width);

                commentRects.exit().remove();
            }
        } //end for initialData.length

        // Scale the range of the data
        // Using comment data as domain
        xScale.domain(d3.extent(initialData[initialDataCommentIndex].results, function(d) {
            return d.date;
        }));
        yScale.domain([0, 100]);

        //Call zoom
        zoom.x(xScale);

        x0 = xScale.copy(); //keep a copy of original domain

        //-----------Graph elements - axis, tuner strip, transparent zoom rect-----------

        //Add a radio tuner style strip
        //Shift overlay up or down
        overlay.attr("transform", "translate(" + (focusMargin.left + focusDim.width / 2) + "," + (focusDim.height + focusMargin.top + focusMargin.bottom + tagFocusMargin.top + tagFocusDim.height + tagFocusMargin.bottom) + ")"); //

        //Shift gradient of tag bg
        svg.select("#tagFocus_bg")
        .attr("fill", "url(#gray-gradient)")
        .attr("transform", "translate(0," + (focusDim.height + focusMargin.top + focusMargin.bottom + tagFocusMargin.top) + ")")
        .attr("width", svgDim.width)
        .attr("height", tagFocusDim.height + tagFocusMargin.top + tagFocusMargin.bottom);


        if (overlay.select('#tuner').empty()) {

            var tunerHeight = focusDim.height + focusMargin.top + focusMargin.bottom + tagFocusMargin.top + tagFocusDim.height + tagFocusMargin.bottom;

            overlay.append("rect")
                .style('fill', 'rgba(0,0,0,0.5)')
                .attr({
                    'id': 'tuner',
                    'width': 1,
                    'height': tunerHeight,
                    'x': 0, //focusDim.width / 2
                    'y': -1 * tunerHeight
                });

            overlay.append("path")
                .style('stroke', 'rgba(192,192,192,1)')
                .attr({
                    'id': 'horizontal_tuner_line',
                    'd': "M " + (-svgDim.width / 2 - focusMargin.left) + " 0 L " + (svgDim.width / 2 + focusMargin.right) + " 0"
                });

            overlay.append("path")
                .style('fill', 'rgba(256,256,256,1)')
                .attr({
                    'id': 'triangle',
                    "transform": "translate(" + 0 + "," + 0 + ")",
                    'd': "M -10 1 L 0 -10 L 10 1 L -10 1"
                });

            overlay.append("path")
                .style('stroke', 'rgba(192,192,192,1)')
                .style('fill', "none")
                .attr({
                    'id': 'triangleStroke',
                    "transform": "translate(" + 0 + "," + 0 + ")",
                    'd': "M -10 0 L 0 -10 L 10 0"
                });
        } //end if tuner empty
        else{
            //readjust tuner height
            var tunerHeight = focusDim.height + focusMargin.top + focusMargin.bottom + tagFocusMargin.top + tagFocusDim.height + tagFocusMargin.bottom;
            overlay.select('#tuner').attr({'height': tunerHeight, 'y': -1 * tunerHeight});
        }

        //Axis
        if (d3.select('#xAxis_g').empty()) {
            focus.append("g")
                .attr("class", "x axis")
                .attr("id", "xAxis_g")
                .attr("transform", "translate(0," + focusDim.height + ")")
                .call(xAxis);
        }

        focus.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        //Add transparent Rect for zoom function and call zoom for first time
        focus.append("rect")
            .attr("class", "pane")
            .attr("width", focusDim.width)
            .attr("height", focusDim.height)
            .call(zoom);

        //Apply colours
        changeColours();

        updateGraph();

        //Reset graph for scaling and translation. Empty Comments section.
        reset();

        if (graphSettings.length == 0){
            window.alert("No data available to graph, until at least one survey completed");
        }
    } //end makeGraph function

//----------Setup brush-------------------------------------------------------------

    //.x(x).scaleExtent([1,10]) limits zoom from 1X to 10X
    var zoom;

    // var zoom = d3.behavior.zoom().x(xScale)
    //     .scaleExtent([0.1, 1000])
    //     .center([focusMargin.left + focusDim.width / 2, 0])
    //     .on("zoom", zoomed)
    //     .on("zoomend", zoomEnded);

    //----------Setup zoom-------------------------------------------------------------

    function zoomed() {
        updateGraph(); //Continuously update graph while panning and zooming
    }

    function zoomEnded() {
        getComment(); //Get closest comment point
        shiftGraph(); //snap graph to closest point
        updateGraph(); //Update graph after snapping

        changeColours();
    }
    
    //Reset graph for scaling and translation. Empty Comments section.
    function reset() {
        zoom.scale(1);
        zoom.translate([0, 0]);

        $("#commentDateDiv").html("Date");
        $("#commentDataDiv").html("");
        $("#commentTagUL").html(""); //reset comment list
    }

    //----------When menu changed-------------------------------------------------------------
    function onEditGraph() {
        makeGraph();
    }

    function setAlpha(input) {
        alpha = input;
    }

    function getAlpha() {
        return alpha;
    }
    
    //----------Update whole graph-------------------------------------------------------------
    //Global to capture x-pixel of current comment
    var xCommentDate = focusDim.width / 2;
    var commentDate;

    //Update graph while panning and zooming and after snapping to closest comment
    function updateGraph() {

        //Update all line graphs currently rendered
        for (var i = 0; i < graphSettings.length; i++) {
            var id = graphSettings[i].id;
            var colour = graphSettings[i].colour;
            var type = id.split("_")[0]; //either: QIDS, SCORE, VAS, ASRM, tag
            var tag = id.split("_")[1];

            var tagRowcounter = 0;

            //Update line graph
            focus.select("#data_" + graphSettings[i].id).attr("d", areaFill);
            focus.select("#data_" + graphSettings[i].id + "_smoothed").attr("d", meanline); //update meanline when in place

            //Update dots on line graphs (not used)
            // var dots = focus.selectAll(".dot_" + graphSettings[i].id);
            // if (!dots.empty()) {
            //     dots.attr("cx", function(d) { return xScale(d.date); });
            // }

            if (type == "tag") {
                var rects = tagFocus.selectAll('.rect_' + tag);
                if (!rects.empty()) {

                    rects.attr('x', function(d) {
                        return xScale(d.date) - tagDim.width / 2;
                    });;
                    //.attr('y', function() { return tagRowcounter*tagDim.height });
                }
            }

        } //end for graphSettings length

        //Update comments
        var commentRects = tagFocus.selectAll('.rect_comment');
        if (!commentRects.empty()) {
            commentRects.attr('x', function(d) {
                return xScale(d.date) - tagDim.width / 2;
            })
        }

        focus.select(".x.axis").call(xAxis);

    } //end updateGraph()


    //Global to capture last midpointDate for snapping to right or left
    var lastMidpointDate;

    //var lastMidpointDate = xScale.invert(focusDim.width / 2);

    //----------Retrieve a comment based on closest entry to the midpoint, move the tuner----------------------

    function getComment() {

        //Get where the date the midpoint (ie. the ticker) has landed
        var midpointDate = xScale.invert(focusDim.width / 2);

        var lastDateinDomain = x0.domain()[1]; //Remember x0? A copy of the domain before any zooming/scaling done

        var bisect; //define bisect function depending if midpoint tuner strip is to the right of the last point in graph
        var commentIndex; //index of comment to be displayed

        //if tuner strip is to the left of last data entry in graph (within range)
        if (midpointDate < lastDateinDomain) {
            bisect = d3.bisector(function(d) {
                return d.date;
            }).left; //returns index of data to the right of bisector
            commentIndex = bisect(initialData[initialDataCommentIndex].results, midpointDate);

            //--Snapping based on direction of scroll right or left  - if user scrolled graph for an older date, snap to left
            // Works better for mouse-zoome wheels
            // if (commentIndex > 0 && midpointDate<lastMidpointDate){
            //         commentIndex = commentIndex-1;
            // }

            //--Snapping based on whether user is closer to right/left date (works better for pinch-zoom on phones)
            if (commentIndex > 0) {
                var dateDiff1 = Math.abs(initialData[initialDataCommentIndex].results[commentIndex].date - midpointDate);
                var dateDiff2 = Math.abs(initialData[initialDataCommentIndex].results[commentIndex - 1].date - midpointDate);
                if (dateDiff2 < dateDiff1)
                    commentIndex = commentIndex - 1;
            }
        }
        //if to the right of last entry, snap to last entry(out of range)
        else if (midpointDate > lastDateinDomain) {
            commentIndex = initialData[initialDataCommentIndex].results.length - 1;
        }

        if (commentIndex == null)
            commentIndex = initialData[initialDataCommentIndex].results.length - 1; //explicitly set to prevent null errors from fast zoom

        commentDate = initialData[initialDataCommentIndex].results[commentIndex].date;
        xCommentDate = xScale(commentDate); //pixel point of selected comment

        if (initialData[initialDataCommentIndex].results[commentIndex].Data != null) {
            var commentData = initialData[initialDataCommentIndex].results[commentIndex].Data;
            var commentTags = initialData[initialDataCommentIndex].results[commentIndex].Tags;

            $("#commentDateDiv").html(commentDateFormat(commentDate));
            $("#commentDataDiv").html(commentData);
            $("#commentTagUL").html(""); //reset comment list
            //Append Tags
            if (commentTags.length > 0) {

                commentTags.forEach(
                    function(item) {
                        jQuery('<li/>', {
                            id: item + "_li",
                            text: item
                        }).appendTo('#commentTagUL');

                        jQuery('<div/>', {
                            id: "div_" + item,
                            class: "tagDiv",
                            text: "",
                        }).prependTo("#" + item + "_li");

                        //$("#commentTagUL").append($(document.createElement('li')).text(item));
                    }
                ) //end forEach
            }
        }

    } //end getComment

    //----------Shift the graph to snap to selected comment-------------------------------------------------------------

    function shiftGraph() {

        //translate graph to closest comment
        var translateGraph = xCommentDate - focusDim.width / 2; //zoom.translate()[0]
        zoom.translate([zoom.translate()[0] - translateGraph, 0]);

        lastMidpointDate = commentDate; //remember this midpointDate for use in snapping
    }

    //----------Change all colours of graphs and tags-------------------------------------------------------------

    function changeColours() {

        for (var i = 0; i < graphSettings.length; i++) {

            var id = graphSettings[i].id;
            var type = id.split("_")[0]; //either: QIDS, SCORE, VAS, ASRM, tag
            var tag = id.split("_")[1];

            //simple loop to check if colour exists in menu's graphColor object, if yes sync
            if (type != "tag") {
                if (graphColors!=null){
                    for (var j = 0; j < graphColors.length; j++) {
                        if (graphColors[j].id == id) {
                            graphSettings[i].colour = graphColors[j].color;
                        }
                    }
                }
            } else if (type == "tag") {
                //simple loop to check if colour exists in menu's tagColor object, if yes sync
                if (tagColors!=null){
                    for (var j = 0; j < tagColors.length; j++) {
                        if (tagColors[j].id == tag) {
                            graphSettings[i].colour = tagColors[j].color;
                        }
                    }
                }
            }
            var thisColour = graphSettings[i].colour;

            //Update tags
            if (type == "tag" && graphSettings[i].hasOwnProperty('tag')) {
                $(".rect_" + graphSettings[i].tag).css("fill", thisColour);
                $("#div_" + graphSettings[i].tag).css("background-color", thisColour);
            } else if (type != "tag") {
                //Update line graphs and dots
                $("#data_" + id).css("fill", thisColour);
                $("#data_" + id).css("stroke", thisColour);

                $("#data_" + id + "_smoothed").css("stroke", thisColour);

                //$(".dot_"+id).css("fill",thisColour); //dots on line graphs are hidden
            }

        } //end for graphSettings length
    } //end changeColours

    function updateHeader() {
        for (var i = 0; i < graphSettings.length; i++) {

            var qid = graphSettings[i].id;
            var type = qid.split("_")[0]; //either: QIDS, SCORE, VAS, ASRM, tag
            var colour = graphSettings[i].colour;

            if (colour != "rgba(0,0,0,0)" && type != "tag") {

                //If header does not contain the graph item
                if (jQuery("#" + qid + "_header_li").length == 0) {
                    jQuery('<li/>', {
                        id: qid + "_header_li",
                        text: qid
                    }).appendTo('#graph-header');

                    jQuery('<div/>', {
                        id: qid + "_menu_div",
                        class: "headerDiv",
                        text: "",
                    }).prependTo("#" + qid + "_header_li");
                }
                $("#" + qid + "_menu_div").css("background-color", colour);
            }

        }
    } //end updateHeaders

	//-----------------------------------------------------------------------------------
    
    //Whenever the bound 'data' expression changes, execute this 
    scope.$watch('data', function (newVal, oldVal) {

        console.log("inside link, watch", scope.data, newVal, oldVal);
        onEditGraph();

      });
    }//end link

  };
});


