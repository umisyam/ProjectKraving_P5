/*  P5 sketch.js file  
*   Umi Syam - November 2015
*   THESIS-1
*/

var app = app || {};

app.main = (function(){

  console.log('Loading app.');
  
  // GLOBALS
  var socket = io.connect('http://localhost:5000');

  /*
   * ===================== START P5 IMPLEMENTATION ===================== 
   */
  //Making the entire sketch as var so we can instantiate it as object later
  var sketch = function(p) {
    var img, imgyou, imgturkey, imgpizza, imgsushi, imgsteak, imgburger, imgbacon, imgcake, imgchoc, imgdonut, imgfries, imgice, imgpancake;
    var pos = p.createVector();
    var vel = p.createVector();
    var rad = 10;
    var balls = [];
    var filteredArray = [];
    var searchTerm;
    var eatingWindow;

    // Initial P5 preload
    p.preload = function() {
      img = p.loadImage("../images/img.png");
      imgturkey = p.loadImage("../images/turkey-bg.png");
      imgpizza = p.loadImage("../images/pizza-bg.png");
      imgsushi = p.loadImage("../images/sushi-bg.png");
      imgsteak = p.loadImage("../images/steak-bg.png");
      imgburger = p.loadImage("../images/burger-bg.png");
      imgbacon = p.loadImage("../images/bacon-bg.png");
      imgcake = p.loadImage("../images/cake-bg.png");
      imgchoc = p.loadImage("../images/choc-bg.png");
      imgdonut = p.loadImage("../images/donut-bg.png");
      imgfries = p.loadImage("../images/fries-bg.png");
      imgice = p.loadImage("../images/icecream-bg.png");
      imgpancake = p.loadImage("../images/pancakes-bg.png");

      imgyou = p.loadImage("../images/you.png");
      console.log("done preload");
    };

    // Initial P5 setup
    p.setup = function() {
      // var canvas = p.createCanvas(p.windowWidth, p.windowHeight);
      var canvas = p.createCanvas(600, 600);
      canvas.position(p.windowWidth/3 - 400, 100);
      canvas.parent('canvasContainer');
      p.ellipseMode(p.RADIUS);

      // setup timeline
      eatingWindow = ["breakfast", "lunch", "dinner", "midnight"];
      // p.textSize(10);
      
      // socket listening..
      socket.on('filteredResults', function (data) {
        console.log(data);  
        var countfilteredResults = data.filteredResults.length;
        console.log(countfilteredResults); 
        $('#total-result').html(data.total);
        searchTerm = data.searchTerm;
        $('#search-term').html(searchTerm);
        $('#search-box').val(searchTerm);
        console.log("search result from database returns this:" + searchTerm);  
        
        // Apply a force each time the mouse is pressed inside the canvas
        canvas.mousePressed(applyForce);

        for (var i = 0; i < countfilteredResults; i++) {
          var row = data.filteredResults[i];
          
          var tweet = row.text;
          var username = row.from_user;
          var timestampISO = row.oriTimestamp.iso;
          var timestampPretty = new Date(timestampISO).toUTCString();
          // console.log(timestampPretty);
          
          // Add a new ball in each frame up to certain limit
          if (balls.length < img.width) {
            var r = 30 * p.random();
            var alpha = p.TWO_PI * p.random();
            pos.set(0.55 * 600 + r * p.cos(alpha), 0.4 * 600 + r * p.sin(alpha), 0);
            vel.set(0, 0, 0);
            // rad = p.map(rad, 0, countfilteredResults, 2, 45);
            balls[i] = new Ball(pos, vel, rad, tweet, username, timestampISO);
            // console.log(balls[i]);
          }
        }

        img.loadPixels();
        imgyou.loadPixels();
        imgturkey.loadPixels();
        imgpizza.loadPixels();
        imgsushi.loadPixels();
        imgburger.loadPixels();
        imgbacon.loadPixels();
        imgcake.loadPixels();
        imgchoc.loadPixels();
        imgdonut.loadPixels();
        imgfries.loadPixels();
        imgice.loadPixels();
        imgpancake.loadPixels();
      });
      p.noStroke();
      
    };
   
    // P5 draw function
    p.draw = function() {
      p.background(0);

      // DIVIDE THE TIMELINE
      // p.fill(255);
      // p.textSize(16);
      // p.textAlign(p.CENTER, p.TOP);
      // for ( var i = 0; i < eatingWindow.length; i++ ) {
      //   p.text(eatingWindow[i], i * p.width/4+35, p.height - 20);
      // }

      switch(searchTerm) {
        case "turkey" : p.image(imgturkey, 0, 0); break;
        case "pizza"  : p.image(imgpizza, 0, 0); break;
        case "sushi"  : p.image(imgsushi, 0, 0); break;
        case "burger" : p.image(imgburger, 0, 0); break;
        case "bacon"  : p.image(imgbacon, 0, 0); break;
        case "cake"  : p.image(imgcake, 0, 0); break;
        case "chocolate" : p.image(imgchoc, 0, 0); break;
        case "donut"  : p.image(imgdonut, 0, 0); break;
        case "fries"  : p.image(imgfries, 0, 0); break;
        case "ice cream"  : p.image(imgice, 0, 0); break;
        case "pancake"  : p.image(imgpancake, 0, 0); break;

        case "you"  : p.image(imgyou, 0, 0); break;
        default:
          p.image(img, 0, 0); break;
      }

      // Update the balls positions
      for (var i = 0; i < balls.length; i++) {
        balls[i].update();
        balls[i].display();
      }

      // // Check if the balls are in contact and move them 
      for (var i = 0; i < balls.length; i++) {
        for (var j = 0; j < balls.length; j++) {
          if (j != i) {
            balls[i].checkCollision(balls[j]);
          }
        }
      }
    };

    // This function applies a force to those balls that are near the cursor
    function applyForce() {
      for (var i = 0; i < balls.length; i++) {
        balls[i].force(p.mouseX, p.mouseY);
      }
    }
    
    p.mousePressed = function() {
      for (var i = 0; i < balls.length; i++) {
        if (balls[i].isHovering()) {
          console.log("Ball #" + i + "is clicked");
        }
      }
    }

    p.keyPressed = function() {
      if (p.keyCode == p.ENTER) {  //13 IS ENTER
        p.remove();
      }
    };

    /*
     * ===================== The Ball class ===================== 
     */
    function Ball(initPos, initVel, rad, tweet, username, timestamp) {
      // Ball constructor
      this.pos = initPos.copy();
      this.vel = initVel.copy();
      this.col = p.color(255);
      // this.rad = 3;
      this.rad = rad;
      this.tweet = tweet;
      this.username = username;
      this.timestamp = new Date(timestamp).toUTCString();   //format the date back to UTC
    }

    Ball.prototype.update = function() {
      // Update ball position and velocity
      this.pos.add(this.vel);
      this.vel.mult(0.999);

      var wall_start = 0;
      var wall_lunch = p.width/4;
      var wall_dinner = p.width/2;
      var wall_midnight = p.width - p.width/4;
      var wall_end = p.width;

      // if ( mouseX > 0 && mouseX < width/4 ) {

      // } else if (mouseX > width/4 && mouseX < width/2) {

      // } else if (mouseX > width/2 && mouseX < width - width/4) {

      // } else if (mouseX > width-width/4 && mouseX < width) {

      // }

      // Boundary/wall checking - if the ball exceeds the image size
      if (this.pos.x > img.width - this.rad) {
        this.pos.x = img.width - this.rad;
        this.vel.x *= -1;
      } else if (this.pos.x < this.rad) {
        this.pos.x = this.rad;
        this.vel.x *= -1;
      }

      if (this.pos.y > img.height - this.rad) {
        this.pos.y = img.height - this.rad;
        this.vel.y *= -1;
      } else if (this.pos.y < this.rad) {
        this.pos.y = this.rad;
        this.vel.y *= -1;
      }

      // Update new ball color and radius
      var pixel = 4 * (p.round(this.pos.x) + p.round(this.pos.y) * img.width);

      switch(searchTerm) {
        case "turkey":
          this.col = p.color(imgturkey.pixels[pixel], imgturkey.pixels[pixel + 1], imgturkey.pixels[pixel + 2]); break;
        case "pizza":
          this.col = p.color(imgpizza.pixels[pixel], imgpizza.pixels[pixel + 1], imgpizza.pixels[pixel + 2]);break;
        case "sushi":
          this.col = p.color(imgsushi.pixels[pixel], imgsushi.pixels[pixel + 1], imgsushi.pixels[pixel + 2]);break;
        case "you":
          this.col = p.color(imgyou.pixels[pixel], imgyou.pixels[pixel + 1], imgyou.pixels[pixel + 2]);break;

        case "burger" : 
          this.col = p.color(imgburger.pixels[pixel], imgburger.pixels[pixel + 1], imgburger.pixels[pixel + 2]); break;
        case "bacon"  : 
          this.col = p.color(imgbacon.pixels[pixel], imgbacon.pixels[pixel + 1], imgbacon.pixels[pixel + 2]); break;
        case "cake"  : 
          this.col = p.color(imgcake.pixels[pixel], imgcake.pixels[pixel + 1], imgcake.pixels[pixel + 2]); break;
        case "chocolate" : 
          this.col = p.color(imgchoc.pixels[pixel], imgchoc.pixels[pixel + 1], imgchoc.pixels[pixel + 2]); break;
        case "donut"  : 
          this.col = p.color(imgdonut.pixels[pixel], imgdonut.pixels[pixel + 1], imgdonut.pixels[pixel + 2]); break;
        case "fries"  : 
          this.col = p.color(imgfries.pixels[pixel], imgfries.pixels[pixel + 1], imgfries.pixels[pixel + 2]); break;
        case "ice cream"  : 
          this.col = p.color(imgice.pixels[pixel], imgice.pixels[pixel + 1], imgice.pixels[pixel + 2]); break;
        case "pancake"  :  
          this.col = p.color(imgpancake.pixels[pixel], imgpancake.pixels[pixel + 1], imgpancake.pixels[pixel + 2]); break;
        default:
          this.col = p.color(img.pixels[pixel], img.pixels[pixel + 1], img.pixels[pixel + 2]);break;
      }
      this.vel.mult(0.3);
      this.vel.x = p.random(-0.5,0.5);
      this.vel.y = p.random(-0.5,0.5);
      p.push();
      // this.pos.x = 
      // rotateX(frameCount * 0.002);
      p.pop();
      // this.col = p.color(img.pixels[pixel], img.pixels[pixel + 1], img.pixels[pixel + 2]);
      // this.rad = p.map(p.brightness(this.col), 0, 255, 3, 7);
    };
    
    Ball.prototype.display = function() {
      
      //when you hover, show the label
      if (this.isHovering()) {
        
        p.fill(255);
        p.noStroke();
        p.textSize(14);
        p.textAlign(p.LEFT, p.BOTTOM);
        p.text(this.tweet, 10, p.height-30);
        p.textSize(10);
        p.textAlign(p.LEFT, p.TOP);
        p.fill(220,255,255);
        p.text(this.username + ",  \t" + this.timestamp, 10, p.height-60);

        this.rad = 14;
        p.strokeWeight(2);
        p.stroke(255);
        p.ellipse(this.pos.x, this.pos.y, this.rad, this.rad);
      }

      this.rad = 10;
      p.strokeWeight(0.5);
      p.stroke(255, 150);
      p.fill(this.col);
      p.ellipse(this.pos.x, this.pos.y, this.rad - 0.5, this.rad - 0.5);
    };

    // Checks if the ball is in contact with another ball
    Ball.prototype.checkCollision = function(b) {
      var contactDist = this.rad + b.rad;
      var xDiff = b.pos.x - this.pos.x;
      var yDiff = b.pos.y - this.pos.y;
      var diffSq = p.sq(xDiff) + p.sq(yDiff);

      if (diffSq < p.sq(contactDist - 1)) {
        var c = contactDist / (2 * p.sqrt(diffSq));
        b.pos.set(this.pos.x + xDiff * (0.5 + c), this.pos.y + yDiff * (0.5 + c), 0);
        this.pos.set(this.pos.x + xDiff * (0.5 - c), this.pos.y + yDiff * (0.5 - c), 0);
        b.vel.set(0, 0, 0);
        this.vel.set(0, 0, 0);
      }
    };

    // This method applies a repulsive force at the given position
    Ball.prototype.force = function(x, y) {
      var xDiff = x - this.pos.x;
      var yDiff = y - this.pos.y;
      var diffSq = p.sq(xDiff) + p.sq(yDiff);
      
      if (diffSq < 1000) {
        var diff = p.sqrt(diffSq);
        var deltaVel = 15 * p.min(p.abs(this.rad / diff), 1);
        this.vel.add(-deltaVel * xDiff / diff, -deltaVel * yDiff / diff);
      }
    };
    
    Ball.prototype.isHovering = function() {
      // var distance = p.dist(p.mouseX, p.mouseY, this.pos.x +  p.width/2, this.pos.y + p.height/2);
      var distance = p.dist(p.mouseX, p.mouseY, this.pos.x, this.pos.y); 
      if(distance < this.rad/2) {
        console.log('hover!');
        return true;
      } else {
        return false;
      }
    };
    
  };
  // ======================== END OF P5 SKETCH


  var getInput = function(){
      loadData($('#search-box').val());
      
    };

  // We put ALL our listeners here
  var attachEvents = function(){
    console.log('Attaching events.');
    
    $('#search-btn').on('click', getInput);
    $('#search-box').keypress(function(e){
      if (e.keyCode == 13) {  //13 IS ENTER
        getInput();
      }
    });

    $( "#icon-pizza" ).click(function() { loadData("pizza"); });
    $( "#icon-sushi" ).click(function() { loadData("sushi"); });
    $( "#icon-steak" ).click(function() { loadData("steak"); });
    $( "#icon-burger" ).click(function() { loadData("burger"); });
    $( "#icon-bacon" ).click(function() { loadData("bacon"); });
    $( "#icon-cake" ).click(function() { loadData("cake"); });
    $( "#icon-choc" ).click(function() { loadData("chocolate"); });
    $( "#icon-donut" ).click(function() { loadData("donut"); });
    $( "#icon-fries" ).click(function() { loadData("fries"); });
    $( "#icon-icecream" ).click(function() { loadData("ice cream"); });
    $( "#icon-pancake" ).click(function() { loadData("pancake"); });
    $( "#icon-turkey" ).click(function() { loadData("turkey"); });

  };

  var loadData = function(searchTerm){
    myp5 = null;
    console.log('Searching for ' + searchTerm + '...');

    socket.emit('getFilteredResult', searchTerm);
    var myp5 = new p5(sketch);

    socket.on('filteredResults', function (data) {
      var totalResult = data.total;
      console.log("Total RESULT = " +totalResult); 
    });
  };


  var init = function(){
    console.log('Initializing app.');
    attachEvents();
  };

  return {
    init: init
  };
})();

/* Wait for all elements on the page to load */
window.addEventListener('DOMContentLoaded', app.main.init);
