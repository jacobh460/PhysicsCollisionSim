//Jacob 2022
//Code for user input

var addObjectBtn = document.getElementById("addObjectBtn");
var runButton = document.getElementById("startStopBtn");
var editButtons = document.getElementById("editObjectButtons");

//drawing
var simCanvas = document.getElementById("simCanvas");
var ctx = simCanvas.getContext("2d");

//if the hand is holding a ghost block
var hand = false;

//if simulation is currently supposed to be running
var running = false;

var selectedElement = null;

function pointInBox(x, y, box)
{
  return (x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height);
}
//show editing buttons and hide add object button
function showEditButtons() {
  addObjectBtn.hidden = true;
  for (var i = 0; i < editButtons.children.length; i++) {
    editButtons.children[i].hidden = false;
  }
}
//hide all buttons, exluding start/stop
function hideExtraButtons() {
  addObjectBtn.hidden = true;
  for (var i = 0; i < editButtons.children.length; i++) {
    editButtons.children[i].hidden = true;
  }
}
//hide edit buttons and show add object button
function hideEditButtons() {
  addObjectBtn.hidden = false;
  for (var i = 0; i < editButtons.children.length; i++) {
    editButtons.children[i].hidden = true;
  }
}
hideEditButtons();

function clearSelection()
{
  selectedElement = null;
  hideEditButtons();
}

function localize(x, y)
{
    return [(x - simCanvas.width / 2) / pixelsPerMeter, (simCanvas.height - y) / pixelsPerMeter];
}


var mouseX;
var mouseY;
simCanvas.addEventListener("mousemove", function(event)
{
  [mouseX, mouseY] = localize(event.offsetX, event.offsetY);

  

  
});

simCanvas.addEventListener("mouseup", function(event) {
  //ignore user input when simulation is running
  if (running)
    return;

  var selectedObject = selectedElement == null ? null : selectedElement.value;
  //localize click coords to world coords in meters
  var [x, y] = localize(event.offsetX, event.offsetY);
  if (selectedObject != null)
    selectedObject.borderWidth = 0;


  //iterate over object list and find selected object

  for (var currentElement = simWorld.objects.firstElement; currentElement != null; currentElement = currentElement.next) {
    var currentObject = currentElement.value;
    //check if mouse is inside object box
    if (pointInBox(x, y, currentObject)) {

      if (currentObject == selectedObject)
      {
        clearSelection();
        return;
      }
      currentObject.borderWidth = 4;
      selectedElement = currentElement;

      showEditButtons();
      return;
    }
  }
  clearSelection();
});

addObjectBtn.addEventListener("click", function() {
  hand = !hand;
});
runButton.addEventListener("click", function() {
  var selectedObject = selectedElement == null ? null : selectedElement.value;
  //change Start/Stop button text and store whether physics should be running
  if (running) {
    runButton.innerText = "Start";
    running = false;
    addObjectBtn.hidden = false;
  }
  else {
    runButton.innerText = "Stop";
    running = true;
    if (selectedObject != null)
      selectedObject.borderWidth = 0;
    selectedObject = null;
    hand = null;
    hideExtraButtons();
  }
});


var lastFrameTime = (new Date()).getTime();
function controlLoop() {

  //get time since last frame
  var currentTime = (new Date()).getTime();
  var deltaTime = (currentTime - lastFrameTime) / 1000;
  lastFrameTime = currentTime;

  //make canvas fill window
  simCanvas.width = document.body.clientWidth;

  //clear canvas
  ctx.clearRect(0, 0, simCanvas.width, simCanvas.height);
  if (running)
    physicsLoop(deltaTime);
  simWorld.draw(ctx);

  var totalM = 0;

  //calculate total momentum of all objects and show on screen
  for (var currentObject = simWorld.objects.firstElement; currentObject != null; currentObject = currentObject.next) {
    totalM += currentObject.value.mass * currentObject.value.velocity;
  }
  ctx.textAlign = "left";
  ctx.fillStyle = "white";
  ctx.font = "20px consolas";
  ctx.fillText(`total p = ${totalM.toFixed(2)} Kg*m/s (hitting walls is considered an external force)`, 0, 20);

  //to calculate fps take reciprocal of seconds between frames
  var fps = 1 / deltaTime;
  ctx.fillText(`${fps.toFixed(2)} fps`, 0, 40);

  window.requestAnimationFrame(controlLoop);
}

controlLoop();