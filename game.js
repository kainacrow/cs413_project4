var GAME_HEIGHT = 650;
var GAME_WIDTH = 1050;
var GAME_SCALE = 3;

var gameport = document.getElementById("gameport");

var renderer = PIXI.autoDetectRenderer(GAME_WIDTH, GAME_HEIGHT, {backgroundColor: 0x000});
gameport.appendChild(renderer.view);

var playing = false;
var currentState = 0;

var housesVisited = [false, false, false];
var enemiesKilled = [false, false];
var menu;
var menuStateMachine = StateMachine.create({
  initial: {state: 'play', event: 'init'},
  error: function () {},
  events: [
    {name: "down", from: "play", to: "instructions"},
    {name: "down", from: "instructions", to: "credits"},
    {name: "down", from: "credits", to: "credits"},
    
    {name: "up", from: "play", to: "play"},
    {name: "up", from: "instructions", to: "play"},
    {name: "up", from: "credits", to: "instructions"}],
    
    callbacks: {
      onplay: function () { moveArrow(0); currentState = 0; },
      oninstructions: function() { moveArrow(1); currentState = 1; },
      oncredits: function() { moveArrow(2); currentState = 2; },
       
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
var gameSound;

var infoText;

var restart = false;

function keyupEventHandler(e) {
    keys[e.which] = false;
}

function keydownEventHandler(e) {
    // gameSound.play();
    keys[e.which] = true;
    
    if (inMenu) {
			if (e.which === 87 || e.which === 38) {
        if (atMainMenu) {
          menuStateMachine.up();
        }
			}
			else if (e.which === 83 || e.which === 40) { 
        if (atMainMenu) {
          menuStateMachine.down();
        }
			}
			else if ((e.which === 27 || e.which === 13 || e.which === 32) && !atMainMenu) {
        loadMainMenu();
      }
			else if (e.which === 13 || e.which === 32) { 
				if (atMainMenu) menu.getChildAt(currentState+2).action(); 
			}
		}
    else{
			if ((e.which === 13 || e.which === 32) && restart) startGame();
			if ((e.which === 27 || e.which === 8) && restart) loadMainMenu();
    }
		
	    if([32, 37, 38, 39, 40].indexOf(e.which) > -1) {
	        e.preventDefault();
	    }  
		  
    movePlayer();
}

document.addEventListener('keydown', keydownEventHandler);
document.addEventListener('keyup', keyupEventHandler);

function movePlayer() {
  if(playing){
    sound.play();
  }
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
    .add('boop.mp3')
    .add('ghostNoises.mp3')
    .add("whoosh.mp3")
    .add('assets.json')
    .add('font', 'minecraft.fnt')
    .load(ready);
    
// ready function
function ready() {
        
    textures["mainMenu"] = PIXI.Texture.fromFrame("mainmenu.png");
    textures["arrow"] = PIXI.Texture.fromFrame("arrow.png");
    
    gameSound = PIXI.audioManager.getAudio("boop.mp3");
    sound = PIXI.audioManager.getAudio('ghostNoises.mp3');
    sound.loop = true;
    whoosh = PIXI.audioManager.getAudio('whoosh.mp3');
    
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
}

// animate function
function animate() {
    requestAnimationFrame(animate);
    if (playing) {
    update_camera();
    doorCollision();
    leaveCollision();
    enemyCollision();
    fridgeCollision();
    }
    renderer.render(stage);
}

function loadMainMenu(first) {
	
	clearStage();
	inMenu = true;
	atMainMenu = true;
	atGameOver = false;
	restart = false;

	menu = new PIXI.Container();

	background = new PIXI.Sprite(textures.mainMenu);
	background.width = GAME_WIDTH/GAME_SCALE;
	background.height = GAME_HEIGHT/GAME_SCALE;
	menu.addChild(background);

	title = new PIXI.extras.BitmapText("Ghost Town",{font: "58px minecraft", align: "center"});
	title.scale.x = 1/GAME_SCALE;
	title.scale.y = 1/GAME_SCALE;
	title.position.x = GAME_WIDTH/GAME_SCALE/2 - title.width/2;
	title.position.y = GAME_HEIGHT/GAME_SCALE/4 - title.height/2;
	menu.addChild(title);

	play = new PIXI.extras.BitmapText("Play",{font: "36px minecraft", align: "center"});
	play.scale.x = 1/GAME_SCALE;
	play.scale.y = 1/GAME_SCALE;
	play.interactive = true, play.buttonMode = true;
	play.on("mousedown", startGame), play.action = startGame;
	play.position.x = GAME_WIDTH/GAME_SCALE/2 - play.width/2;
	play.position.y = title.position.y + GAME_HEIGHT/GAME_SCALE/6;
	menu.addChild(play);

	instructions = new PIXI.extras.BitmapText("Instructions",{font: "36px minecraft", align: "center"});
	instructions.scale.x = 1/GAME_SCALE;
	instructions.scale.y = 1/GAME_SCALE;
	instructions.interactive = true, instructions.buttonMode = true;
	instructions.on("mousedown", loadInstructions), instructions.action = loadInstructions;
	instructions.position.x = GAME_WIDTH/GAME_SCALE/2 - instructions.width/2;
	instructions.position.y = play.position.y + GAME_HEIGHT/GAME_SCALE/10;
	menu.addChild(instructions);

	credits = new PIXI.extras.BitmapText("Credits",{font: "36px minecraft", align: "center"});
	credits.scale.x = 1/GAME_SCALE;
	credits.scale.y = 1/GAME_SCALE;
	credits.interactive = true, credits.buttonMode = true;
	credits.on("mousedown", loadCredits), credits.action = loadCredits;
	credits.position.x = GAME_WIDTH/GAME_SCALE/2 - credits.width/2;
	credits.position.y = instructions.position.y + GAME_HEIGHT/GAME_SCALE/10;
	menu.addChild(credits);

	arrow = new PIXI.Sprite(textures.arrow);
	arrow.position.x = menu.getChildAt(currentState+2).position.x - arrow.width - 10;
	arrow.position.y = menu.getChildAt(currentState+2).position.y;
	menu.addChild(arrow);

	stage.addChild(menu);
}

// Helper method to parse menu input
function parseMenuInput(e) {
	menu.children[menu.children.indexOf(e.target)].action();
}

function moveArrow(index) {
	elem = menu.getChildAt(index+2);
	createjs.Tween.removeTweens(arrow.position);
	createjs.Tween.get(arrow.position).to({y: elem.position.y, x: elem.position.x - arrow.width - 10}, 500, createjs.Ease.cubicOut);
}

function loadInstructions() {

		clearStage();
		atMainMenu = false;

		menu = new PIXI.Container();

		background = new PIXI.Sprite(textures.mainMenu);
		background.width = GAME_WIDTH/GAME_SCALE;
		background.height = GAME_HEIGHT/GAME_SCALE;
		menu.addChild(background);

		title = new PIXI.extras.BitmapText("Instructions",{font: "58px minecraft", align: "center"});
		title.scale.x = 1/GAME_SCALE;
		title.scale.y = 1/GAME_SCALE;
		title.position.x = GAME_WIDTH/GAME_SCALE/2 - title.width/2;
		title.position.y = 10;
		menu.addChild(title);

		infoText = new PIXI.extras.BitmapText("OH NO! Fire Ghosts have overrun your\ntown and it is up to you to save it.\n\nTo do this, you must turn into the 'Ice Ghost'\n\nGOOD LUCK!\n\nUse WASD to move around the board",{font: "36px minecraft", align: "center"});
		infoText.scale.x = 1/GAME_SCALE;
		infoText.scale.y = 1/GAME_SCALE;
		infoText.position.x = GAME_WIDTH/GAME_SCALE/2 - infoText.width/2;
		infoText.position.y = 20 + GAME_HEIGHT/GAME_SCALE/8;
		menu.addChild(infoText);

		back = new PIXI.extras.BitmapText("Back",{font: "36px minecraft", align: "center"});
		back.scale.x = 1/GAME_SCALE;
		back.scale.y = 1/GAME_SCALE;
		back.interactive = true, back.buttonMode = true;
		back.on("mousedown", loadMainMenu), back.action = loadMainMenu;
		back.position.x = GAME_WIDTH/GAME_SCALE - back.width - 10;
		back.position.y = 10;
		menu.addChild(back);

		arrow = new PIXI.Sprite(textures.arrow);
		arrow.position.x = back.position.x - arrow.width - 10;
		arrow.position.y = back.position.y;
		menu.addChild(arrow);

		stage.addChild(menu);
}

	function loadCredits() {

		clearStage();
		atMainMenu = false;

		menu = new PIXI.Container();

		background = new PIXI.Sprite(textures.mainMenu);
		background.width = GAME_WIDTH/GAME_SCALE;
		background.height = GAME_HEIGHT/GAME_SCALE;
		menu.addChild(background);

		title = new PIXI.extras.BitmapText("Credits:",{font: "58px minecraft", align: "center"});
		title.scale.x = 1/GAME_SCALE;
		title.scale.y = 1/GAME_SCALE;
		title.position.x = GAME_WIDTH/GAME_SCALE/2 - title.width/2;
		title.position.y = 10;
		menu.addChild(title);

		infoText = new PIXI.extras.BitmapText("Programming: Kaina Crow\n\nSounds: Kaina Crow\n\nArt: Kaina Crow",{font: "36px minecraft", align: "center"});
		infoText.scale.x = 1/GAME_SCALE;
		infoText.scale.y = 1/GAME_SCALE;
		infoText.position.x = GAME_WIDTH/GAME_SCALE/2 - infoText.width/2;
		infoText.position.y = 20 + GAME_HEIGHT/GAME_SCALE/8;
		menu.addChild(infoText);

		back = new PIXI.extras.BitmapText("Back",{font: "36px minecraft", align: "center"});
		back.scale.x = 1/GAME_SCALE;
		back.scale.y = 1/GAME_SCALE;
		back.interactive = true, back.buttonMode = true;
		back.on("mousedown", loadMainMenu), back.action = loadMainMenu;
		back.position.x = GAME_WIDTH/GAME_SCALE - back.width - 10;
		back.position.y = 10;
		menu.addChild(back);

		arrow = new PIXI.Sprite(textures.arrow);
		arrow.position.x = back.position.x - arrow.width - 10;
		arrow.position.y = back.position.y;
		menu.addChild(arrow);

		stage.addChild(menu);
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
  if (!(orangeFridge.x > (player.position.x + player.width/2) || (orangeFridge.x + orangeFridge.width) < player.position.x || orangeFridge.y > (player.position.y + player.height/2) || (orangeFridge.y + orangeFridge.height) < player.position.y)){
      whoosh.play();
      console.log("collison");
      housesVisited[0] = true;
      //console.log(housesVisited);
      player.texture = PIXI.Texture.fromFrame("grey.png");
      // player.position.x = previousX;
      // player.position.y = previousY;
  }
  else if (!(blueFridge.x > (player.position.x + player.width/2) || (blueFridge.x + blueFridge.width) < player.position.x || blueFridge.y > (player.position.y + player.height/2) || (blueFridge.y + blueFridge.height) < player.position.y)){
      whoosh.play();
      if (housesVisited[0] == true){
        whoosh.play();
        housesVisited[1] = true;
        player.texture = PIXI.Texture.fromFrame("frosty.png");
        
      }
  }
  else if (!(pinkFridge.x > (player.position.x + player.width/2) || (pinkFridge.x + pinkFridge.width) < player.position.x || pinkFridge.y > (player.position.y + player.height/2) || (pinkFridge.y + pinkFridge.height) < player.position.y)){
      if (housesVisited[1] == true && housesVisited[0] == true){
        whoosh.play();
        housesVisited[2] = true;
        player.texture = PIXI.Texture.fromFrame("ice.png");
      }
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
              console.log("collision");
              gameOver();
              //enterBluehouse();  
    }

    if (!(enemy2.x > (player.position.x + player.width/2) || (enemy2.x + enemy2.width) < player.position.x || enemy2.y > (player.position.y + player.height/2) || (enemy2.y + enemy2.height) < player.position.y)){
                gameOver();
                //enterBluehouse();
    }
  }
  else if (player.texture === PIXI.Texture.fromFrame("ice.png")){
    if(!(enemy1.x > (player.position.x + player.width/2) || (enemy1.x + enemy1.width) < player.position.x || enemy1.y > (player.position.y + player.height/2) || (enemy1.y + enemy1.height) < player.position.y)){
      enemiesKilled[0] = true;
      entity_layer.removeChild(enemy1);
    }
    else if(!(enemy2.x > (player.position.x + player.width/2) || (enemy2.x + enemy2.width) < player.position.x || enemy2.y > (player.position.y + player.height/2) || (enemy2.y + enemy2.height) < player.position.y)){
      enemiesKilled[1] = true;
      entity_layer.removeChild(enemy2);
    }
    if(enemiesKilled[0] === true && enemiesKilled[1] === true){
      winGame();
    }
  }
}        

function gameOver() {
    playing = false;
    moving = false;
    
    clearStage();
		atMainMenu = false;
    restart = true;
    
		menu = new PIXI.Container();

		background = new PIXI.Sprite(textures.mainMenu);
		background.width = GAME_WIDTH/GAME_SCALE;
		background.height = GAME_HEIGHT/GAME_SCALE;
    stage.y = 0;
    stage.x = 0;
		menu.addChild(background);

		title = new PIXI.extras.BitmapText("\nOH NO!",{font: "58px minecraft", align: "center"});
		title.scale.x = 1/GAME_SCALE;
		title.scale.y = 1/GAME_SCALE;
		title.position.x = GAME_WIDTH/GAME_SCALE/2 - title.width/2;
		title.position.y = 10;
		menu.addChild(title);

		loseText = new PIXI.extras.BitmapText("\n\nYou have been defeated by\nthe fire ghosts!\n\nYour village has been taken over!\n\n\n\nPress Enter to play again\n\nPress ESC to go back to the Main Menu",{font: "36px minecraft", align: "center"});
		loseText.scale.x = 1/GAME_SCALE;
		loseText.scale.y = 1/GAME_SCALE;
		loseText.position.x = GAME_WIDTH/GAME_SCALE/2 - loseText.width/2;
		loseText.position.y = 20 + GAME_HEIGHT/GAME_SCALE/8;
		menu.addChild(loseText);
        
		stage.addChild(menu);
  
}

function winGame() {
    playing = false;
    moving = false;

		clearStage();
		atMainMenu = false;
    
		menu = new PIXI.Container();

		background = new PIXI.Sprite(textures.mainMenu);
		background.width = GAME_WIDTH/GAME_SCALE;
		background.height = GAME_HEIGHT/GAME_SCALE;
    stage.x = 0;
    stage.y = 0
		menu.addChild(background);

		title = new PIXI.extras.BitmapText("\n\nCongratulations!",{font: "58px minecraft", align: "center"});
		title.scale.x = 1/GAME_SCALE;
		title.scale.y = 1/GAME_SCALE;
		title.position.x = GAME_WIDTH/GAME_SCALE/2 - title.width/2;
		title.position.y = 10;
		menu.addChild(title);

		loseText = new PIXI.extras.BitmapText("\n\n\nYou have successfully defeated all\nof the fire ghosts!\n\nYour village is safe!",{font: "36px minecraft", align: "center"});
		loseText.scale.x = 1/GAME_SCALE;
		loseText.scale.y = 1/GAME_SCALE;
		loseText.position.x = GAME_WIDTH/GAME_SCALE/2 - loseText.width/2;
		loseText.position.y = 20 + GAME_HEIGHT/GAME_SCALE/8;
		menu.addChild(loseText);
        
		stage.addChild(menu);
}


function clearStage() {
		while(stage.children[0]) {
			stage.removeChild(stage.children[0]);
		}
	}
  
  function startGame() {


		clearStage();
		inMenu = false;
		atMainMenu = false;
		atGameOver = false;
		playing = true;
		restart = false;
    
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
