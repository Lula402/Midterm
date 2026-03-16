let socket;
let x, y;
let elHue = 255;
let isActive = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    colorMode(HSB, 360, 100, 100, 1);

    x = width / 2;
    y = height / 2;

    socket = io();
    socket.on('connect', () => console.log('Connected to server'));
    socket.on('disconnect', () => console.log('Disconnected from server'));
    socket.on('connect_error', (error) => console.error('Socket.IO error:', error));

    let div = createDiv('Toca y arrastra en la pantalla para cambiar el color');
    div.position(width/2, 20);
    div.style('color', 'white');
    div.style('font-family', 'sans-serif');
    div.style('pointer-events', 'none'); 
}

function draw() {
    background(0);

    push();
    translate(width / 2, height / 2);
    for (let i = 360; i > 0; i -= 2) { 
        strokeWeight(2);
        rotate(radians(2));
        line(0, 0, min(width, height) * 0.4, 0);
    }
    pop();

    let dx = x - width / 2;
    let dy = y - height / 2;

    push();
    translate(width / 2, height / 2);
    stroke(255);
    strokeWeight(2);
    fill(elHue, 100, 100);

    if (isActive) {
        circle(dx, dy, 40);
        stroke(255, 0.5);
        noFill();
        circle(dx, dy, 60);
    } else {
        circle(dx, dy, 20);
    }
    pop();
}

function updatePositionAndColor(inputX, inputY) {
    x = constrain(inputX, 0, width);
    y = constrain(inputY, 0, height);

    let dx = x - width / 2;
    let dy = y - height / 2;
    let angulo = atan2(dy, dx);
    let degreesAngulo = degrees(angulo);
    
    if(degreesAngulo < 0) {
        degreesAngulo += 360; 
    }

    elHue = 360 - degreesAngulo; 

    socket.emit('message_joystick', elHue);
}

function touchStarted() {
    isActive = true;
    if (touches.length > 0) {
        updatePositionAndColor(touches[0].x, touches[0].y);
    }
    return false; 
}

function touchMoved() {
    if (touches.length > 0) {
        updatePositionAndColor(touches[0].x, touches[0].y);
    }
    return false;
}

function touchEnded() {
    isActive = false;
    return false;
}

function mousePressed() {
    isActive = true;
    updatePositionAndColor(mouseX, mouseY);
}

function mouseDragged() {
    updatePositionAndColor(mouseX, mouseY);
}

function mouseReleased() {
    isActive = false;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    x = width / 2;
    y = height / 2;
}