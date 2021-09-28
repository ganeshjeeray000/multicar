class Game 
{
  constructor() 
  {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");

    this.leaderboardTitle = createElement("h2");
    this.leader1 = createElement("h2"); //player1
    this.leader2 = createElement("h2"); //player2
  }

  getState() //This function reads the gameState variable's value from the database
  {
    var gamestateRef = db.ref("gameState");
    gamestateRef.on("value", function(data){gameState = data.val();});
  }

  updateState(state) //This function writes playerCount variable's value into the database
  {
    db.ref("/").update({gameState: state});
  }

  start() 
  {
    form = new Form();
    form.display();
    
    player = new Player();

    playerCount = player.getCount();
    
    car1 = createSprite(width/2 - 50, height - 100);
    car1.addImage(car1Img);
    car1.scale = 0.07;

    car2 = createSprite(width/2 + 50, height - 100);
    car2.addImage(car2Img);
    car2.scale = 0.07;

    cars = [car1, car2];
  
   fuelsGroup = new Group();
   coinsGroup = new Group();
   obstaclesGroup = new Group();
  
   var obstaclesPositions = [ 
     { x: width / 2 + 250, y: height - 800, image: obstacle2Img }, 
     { x: width / 2 - 150, y: height - 1300, image: obstacle1Img }, 
     { x: width / 2 + 250, y: height - 1800, image: obstacle1Img }, 
     { x: width / 2 - 180, y: height - 2300, image: obstacle2Img }, 
     { x: width / 2, y: height - 2800, image: obstacle2Img }, 
     { x: width / 2 - 180, y: height - 3300, image: obstacle1Img }, 
     { x: width / 2 + 180, y: height - 3300, image: obstacle2Img }, 
     { x: width / 2 + 250, y: height - 3800, image: obstacle2Img }, 
     { x: width / 2 - 150, y: height - 4300, image: obstacle1Img }, 
     { x: width / 2 + 250, y: height - 4800, image: obstacle2Img }, 
     { x: width / 2, y: height - 5300, image: obstacle1Img }, 
     { x: width / 2 - 180, y: height - 5500, image: obstacle2Img } 
    ];
  
  this.addSprites(fuelsGroup,4,fuelImg,0.02);
  this.addSprites(coinsGroup,18,coinImg,0.09);
  this.addSprites(obstaclesGroup,obstaclesPositions.length,obstacle1Img,0.04,obstaclesPositions);
  }

  addSprites(spriteGroup,numberOfSprites,spriteImage,spriteScale,spritePosition = [])
  {
    for(var i = 0;i< numberOfSprites; i++)
    {
      var x,y;
     
      if(spritePosition.length > 0)
      {
       x = spritePosition[i].x;
       y = spritePosition[i].y;
       spriteImage = spritePosition[i].image;
      }
      else
      {
       x = random(width/2 + 150,width/2 - 150);
       y = random(-height * 4.5,height - 400);
      }
   
      var sprite = createSprite(x,y);
      sprite.addImage(spriteImage);
      sprite.scale = spriteScale;
      spriteGroup.add(sprite);
    }
  }
  
 handleElements()
  {
    form.hideForm();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect"); 

    this.resetTitle.html("Reset Game");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width/2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width/2 + 230, 100);

    this.leaderboardTitle.html("Leaderboard");
    this.leaderboardTitle.class("resetText");
    this.leaderboardTitle.position(width/3 - 50, 40);

    this.leader1.class("leadersText");
    this.leader1.position(width/3 - 50, 80);

    this.leader2.class("leadersText");
    this.leader2.position(width/3 - 50, 130);
  }

  play()
  {
    this.handleElements();
    this.handleResetButton();
    Player.getPlayersInfo();

    if(allPlayers !== undefined)
    {
      image(trackImg, 0, -height*5, width, height*6);
      this.showLeaderboard();

      var index = 0;
      for(var plr in allPlayers) //for-in loop extracts the value from the javascript object
      {
        index = index + 1;
        var x = allPlayers[plr].positionX;
        var y = height - allPlayers[plr].positionY;
        cars[index - 1].position.x = x; //To give x-position to the car when game is in play state
        cars[index - 1].position.y = y; //To give y-position to the car when game is in play state

        if(index === player.index)
        {
          stroke(10);
          fill("red");
          ellipse(x, y, 60, 60);
         
          this.handleFuels(index);
          this.handleCoins(index);
         
          camera.position.x = cars[index - 1].position.x;
          camera.position.y = cars[index - 1].position.y;
        }
      }
      this.handlePlayerControls();
      drawSprites();
    }
  }

  handlePlayerControls()
  {
    if(keyIsDown(UP_ARROW))
    {
      player.positionY = player.positionY + 10;
      player.updatePosition();
    }

    if(keyIsDown(LEFT_ARROW) && player.positionX > width/3 - 50)
    {
      player.positionX = player.positionX - 5;
      player.updatePosition();
    }

    if(keyIsDown(RIGHT_ARROW) && player.positionX < width/2 + 300)
    {
      player.positionX = player.positionX + 5;
      player.updatePosition();
    }
  }

  showLeaderboard()
  {
    var leader1, leader2;
    var players = Object.values(allPlayers); //This method returns an array of values of an object(allPlayers) in the same order as provided by a for-in loop
    
    if((players[0].rank === 0 && players[1].rank === 0) || players[0].rank === 1)
    {
      leader1 = players[0].rank + "&emsp;" + players[0].name + "&emsp;" + players[0].score; //&emsp; tag is used to give 4 spaces
      leader2 = players[1].rank + "&emsp;" + players[1].name + "&emsp;" + players[1].score;
    }

    if(players[1].rank === 1)
    {
      leader1 = players[1].rank + "&emsp;" + players[1].name + "&emsp;" + players[1].score; 
      leader2 = players[0].rank + "&emsp;" + players[0].name + "&emsp;" + players[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);
  }

  handleResetButton()
  {
    this.resetButton.mousePressed(() => {
      db.ref("/").set({playerCount: 0, gameState: 0, players: {}});
      window.location.reload(); //To reload the window
    });
  }
 handleFuels(index)
{
  cars[index - 1].overlap(fuelsGroup,function(collector,collected){
   player.fuel = 185;
  collected.remove();
  })
}

handleCoins(index)
{
cars[index - 1].overlap(coinsGroup, function(collector,collected){
 player.score = player.score + 21;
player.updatePosition();
collected.remove();
    })
  }
};
