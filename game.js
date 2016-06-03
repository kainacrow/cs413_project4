var GAME_HEIGHT = 1550;//650;
var GAME_WIDTH = 1550;//1050;
var GAME_SCALE = 4;

var gameport = document.getElementById("gameport");

var renderer = PIXI.autoDetectRenderer(GAME_WIDTH, GAME_HEIGHT, {backgroundColor: 0x000});
gameport.appendChild(renderer.view);

var playing = false;
var currentState = 0;

var housesVisited = [];

var menuStateMachine = StateMachine.create({
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
      onplay: function () { moveArrow(0); currentState = 0; },
      oninstructions: function() { moveArrow(1); currentState = 1; },
      onoptions: function() { moveArrow(2); currentState = 2; },
      oncredits: function() { moveArrow(3); currentState = 3; }
    }
});

var stage = new PIXI.Container();
stage.scale.x = GAME_SCALE;
stage.scale.y = GAME_SCALE;


// Scene objects get loaded in the ready function
var player;
var world;

var currentText;
var text;

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

var pinkFridge;
var blueFridge;
var orangeFridge;

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

var ghost;
var ice;
var grey;
var frosty;
var textures = {};

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
    
    textures["mainMenu"] = PIXI.Texture.fromFrame("mainmenu.png");
    textures["arrow"] = PIXI.Texture.fromFrame("arrow.png");
    
    blue = world.getObject("blueHouse");
    pink = world.getObject("pinkHouse");
    orange = world.getObject("orangeHouse");
    walls = world.getObjects("wall");
    blueDoor = world.getObject("blueDoor");
    pinkDoor = world.getObject("pinkDoor");
    orangeDoor = world.getObject("orangeDoor");
    
    pinkFridge = world.getObject("pinkFridge");
    blueFridge = world.getObject("blueFridge");
    orangeFridge = world.getObject("orangeFridge");
    
    ghost = new PIXI.Sprite(PIXI.Texture.fromFrame("ghost.png"));
    frosty = new PIXI.Sprite(PIXI.Texture.fromFrame("frosty.png"));
    grey = new PIXI.Sprite(PIXI.Texture.fromFrame("grey.png"));
    ice = new PIXI.Sprite(PIXI.Texture.fromFrame("ice.png"));

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

    player = ghost;
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
     
     loadMainMenu(true);
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
    fridgeCollision();
    renderer.render(stage);
}



function moveArrow(index) {
	elem = menu.getChildAt(index+2);
	createjs.Tween.removeTweens(arrow.position);
	createjs.Tween.get(arrow.position).to({y: elem.position.y, x: elem.position.x - arrow.width - 10}, 500, createjs.Ease.cubicOut);
}

function collision(desX, desY) {
  for (var i = 0; i < walls.length; i++){
        if (!(walls[i].x > (desX + player.width/2) || (walls[i].x + walls[i].width) < desX || walls[i].y > (desY + player.height/2) || (walls[i].y + walls[i].height) < desY)){
            return true;
        }
  }
          return false;
}

function fridgeCollision() {
  previousX = player.position.x;
  previousY = player.position.y;
  if (!(pinkFridge.x > (player.position.x + player.width/2) || (pinkFridge.x + pinkFridge.width) < player.position.x || pinkFridge.y > (player.position.y + player.height/2) || (pinkFridge.y + pinkFridge.height) < player.position.y)){
      console.log("collison");
      housesVisited[0] = true;
      //console.log(housesVisited);
      player.texture = PIXI.Texture.fromFrame("grey.png");
      // player.position.x = previousX;
      // player.position.y = previousY;
  }
  else if (!(blueFridge.x > (player.position.x + player.width/2) || (blueFridge.x + blueFridge.width) < player.position.x || blueFridge.y > (player.position.y + player.height/2) || (blueFridge.y + blueFridge.height) < player.position.y)){
      if (housesVisited[0] == true){
        housesVisited[1] = true;
        player.texture = PIXI.Texture.fromFrame("frosty.png");
        
      }
  }
  else if (!(orangeFridge.x > (player.position.x + player.width/2) || (orangeFridge.x + orangeFridge.width) < player.position.x || orangeFridge.y > (player.position.y + player.height/2) || (orangeFridge.y + orangeFridge.height) < player.position.y)){
      if (housesVisited[1] == true)
        housesVisited[2] = true;
        player.texture = PIXI.Texture.fromFrame("ice.png");
  }
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
  if (player.texture !== PIXI.Texture.fromFrame("ice.png")){
    if (!(enemy1.x > (player.position.x + player.width/2) || (enemy1.x + enemy1.width) < player.position.x || enemy1.y > (player.position.y + player.height/2) || (enemy1.y + enemy1.height) < player.position.y)){
              gameOver;
              //enterBluehouse();
    }

    if (!(enemy2.x > (player.position.x + player.width/2) || (enemy2.x + enemy2.width) < player.position.x || enemy2.y > (player.position.y + player.height/2) || (enemy2.y + enemy2.height) < player.position.y)){
                gameOver;
                //enterBluehouse();
    }
  }
  else {
    //gameOver();
  }
}        

function displayText(words) {
	text.alpha = 1;
  currentText = words;
}

function gameOver() {
  playing = false;
  moving = false;
  displayText("hsdkhfsklfhksf");
  
}

// camera movement
function update_camera() {
    stage.x = -player.x*GAME_SCALE + GAME_WIDTH/2 - player.width/2*GAME_SCALE;
    stage.y = -player.y*GAME_SCALE + GAME_HEIGHT/2 - player.height/2*GAME_SCALE;
    if (entity_layer.visible == true){
      stage.x = -Math.max(0, Math.min(1280*GAME_SCALE-GAME_WIDTH, -stage.x));
      stage.y = -Math.max(0, Math.min(world.worldHeight*GAME_SCALE - GAME_HEIGHT, -stage.y));
    }
    else if (pink.visible == true) {
      stage.x = -Math.max(1280*GAME_SCALE, Math.min(1696*GAME_SCALE-GAME_WIDTH, -stage.x));
      stage.y = -Math.max(320*GAME_SCALE, Math.min(640*GAME_SCALE - GAME_HEIGHT, -stage.y));
    }
    else if(orange.visible == true) {
      stage.x = -Math.max(1280*GAME_SCALE, Math.min(1696*GAME_SCALE-GAME_WIDTH, -stage.x));
      stage.y = -Math.max(0, Math.min(320*GAME_SCALE - GAME_HEIGHT, -stage.y));
    }
    else if(blue.visible == true){
      stage.x = -Math.max(1280*GAME_SCALE, Math.min(1696*GAME_SCALE-GAME_WIDTH, -stage.x));
      stage.y = -Math.max(640*GAME_SCALE, Math.min(960*GAME_SCALE - GAME_HEIGHT, -stage.y));
    }
}
