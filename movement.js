var keys = {};

function keyupEventHandler(e) {
    keys[e.which] = false;
}

function keydownEventHandler(e) {
    keys[e.which] = true;
    if([32, 37, 38, 39, 40, 9].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
    if([9].indexOf(e.keyCode) > -1) {
        credits.visible = false;
        creditsText.visible = false;
        creditsText1.visible = false;
        creditsText2.visible = false;
    }
    if([13].indexOf(e.keyCode) > -1) {
        start.visible = false;
        startText.visible = false;
        startText1.visible = false;
    }
    
}

document.addEventListener('keydown', keydownEventHandler);
document.addEventListener('keyup', keyupEventHandler);

function movePlayer() {
    previousX = runner.position.x;
    previousY = runner.position.y;
    if(keys[87] || keys[38]) { // W key pressed
        if (!(collision(player.x - pixelMovement, null))){
    createjs.Tween.get(player).to({x: player.x - pixelMovement}, speed).call(move);
    }
    }
    if(keys[83] || keys[40]) { // S key pressed
        if(runner.position.y < renderer.height - runner.height/2)
        runner.position.y += 3;
    }
    if(keys[65] || keys[37]) { // A key pressed
        if(runner.position.x > runner.width/2){
        runner.scale.x = Math.abs(runner.scale.x)*-1;
        runner.position.x -= 3;
        }
    }
    if(keys[68] || keys[39]) { // D key pressed
        if(runner.position.x < renderer.width - runner.width/2){
        runner.scale.x = Math.abs(runner.scale.x)*1;
        runner.position.x += 3;
        }
    }
    if (collision()) { 
        runner.position.x = previousX;
        runner.position.y = previousY;
     }
}