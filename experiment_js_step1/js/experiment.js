var state = {
  NONE: 0,
  INTERTITLE: 1,
  SHAPES: 2,
  PLACEHOLDERS: 3,
  FINISH_EXPERIMENT: 4,
};

var timeTracker = {
  startTime: 0,
  endTime: 0
}

var perceptionTime = [];

var objCount = 0;

var shapes = [];

var recordIsCorrect = false;

var ctx = {
  w: 1400,
  h: 600,

  trials: [],
  participant: "",
  startBlock: 0,
  startTrial: 0,
  cpt: 0,

  logs: [],
  participantIndex: "ParticipantID",
  blockIndex: "Block1",
  trialIndex: "TrialID",
  vvIndex: "VV",
  objectsCountIndex: "OC",

  state: state.NONE,

};

var keyListener = function (event) {

  event.preventDefault();

  if (ctx.state == state.INTERTITLE && event.code == "Enter") {
    d3.selectAll('.instr').remove();
    startTrial();
  } else if (ctx.state == state.SHAPES && event.code == "Space") {
    d3.selectAll(".visualMarks").remove();
    showPlaceholders();
  }
}

var showIntertitle = function () {
  ctx.state = state.INTERTITLE;

  d3.select("#instructions")
    .append('p')
    .classed('instr', true)
    .html("Multiple shapes will get displayed.<br> Only <b>one shape</b> is different from all other shapes.");

  d3.select("#instructions")
    .append('p')
    .classed('instr', true)
    .html("1. Spot it as fast as possible and press <code>Space</code> bar;");

  d3.select("#instructions")
    .append('p')
    .classed('instr', true)
    .html("2. Click on the placeholder over that shape.");

  d3.select("#instructions")
    .append('p')
    .classed('instr', true)
    .html("Press <code>Enter</code> key when ready to start.");

}

// copied from https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

var startTrial = function () {
  timeTracker.startTime = new Date().getTime();

  ctx.state = state.SHAPES;

  var objectCount = ctx.trials[ctx.cpt][ctx.objectsCountIndex];
  var vv = ctx.trials[ctx.cpt][ctx.vvIndex];

  console.log("experimental condition: " +
    "(VV=" + vv + ", " +
    "OC=" + objectCount + ")");

  // TODO show the grid of shapes depending on the experimental condition
  // example for VV="Size"

  objCount =
    (objectCount === "low") ? 9 :
      (objectCount === "medium") ? 16 : 25;

  // pick a random appearance for our target
  var targetSize = Math.random() < 0.5 ? "small" : "large";
  var targetColor = Math.random() < 0.5 ? "light" : "dark";


  // add the target to the list of shapes to display
  shapes.push({ size: targetSize, color: targetColor, target: true });

  if (vv === "Size") {
    // add (objectCount - 1) shapes that have a different size than that of the target
    for (var i = 0; i < (objCount - 1); i++) {
      shapes.push(
        {
          size: (targetSize === "small" ? "large" : "small"),
          color: targetColor,
          target: false
        });
    }
  }
  else if (vv == "Color") {
    for (var i = 0; i < (objCount - 1); i++) {
      shapes.push(
        {
          size: targetSize,
          color: (targetColor === "light" ? "dark" : "light"),
          target: false
        });
    }
  }
  else if (vv == "Color_Size") {
    var temp = objCount - 1;
    if (temp % 2 !== 0) {
      console.log("not even");
      shapes.push(
        {
          size: targetSize,
          color: (targetColor === "light" ? "dark" : "light"),
          target: false
        });
      for (var i = 0; i < (temp / 2) - 1; i++) {
        shapes.push(
          {
            size: targetSize,
            color: (targetColor === "light" ? "dark" : "light"),
            target: false
          });
      }
      for (var i = 0; i < (temp / 2) - 1; i++) {
        shapes.push(
          {
            size: (targetSize === "small" ? "large" : "small"),
            color: targetColor,
            target: false
          });
      }
    }
    else {
      for (var i = 0; i < (temp / 2); i++) {
        shapes.push(
          {
            size: targetSize,
            color: (targetColor === "light" ? "dark" : "light"),
            target: false
          });
      }
      for (var i = 0; i < (temp / 2); i++) {
        shapes.push(
          {
            size: (targetSize === "small" ? "large" : "small"),
            color: targetColor,
            target: false
          });
      }
    }
  }

  // shuffle the array to display the target at a random location
  shuffle(shapes);

  // display shapes
  var sideMatrix = Math.sqrt(objCount);
  for (var i = 0; i < shapes.length; i++) {
    d3.select("#mainScene")
      .append("circle")
      .attr("cx", 200 + i % sideMatrix * 60)
      .attr("cy", 200 + Math.floor(i / sideMatrix) * 60)
      .attr("r", shapes[i].size === "small" ? 10 : 20)
      .attr("fill", shapes[i].color === "light" ? "#cccccc" : "#595959")
      .attr("class", "visualMarks");
  }

}

var downloadLogs = function (event) {
  event.preventDefault();
  var csvContent = "data:text/csv;charset=utf-8,";


  ctx.logs.forEach(function (rowData) {
    var temp = Object.values(rowData); // This line is to convert the objects into array so that i can convert it to srting later 
    var row = temp.join(',');
    csvContent += row + "\r\n";
  })

  var encodeUri = encodeURI(csvContent);

  var downloadLink = d3.select("form")
    .append('a')
    .attr('href', encodeUri)
    .attr('download', "Logs_" + ctx.participant + "_" + Date.now() + ".csv")
    .text("Logs_" + ctx.participant + "_" + Date.now() + ".csv");
}

var showPlaceholders = function () {
  // TODO
  timeTracker.endTime = new Date().getTime();

  var sideMatrix = Math.sqrt(objCount);
  for (var i = 0; i < shapes.length; i++) {
    d3.select("#mainScene")
      .append("rect")
      .datum(shapes[i].target)
      .attr("x", 200 + i % sideMatrix * 60)
      .attr("y", 200 + Math.floor(i / sideMatrix) * 60)
      .attr("width", 45)
      .attr("height", 45)
      .attr("fill", "#cccccc")
      .attr("class", "place-Holder")
      .on("click", isCorrectTarget);
  }
  // console.log(Math.floor(((timeTracker.endTime-timeTracker.startTime)%(1000*60))/1000) );
}

var isCorrectTarget = function () {
  console.log("****************" + ctx.trials[ctx.cpt][ctx.participantIndex]);
  if (ctx.trials[ctx.cpt][ctx.participantIndex] === ctx.participant) {
    console.log(d3.select(this).datum());

    // COde to download it in csv file with adding the timer and stuff.

    recordIsCorrect = d3.select(this).datum();
    if (recordIsCorrect) {
      ctx.logs[ctx.cpt].perceptionTime = timeTracker.endTime - timeTracker.startTime;
      if(ctx.cpt === 269){
        d3.selectAll('.place-Holder').remove();
        finishExperiment();
      }
      if (ctx.trials[ctx.cpt + 1][ctx.participantIndex] === ctx.participant) {
        nextTrial();
      }
      else {
        d3.selectAll('.place-Holder').remove();
        finishExperiment();
      }
    }
    else {
      ctx.logs[ctx.cpt].error++;
      nextTrial();
    }
  }

}

var finishExperiment = function () {

  ctx.state = state.FINISH_EXPERIMENT;

  d3.select("#instructions")
    .append('p')
    .classed('instr', true)
    .html("The Experiment is complete.<br> <b>Thank you</b> ");
}

var nextTrial = function () {

  if (recordIsCorrect) {
    ctx.cpt++;
  }

  if(ctx.cpt == -1){
    ctx.cpt++;
  }
  //setting to default
  shapes = [];
  timeTracker.endTime = timeTracker.startTime = 0;
  var objCount = 0;
  d3.selectAll(".place-Holder").remove();

  showIntertitle();
}

var startExperiment = function (event) {
  event.preventDefault();

  //console.log(event);

  for (var i = 0; i < ctx.trials.length; i++) {
    if (ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if (parseInt(ctx.trials[i][ctx.blockIndex]) == ctx.startBlock) {
        if (parseInt(ctx.trials[i][ctx.trialIndex]) == ctx.startTrial) {
          ctx.cpt = i - 1;
        }
      }
    }
  }

  console.log("start experiment at " + ctx.cpt);
  nextTrial();
}

var createScene = function () {
  var svgEl = d3.select("#scene").append("svg");
  svgEl.attr("id", "mainScene");
  svgEl.attr("width", ctx.w);
  svgEl.attr("height", ctx.h)
    .classed('centered', true);

  loadData(svgEl);
};

/****************************************/
/******** STARTING PARAMETERS ***********/
/****************************************/

var setTrial = function (trialID) {
  ctx.startTrial += parseInt(trialID);
  console.log(ctx.startTrial);
}

var setBlock = function (blockID) {
  ctx.startBlock = parseInt(blockID);

  var trial = "";
  var options = [];

  for (var i = 0; i < ctx.trials.length; i++) {
    if (ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if (parseInt(ctx.trials[i][ctx.blockIndex]) == ctx.startBlock) {
        if (!(ctx.trials[i][ctx.trialIndex] === trial)) {
          trial = ctx.trials[i][ctx.trialIndex];
          options.push(trial);
        }
      }
    }
  }

  var select = d3.select("#trialSel");

  select.selectAll('option')
    .data(options)
    .enter()
    .append('option')
    .text(function (d) { return d; });

  setTrial(options[0]);

}

var setParticipant = function (participantID) {
  ctx.participant = participantID;

  var block = "";
  var options = [];

  for (var i = 0; i < ctx.trials.length; i++) {
    if (ctx.trials[i][ctx.participantIndex] === ctx.participant) {
      if (!(ctx.trials[i][ctx.blockIndex] === block)) {
        block = ctx.trials[i][ctx.blockIndex];
        options.push(block);
      }
    }
  }

  var select = d3.select("#blockSel")
  select.selectAll('option')
    .data(options)
    .enter()
    .append('option')
    .text(function (d) { return d; });

  setBlock(options[0]);

};

var loadData = function (svgEl) {

  d3.csv("Experiment.csv").then(function (data) {
    ctx.trials = data;

    var participant = "";
    var options = [];

    for (var i = 0; i < ctx.trials.length; i++) {
      ctx.trials[i].error = 0;
      ctx.logs.push(ctx.trials[i]);
      if (!(ctx.trials[i][ctx.participantIndex] === participant)) {
        participant = ctx.trials[i][ctx.participantIndex];
        options.push(participant);
      }
    }

    var select = d3.select("#participantSel")
    select.selectAll('option')
      .data(options)
      .enter()
      .append('option')
      .text(function (d) { return d; });

    setParticipant(options[0]);

  }).catch(function (error) { console.log(error) });
};

function onchangeParticipant() {
  selectValue = d3.select('#participantSel').property('value');
  setParticipant(selectValue);
};

function onchangeBlock() {
  selectValue = d3.select('#blockSel').property('value');
  setBlock(selectValue);
};

function onchangeTrial() {
  selectValue = d3.select("#trialSel").property('value');
  setTrial(selectValue);
};
