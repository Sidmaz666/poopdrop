export default function game_sketch(p5) {
  let pigeonSprite, poopSprite;
  let pigeonSpriteFrameWidth,
    pigeonSpriteFrames,
    pigeonSpriteCurrentFrame = 0;
  let pigeonSpriteX, pigeonSpriteY;
  let pigeonSize = 0.3;
  let touchStartX, touchStartY;

  let background;
  let backgroundX = 0;
  let backgroundSpeed = 2;

  let carSprites = [];
  let cars = [];
  let carSpawnTimer = 0;

  let poops = [];
  let enemies = [];
  let enemySpawnTimer = 0;

  let lastTouchTime = 0;
  let carSpriteIds;

  let score = 0;
  let level = 0;
  let target;
  let life = 5;

  let LOADER_CLEAR_INTERVAL;
  let SHOW_GAME_OVER = false

  let pause = true;
  let is_game_start = false;
  let is_game_ended = false;
  let isAudio=true;
  let isAudioEffects=true;

  let backgroundAudio
  let successAudio
  let wrongAudio
  let endAudio

  let gameReset = false;


  p5.preload = () => {
    document.body.insertAdjacentHTML("beforeend",`
	<div 
	id="loader-screen" 
	class="
	bg-[url('./sprite/background.jpg')]
	backdrop-blur-sm
	absolute top-0 left-0 w-screen h-screen flex items-center justify-center">
		<div class="loader"></div>
	</div>
     `)
    pigeonSprite = p5.loadImage("./sprite/pigeon.png");
    background = p5.loadImage("./sprite/background.jpg");
    poopSprite = p5.loadImage("./sprite/poop.png"); 
    backgroundAudio = p5.createAudio("./audio/audio.mp3").elt
    backgroundAudio.style.display = "none";
    backgroundAudio.loop = true;
    backgroundAudio.volume = 0.2;
    successAudio = p5.createAudio("./audio/success.mp3").elt
    successAudio.style.display = "none";
    successAudio.volume = 0.4;
    wrongAudio = p5.createAudio("./audio/wrong.mp3").elt
    wrongAudio.style.display = "none";
    wrongAudio.volume = 0.4;
    endAudio = p5.createAudio("./audio/end.mp3").elt
    endAudio.style.display = "none";
    endAudio.volume = 0.3;
    for (let i = 1; i <= 7; i++) {
      carSprites.push(p5.loadImage(`./sprite/car_${i}.png`));
    }
    carSpriteIds = carSprites.map((_, index) => `car_${index + 1}`);
    if (
      document?.localStorage &&
      document?.localStorage.getItem("level") !== null
    ) {
      level = parseInt(document?.localStorage.getItem("level"));
    }
  };

  p5.setup = () => {
    p5.createCanvas(window.innerWidth, window.innerHeight);
    pigeonSetup();
    document.querySelector(".react-p5-wrapper").style.display = "block";
    setInterval(() => {
      if(document.querySelector("#loader-screen")){
	document.querySelector("#loader-screen").remove();
	clearInterval(LOADER_CLEAR_INTERVAL);
	LOADER_CLEAR_INTERVAL = null;
      }
    },10)
    showMenu()
  };

  const showMenu = () => {
    document.body.insertAdjacentHTML("beforeend",`
	<div 
	id="menu" 
	class="
	bg-gray-800/5 
	backdrop-blur-sm	
	absolute top-0 left-0 w-screen h-screen flex items-center justify-center z-[9999]">
	<div
	id="info"
	class="
	absolute top-0 left-0 w-screen h-screen ${gameReset ? 'hidden' : 'flex'} items-center justify-center">
	       <div class="relative flex flex-col space-y-2 bg-green-950/70 
	       w-[250px] overflow-y-auto
	       backdrop-blur-sm rounded-lg shadow-md pt-4 
	       border-4 border-amber-700 p-2 px-4 pb-4 text-yellow-200">
		 <button class="absolute top-1.5 right-1.5 text-sm bg-white text-amber-600 rounded-full w-4 h-4
		 text-center" 
		 ontouchstart="document.querySelector('#info').style.display = 'none'"
		 onclick="document.querySelector('#info').style.display = 'none'">
		 <i class="fa-solid fa-xmark"></i>
		 </button>
		 <span class="text-lg font-semibold font-mono uppercase text-center">HOPC rules</span>
		 <ul class="list-disc list-outside pl-4">
		   <li>Double Tap to Poop</li>
		   <li>Move the pigeon by touching on the screen</li>
		   <li>Black birds are the Enemy</li>
		   <li>One enemy hit will cost you one heart.</li>
		   <li>One point is deducted for poopoing on the wrong car</li>
		   <li>Like life, there are only losers in this game.</li>
		 </ul>
		 <span
		  ontouchstart="
			window.location.href = 'https://github.com/Sidmaz666';
		  "
		  class="text-center mt-[0.8rem_!important]">
		  <span>Created By: <span class="text-amber-500">Sidmaz666</span></span>
		   <i class="fa-brands fa-github ml-1 text-yellow-300"></i>
		 </span>
	       </div>
	</div>
		<div class="flex flex-col p-2">
			<button 
			ontouchstart="window.startGame()"
			onclick="window.startGame()"
			class="cursor-pointer
			font-mono text-2xl px-4 py-2 rounded-lg bg-green-500 text-white uppercase
			border border-green-600 shadow-md font-semibold">
				start
			</button>
		</div>
			<div class="flex space-x-2 items-center justify-center mt-3 px-2 absolute top-0 right-0 text-xs">
			<button 
			 ontouchstart="document.querySelector('#info').style.display = 'flex'"
			 onclick="document.querySelector('#info').style.display = 'flex'">
				    <i class="fa-solid fa-circle-info 
				    bg-green-500 text-white rounded-full text-xl"></i>
				  </button>
				</div>
			</div>
	</div>
     `)
  }

  window.startGame = () => {
	is_game_start = true;
	target = p5.random(carSpriteIds);
	document.querySelector("#menu").remove();
    	if(isAudio) backgroundAudio.play();
  };

  window.pauseGame = () => {
	  pause = true
    	 if(document.getElementById('controls')){
	     document.getElementById('controls').innerHTML = ''
	     document.getElementById('controls').insertAdjacentHTML("beforeend", `
			<button
			ontouchstart="window.playGame()"
			class="px-2 text-xs uppercase font-mono font-medium
			bg-green-500 text-white">Resume</button>
	       `)
    	 }
  }

  window.playGame = () => {
        if(document.getElementById('game-target')){
	  document.getElementById('game-target').remove()
	}
    	 if(document.getElementById('controls')){
	     document.getElementById('controls').innerHTML = ''
	     document.getElementById('controls').insertAdjacentHTML("beforeend", `
			<button 
			ontouchstart="window.pauseGame()"
			class="px-2 text-xs uppercase font-mono font-medium 
			bg-green-500 text-white">Pause</button>
	       `)
    	 }
    	pause = false 
  }

  window.resetGame = () => {
    gameReset = true
      if(document.getElementById('game-over')){
	document.getElementById('game-over').remove()
      }
      if(document.getElementById('game-stats')){
	document.getElementById('game-stats').remove()
      }
      pause = true
      is_game_ended = false
      score = 0
      life = 5
      level = localStorage.getItem('level') ? localStorage.getItem('level') : 0
      is_game_start = false
      backgroundX = 0;
      cars = [];
      carSpawnTimer = 0;
      poops = [];
      enemies = [];
      enemySpawnTimer = 0;
      lastTouchTime = 0;
      target = p5.random(carSpriteIds);
      SHOW_GAME_OVER = false;
      showMenu();
      window.startGame()
  }

  const showHiddenQuest = () => {
    document.getElementById('game-over').remove()
    document.body.insertAdjacentHTML("beforeend",`
	<div 
	id="game-over" 
	class="
	bg-gray-800/5 
	backdrop-blur-sm	
	absolute top-0 left-0 w-screen h-screen flex items-center justify-center z-[9999]">
	<div
	class="
	absolute top-0 left-0 w-screen h-screen flex items-center justify-center">
	       <div class="relative flex flex-col space-y-2 bg-green-950/70 
	       w-[250px] overflow-y-auto
	       backdrop-blur-sm rounded-lg shadow-md pt-4 
	       border-4 border-amber-700 p-2 px-4 pb-4 text-yellow-200">
		 <span class="text-xl font-semibold font-mono uppercase text-center">secret quest unlocked</span>
		 <span class="text-md font-mono uppercase text-center">
		      Eta toh tui e hobi r <strong class="text-amber-500">Paira</strong>. Toh when are we going out?
		 </span>
		 <button 
		 class="px-4 rounded-lg py-2 mt-[0.8rem_!important]
		 uppercase font-mono font-medium bg-green-500 text-white"
		 ontouchstart="window.resetGame()">
			Play Again
		 </button>
	       </div>
	     </div>
	`)

  }

  window.checkHOPCAnswer = () => {
    const text = prompt("Enter the answer")
    if(text?.length < 1) return
    if(
      text.toLowerCase() == "head of pigeon community" ||
      text.toLowerCase() == "head of pigeon the community" ||
      text.toLowerCase() == "pigeon community head" ||
      text.toLowerCase() == "penguin"
    ){
	showHiddenQuest()
    }
  }

  const showGameOver = () => {
    document.body.insertAdjacentHTML("beforeend",`
	<div 
	id="game-over" 
	class="
	bg-gray-800/5 
	backdrop-blur-sm	
	absolute top-0 left-0 w-screen h-screen flex items-center justify-center z-[99999]">
	<div
	class="
	absolute top-0 left-0 w-screen h-screen flex items-center justify-center">
	       <div class="relative flex flex-col space-y-2 bg-green-950/70 
	       w-[250px] overflow-y-auto
	       backdrop-blur-sm rounded-lg shadow-md pt-4 
	       border-4 border-amber-700 p-2 px-4 pb-4 text-yellow-200">
		 <span class="text-lg font-semibold font-mono uppercase text-center">Game Over</span>
		 <span class="text-xl font-semibold font-mono uppercase text-center">
      			<i class="fa-solid fa-star"></i>
			  ${score}
		 </span>
		 <button 
		 class="px-4 rounded-lg py-2 mt-[0.8rem_!important]
		 uppercase font-mono font-medium bg-green-500 text-white"
		 ontouchstart="window.resetGame()">
			Play Again
		 </button>
		 <div class="flex flex-col space-y-2 relative z-[99999]">
		 	<span class="text-sm">You know what <strong class="text-amber-500">HOPC</strong> means? </span>
			<button 
			 ontouchstart="window.checkHOPCAnswer()"
			 class="px-4 rounded-lg py-1.5 
			 uppercase font-mono font-medium border-amber-700 border bg-transparent text-amber-500"
			 ">
				Yes
			 </button>
		 </div>
		 <span
		  ontouchstart="
			window.location.href = 'https://github.com/Sidmaz666';
		  "
		  class="text-center mt-[0.8rem_!important]">
		  <span>Created By: <span class="text-amber-500">Sidmaz666</span></span>
		   <i class="fa-brands fa-github ml-1 text-yellow-300"></i>
		 </span>
	       </div>
	     </div>
	`)
  }

  const checkGameOver = () => {
    if(life <= 0){
	    is_game_ended = true
	    pause = true
	    if(document.getElementById('game-stats')){
	      document.getElementById('game-stats').remove()
	    }
	    if(!SHOW_GAME_OVER){
	      showGameOver()
	      SHOW_GAME_OVER = true
	      if(isAudio){
		backgroundAudio.pause();
	      } 
	      if(isAudioEffects){
		endAudio.play();
	      } 
	    }
	}
  }

  const updateLife = () => {
      if(!document.getElementById('game-life')) return
      document.getElementById('game-life').innerHTML = ''
      const LIFE_HTML_CHILD =  []
      Array(life).fill(null).forEach(() => {
	LIFE_HTML_CHILD.push(`
	  <i class="fa-solid fa-heart"></i>
	`)
      })
      document.getElementById('game-life').insertAdjacentHTML("beforeend", `
	${LIFE_HTML_CHILD.join('')}
      `)
    	checkGameOver()
  }

  const getLevel = () => {
    let level = Math.floor(score / 20);
    return score == 0 ? 0 : level + 1;
  }

  const updateScore = () => {
      if(!document.getElementById('game-score')) return
      document.getElementById('game-score').innerHTML = ''
      document.getElementById('game-score').insertAdjacentHTML("beforeend", `
      	<i class="fa-solid fa-star text-sm"></i>
	<span>
	  ${score}
	</span>
      `)
      level = getLevel()
      updateLevel()
  }

  const updateLevel = () => {
      if(!document.getElementById('game-level')) return
      document.getElementById('game-level').innerHTML = ''
      document.getElementById('game-level').insertAdjacentHTML("beforeend", `
	<i class="fa-solid fa-crown"></i>
	<span>
	  ${level}
	</span>
      `)
       localStorage.setItem('level', level)
  }

  const showTarget = () => {
	if(!document.getElementById('game-target') && pause && !is_game_ended){
	  document.body.insertAdjacentHTML("beforeend",`
	    <div id="game-target" class="flex justify-center items-center
	    absolute top-0 left-0 w-screen h-screen z-[99999] bg-gray-800/5 backdrop-blur-sm">
	       <div class="flex flex-col space-y-2 bg-green-950/70
	       backdrop-blur-sm rounded-lg shadow-md border-4 border-amber-700 p-2 px-4 pb-4">
		 <span 
		 class="text-lg font-semibold text-yellow-200 
		 uppercase font-mono text-center">Target Car</span>
		 <div class="p-2 mb-[0.75rem_!important]">
		   <img src="/sprite/${target}.png" class="w-[200px]" alt="">
		 </div>
		 <button 
		 class="px-4 rounded-lg py-2 uppercase font-mono font-medium bg-green-500 text-white"
		 ontouchstart="window.playGame()">
		 	Got It!
		 </button>
	       </div>
	    </div>
	  `)
	}
  }

  p5.draw = () => {
    backgroundX -= backgroundSpeed;
    const backgroundHeight = p5.height;
    const imgAspectRatio = background.width / background.height;
    const drawHeight = backgroundHeight;
    const drawWidth = drawHeight * imgAspectRatio;

    p5.image(background, backgroundX, 0, drawWidth, drawHeight);
    p5.image(background, backgroundX + drawWidth, 0, drawWidth, drawHeight);

    if (backgroundX <= -drawWidth) {
      backgroundX = 0;
    }

    animatePigeon();

    if(is_game_start){
      if(!document.getElementById('game-stats')){
	document.body.insertAdjacentHTML("beforeend",`
	  <div id="game-stats" class="flex flex-col absolute top-0 left-0 z-[9999] p-2 space-y-1 w-full">
	  	<div id="game-life" class="flex space-x-0.5 items-center text-rose-500"></div>
	  	<div id="game-score" class="flex space-x-1 items-center text-yellow-200"></div>
	  	<div id="game-level" class="flex space-x-1 items-center text-orange-200"></div>
	  	<div id="controls" class="absolute top-0 right-2">
		</div>
	  </div>
	`)
	updateLife()
	updateScore()
	showTarget()
      }
      if(pause) return
      handleCars();
      handleEnemies();
      handlePoops();
    }

  };

  const handleCars = () => {
    carSpawnTimer--;
    if (carSpawnTimer <= 0) {
      spawnCar();
      carSpawnTimer = p5.random(100, 250);
    }

    for (let i = cars.length - 1; i >= 0; i--) {
      let car = cars[i];
      car.x -= backgroundSpeed;

      p5.image(car.sprite, car.x, car.y, car.width, car.height);

      if (car.x + car.width < 0) {
        cars.splice(i, 1);
      }
    }
  };

  const handleEnemies = () => {
    enemySpawnTimer--;
    if (enemySpawnTimer <= 0 && enemies.length < 2) {
      spawnEnemy();
      enemySpawnTimer = p5.random(100, 300); 
    }

    for (let i = enemies.length - 1; i >= 0; i--) {
      let enemy = enemies[i];
      let elapsedTime = p5.millis() - enemy.spawnTime; 

      if (elapsedTime < 3000) {
        enemy.x += (pigeonSpriteX - enemy.x) * 0.025; 
        enemy.y += (pigeonSpriteY - enemy.y) * 0.025;
      } else {
        let moveDirection = p5.createVector(
          enemy.x - pigeonSpriteX,
          enemy.y - pigeonSpriteY
        );
        moveDirection.setMag(10); 
        enemy.x += moveDirection.x;
        enemy.y += moveDirection.y;
      }

      if (p5.frameCount % 10 === 0) {
        enemy.currentFrame = (enemy.currentFrame + 1) % pigeonSpriteFrames;
      }

      p5.push();
      p5.tint(50, 50, 50); 
      const scaledWidth = pigeonSpriteFrameWidth * pigeonSize;
      const scaledHeight = pigeonSprite.height * pigeonSize;
      p5.image(
        pigeonSprite,
        enemy.x - scaledWidth / 2,
        enemy.y - scaledHeight / 2,
        scaledWidth,
        scaledHeight,
        enemy.currentFrame * pigeonSpriteFrameWidth,
        0,
        pigeonSpriteFrameWidth,
        pigeonSprite.height
      );
      p5.pop();

      if (
        p5.dist(enemy.x, enemy.y, pigeonSpriteX, pigeonSpriteY) <
        scaledWidth / 2
      ) {
        console.log("Enemy hit the pigeon!");
        life--;
	if(isAudioEffects){
	  wrongAudio.play();
	}
	updateLife()
        enemies.splice(i, 1); 
      }

      if (
        enemy.x < -scaledWidth ||
        enemy.x > p5.width ||
        enemy.y < -scaledHeight ||
        enemy.y > p5.height
      ) {
        console.log("Enemy moved out of bounds!");
        enemies.splice(i, 1); 
      }
    }
  };

  const spawnCar = () => {
    let carSprite = p5.random(carSprites);
    let carIndex = carSprites.indexOf(carSprite);
    let carId = carSpriteIds[carIndex]; 

    let carWidth = p5.random(150, 200);
    let carHeight = carSprite.height * (carWidth / carSprite.width);
    let carY = p5.height - carHeight - 80;

    let car = {
      sprite: carSprite,
      id: carId, 
      x: p5.width,
      y: carY,
      width: carWidth,
      height: carHeight,
    };

    cars.push(car);
  };

  const spawnEnemy = () => {
    let enemySize = p5.random(20, 50);
    let spawnSide = p5.random(["right", "top", "left"]);
    let enemy = {
      x:
        spawnSide === "right"
          ? p5.width
          : spawnSide === "left"
          ? 0
          : p5.random(p5.width),
      y: spawnSide === "top" ? 0 : p5.random(p5.height),
      size: enemySize,
      currentFrame: 0, 
      spawnTime: p5.millis(), 
    };

    enemies.push(enemy);
  };

  const pigeonSetup = () => {
    pigeonSpriteFrames = 9;
    pigeonSpriteFrameWidth = pigeonSprite.width / pigeonSpriteFrames;
    pigeonSpriteX = p5.width / 2;
    pigeonSpriteY = p5.height / 4;
  };

  const animatePigeon = () => {
    if (p5.frameCount % 10 === 0) {
      pigeonSpriteCurrentFrame = p5.frameCount % pigeonSpriteFrames;
    }
    const scaledWidth = pigeonSpriteFrameWidth * pigeonSize;
    const scaledHeight = pigeonSprite.height * pigeonSize;
    p5.image(
      pigeonSprite,
      pigeonSpriteX - scaledWidth / 2,
      pigeonSpriteY - scaledHeight / 2,
      scaledWidth,
      scaledHeight,
      pigeonSpriteCurrentFrame * pigeonSpriteFrameWidth,
      0,
      pigeonSpriteFrameWidth,
      pigeonSprite.height
    );
  };

  const handlePoops = () => {
    for (let i = poops.length - 1; i >= 0; i--) {
      let poop = poops[i];
      poop.y += 5; 

      p5.image(poopSprite, poop.x, poop.y, 10, 10); 

      if (poop.y > p5.height) {
        poops.splice(i, 1);
      }

      for (let car of cars) {
        if (
          poop.x < car.x + car.width &&
          poop.x + 10 > car.x && 
          poop.y < car.y + car.height &&
          poop.y + 10 > car.y
        ) {
          console.log("Poop hit the car!");
          if (car.id === target) {
            score += 1;
	    if(isAudioEffects){
	      successAudio.play();
	    }
	    updateScore();
            console.log("Poop hit the Target Car!");
          } else {
            if (score <= 0) return;
            score -= 1;
	    updateScore();
          }
          poops.splice(i, 1); 
          break;
        }
      }
    }
  };

  p5.doubleClicked = () => {
    dropPoop();
  };

  const dropPoop = () => {
    let poop = {
      x: pigeonSpriteX,
      y: pigeonSpriteY,
    };
    poops.push(poop);
  };

  p5.touchStarted = (event) => {
    const currentTime = p5.millis();
    if (currentTime - lastTouchTime < 300) {
      dropPoop(); 
    }
    lastTouchTime = currentTime;

    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    return false;
  };

  p5.touchMoved = (event) => {
    if(!is_game_start || pause) return;
    let touchCurrentX = event.touches[0].clientX;
    let touchCurrentY = event.touches[0].clientY;

    let deltaX = touchCurrentX - touchStartX;
    let deltaY = touchCurrentY - touchStartY;

    pigeonSpriteX += deltaX;
    pigeonSpriteY += deltaY;

    pigeonSpriteX = p5.constrain(
      pigeonSpriteX,
      0 + (pigeonSize * pigeonSpriteFrameWidth) / 2,
      p5.width - (pigeonSize * pigeonSpriteFrameWidth) / 2
    );
    pigeonSpriteY = p5.constrain(
      pigeonSpriteY,
      0 + (pigeonSize * pigeonSprite?.height) / 2,
      p5.height - 150 - (pigeonSize * pigeonSprite?.height) / 2
    );

    touchStartX = touchCurrentX;
    touchStartY = touchCurrentY;

    return false;
  };

  p5.touchEnded = () => {
    return false;
  };
}
