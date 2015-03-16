// Copyright 2013 William Malone (www.williammalone.com)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

(function() {
	// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
	// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
	// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
	// MIT license

    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());


(function () {
			
	var numCoins = 5,
		score = 0,
	    coins = [],
		canvas;			

	function gameLoop () {
	
	  var i;
	
	  window.requestAnimationFrame(gameLoop);    // requestAnimationFrame hooks into the browser's asynchronous looping (refreshing)
	  
	  // Clear the canvas
	  canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

	  for (i = 0; i < coins.length; i += 1) {
		  coins[i].update();
		  coins[i].render();
	  }
	}      // end gameLoop
	
	function sprite (options) {
			
		var	frameIndex = 0,
			tickCount = 0,
			ticksPerFrame = options.ticksPerFrame || 0,
			numberOfFrames = options.numberOfFrames || 1;
		
		var that = {};   // instantiate an object using an empty constructor
		
		that.context = options.context;
		that.width = options.width;
		that.height = options.height;
		that.xx = 0;
		that.yy = 0;
		that.image = options.image;
		that.scaleRatio = 1;
	
		// the crucial update where each frame is shown after tickCount is > than ticksPerFrame		
		that.update = function () {

            tickCount += 1;

            if (tickCount > ticksPerFrame) {                // note in line 159 that ticksPerFrame is set to i. This affects rotation speed of coins

				tickCount = 0;
				
                // If the current frame index is in range
                if (frameIndex < numberOfFrames - 1) {	
                    // Go to the next frame
                    frameIndex += 1;
                } else {
                    frameIndex = 0;
                }
            }
        };
		
		that.render = function () {

		  // Draw the animation
		  that.context.drawImage(
		    that.image,
		    frameIndex * that.width / numberOfFrames,
		    0,
		    that.width / numberOfFrames,
		    that.height,
		    that.xx,
		    that.yy,
		    that.width / numberOfFrames * that.scaleRatio,   // scaleRatio varies by a Random number created below at line 167
		    that.height * that.scaleRatio);                  // and this affects the size of the coin
		};
		
		that.getFrameWidth = function () {
			return that.width / numberOfFrames;
		};
		
		return that;
	}    // end Sprite
	
	function destroyCoin (coin) {
	
		var i;
		
		for (i = 0; i < coins.length; i += 1) {
			if (coins[i] === coin) {
				coins[i] = null;
				coins.splice(i, 1);   //Go to i index in array and remove 1 item, that is, assign 'null' then remove 'null' at i pos.
				                      //This shortens the array by 1 therefore coins.length = coins.length - 1
				break;  // exit the Loop
			}
		}
	}
	
	function spawnCoin () {
	   
		var coinIndex,
			coinImg;
	
		// Create sprite sheet
		coinImg = new Image();	
	    coinIndex = coins.length;
	    // Create sprite..................recall sprite assigns values to 'options', in this case 6 of them. {} means Object
		// ALSO coins <= sprite, that is, coins gets all the properties of sprite
		// BTW, recall that sprite returns 'that'
		
		// Imp** sprite below will perform Update and Render for this new coins[coinIndex] member using the parameters defined
		coins[coinIndex] = sprite({
			context: canvas.getContext("2d"),
			width: 1000,
		    height: 100,
			image: coinImg,
		    numberOfFrames: 10,
			ticksPerFrame: i
		});
		        	 
	// assign values to  xx and yy which are defined above in the sprite object
		coins[coinIndex].xx = Math.random() * (canvas.width - coins[coinIndex].getFrameWidth() * coins[coinIndex].scaleRatio);
		coins[coinIndex].yy = Math.random() * (canvas.height - coins[coinIndex].height * coins[coinIndex].scaleRatio);
		
		coins[coinIndex].scaleRatio =  Math.random() * 0.5 + 0.5;
		        
		// Load sprite sheet
		coinImg.src = "images/coin-sprite-animation.png";
	
	}   // end spawnCoin ()
	
	function getElementPosition (element) {
	   // element is the canvas dims. in order to get the proper coords of the mouse position.
	   var parentOffset,
       	   pos = {
               x: element.offsetLeft,      //offsetLeft, offsetTop, offsetParent are javascript KEY words
               y: element.offsetTop        //offsetLeft etc. are number of pixels mouse is from Left and Top
           };
       if (element.offsetParent) {
           parentOffset = getElementPosition(element.offsetParent);
           pos.x += parentOffset.x;        // calculates how far the canvas is from the parent, perhaps parent = DOM default screen
           pos.y += parentOffset.y;        // so it's parent offset + canvas offset
       }
       return pos;
    }  // end getElementPosition
	
	function distance (p1, p2) {
	
		var dx = p1.x - p2.x,
			dy = p1.y - p2.y;
			
		return Math.sqrt(dx * dx + dy * dy);
	}
	
	function tap (e) {
	
		var i,
			loc = {},     // {}  empty constructor 
			dist,
			coinsToDestroy = [];
			poss = getElementPosition(canvas),    
			tapX = e.targetTouches ? e.targetTouches[0].pageX : e.pageX,    // e.pageX for mouse  and e.targetTouches[0].pageX for ipad
			tapY = e.targetTouches ? e.targetTouches[0].pageY : e.pageY,    // ? is conditional: if true then e.targetTouches[0].pageY ELSE e.pageY
		    canvasscaleRatio = canvas.width / canvas.offsetWidth;
      	
        loc.x = (tapX - poss.x) * canvasscaleRatio;  // poss.x is the canvas offset from the parent to get the accurate x value of the mouse when pressed
		loc.y = (tapY - poss.y) * canvasscaleRatio;
		
        for (i = 0; i < coins.length; i += 1) {
		
			// Distance between tap and coin
			dist = distance({
				x: (coins[i].xx + coins[i].getFrameWidth() / 2 * coins[i].scaleRatio),
				y: (coins[i].yy + coins[i].getFrameWidth() / 2 * coins[i].scaleRatio)
			}, {
				x: loc.x,      // location, x coord, of tap
				y: loc.y
			});
			
			// Check for tap collision with coin		
			if (dist < coins[i].getFrameWidth() / 2 * coins[i].scaleRatio) {
				coinsToDestroy.push(coins[i]);
			}
		}     //  end for loop 
		
		// Destroy tapped coins
		for (i = 0; i < coinsToDestroy.length; i += 1) {
		
			score += parseInt(coinsToDestroy[i].scaleRatio * 10, 10);   //the second 10 is base 10 decimal
			destroyCoin(coinsToDestroy[i]);	
			setTimeout(spawnCoin, 1000);	
		}
		
		if (coinsToDestroy.length) {
			document.getElementById("score").innerHTML = score;
		}
	}   // end tap
	
	// Get canvas
	canvas = document.getElementById("coinTapGame");
	canvas.width = 460;     // 460
	canvas.height = 230;    // 230
	
	
	// Here is the beginning of execution. First, spawnCoin fills the array. 'tis the FIRST thing this program does.
	for (i = 0; i < numCoins; i += 1) {
	   
    	spawnCoin();
	}
	
	gameLoop();
	
	canvas.addEventListener("touchstart", tap);
	canvas.addEventListener("mousedown", tap);

} ());

