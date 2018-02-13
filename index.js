var MAIN__CANVAS = document.getElementsByClassName('main-c')[0]; // ca
var C2D = MAIN__CANVAS.getContext('2d'); // 2d drawing
var myArt; // objects for art
var UPDATE_TIMER = 20; // how often drawing updates in ms
var NUM_OBJECTS = 30; // how many objects to draw

class Scene {
  constructor (inN) {
    this.dots = new Array(inN); // no resizing
    for (let i = 0; i < inN; i++) {
      this.dots[i] = new Dot();
    }
    // console.log('constructor for Scene');
  }

  timeStepAll () {
    this.dots.forEach((item) => {
      item.timeStep();
    });
  }

  getDots () {
    return this.dots;
  }

  getPairs (cutoff = 10) {
    // returns an array of pairs to draw with proximity
    // this can be optimized but minor counts here

    let cutoffSquared = Math.pow(cutoff, 2);
    let pairs = []; // array of pairs objects
    
    let totalDots = this.dots.length;
    // for each dot
    for (let i = 0; i < totalDots - 1; i++) {
      // for each dot not yet counted
      for (let j = i + 1; j < totalDots; j++) {
        let X1 = this.dots[i].pX;
        let Y1 = this.dots[i].pY;
        let X2 = this.dots[j].pX;
        let Y2 = this.dots[j].pY;
        // console.log(' checking ' + parseInt(X1) + ',' + parseInt(Y1) + '-' + parseInt(X2) + ',' + parseInt(Y2));
        let dSquared = Math.pow(X2 - X1, 2) + Math.pow(Y2 - Y1, 2);
        if (dSquared <= cutoffSquared) {
          let thisPair = {}; // individual pair object
          thisPair.X1 = X1;
          thisPair.X2 = X2;
          thisPair.Y1 = Y1;
          thisPair.Y2 = Y2;

          // ideally we have a smooth transition from transparent to solid connection so less jarring
          // best connection is at 0 or lets say even half cutoff - opacity of 1
          // worst connection is at cutoff and should give opacity of 0
          thisPair.strength = Math.min(
            Math.max(1.5 - 2 * Math.sqrt(dSquared) / cutoff, 0),
            1);

          // add copy of thisPair to the pairs array;
          // simply doing pairs.push(thisPair) was linking the object id & resulting
          // in pairs having many identical objects bc they are linked
          pairs.push(Object.assign({}, thisPair));
        }
      }
      // console.log(pairs);
      // console.log(' ');
    }
   
    // console.log(pairs);
    // console.log(' ');
    return pairs;
  }
}

class Dot {
  constructor (inMaxVelocity = 1) {
    // this will be in % coordinates instead of pixels so it's independent of resolution
    this.pX = 100 * Math.random();
    this.pY = 100 * Math.random();
    this.dX = (inMaxVelocity * Math.random()) - inMaxVelocity / 2;
    this.dY = (inMaxVelocity * Math.random()) - inMaxVelocity / 2;
  }

  timeStep () {
    // check for bounces
    let isBounceX = (this.pX + this.dX >= 100) || (this.pX + this.dX <= 0);
    if (isBounceX) {
      this.dX = -this.dX; // reverse direction in X
    }

    let isBounceY = (this.pY + this.dY >= 100) || (this.pY + this.dY <= 0);
    if (isBounceY) {
      this.dY = -this.dY; // reverse direction in X
    }

    this.pX += this.dX; // add velocity per step to position
    this.pY += this.dY; // add velocity per step to position
  }

  getX () {
    return this.pX;
  }

  getY () {
    return this.pY;
  }
}

// main event that starts other events
window.addEventListener('load', initializeScene);

function initializeScene () {
  // this starts everything

  // create the art objects from class
  myArt = new Scene(NUM_OBJECTS);

  // add resizing events
  window.addEventListener('resize', resizeAndRefreshCanvas);

  // run sizing and refreshing once
  resizeAndRefreshCanvas();

  // start a timer once
  let myTimer = window.setInterval(intervalUpdate, UPDATE_TIMER);
}

function resizeAndRefreshCanvas () {
  // run to resize canvas
  MAIN__CANVAS.width = window.innerWidth;
  MAIN__CANVAS.height = window.innerHeight; // .clientHeight with padding

  // refresh canvas
  refreshCanvas();
  // console.log(MAIN__CANVAS.width + ',' + MAIN__CANVAS.height);
}

function refreshCanvas () {
  // run to refresh drawings

  // grab drawing area size first
  let fullX = MAIN__CANVAS.width;
  let fullY = MAIN__CANVAS.height;

  // then clear the canvas
  C2D.clearRect(0, 0, fullX, fullY);

  // helper for testing borders
  // C2D.strokeStyle = 'red';
  // C2D.lineWidth = '5';
  // C2D.strokeRect(0, 0, fullX, fullY);

  // draw the dots in current location
  // myArt.getDots().forEach((eaDot) => {
  //   // draw each Dot
  //   drawDot(eaDot.getX() * fullX / 100,
  //     eaDot.getY() * fullY / 100,
  //     0.4 * fullY / 100);
  // });

  // draw lines for dots close enough together
  myArt.getPairs(30).forEach((eaPair) => {
    // draw each Dot
    drawLine(eaPair.X1 * fullX / 100,
      eaPair.Y1 * fullY / 100,
      eaPair.X2 * fullX / 100,
      eaPair.Y2 * fullY / 100,
      0.2 * fullY / 100,
      eaPair.strength);
    // console.log(eaPair);
  });
  // console.log(myArt.getPairs(10));
  // console.log(' ');
}

function drawDot (inX, inY, inR = 2, inStrength = 1) {
  // round them for accuracy
  let goodX = Math.floor(inX);
  let goodY = Math.floor(inY);
  let goodR = Math.floor(inR);
  // box is faster
  // C2D.fillStyle = 'white';
  // C2D.fillRect(goodX - 2, goodY - 2, 4, 4);

  C2D.beginPath();
  C2D.arc(goodX, goodY, goodR, 0, 2 * Math.PI);
  C2D.fillStyle = 'rgba(255, 255, 255, ' + String(inStrength) + ')';
  C2D.fill();
}

function drawLine (inX1, inY1, inX2, inY2, inW = 2, inStrength = 1) {
  // round them for accuracy
  let goodX1 = Math.floor(inX1);
  let goodY1 = Math.floor(inY1);
  let goodX2 = Math.floor(inX2);
  let goodY2 = Math.floor(inY2);
  let goodW = Math.floor(inW);
  let goodS = inStrength * 0.5; // reduce opacity by 1/2

  C2D.beginPath();
  C2D.strokeStyle = 'rgba(255, 255, 255, ' + String(goodS) + ')';
  C2D.lineWidth = goodW;
  C2D.moveTo(goodX1, goodY1);
  C2D.lineTo(goodX2, goodY2);
  C2D.stroke();

  drawDot(goodX1, goodY1, goodW * 2, goodS);
  drawDot(goodX2, goodY2, goodW * 2, goodS);
  // console.log(' drawing line ' + goodX1 + ',' + goodY1 + '-' + goodX2 + ',' + goodY2);
}

function intervalUpdate () {
  // this updates the location of everything & refreshes drawing
  myArt.timeStepAll();
  refreshCanvas();
}
