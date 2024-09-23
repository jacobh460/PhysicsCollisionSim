//Jacob 2022

var pixelsPerMeter = 100;


class listElement
{
    constructor(value)
    {
      this.next = null;
      this.last = null;
      this.value = value;
    }
}
//linked list for holding world objects for fast pop operations
class linkedList
{
  constructor()
  {
    this.lastElement = null;
    this.firstElement = null;
  }

  push(data)
  {
    var element = new listElement(data);
    if (this.firstElement == null)
    {
      this.firstElement = element;
      this.lastElement = element;
    }
    else
    {
      this.lastElement.next = element;
      element.last = this.lastElement;
      this.lastElement = element;
    }
  }

  pop(element)
  {
    element.last = element.next;
  }
}

//draw rect with bottom of screen as y=0 and center of screen as x=0
function rect(ctx, x, y, width, height, borderWidth)
{
  if (borderWidth == 0)
    ctx.fillRect(x + (ctx.canvas.width/2), ctx.canvas.height - y - height, width, height);
  else
  {
    ctx.strokeStyle = "lightblue";
    ctx.lineWidth = borderWidth;
    ctx.beginPath();
    ctx.roundRect(x + (ctx.canvas.width/2), ctx.canvas.height - y - height, width, height, 2);
    ctx.fill();
    ctx.stroke();
  }
}

//get font size needed to fill width
function getFontFitSize(ctx, text, font, width)
{
  ctx.font = `1px ${font}`;
  return width/ctx.measureText(text).width;
}

function text(ctx, x, y, content, widthFit)
{
  var size = getFontFitSize(ctx, content, "arial", widthFit);
  ctx.font = `${size}px arial`;

  ctx.fillText(content, x + (ctx.canvas.width/2), ctx.canvas.height - y);
}


class world
{
  constructor()
  {
    //holds physics objects
    this.objects = new linkedList();
  }

  addObject(worldObj)
  {
    worldObj.world = this;
    this.objects.push(worldObj);
  }

  //deltaTime: seconds since last physics update (floating point)
  doPhysics(deltaTime, leftBound, rightBound)
  {
    var left = leftBound / pixelsPerMeter;
    var right = rightBound / pixelsPerMeter;
    var currentObject;
    //tick each object
    for (currentObject = this.objects.firstElement; currentObject != null; currentObject = currentObject.next)
    {

      if (!currentObject.value.physicsTicked)
      {
        currentObject.value.physicsTick(deltaTime, left, right);
      }
    }

    for (currentObject = this.objects.firstElement; currentObject != null; currentObject = currentObject.next)
    {
      currentObject.value.collided = false;
    }
  }

  draw(ctx)
  {
    //iterate over objects[] and call draw function
    for (var currentObject = this.objects.firstElement; currentObject != null; currentObject = currentObject.next)
    {
      currentObject.value.draw(ctx);
    }
  }
}


class box
{
  constructor(x, y, width, height, mass, color = "red", velocity = 0, fontColor = "white")
  {
    //x and y position of box, in meters
    this.x = x;
    this.y = y;

    //remember last position in case of a collision
    this.lastX = this.x;

    //width and height of box in meters
    this.width = width;
    this.height = height;

    //background box color
    this.color = color;

    //current velocity
    this.velocity = velocity;

    //mass in kg
    this.mass = mass;

    //this is changed when a user selects the object
    this.borderWidth = 0;


    //font background color for text displayed on top of box (text that is outside the box has black background)
    this.fontColor = fontColor;
    //this gets set when a box is added to a world object
    this.world = null;


    this.collided = false;
  }

  undoMovement()
  {
    //go to previous position
    this.x = this.lastX;
  }

  doMovement(deltaTime)
  {
    //remember position and move based on velocity
    this.lastX = this.x;
    this.x += this.velocity * deltaTime;
  }

  draw(ctx)
  {
    ctx.fillStyle = this.color;
    //draw rect showing box position and size
    rect(ctx, this.x * pixelsPerMeter, this.y * pixelsPerMeter, this.width * pixelsPerMeter, this.height * pixelsPerMeter, this.borderWidth);

    //extra info
    ctx.fillStyle = this.fontColor;
    ctx.textAlign = "center";

    //show mass
    text(ctx, this.x * pixelsPerMeter + this.width * pixelsPerMeter/2, this.y * pixelsPerMeter + this.height * pixelsPerMeter/2, `${this.mass} Kg`, this.width * pixelsPerMeter);

    //show velocity
    text(ctx, this.x * pixelsPerMeter + this.width * pixelsPerMeter/2, this.y * pixelsPerMeter + this.height * pixelsPerMeter + 30, `${this.velocity.toFixed(2)} m/s`, this.width * pixelsPerMeter);

    //show momentum
    text(ctx, this.x * pixelsPerMeter + this.width * pixelsPerMeter/2, this.y * pixelsPerMeter + this.height * pixelsPerMeter + 60, `p = ${(this.mass * this.velocity).toFixed(2)}`, this.width * pixelsPerMeter);
  }

  /*
  I wrote this similar to how I think game engines handle physics

  --bounds--
  leftBound: minimum x value of left edge of box
  rightBound: maximum x value of right edge of box
  if the box exceeds these bounds, it should reverse directions (this isn't very realistic, but it will make the boxes stay on screen)
  */
  physicsTick(deltaTime, leftBound, rightBound)
  {

    //if less than left bound, set velocity to positive
    
    if (this.x <= leftBound)
      this.velocity = Math.abs(this.velocity);
    //if greater than right bound, set velocity to negative
    else if (this.x + this.width >= rightBound)
      this.velocity = Math.abs(this.velocity) * -1;

    //move based on velocity
    this.doMovement(deltaTime);

    //check if current object (this) intersects (collides) any other object
    for(var currentObject = this.world.objects.firstElement; currentObject != null; currentObject = currentObject.next)
    {
      var otherObject = currentObject.value;
      if (otherObject == this)
        continue;

      //check if object is colliding with other object
      if (((this.x > otherObject.x) && (this.x < otherObject.x + otherObject.width)) || ((this.x + this.width > otherObject.x) && (this.x + this.width <  otherObject.x + otherObject.width)))
      {
        //step back so you are no longer colliding
        this.undoMovement();

        //if you have already collided
        if (this.collided)
          break;


        //use momentum theorem to calculate new velocities
        var v1 = this.velocity;
        var v2 = otherObject.velocity;
 

        //https://en.wikipedia.org/wiki/Elastic_collision#Two-Dimensional_Collision_With_Two_Moving_Objects

        /*
         I was able to solve for u1 (v1 prime) and u2 (v2 prime) knowing the following:

         v1 - v2 = u2 - u1 (found on wikipedia) conservation of kinetic energy
         m1 * v1 + m2 * v2 = m1 * u1 + m2 * u2 (impulse momentum theorem)

        */


        //solution I got: ((2 * m2 * v2) + v1 * (m1 - m2))/(m1 + m2) = v1 prime
        var v1Prime = ((2 * otherObject.mass * v2) + v1 * (this.mass - otherObject.mass))/(this.mass + otherObject.mass);

        //solution: ((2 * m1 * v1) + v2 * (m2 - m1))/(m1 + m2) = v2 prime
        var v2Prime = ((2 * this.mass * v1) + v2 * (otherObject.mass - this.mass))/(this.mass + otherObject.mass);

        this.velocity = v1Prime;
        otherObject.velocity = v2Prime;

        this.collided = true;
        otherObject.collided = true;
        break;
      }
    }
  }
}