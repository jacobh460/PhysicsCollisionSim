//Jacob 2022


var simWorld = new world();
var baseY = .25;

simWorld.addObject(new box(0, .25, 1, 1, 100, "green", -3));
simWorld.addObject(new box(-1.5, .25, 1, 1, 100, "blue", -2));
simWorld.addObject(new box(-3, .25, 1, 1, 500, "red", 2.5));
simWorld.addObject(new box(1.5, .25, 1, 1, 250, "orange", 2.5));


function physicsLoop(deltaTime)
{

  //do physics then draw
  simWorld.doPhysics(deltaTime, -(simCanvas.width/2), (simCanvas.width/2));

}