import Game from './scenes/game.js'

//var scene = new Phaser.Scene("game");

let w;
let h;


     //let w = window.innerWidth - 240;
     //let h = window.innerWidth * 1080 / 1920;

     if(window.innerWidth < window.innerHeight){
      w = window.innerHeight - 240;
      h = window.innerHeight * 1080 / 1920;
     } else {
       w = window.innerWidth - 240;
       h = window.innerWidth * 1080 / 1920;
     }


var config = {
    type: Phaser.AUTO,
    backgroundColor: '#634000',
    scale: {
        mode: Phaser.Scale.fit,
        parent: 'phaser-game',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width:   w * window.devicePixelRatio,
        height:   h  * window.devicePixelRatio
    },
    dom: {
        createContainer: true
    },
    scene: [
        Game
    ]
};


const game = new Phaser.Game(config);






/*game.scale.on(Phaser.Scale.Events.LEAVE_FULLSCREEN, () => {
  game.scale.scaleMode = Phaser.Scale.NONE;
  game.scale.autoCenter = Phaser.Scale.CENTER_HORIZONTALLY;
});

game.scale.on(Phaser.Scale.Events.ENTER_FULLSCREEN, () => {
  game.scale.scaleMode = Phaser.Scale.FIT;
  game.scale.autoCenter = Phaser.Scale.CENTER_BOTH;
});*/
