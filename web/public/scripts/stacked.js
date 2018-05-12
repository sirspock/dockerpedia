angular.module('dockerpedia.directives')
.directive(
  'stacked', 
  function() {
  return {
    restrict: 'EA',
    scope: { data: '=', update: '=', selected: '='},
    link: function(scope, element, attrs) {
/******************** D3 code here *******************/
      scope.update = function (id) {
        //console.log(scope.data) // <-- Data here!
        //console.log(scope.data['google'].images[0].packages);
        var data = [];
        var all = scope.data[scope.selected].images[id].packages; //imge id
        var tmp = null;
        for (n in all) {
          tmp = {
            critical : all[n].critical,
            high : all[n].high,
            low : all[n].low,
            medium : all[n].medium,
            negligible : all[n].negligible,
            package : all[n].name,
            unknown : all[n].unknown
          }
          if (tmp.critical || tmp.high || tmp.low || 
              tmp.medium || tmp.negligible || tmp.unknown )
            data.push(tmp);
        }
        data.columns = ['critical', 'high', 'low', 'medium', 'negligible', 'package', 'unknown']
        //console.log ( data );
        start(data);
      };



var start = function (data) {
  var parentWidth = element[0].parentElement.offsetWidth;
  var input = {'data': data, 'width':parentWidth-30, 'height': Math.max(data.length*20, 200)},
      canvas = setUpSvgCanvas(input);
  drawBars(input, canvas); 
}

/*var tooltip = svg.append("g")
  .attr("class", "tooltip")
  .style("display", "none");
    
tooltip.append("rect")
  .attr("width", 30)
  .attr("height", 20)
  .attr("fill", "white")
  .style("opacity", 0.5);

tooltip.append("text")
  .attr("x", 15)
  .attr("dy", "1.2em")
  .style("text-anchor", "middle")
  .attr("font-size", "12px")
  .attr("font-weight", "bold");
*/ 
function drawBars(input, canvas) {

    var params = {'input': input, 'canvas': canvas};
    initialize(params);
    update(params);

}


function initialize(params) {

    // unpacking params
    var canvas = params.canvas,
        input = params.input;

    // unpacking canvas
    var svg = canvas.svg,
        margin = canvas.margin,
        width = params.width = canvas.width,
        height = params.height = canvas.height;


    // processing Data and extracting packageNames and severityNames
    var formattedData = formatData(input.data),
        blockData = params.blockData = formattedData.blockData,
        packageNames = params.packageNames = formattedData.packageNames,
        severityNames = params.severityNames = formattedData.severityNames;

    //console.log(formattedData)
    // initialize color
    var color = setUpColors().domain(severityNames);

    // initialize scales and axis
    var scales = initializeScales(width, height),
        x = params.x = scales.x,
        y = params.y = scales.y;

    y.domain(packageNames);
    x.domain([0, d3.max(blockData, function(d) { return d.y1; })]);

    initializeAxis(svg, x, y, height, width);

    // initialize bars
    var bar = params.bar = svg.selectAll('.bar')
      .data(blockData)
      .enter().append('g')
        .attr('class', 'bar');

    //console.log(y.bandwidth())
    bar.append('rect')
            .attr('y', function(d) {return y(d.x);})
            .attr('x', function(d) {return x(0);})
            .attr("width", 0)
            .attr('height', y.bandwidth())
            .attr('fill', function(d){ return color(d.cluster);});

    var tooltip = params.tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    tooltip.append("rect")
      .attr("width", 30)
      .attr("height", 20)
      .attr("fill", "black")
      .style("opacity", 0.5);

    tooltip.append("text")
      .attr("x", 15)
      .attr("dy", "1.2em")
      .style("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("font-weight", "bold");

    // heights is a dictionary to store bar height by cluster
    // this hierarchy is important for animation purposes
    // each bar above the chosen bar must collapse to the top of the
    // selected bar, this function defines this top
    params.heights = setUpHeights(severityNames, blockData);

    // defining max of each bin to convert later to percentage
    params.maxPerBin = setUpMax(severityNames, blockData);


    // variable to store chosen cluster when bar is clicked
    var chosen = params.chosen = {
        cluster: null
    };

    // initialize legend
    var legend = params.legend = svg.selectAll('.legend')
        .data(severityNames)
        .enter().append('g')
            .attr('class', 'legend');

    legend.append('rect')
        .attr('x', width + margin.right - 18)
        .attr('y', function(d, i) {return 20 * (severityNames.length - 1 - i);})
        .attr('height', 18)
        .attr('width', 18)
        .attr('fill', function(d){ return color(d);})
        .on('click', function(d){
            chosen.cluster = chosen.cluster === d ? null : d;
            update(params);
        });

    legend.append('text')
        .attr('x', width + margin.right - 25)
        .attr('y', function(d, i) { return 20 * (severityNames.length - 1 - i) ;})
        .text(function(d) {return d;})
        .attr('dy', '.95em')
        .style('text-anchor', 'end');

    // initialize checkbox options
    d3.select("#myCheckbox").on("change",function(){update(params);});

    params.view = false;

}

function update(params){

    // retrieving params to avoid putting params.x everywhere
    var svg = params.canvas.svg,
        margin = params.canvas.margin,
        x = params.x,
        y = params.y,
        tooltip = params.tooltip,
        blockData = params.blockData,
        heights = params.heights,
        chosen = params.chosen,
        width = params.width,
        height = params.height,
        bar = params.bar,
        severityNames = params.severityNames,
        packageNames = params.packageNames,
        legend = params.legend,
        maxPerBin = params.maxPerBin,
        view = params.view;

    var transDuration = 700;

    // re-scaling data if view is changed to percentage
    // and re-scaling back if normal view is selected
    var newView = d3.select("#myCheckbox").property("checked");

    if(newView){
        if(view != newView){
            blockData.forEach(function (d){
                d.y0 /= maxPerBin[d.x];
                d.y1 /= maxPerBin[d.x];
                d.height /= maxPerBin[d.x];
            });
            heights = setUpHeights(severityNames, blockData);
        }
    }
    else{
        if(view != newView){
            blockData.forEach(function (d){
                d.y0 *= maxPerBin[d.x];
                d.y1 *= maxPerBin[d.x];
                d.height *= maxPerBin[d.x];
            });
            heights = setUpHeights(severityNames, blockData);
        }
    }
    params.view = newView;


    // update Y axis
    if(chosen.cluster == null){
        x.domain([0, d3.max(blockData, function(d) { return d.y1; })]);
    }
    else{
        x.domain([0, d3.max(heights[chosen.cluster])]);
    }

    if(newView){
        x.domain([0, 1]);
    }

    var axisX = d3.axisBottom(x)
        .tickSize(-height);

    if(newView){
         axisX.tickFormat(d3.format(".0%"));
    }


    svg.selectAll('.axisX')
        .transition()
        .duration(transDuration)
        .call(axisX);


    // update legend
    legend.selectAll('rect')
        .transition()
        .duration(transDuration)
        .attr('height', function(d) {return choice(chosen.cluster, d, 18, 18, 0);})
        .attr('y', function(d) {
            var i = severityNames.indexOf(d);
            if (i > severityNames.indexOf(chosen.cluster)){
                return choice(chosen.cluster, d, 20 * (severityNames.length - 1 - i) , 0, 0);
            }
            else {
                return choice(chosen.cluster, d, 20 * (severityNames.length - 1 - i) , 0,  18);
            }
        });
    legend.selectAll('text')
        .transition()
        .duration(transDuration)
        .attr('y', function(d) {
            var i = severityNames.indexOf(d);
            if (i > severityNames.indexOf(chosen.cluster)){
                return choice(chosen.cluster, d, 20 * (severityNames.length - 1 - i) , 0, 0);
            }
            else {
                return choice(chosen.cluster, d, 20 * (severityNames.length - 1 - i) , 0,  18);
            }
        })
        .style('font-size' ,function(d, i) {return choice(chosen.cluster, d, '16px', '16px', '0px');})
        .attr('x', function(d) {return choice(chosen.cluster, d, 
            width + margin.right - 25,
            width + margin.right - 25,
            width + margin.right - 25 - this.getComputedTextLength()/2);});


    // update bars
    bar.selectAll('rect')
        // .on("mouseover", function(d) {
        //     tooltip.transition()
        //          .duration(200)
        //          .style("opacity", .9);
        //     tooltip.html(d["Cereal Name"]) //+ "<br/> (" + xValue(d) + ", " + yValue(d) + ")")
        //          .style("left", (d3.event.pageX + 5) + "px")
        //          .style("top", (d3.event.pageY - 28) + "px");
        // })
        // .on("mouseout", function(d) {
        //     tooltip.transition()
        //          .duration(500)
        //          .style("opacity", 0);
        // }

        .on("mouseover", function(d) {
          tooltip.transition()
               .duration(200)
               .style("opacity", .9);
            var xPosition = d3.event.pageX + 5;
            var yPosition = d3.event.pageY - 28;
            console.log(tooltip)
            tooltip.style("left", xPosition + "px");
            tooltip.style("top", yPosition + "px");
            tooltip.select("text").text(d.height);

        })
        .on("mouseout", function(d) {
            tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        })
        .on('click', function(d){
            chosen.cluster = chosen.cluster === d.cluster ? null : d.cluster;
            update(params);
        })
        .transition()
        .duration(transDuration)
        .attr('x', function(d) {
            return choice(chosen.cluster, d.cluster,
                x(d.y0), //ok
                x(0),
                myHeight(chosen, d, severityNames, packageNames, x, heights));
        })
        .attr('width', function(d) { 
            return choice(chosen.cluster, d.cluster,
                x(d.height), //ok
                x(d.height),
                0);
        });

}

// heights is a dictionary to store bar height by cluster
// this hierarchy is important for animation purposes 
function setUpHeights(severityNames, blockData) {
    var heights = {};
    severityNames.forEach(function(cluster) { 
        var clusterVec = [];
        blockData.filter(function (d){ return d.cluster == cluster;}).forEach(function(d) {
            clusterVec.push(d.height);
        });
        heights[cluster] = clusterVec;
    });
    return heights;
}

// getting the max value of each bin, to convert back and forth to percentage
function setUpMax(severityNames, blockData){
    var lastClusterElements = blockData.filter(function(d){return d.cluster == severityNames[severityNames.length - 1]})
    var maxDict = {};
    lastClusterElements.forEach(function(d) {
        maxDict[d.x] = d.y1;
    });
    return maxDict;
}

// custom function to provide correct animation effect
// bars should fade into the top of the remaining bar
function myHeight(chosen, d, severityNames, packageNames, x, heights){
    if(chosen.cluster == null){
        return 0;
    }
    if(severityNames.indexOf(chosen.cluster) > severityNames.indexOf(d.cluster)){
        return 0;
    }
    else {
        return x(heights[chosen.cluster][packageNames.indexOf(d.x)]);
    }
}


// handy function to play the update game with the bars and legend
function choice(variable, target, nullCase, targetCase, notTargetCase){
    switch(variable) {
        case null:
            return nullCase;
        case target:
            return targetCase;
        default:
            return notTargetCase;
        }
}


function initializeScales(width, height){
    var y = d3.scaleBand()
    .rangeRound([0, height])    // .rangeRound([height, 0]);
    .align(0.1);


    var x = d3.scaleLinear()
        .range([0, width]);

    return {
        x: x,
        y: y
    };
}


function initializeAxis(svg, x, y, height, width){
    var yAxis = d3.axisLeft(y)
        .tickSize(-width);

    svg.append('g')
        .attr('class', 'axisY')
        .call(yAxis);

    svg.append('g')
        .attr('class', 'axisX')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x).ticks(null, "s"))                  //  .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
          .attr("y", 35)                                             //     .attr("y", 2)
          .attr("x", x(x.ticks().pop()) + 0.5)                      //     .attr("y", y(y.ticks().pop()) + 0.5)
          .attr("dy", "0.32em")                                     //     .attr("dy", "0.32em")
          .attr("fill", "#000")
          .attr("font-weight", "bold")
          .attr("text-anchor", "start")
          .text("Vulnerabilities")
          .attr("transform", "translate("+ (-width) +",-10)"); 
}


function setUpSvgCanvas(input) {
    // Set up the svg canvas
    var margin = {top: 20, right: 100, bottom: 20, left: 80},
        width = input.width - margin.left -margin.right,
        height = input.height - margin.top -margin.bottom;
  
    var tmp = document.getElementById("stacked-svg");
    if (tmp) tmp.parentNode.removeChild(tmp);

    var svg = d3.select(element[0]).append("svg")
        .attr('id', 'stacked-svg')
        .attr('width', width + margin.left + margin.right )
        .attr('height', height + margin.top +margin.bottom )
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    return {
        svg: svg,
        margin: margin,
        width: width,
        height: height
    };
}


function setUpColors() {
    return d3.scaleOrdinal(d3.schemeCategory20);
}


// formatting Data to a more d3-friendly format
// extracting packageNames and severityNames
function formatData(data){

    var severityNames = d3.keys(data[0]).filter(function(key) {return key !== 'package'; });
    var packageNames = [];
    var blockData = [];
    //console.log(data)

    for(var i = 0; i < data.length; i++){
        var y = 0;
        packageNames.push(data[i].package);
        for(var j = 0; j < severityNames.length; j++){
            var height = parseFloat(data[i][severityNames[j]]);
            var block = {'y0': parseFloat(y),
                'y1': parseFloat(y) + parseFloat(height),
                'height': height,
                'x': data[i].package,
                'cluster': severityNames[j]};
            y += parseFloat(data[i][severityNames[j]]);
            blockData.push(block);
        }
    }
    return {
        blockData: blockData,
        packageNames: packageNames,
        severityNames: severityNames
    };

}






/*****************************************************/
    }
  };
});
