var gameHeight = 1550;//650;
var gameWidth = 1550;//1050;
var gameScale = 4;

var gameport = document.getElementById("gameport");

var renderer = PIXI.autoDetectRenderer(gameWidth, gameHeight, {backgroundColor: 0x000});
gameport.appendChild(renderer.view);

var playing = false;
var currentState = 0;

var housesVisited = [];

var menu = StateMachine.create({
  initial: {state: 'play', event: 'init'},
  error: function () {},
  events: [
    {name: "down", from: "play", to: "instructions"},
    {name: "down", from: "instructions", to: "options"},
    {name: "down", from: "options", to: "credits"},
    {name: "down", from: "credits", to: "credits"},
    
    {name: "up", from: "play", to: "play"},
    {name: "up", from: "instructions", to: "play"},
    {name: "up", from: "options", to: "instructions"},
    {name: "up", from: "credits", to: "options"}],
    
    callbacks: {
      onplay: function () { movePointer(0); currentState = 0; },
      oninstructions: function() { movePointer(1); currentState = 1; },
      onoptions: function() { movePointer(2); currentState = 2; },
      oncredits: function() { movePointer(3); currentState = 3; }
    }
});

// // var start = new PIXI.Sprite(PIXI.Texture.fromImage("instructions1.png"));
// var startText = new PIXI.Text("Press Enter\nto play", {font: "12px Monospace", fill: "#fff", strokeThickness: 3});
// startText.position.y = 50;
// startText.position.x = 20;

// var winText = new PIXI.Text("You have\nsuccessfully\nkilled all\nthe villains\nCongrats!", {font: "12px Monospace", fill: "#fff", strokeThickness: 3});
// winText.position.y = 20;
// winText.position.x = 20;

var stage = new PIXI.Container();
stage.scale.x = gameScale;
stage.scale.y = gameScale;


// var start = false;

// Scene objects get loaded in the ready function
var player;
var world;

// Character movement constants:
// var moveLeft = 1;
// var moveRight = 2;
// var moveUp = 3;
// var moveDown = 4;
// var moveNone = 0;

var entity_layer;
var blue;
var pink;
var orange;

var blueDoor;
var pinkDoor;
var orangeDoor;

var pinkMat;
var blueMat;
var orangeMat;

var spawnOrange;
var spawnPink;
var spawnBlue;

var leaveOrange;
var leavePink;
var leaveBlue;

var walls = [];
var doors = [];

var enemy;
var enemy1;
var enemy2;
var enemies = [];

var game = false;
var pixelMovement = 32;
var speed = 200;

var keys = {};
var moving = false;

function keyupEventHandler(e) {
    keys[e.which] = false;
}

function keydownEventHandler(e) {
    keys[e.which] = true;
    if([32, 37, 38, 39, 40, 9].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }    
    movePlayer();
}

document.addEventListener('keydown', keydownEventHandler);
document.addEventListener('keyup', keyupEventHandler);

function movePlayer() {
    previousX = player.position.x;
    previousY = player.position.y;
    if(keys[87] || keys[38] && !moving) { // W key pressed
      console.log("UP");
      if (!(collision(previousX, player.y - pixelMovement))){
        moving = true;
        newY = previousY - pixelMovement;
            createjs.Tween.get(player).to({y: newY}, speed).call(function() { moving = false; });
        }
    }
    if(keys[83] || keys[40] && !moving) { // S key pressed
      console.log("Down");
      if(!(collision(previousX, player.y + pixelMovement))){
        moving = true;
        newY = previousY + pixelMovement;
            createjs.Tween.get(player).to({y: newY}, speed).call(function() { moving = false; });  
        }  
    }
    if(keys[65] || keys[37] && !moving) { // A key pressed
      console.log("left");
      if (!(collision(player.x - pixelMovement, previousY))){
        moving = true;
        newX = previousX - pixelMovement;
            createjs.Tween.get(player).to({x: newX}, speed).call(function() { moving = false; });
        }
    }
    if(keys[68] || keys[39] && !moving) { // D key pressed
      console.log("left");
      if (!(collision(player.x + pixelMovement, previousY))){
        moving = true;
        newX = previousX + pixelMovement;
            createjs.Tween.get(player).to({x: newX}, speed).call(function() { moving = false; });
        }  
    }
}

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

// loader
PIXI.loader
    .add('map_json', 'map.json')
    .add('tileset', 'grid.png')
    //.add('man', 'tower1.png')
    .add('assets.json')
    .add('font', 'minecraft.fnt')
    .load(ready);
    
// ready function
function ready() {
    
    playing = true;
    //createjs.Ticker.setFPS(60);
    var tu = new TileUtilities(PIXI);
    world = tu.makeTiledWorld("map_json", "grid.png");
    stage.addChild(world);
    
    blue = world.getObject("blueHouse");
    pink = world.getObject("pinkHouse");
    orange = world.getObject("orangeHouse");
    walls = world.getObjects("wall");
    blueDoor = world.getObject("blueDoor");
    pinkDoor = world.getObject("pinkDoor");
    orangeDoor = world.getObject("orangeDoor");
    person = new PIXI.Sprite(PIXI.Texture.fromFrame("ghost.png"));

    spawnOrange = world.getObject("spawnOrange");
    spawnBlue = world.getObject("spawnBlue");
    spawnPink = world.getObject("spawnPink");
    
    leaveOrange = world.getObject("leaveOrange");
    leaveBlue = world.getObject("leaveBlue");
    leavePink = world.getObject("leavePink");
    
    pinkMat = world.getObject("pinkMat");
    blueMat = world.getObject("blueMat");
    orangeMat = world.getObject("orangeMat");
    
    var man = world.getObject("character");

    player = person;
    player.x = man.x + player.width/2;
    player.y = man.y + player.width/2;
    player.anchor.x = 0.5;
    player.anchor.y = 0.5;

    // Find the entity layer
    entity_layer = world.getObject("map");
    
    world.getObject("Entities").addChild(player);
    
    // two enemies in the game
    enemy1 = new PIXI.Sprite(PIXI.Texture.fromFrame("fire.png"));
    enemy2 = new PIXI.Sprite(PIXI.Texture.fromFrame("fire.png"));
    entity_layer.addChild(enemy1);
    entity_layer.addChild(enemy2);


    // entity_layer.addChild(startText);
    // entity_layer.addChild(winText);
    // winText.visible = false;
        
    // player.direction = moveNone;
    // player.moving = false;
    
    enemy1.position.y = 425;
    enemy1.position.x = 250;
    enemy2.position.y = 200;
    enemy2.position.x = 50;
    //var target = {x: 500, y: 345};
    createjs.Tween.get(enemy1.position, {loop:true})
    .to({y:enemy1.position.y + 150}, 2000, createjs.Ease.quadIn)
    .to({y:enemy1.position.y}, 4000, createjs.Ease.quintIn)
    .to({x:enemy1.position.x + 250}, 8000, createjs.Ease.quadOut)
    .to({x:enemy1.position.x}, 5000, createjs.Ease.quintOut);

    //var target = {x: 500, y: 345};
    createjs.Tween.get(enemy2.position, {loop:true})
    .to({x:enemy2.position.x + 200}, 2000, createjs.Ease.quintInOut)
    .to({x:enemy2.position.x}, 6000, createjs.Ease.quartOut)
    .to({y:enemy2.position.y + 200}, 3000, createjs.Ease.quartIn)
    .to({x:enemy2.position.x + 200}, 2000, createjs.Ease.getelasticInOut)
    .to({y:enemy2.position.y}, 5000, createjs.Ease.quartOut)
    .to({x:enemy2.position.x}, 6000, createjs.Ease.sineIn);
     animate();
}

function enterBluehouse() {
  entity_layer.visible = false;
  world.getObject("Collision").visible = false;
  createjs.Tween.removeTweens(player);
  blue.visible = true;
  player.position.x = spawnBlue.x;
  player.position.y = spawnBlue.y;
}

function enterPinkhouse() {
  entity_layer.visible = false;
  world.getObject("Collision").visible = false;
  createjs.Tween.removeTweens(player);
  pink.visible = true;
  player.position.x = spawnPink.x;
  player.position.y = spawnPink.y;
}

function enterOrangehouse() {
  entity_layer.visible = false;
  world.getObject("Collision").visible = false;
  createjs.Tween.removeTweens(player);
  orange.visible = true;
  player.position.x = spawnOrange.x;
  player.position.y = spawnOrange.y;
}

function leaveHouse() {
  if (orange.visible == true){
    entity_layer.visible = true;
    createjs.Tween.removeTweens(player);
    orange.visible = false;
    player.position.x = leaveOrange.x;
    player.position.y = leaveOrange.y;
  }
  else if(pink.visible == true){
    entity_layer.visible = true;
    createjs.Tween.removeTweens(player);
    pink.visible = false;
    player.position.x = leavePink.x;
    player.position.y = leavePink.y;
  }
  else if (blue.visible == true){
    entity_layer.visible = true;
    createjs.Tween.removeTweens(player);
    blue.visible = false;
    player.position.x = leaveBlue.x;
    player.position.y = leaveBlue.y;
  }
  // entity_layer.visible = true;
  // orange.visible = false;
  // pink.visible = false;
  // blue.visible = false;
}

// animate function
function animate() {
    requestAnimationFrame(animate);
    update_camera();
    doorCollision();
    leaveCollision();
    enemyCollision();
    renderer.render(stage);

    }

function movePointer(index) {
	elem = menu.getChildAt(index+2);
	createjs.Tween.removeTweens(pointer.position);
	createjs.Tween.get(pointer.position).to({y: elem.position.y, x: elem.position.x - pointer.width - 10}, 500, createjs.Ease.bounceOut);
}

function collision(desX, desY) {
  for (var i = 0; i < walls.length; i++){
        if (!(walls[i].x > (desX + player.width/2) || (walls[i].x + walls[i].width) < desX || walls[i].y > (desY + player.height/2) || (walls[i].y + walls[i].height) < desY)){
            return true;
        }

  }
          return false;
  
}

function doorCollision() {
  // for (var i = 0; i < doors.length; i++){
        if (!(blueDoor.x > (player.position.x + player.width/2) || (blueDoor.x + blueDoor.width) < player.position.x || blueDoor.y > (player.position.y + player.height/2) || (blueDoor.y + blueDoor.height) < player.position.y)){
            enterBluehouse();
        }
        else if (!(pinkDoor.x > (player.position.x + player.width/2) || (pinkDoor.x + pinkDoor.width) < player.position.x || pinkDoor.y > (player.position.y + player.height/2) || (pinkDoor.y + pinkDoor.height) < player.position.y)){
            enterPinkhouse();
        }
        else if (!(orangeDoor.x > (player.position.x + player.width/2) || (orangeDoor.x + orangeDoor.width) < player.position.x || orangeDoor.y > (player.position.y + player.height/2) || (orangeDoor.y + orangeDoor.height) < player.position.y)){
            enterOrangehouse();
          }
return false;
  }
  
function leaveCollision() {
  // for (var i = 0; i < doors.length; i++){
        if (!(blueMat.x > (player.position.x + player.width/2) || (blueMat.x + blueMat.width) < player.position.x || blueMat.y > (player.position.y + player.height/2) || (blueMat.y + blueMat.height) < player.position.y)){
            leaveHouse();
        }
        else if (!(pinkMat.x > (player.position.x + player.width/2) || (pinkMat.x + pinkMat.width) < player.position.x || pinkMat.y > (player.position.y + player.height/2) || (pinkMat.y + pinkMat.height) < player.position.y)){
            leaveHouse();
        }
        else if (!(orangeMat.x > (player.position.x + player.width/2) || (orangeMat.x + orangeMat.width) < player.position.x || orangeMat.y > (player.position.y + player.height/2) || (orangeMat.y + orangeMat.height) < player.position.y)){
            leaveHouse();
          }
return false;
  }
  
function enemyCollision() {
  if (!(enemy1.x > (player.position.x + player.width/2) || (enemy1.x + enemy1.width) < player.position.x || enemy1.y > (player.position.y + player.height/2) || (enemy1.y + enemy1.height) < player.position.y)){
            enterBluehouse();
  }

if (!(enemy2.x > (player.position.x + player.width/2) || (enemy2.x + enemy2.width) < player.position.x || enemy2.y > (player.position.y + player.height/2) || (enemy2.y + enemy2.height) < player.position.y)){
            enterBluehouse();
}
}        

// camera movement
function update_camera() {
    stage.x = -player.x*gameScale + gameWidth/2 - player.width/2*gameScale;
    stage.y = -player.y*gameScale + gameHeight/2 - player.height/2*gameScale;
    if (entity_layer.visible == true){
      stage.x = -Math.max(0, Math.min(1280*gameScale-gameWidth, -stage.x));
      stage.y = -Math.max(0, Math.min(world.worldHeight*gameScale - gameHeight, -stage.y));
    }
    else if (pink.visible == true) {
      stage.x = -Math.max(1280*gameScale, Math.min(1696*gameScale-gameWidth, -stage.x));
      stage.y = -Math.max(320*gameScale, Math.min(640*gameScale - gameHeight, -stage.y));
    }
    else if(orange.visible == true) {
      stage.x = -Math.max(1280*gameScale, Math.min(1696*gameScale-gameWidth, -stage.x));
      stage.y = -Math.max(0, Math.min(320*gameScale - gameHeight, -stage.y));
    }
    else if(blue.visible == true){
      stage.x = -Math.max(1280*gameScale, Math.min(1696*gameScale-gameWidth, -stage.x));
      stage.y = -Math.max(640*gameScale, Math.min(960*gameScale - gameHeight, -stage.y));
    }
}
