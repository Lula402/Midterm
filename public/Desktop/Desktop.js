let socket;
let targetHue = 255; 
let currentHue = 255;
let video;
let previousFrame;
let hasPreviousFrame = false;
let lastVideoTime = -1;
let frameBuffer = [];
let bufferSize = 15;
let averageFrame;
let differenceImg;
let maskImg;
let voronoiLayer;
let misPuntos = [];
let movementPercentage = 0;
let umbral = 0;
let pixelesActivos = []; 

function setup() {
  let p5Canvas = createCanvas(640, 480);
  p5Canvas.style('width', '100vw');
  p5Canvas.style('height', '100vh');
  p5Canvas.style('object-fit', 'contain'); 
  p5Canvas.style('position', 'absolute');
  p5Canvas.style('top', '0');
  p5Canvas.style('left', '0');
  createCanvas(640, 480);
  colorMode(HSB, 360, 100, 100, 1);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  umbral = 15;
  bufferSize = 15;

  voronoiLayer = createGraphics(640, 480);
  previousFrame = createImage(640, 480);
  averageFrame = createImage(640, 480);
  differenceImg = createImage(640, 480);
  maskImg = createImage(640, 480);

  previousFrame.loadPixels();
  averageFrame.loadPixels();
  differenceImg.loadPixels();
  maskImg.loadPixels();

  for (let i = 0; i < 50; i++) {
    let img = createImage(640, 480);
    img.loadPixels(); // Pre-cargo cada frame del buffer
    frameBuffer.push(img);
  }

  for (let i = 0; i < 2500; i++) {
    misPuntos.push([random(width), random(height)]);
  }

    // Conectar al servidor de Socket.IO
    //let socketUrl = 'http://localhost:3000';
    socket = io();

    socket.on('connect', () => {
        console.log('Connected to server');
        socket.emit('join_room', 'Visuales room');
    });

    socket.on('message_joystick', (data) => {
        console.log(`Received targetHue: ${data}`);
        targetHue = data;
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket.IO error:', error);
    });
}

function draw() {
  video.loadPixels();
  currentHue = lerp(currentHue, targetHue, 0.8);
  if (video.pixels.length > 0) {
    let tiempoActual = video.time();

    if (tiempoActual !== lastVideoTime) {
      if (!hasPreviousFrame) {
        copyPixels(video, previousFrame);
        hasPreviousFrame = true;
      }

      background(0);
      
      addFrameToBuffer(video); 
      calculateAverageFrame();
      processNewFrame();

      lastVideoTime = tiempoActual;
    }
  }
}

function processNewFrame() {
  differenceImg.loadPixels();
  maskImg.loadPixels();

  let infoMovimiento = updateBodyMask(video, averageFrame, maskImg, differenceImg, currentHue);
  movementPercentage = infoMovimiento.porcentaje;

  updateVoronoi(maskImg);
  drawAura(voronoiLayer);
  
  image(differenceImg, 0, 0, width, height);
  image(voronoiLayer, 0, 0, width, height);

  copyPixels(video, previousFrame);
}

function updateBodyMask(vid, avg, mImg, dImg, cHue) {
  let videoPixels = vid.pixels;
  let averagePixels = avg.pixels;
  let maskPixels = mImg.pixels;
  let differencePixels = dImg.pixels;
  let count = 0;
  let w = vid.width;
  
    if(movementPercentage < 2){
        umbral = 0;
    } else {
        umbral = 15; 
    }
  pixelesActivos = [];

  for (let i = 0; i < videoPixels.length; i += 4) {
    let bActual = (videoPixels[i] * 0.3) + (videoPixels[i+1] * 0.59) + (videoPixels[i+2] * 0.11);
    let bPromedio = (averagePixels[i] * 0.3) + (averagePixels[i+1] * 0.59) + (averagePixels[i+2] * 0.11);
    let diff = Math.abs(bActual - bPromedio);

    if (diff > 25) count++;
    let col = color(cHue, 100, diff * 2);
    differencePixels[i]     = red(col);
    differencePixels[i + 1] = green(col);
    differencePixels[i + 2] = blue(col);
    differencePixels[i + 3] = 255;

    if (diff >= umbral) {
      maskPixels[i] = maskPixels[i+1] = maskPixels[i+2] = 255;
      let index = i / 4;
      pixelesActivos.push([index % w, Math.floor(index / w)]);
    } else {
      maskPixels[i] = maskPixels[i+1] = maskPixels[i+2] = 0;
    }
    maskPixels[i + 3] = 255;
  }

  dImg.updatePixels();
  mImg.updatePixels();
  
  return { porcentaje: (count / (vid.width * vid.height)) * 100 };
}

function calculateAverageFrame() {
  let n = min(bufferSize, frameBuffer.length);
  if (n === 0) return;

  averageFrame.loadPixels();
  let averagePixels = averageFrame.pixels;

  for (let i = 0; i < averagePixels.length; i += 4) {
    let r = 0, g = 0, b = 0;
    for (let j = frameBuffer.length - n; j < frameBuffer.length; j++) {
      let framePixels = frameBuffer[j].pixels;
      r += framePixels[i];
      g += framePixels[i + 1];
      b += framePixels[i + 2];
    }
    averagePixels[i] = r / n;
    averagePixels[i + 1] = g / n;
    averagePixels[i + 2] = b / n;
    averagePixels[i + 3] = 255;
  }
  averageFrame.updatePixels(); 
}

function addFrameToBuffer(currentFrame) {
  let img = frameBuffer.shift();
  img.loadPixels();
  img.pixels.set(currentFrame.pixels);
  img.updatePixels();
  frameBuffer.push(img);
}

function updateVoronoi(mask) {
  const delaunay = d3.Delaunay.from(misPuntos);
  const v = delaunay.voronoi([0, 0, 640, 480]);
  let maskPixels = mask.pixels;

  for (let i = 0; i < misPuntos.length; i++) {
    let vertices = v.cellPolygon(i);
    if (vertices) {
      let sx = 0, sy = 0;
      for (let p of vertices) { sx += p[0]; sy += p[1]; }
      let px = sx / vertices.length;
      let py = sy / vertices.length;

      let x = floor(constrain(px, 0, 639));
      let y = floor(constrain(py, 0, 479));
      let index = (y * 640 + x) * 4;

      if (maskPixels[index] === 255) {
        misPuntos[i][0] = lerp(misPuntos[i][0], px, 0.95);
        misPuntos[i][1] = lerp(misPuntos[i][1], py, 0.95);
      } else {
        reubicarPunto(i);
      }
    }
  }
}

function drawAura(capa) {
  capa.clear();
  capa.noStroke();
  let radioPunto = map(constrain(movementPercentage, 0, 30), 0, 30, 2, 5);
  capa.fill(255);
  for (let p of misPuntos) {
    capa.ellipse(p[0], p[1], radioPunto, radioPunto);
  }
}

function reubicarPunto(index) {
  if (pixelesActivos.length > 0) {
    let r = floor(random(pixelesActivos.length));
    misPuntos[index] = [pixelesActivos[r][0], pixelesActivos[r][1]];
  }
}

function copyPixels(source, target) {
  source.loadPixels();
  target.loadPixels();
  target.pixels.set(source.pixels);
  target.updatePixels();
}
