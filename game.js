var gameHeight = 650;
var gameWidth = 1050;
var gameScale = 4;

var gameport = document.getElementById("gameport");

var renderer = PIXI.autoDetectRenderer(gameWidth, gameHeight, {backgroundColor: 0x3bd2f2});
gameport.appendChild(renderer.view);

var playing = false;
var currentState = 0;

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
var moveLeft = 1;
var moveRight = 2;
var moveUp = 3;
var moveDown = 4;
var moveNone = 0;

var entity_layer;
var blue;
var pink;
var orange;

var enemy;
var enemy1;
var enemy2;
var enemies = [];

var game = false;
var pixelMovement = 32;
var speed = 200;

// the move function starts of continues movement
function move() {
    if (player.direction == moveNone) {
    player.moving = false;
    // console.log(player.y);
    return;
  }
  
  //player.anchor.x = 0.5;
  //player.anchor.y = 0.0;
  
  if (player.direction == moveLeft) {
    look_left = true;
    look_right = false;
    createjs.Tween.get(player).to({x: player.x - pixelMovement}, speed).call(move);
  }
  if (player.direction == moveRight) {
      look_right = true;
      look_left = false;
      createjs.Tween.get(player).to({x: player.x + pixelMovement}, speed).call(move);
  }
  if (player.direction == moveUp)
    createjs.Tween.get(player).to({y: player.y - pixelMovement}, speed).call(move);
  
  if (player.direction == moveDown)
    createjs.Tween.get(player).to({y: player.y + pixelMovement}, speed).call(move);  

//   console.log("move");
  player.moving = true;
}

// Keydown events start movement
window.addEventListener("keydown", function (e) {
  e.preventDefault();
  if (!playing){
    if (e.keyCode === 87 || e.keyCode === 38) { menu.up(); }
		if (e.keyCode === 83 || e.keyCode === 40) { menu.down(); }
		if (e.keyCode === 13 || e.keyCode === 32) { menu.getChildAt(currState+2).action(); }
  }
  if (!player) return;
  if (player.moving) return;
  if (e.repeat == true) return;
  
  player.direction = moveNone;

  if (e.keyCode == 87)
    player.direction = moveUp;
  else if (e.keyCode == 83)
    player.direction = moveDown;
  else if (e.keyCode == 65)
    player.direction = moveLeft;
  else if (e.keyCode == 68)
    player.direction = moveRight;

//   console.log(e.keyCode);
  move();
});

// Keyup events end movement
window.addEventListener("keyup", function onKeyUp(e) {
  e.preventDefault();
  if (!player) return;
  player.direction = moveNone;
});

PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

// loader
PIXI.loader
    .add('map_json', 'map.json')
    .add('tileset', 'grid.png')
    .add('man', 'tower1.png')
    .add('assets.json')
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


    console.log(world);
    var man = world.getObject("character");
    man.height = 18;
    man.width = 10;

    player = new PIXI.Sprite(PIXI.loader.resources.man.texture);
    player.x = man.x;
    player.y = man.y;
    player.anchor.x = 0.0;
    player.anchor.y = 0.0;
//    player.anchor.y = -21.5;

    // Find the entity layer
    entity_layer = world.getObject("map");
    
    world.getObject("Entities").addChild(player);
    
    // two enemies in the game
    enemy1 = new PIXI.Sprite(PIXI.Texture.fromFrame("villainSprite.png"));
    enemy2 = new PIXI.Sprite(PIXI.Texture.fromFrame("villainSprite.png"));
    entity_layer.addChild(enemy1);
    entity_layer.addChild(enemy2);


    // entity_layer.addChild(startText);
    // entity_layer.addChild(winText);
    // winText.visible = false;
        
    // player.direction = moveNone;
    // player.moving = false;
    
    enemy1.position.y = 395;
    enemy1.position.x = 300;
    enemy2.position.y = 100;
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
    .to({y:enemy2.position.y}, 5000, createjs.Ease.getPowOut)
    .to({x:enemy2.position.x}, 6000, createjs.Ease.sineIn);
     animate();
}

function enterBluehouse() {
  entity_layer.visible = false;
  blue.visible = true;
  player.position
}

function enterPinkhouse() {
  entity_layer.visible = false;
  pink.visible = true;
}

function enterOrangehouse() {
  entity_layer.visible = false;
  orange.visible = true;
}

function leaveHouse() {
  entity_layer.visible = true;
  orange.visible = false;
  pink.visible = false;
  blue.visible = false;
}

// animate function
function animate() {
    requestAnimationFrame(animate);
    update_camera();
    renderer.render(stage);

    }

function movePointer(index) {
	elem = menu.getChildAt(index+2);
	createjs.Tween.removeTweens(pointer.position);
	createjs.Tween.get(pointer.position).to({y: elem.position.y, x: elem.position.x - pointer.width - 10}, 500, createjs.Ease.bounceOut);
}

// camera movement
function update_camera() {
    stage.x = -player.x*gameScale + gameWidth/2 - player.width/2*gameScale;
    stage.y = -player.y*gameScale + gameHeight/2 - player.height/2*gameScale;
    stage.x = -Math.max(0, Math.min(world.worldWidth*gameScale - gameWidth, -stage.x));
    stage.y = -Math.max(0, Math.min(world.worldHeight*gameScale - gameHeight, -stage.y));
}
