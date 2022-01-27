import {io} from 'socket.io-client';
import Drag from '../helpers/drag.js';
import dropperRight from '../helpers/dropperRight.js';
import replaceFront from '../helpers/replaceFront.js';
import bigFont from '../helpers/bigFont.js';
import {Events} from '../helpers/Events.js';
import { hunter, romanGreek, darkAge2, rennaisance, goldAge, enlightment, industry, now } from '../helpers/Orders.js';
const Dates = []
const Explain = []
const names = []

const socket = io('http://167.86.74.64:3000', {transports : ["websocket"] })

for(let f = 0; f < Events.length; f++) {
    Dates[f] = Events[f].Dates;
    Explain[f] = Events[f].Explain;
    names[f] = Events[f].Names;
}

var keys;
var checking = false;
var cardsPlayed = [];
var replaceCards = [];
var zones = [];
var started = false;
var playersCards = [];
var playersName = [];
var playersId = [];
const MaxCards = 7;
var LeftisDown = false;
var RightisDown = false;
var paused = false;
var urTurn = false;
var Turn = 0;
var players = [];
var rightDropZone;
let urId;
let ending = false;
let animationNow = false;
let playersCount = 0;
let pressedVote = false;


const zustand = document.querySelector('.containerGame .control .info');
const lbl_Player = document.getElementById('Spielzug');
const Btn_nextTurn = document.getElementById('Btn_nextTurn');
const Btn_doubt = document.getElementById('Btn_doubt');
const endscreen = document.querySelector('.con')


        function winxixi(){
            document.querySelector('.con').style.display = 'grid'
            document.querySelector('.x').style.display = 'grid'
            let xixi = document.getElementById('xixix')
            xixi.innerHTML="Du hast gewonnen!";
            document.getElementsByTagName('canvas')[0].style.visibility = 'hidden'
            document.getElementsByTagName('canvas')[0].style.zIndex = '-1'
            let green = document.querySelector('body')
            green.classList.add('green')
            document.getElementById('lbl_nextTurn').innerText = 'Gewonnen'

            document.getElementById('lbl_doubt').innerText = 'Juhuu. Frag doch mal nach Keksen'
            }
        function losexixi(Person){
            document.querySelector('.x').style.display = 'grid'
            let xixi = document.getElementById('xixix')
            xixi.innerHTML= Person + " hat gewonnen!";
            document.getElementsByTagName('canvas')[0].style.visibility = 'hidden'
            document.getElementsByTagName('canvas')[0].style.zIndex = '-1'
            let red = document.querySelector('body')
            red.classList.add('red')
            document.getElementById('lbl_nextTurn').innerText = 'Verloren'

            document.getElementById('lbl_doubt').innerText = 'Vielleicht das nächste mal'

        }


function shuffle(array) {
    var m = array.length, t, i;
  
    // While there remain elements to shuffle…
    while (m) {
  
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);
  
      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }
  
    return array;
  }



function yWert(self, x) {
    let y = -1 * Math.sqrt(((self.game.config.height**(2)*(0.25*self.game.config.width**(2)-(x-0.5*self.game.config.width)**(2)))/(4*self.game.config.width**(2))))+self.game.config.height
    return y
}

function cardAngle(self, x) {
    let a = (self.game.config.height * (x - self.game.config.width / 2) / (2 * self.game.config.width * Math.sqrt(self.game.config.width ** 2 / 4 - (x - self.game.config.width / 2) ** 2)))
    return a
}

function nextTurn(self) {
    if(Turn > players.length) {Turn == players.length - 1}
    Turn++;
        if (Turn >= players.length) {
            Turn = 0;
        }
        let f = [players[Turn], false]
        self.socket.emit('nextTurn', f)
        let g = [Turn, Turn - 1];
        if (g[1] < 0) {g[1] = players.length - 1}
        self.socket.emit('start', (Turn))
        self.socket.emit('Turn', (g))
    
        zustand.classList.remove('active');
        Btn_nextTurn.style.opacity= 0.5;
        Btn_nextTurn.style.cursor="no-drop";
        Btn_doubt.style.opacity= 0.5;
        Btn_doubt.style.cursor="no-drop";
        document.getElementById('lbl_nextTurn').innerText = 'Nächster Zug'

}

function wasRight(self, end) {
    let r = Turn - 1;
    if (r < 0) {r = players.length - 1}
    let data = [Turn, end]
    self.socket.emit('wasRight', (data))
}



function itsFalse(self) {
    let o = Turn - 1;
    if (o < 0) {o = players.length - 1}
    let d = [o, players[o]]

    self.socket.emit('itsFalse', d)
}

function moveArrayItemToNewIndex(arr, old_index, new_index) {
    if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; 
};

function startGame(names, cardOrder, self, cardsHand, zonesHand, zones, cardsPlayed, Explain, Dates) {

    self.zoneRight = new dropperRight({                       
        scene: self,
        x: self.game.config.width / 2,
        y: self.game.config.height / 2,
        depth: 0,
        x2: self.game.config.width / 2,
        y2: self.game.config.height / 6,
    })
    rightDropZone = self.zoneRight.renderZone();
    rightDropZone.setOrigin(0, 0.5)
    rightDropZone.x = self.game.config.width / 2
    rightDropZone.field = true;
    rightDropZone.Number = 1;
    rightDropZone.input.enabled = true;
    rightDropZone.background = true;

    for (let h = -1; h < 2; h++) {
    if (h < 0) {
        self.zoneRight = new dropperRight({                       
            scene: self,
            x: self.game.config.width / 2 + h * self.game.config.width / 12,
            y: self.game.config.height / 2,
            depth: 1,
            x2: self.game.config.width,
            y2: self.game.config.height / 6,
        })
        self.dropZone = self.zoneRight.renderZone();
        self.dropZone.setOrigin((15/16*self.game.config.width)/self.game.config.width, 0.5)
        self.dropZone.x = self.game.config.width / 2 + h * self.game.config.width / 12
        self.dropZone.input.enabled = true;
        self.dropZone.field = true;
        self.dropZone.left = true;
        self.dropZone.Number = 0;
    } else {
        self.zoneRight = new dropperRight({                       
            scene: self,
            x: self.game.config.width / 2 + h * self.game.config.width / 12,
            y: self.game.config.height / 2,
            depth: 1,
            x2: self.game.config.width / 6,
            y2: self.game.config.height / 6,
        })
        self.dropZone = self.zoneRight.renderZone();
        self.dropZone.input.enabled = true;
        self.dropZone.field = true;
        self.dropZone.left = false;
            self.dropZone.Number = 1;
    }
    zones.push(self.dropZone);
    h++;
    }
    

    self.player = new Drag({
        scene: self,
        x: self.game.config.width / 20 * 19,
        y: self.game.config.height / 10 * 7,
        card: 'card',
        depth: 1,
        draggable: false,
        Order: cardOrder[0],
        width: self.game.config.width,
        ondragend: (pointer, gameObject, dropZone) => {}
    });
    self.player.Number = cardOrder[0];
    self.player.input.draggable = false;
    self.player.DropNumber = 0;
    self.player.Position = 0;
    self.player.droppen = 0;
    self.player.HandNumber = undefined;
    self.player.HandPosition = undefined;
    self.player.dropped = true;
    self.player.overField = false;
    self.player.input.draggable = false;
    self.player.setScale(self.game.config.width / 6 / self.player.width)
    cardsPlayed.push(self.player)
    if (paused) {
        cardsPlayed[0].x = self.game.config.width / 2;
        cardsPlayed[0].y = self.game.config.height / 2
    } else {
    self.tweens.add({
        targets: cardsPlayed[0],
        angle: 0,
        x: self.game.config.width / 2,
        y: self.game.config.height / 2,
        duration: 400
    })
    }
}

function HandstartCard(names, cardOrder, self, cardsHand, zonesHand, checking, Explain, Dates, cardsDrawn, start) {
    self.player = new Drag({
        scene: self,
        x: self.game.config.width / 2,  
        y: self.game.config.height / 4 * 3,
        card: 'card',
        depth: 1,
        draggable: true,
        Order: cardOrder[0],
        width: self.game.config.width,
        ondragend: (pointer, gameObject, dropZone, dropped) => {}
    });
    self.player.Number = cardOrder[0];
    self.player.DropNumber = undefined;
    self.player.Position = undefined;
    self.player.HandPosition = 0;
    self.player.HandNumber = 0;
    self.player.dropped = false;
    self.player.droppen = 0;
    self.player.input.draggable = false;
    cardsHand.push(self.player)
    cardOrder.shift();
    
    
    

    for (let h = 0; h < 11; h++) {
        self.zoneRight = new dropperRight({                       
        scene: self,
        x: self.game.config.width / 2 - self.game.config.width / 16 + h * self.game.config.width / 8,
        y: self.game.config.height / 4 * 3,
        depth: 1,
        x2: self.game.config.width / 8,
        y2: self.game.config.height / 6,
    })
    self.dropZone = self.zoneRight.renderZone();
    if (h < 2) {
        self.dropZone.input.enabled = true;
    } else {
        self.dropZone.input.enabled = false;
    }
    self.dropZone.field = false;
    self.dropZone.Number = h;
    zonesHand.push(self.dropZone);
    }
};

function drawCard(names, cardOrder, self, cardsHand, zonesHand, checking, Explain, Dates, i, extraDelay) {
    if ((i + cardsHand.length) > MaxCards) {
        i = MaxCards - cardsHand.length
    }
    if (cardsHand.length + i > MaxCards) return;
    let drawnCards = i
            let c = drawnCards * players.length
            if(c > cardOrder.length){
                let d = cardOrder.length / players.length
                drawnCards = Math.floor(d)
            }
    if(drawnCards < 1) return
    for (let u = 0; u < cardsHand.length; u++) {
        cardsHand[u].x = cardsHand[u].x - i * self.game.config.width / 16;
        cardsHand[u]._rotation =  cardAngle(self, cardsHand[u].x);  
        cardsHand[u].y = yWert(self, cardsHand[u].x);
    }
    LeftisDown = false
    RightisDown = false
    animationNow = true
    self.otherCard.noDrag = true
    for (let e = 0; e < i; e++) {
    self.player = new Drag({
        scene: self,
        x: self.otherCard.x,
        y: self.otherCard.y,
        card: 'card',
        depth: 1,
        draggable: true,
        Order: cardOrder[0],
        width: self.game.config.width,
        ondragend: (pointer, gameObject, dropZone, dropped) => {}
    });
    self.player.Number = cardOrder[0];
    self.player.DropNumber = undefined;
    self.player.HandNumber = cardsHand.length;
    self.player.HandPosition = cardsHand.length;
    self.player.Position = undefined;
    self.player._rotation = 3.14 / 2;
    self.player.droppen = 0;
    self.player.overInactive = false;
    self.player.dropped = false;
    self.player.input.draggable = false;
    cardOrder.shift();
    cardsHand.push(self.player);
    zonesHand[cardsHand.length].input.enabled = true;}
    for (let p = 0; p < zonesHand.length; p++) {
        zonesHand[p].x = zonesHand[p].x - i * self.game.config.width / 16;
        zonesHand[p].y = -Math.sqrt((self.game.config.width)**2 - (zonesHand[p].x - self.game.config.width / 2)**2) + 2.4 * self.game.config.height;
        }
        if (paused) {
            for (let f = 0; f < i + 1; f++) {
                cardsHand[cardsHand.length - (i - f + 1)].x = cardsHand[cardsHand.length - i - 1].x + f * self.game.config.width / 8;
                }
            if(urTurn) {
                    for(let e = 0; e < cardsHand.length; e++) {
                        cardsHand[e].input.draggable = true;
                    }
                }
            for (let f = 0; f < cardsHand.length; f++) {
                cardsHand[f].y = yWert(self, cardsHand[f].x);
                cardsHand[f]._rotation = cardAngle(self, cardsHand[f].x)
            }
            animationNow = false
            self.otherCard.noDrag = false
        } else {
        for (let f = 1; f < i + 1; f++) {
            self.tweens.add({
                targets: cardsHand[cardsHand.length - (i - f + 1)],
                angle: (cardAngle(self, cardsHand[cardsHand.length - i - 1].x + f * self.game.config.width / 8)) * (180 / 3.14),
                x: cardsHand[cardsHand.length - i - 1].x + f * self.game.config.width / 8,
                y: yWert(self, cardsHand[cardsHand.length - i - 1].x + f * self.game.config.width / 8),
                duration: 400,
                delay: (f - 1) * 500 + 500 * extraDelay,
                onComplete: (u) => {
                    if(urTurn) {
                    if(f == i) {
                        for(let e = 0; e < cardsHand.length; e++) {
                            cardsHand[e].input.draggable = true;
                        }
                        animationNow = false
                        self.otherCard.noDrag = false
                    }}
                }          
            })
        }
    }



}

export default class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        };


    preload() {


        this.load.image('card', './src/assets/card3.png');
        this.load.bitmapFont('font', './src/assets/font_0.png', './src/assets/font.fnt');
        this.load.image('title', './src/assets/title.png');
        this.load.image('left', './src/assets/left.png');
        this.load.image('right', './src/assets/right.png');
    }

    create() {
        let self = this;
        let cardsHand = [];
        let dropped = false;
        let outline = [];
        var zonesHand = [];
        let cardLayed = false;
        var cardOrder = [];
        let urTri;
        let checked = false;

        let notSorted = []
        let sorted = []

        keys = this.input.keyboard.addKeys({
            left: 'right',
            right: 'left'
        });
        this.returnKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        const rightCardsDraw = 2;
        const falseCardsDraw = 3;
        const starterCards = 6;
        const cardLayedSize = self.game.config.width / 6
        const cardHandSize = self.game.config.width / 8
        let arrowY;

        var objectNumber = undefined;
        var dropZoneNumber = undefined;
        var dropZoneX = undefined;


        document.getElementsByTagName('canvas')[0].style.visibility = 'hidden'

        const selectBx = document.getElementById('selectBox')

        

        self.login = document.querySelector('.containerLogin')


         this.startText = document.getElementById('Btn_startGame')
         this.selectBox = document.getElementById('selectator')





        const signinBtn = document.querySelector('.signinBtn');
            const signupBtn = document.querySelector('.signupBtn');
            const formBx = document.querySelector('.formBx');
            const canvas1 = document.querySelector('.canvas1')
            const container = document.querySelector('.container')

            const Btn_createGame = document.getElementById('Btn_createGame');
            const Btn_joinRoom = document.getElementById('Btn_joinRoom')
            

            Btn_joinRoom.onclick = function() {
                self.nameInput = document.getElementById('txt_roomCode')
                self.usernameInput = document.getElementById('txt_PlayerName')

                        if(self.nameInput.value != "") {
                            let data = [self.nameInput.value, self.usernameInput.value]
                            self.socket.emit('joinRoom', data)

                        }
            
            }

            document.getElementById('lbl_dontExist_J').style.visibility = 'hidden'
            document.getElementById('lbl_dontExist_N').style.visibility = 'hidden'

            Btn_createGame.onclick = function() {
                self.createName = document.getElementById('txt_createRoomUsername')
                self.createRoom = document.getElementById('txt_RoomName')

                
                let data = [self.createName.value, self.createRoom.value, false]
                self.socket.emit('newGame', data)
                
            }


            signupBtn.onclick = function(){
                formBx.classList.add('active');
                
                document.getElementById('lbl_dontExist_J').style.visibility = 'hidden'
                document.getElementById('lbl_dontExist_N').style.visibility = 'hidden'
            }

            signinBtn.onclick = function(){
                formBx.classList.remove('active');
                
                document.getElementById('lbl_dontExist_J').style.visibility = 'hidden'
                document.getElementById('lbl_dontExist_N').style.visibility = 'hidden'
            }


        this.background = self.add.image(self.game.config.width / 2, self.game.config.height / 2, 'title')
        this.background.setScale(self.game.config.width / this.background.width, self.game.config.height / this.background.height )
        
        this.otherCard = new bigFont({
            scene: self,
            x: self.game.config.width / 2,
            y: self.game.config.height / 10 * 2,
            card: 'card',
            depth: 2,
            Order: undefined, 
            width: self.game.config.width,
            BigCard: true
        });
        this.otherCard.setScale(3 * (self.game.config.width / 8) / self.otherCard.width, 3 * (self.game.config.width / 8) / self.otherCard.width)


        this.game.events.addListener(Phaser.Core.Events.FOCUS, function() {paused = false});
        this.game.events.addListener(Phaser.Core.Events.BLUR, function() {paused = true});


        this.socket = socket

        this.socket.on('dealCard', (data) => {
            startGame(names, data, self, cardsHand, zonesHand, zones, cardsPlayed, Explain, Dates);
            self.startText.style.display ='none'
            self.selectBox.style.display = 'none'

        })
        this.socket.on('startCard', (z) => {                //das Spiel beginnt und legt Karten aus
            document.getElementsByTagName('canvas')[0].style.zIndex = ' 1'
            document.getElementsByTagName('canvas')[0].style.visibility = 'visible'
            window.dispatchEvent(new Event('resize'));
            started = true;
            let draw = z[1]
            let order = z[0]
            HandstartCard(names, order, self, cardsHand, zonesHand, zones, cardsPlayed, Explain, Dates, draw, 1);
            if((draw - 1) > 0 ) {
                drawCard(names, order, self, cardsHand, zonesHand, checking, Explain, Dates, draw - 1, 1)}
            
        })

        this.socket.on('started', function() {
            started = true
        })


        this.socket.on('nextTurn', (start) => {                  //es ist dein Zug
            let r = start
            if(!r) {
            for (let g = 0; g < cardsHand.length; g++) {
                cardsHand[g].input.draggable = true;
            }}
            urTurn = true;
            checked = false;
            dropped = false;
            zustand.classList.add('active');
                    Btn_nextTurn.style.opacity= 1;
                    Btn_nextTurn.style.cursor="pointer";
                    Btn_doubt.style.opacity= 1;
                    Btn_nextTurn.style.cursor="pointer";

            if(cardsPlayed.length > 1) {
                Btn_doubt.style.cursor='pointer'
            } else {
                Btn_doubt.style.cursor='no-drop'
            }
            lbl_Player.innerText = 'Du bist am Zug'
        })


        this.socket.on('Turn', (g) => {                     //updated die Kartenzahl beim Zugwechsel

            window.dispatchEvent(new Event('resize'));


            Turn = g[0]
            if(g[0] !== players.indexOf(urId)){lbl_Player.innerText = playersName[g[0]] + ' ist am Zug'}
            document.getElementById(playersId[g[0]]).style.color = '#209174'
            document.getElementById(playersId[g[1]]).style.color = '#f0f8ff'

            rightDropZone.Number = cardsPlayed.length

            if(players.indexOf(urId) == 0) {
            let b = [players, -1, 0]
            self.socket.emit('cardCount', b)}
        })


        this.socket.on('end', (n) => {                                  //das Endsegment vom Spiel
            notSorted.length = 0;
            
            checking = true;
                for (let g = 0; g < cardsPlayed.length; g++) {
                    notSorted[g] = cardsPlayed[g].Number;
                }
                for (let r = 0; r < cardsPlayed.length; r++) {
                    cardsPlayed[r].input.draggable = false;
                }
                for (let g = 0; g < cardsHand.length; g++) {
                    cardsHand[g].input.draggable = false;
                }
                document.getElementById('lbl_nextTurn').innerText = playersName[n] + ' ist am Prüfen'
                let testen = document.querySelector('.test')
                testen.classList.add('slightbottom')
                let texten =  document.getElementById('testFont')
                texten.innerText = playersName[Turn] + ' ist am Prüfen'

            for (let t = 0; t < cardsPlayed.length; t++) {              //ersetze die karten die gelegt wurden
                self.player = new replaceFront({
                    scene: self,
                    x: cardsPlayed[t].x,
                    y: cardsPlayed[t].y,
                    card: 'card',
                    depth: 1,
                    Order: cardsPlayed[t].Number, 
                    cards: notSorted,
                    length: notSorted.length,
                    width: cardLayedSize,
                    t: t,
                });
                self.player.Number = cardsPlayed[t].Number;
                replaceCards.push(self.player);
            }
            for (let b = 0; b < cardsPlayed.length; b++) {
                cardsPlayed[b].destroy();
            }
            cardsPlayed.length = 0;
        })
        this.socket.on('itsFalse', () => {                                                                //zieh karten wenn es falsch war
                drawCard(names, cardOrder, self, cardsHand, zonesHand, checking, Explain, Dates, falseCardsDraw, 0);
            
            let data = cardOrder;
            self.socket.emit('order', (data))
            let b = [players, -1, 0]
            self.socket.emit('cardCount', b)
        })


        this.socket.on('ur', (r) => {                           //updated das Rechteck bei der Kartenanzahl
            document.getElementById(playersId[r]).style.backgroundColor = '#444a50'
        })

        

        this.socket.on('loser', () => {                    //wenn man verloren hat
            let Person = playersName[Turn]
            losexixi(Person)
            let testen = document.querySelector('.test')
            testen.style.display = 'none'
        })

        const endButton = document.getElementById('xx')
        endButton.onclick = function() {
            self.socket.emit('endGame')
        }

        this.socket.on('destroy', function() {                  //zerstöre alles
            Btn_nextTurn.style.opacity= 0.5;
            Btn_nextTurn.style.cursor="no-drop";
            Btn_doubt.style.opacity= 0.5;
            Btn_doubt.style.cursor="no-drop";
            let testen = document.querySelector('.test')
            testen.classList.remove('slightbottom')
            let texten =  document.getElementById('testFont')
                texten.innerText = ''
            playersCount = 0;
            pressedVote = false
            if(paused) {
                for (let z = 0; z < replaceCards.length; z++) {
                    replaceCards[z].destroy();
                }
            } else {
            for (let z = 0; z < replaceCards.length; z++) {
                self.tweens.add({                       //*fancy animation*
                    targets: replaceCards[z],
                    x: self.otherCard.x,
                    y: self.otherCard.y,
                    duration: 200,
                    onComplete: () => {
                        if (z < replaceCards.length) {
                            for (let z = 0; z < replaceCards.length; z++) {
                                replaceCards[z].destroy();
                            }
                            replaceCards = [];
                        }
                    }
                })
            }}
            /*for (let z = 0; z < replaceCards.length; z++) {
                replaceCards[z].destroy();
            }*/
            for (let z = 0; z < zones.length; z++) {
                zones[z].destroy();
            }
            zones.length = 0;
            document.getElementById('lbl_nextTurn').innerText = 'Nächster Zug'

            replaceCards.length = 0;
            checking = false;
            rightDropZone.Number = cardsPlayed.length + 1
        })

        this.socket.on('endGame', function () {              //beende das Spiel
            
            location.reload(); 

            document.querySelector('.con').style.display = 'none'
            document.querySelector('.x').style.display = 'none'
            let no = document.querySelector('body')
            no.classList.remove('green')
            no.classList.remove('red')
             zustand.classList.add('active');
                    Btn_nextTurn.style.opacity= 1;
                    Btn_nextTurn.style.cursor="pointer";
                    Btn_doubt.style.opacity= 1;
                    Btn_nextTurn.style.cursor="pointer";
             for(let r = 0; r < players.length; r++){
                document.getElementById(playersId[r]).style.color = '#f0f8ff'
             }
             for(let f = 0; f < replaceCards.length; f++) {
                replaceCards[f].destroy()
            }
            for(let f = 0; f < zones.length; f++) {
                zones[f].destroy()
            }
            for(let f = 0; f < zonesHand.length; f++) {
                zonesHand[f].destroy()
            }
            for(let r = 0; r < cardsHand.length; r++){
                cardsHand[r].destroy()
            }
            for(let r = 0; r < cardsPlayed.length; r++){
                cardsPlayed[r].destroy()
            }
            for(let e = 0; e < playersId.length; e++){
                document.getElementById(playersId[e]).innerText = playersName[e]
            }
            document.getElementById('lbl_nextTurn').innerText = 'Nächster Zug'
            zustand.classList.remove('active')
            lbl_Player.innerText = ''    
            checking = false;
             cardsPlayed.length = 0
             replaceCards.length = 0
             zones.length = 0
             started = false;
             playersCards.length = 0
             LeftisDown = false;
             RightisDown = false;
             paused = false;
             urTurn = false;
             Turn = 0;
             cardsHand.length = 0
             dropped = false;
             outline.length = 0
             zonesHand.length = 0
             cardLayed = false;
             cardOrder.length = 0
             urTri;
             checked = false;
             if(self.winner){self.winner.destroy()}
             if(self.nextGame){self.nextGame.destroy()}
             

             document.getElementById(playersId[players.indexOf(urId)]).style.backgroundColor = ''
             document.getElementsByTagName('canvas')[0].style.zIndex = '-1'
             document.getElementsByTagName('canvas')[0].style.visibility = 'hidden' 
             self.startText.style.display = 'block'
             self.selectBox.style.display = 'block'
             document.querySelector('.selecten').style.display = 'block'
             
            self.events.off('addScore');
            self.scene.restart()
        })

        this.socket.on('order', (data) => {             //update das Kartendeck
            cardOrder = data;
        })

        this.socket.on('newGame', (player) => {         //erstelle die Kartenanzahlanzeige
            document.querySelector('.selecten').style.display = 'none'
            document.getElementById('lbl_nextTurn').innerText = 'Nächster Zug'
            document.getElementById('lbl_doubt').innerText = 'Anzweifeln'

            for(let p = 0; p < playersId.length; p++) {
                let element = document.getElementById(playersId[p]);
                    element.parentNode.removeChild(element);
                }

            playersId.length = 0;

            for (let r = 0; r < player.length; r++) {
                playersCards[r] = 6;
                playersName.push('Spieler ' + (r + 1));

                let element = document.createElement("div");
                    element.id = 'Player_' + r
                    element.appendChild(document.createTextNode(playersName[r] + ': ' + playersCards[r] + ' Karten'));
                    document.getElementById('plist').appendChild(element);
                    playersId.push('Player_' + r)
            }
            self.left.visible = true;
            self.right.visible = true;
            self.reset.visible = false;

            

        })



        this.socket.on('next', (data) => {                      //nächster zug karte legen
            LeftisDown = false
            RightisDown = false
            animationNow = true
            self.otherCard.noDrag = true

            if (paused) {                                       //wenn des spiel pausiert ist, keine animation. Führt zu bugs (rausgetabbt und so)
            for (let u = 0; u < cardsPlayed.length; u++) {
                if (cardsPlayed[u] !== undefined) {
                    if (data[1] <= cardsPlayed[u].Position) {
                        cardsPlayed[u].x = cardsPlayed[u].x + cardLayedSize / 2;
                    } else {
                        cardsPlayed[u].x = cardsPlayed[u].x - cardLayedSize / 2;
                    }
                    animationNow = false
                    self.otherCard.noDrag = false

            }}} else {
                for (let u = 0; u < cardsPlayed.length; u++) {
                    if (cardsPlayed[u] !== undefined) {
                        if (data[1] <= cardsPlayed[u].Position) {
                            self.tweens.add({                       //*fancy animation*
                                targets: cardsPlayed[u],
                                x: cardsPlayed[u].x + cardLayedSize / 2,
                                duration: 200
                            })
                        } else {
                            self.tweens.add({
                                targets: cardsPlayed[u],
                                x: cardsPlayed[u].x - cardLayedSize / 2,
                                duration: 200    
                            })
                        }
                }}
            }

            self.player = new Drag({
                scene: self,
                x: self.game.config.width / 2,
                y: self.game.config.height / 10 * 3,
                card: 'card',
                depth: 1,
                draggable: false,
                Order: data[2],
                width: self.game.config.width,
                ondragend: (pointer, gameObject, dropZone) => {}
            });
            self.player.setScale(self.game.config.width / 6 / self.player.width)
            self.player.Number = data[2];
            self.player.DropNumber = data[1];
            self.player.Position = data[1];
            self.player.droppen = 0;
            self.player.HandNumber = undefined;
            self.player.HandPosition = undefined;
            self.player.dropped = true;
            self.player.overField = false;
            self.player.input.draggable = false;

            if(paused) {                                    //NO ANIMATION
                self.player.x = zones[data[1]].x;
                self.player.y = self.game.config.height / 2;
            } else {
                self.tweens.add({                           //*fancy animation*
                    targets: self.player,
                    angle: 0,
                    x: zones[data[1]].x,
                    y: self.game.config.height / 2,
                    duration: 300,     
                    onComplete: () =>{
                        animationNow = false
                        self.otherCard.noDrag = false

                    }
                })
            }

            let zonesTest = [];
                    for (let i = 0; i < zones.length; i++) {                                            //schau welche dropZones angeschaltet sind
                        zonesTest[i] = zones[i].input.enabled 
                    }
                    if (!zonesTest.includes(false)) {                                                   //wenn alle angeschaltet sind, erstelle eine neue
                    self.zoneRight = new dropperRight({                       
                    scene: self,
                    x: zones[zones.length - 1].x + self.game.config.width / 6,
                    y: self.game.config.height / 2,
                    depth: 1,
                    x2: self.game.config.width / 6,
                    y2: self.game.config.height / 6,
                })
                self.dropZone = self.zoneRight.renderZone();
                self.dropZone.left = false;
                self.dropZone.field = true;
                self.dropZone.input.enabled = true;
                self.dropZone.Number = zones.length;
                zones.push(self.dropZone);} else {                                                      //wenn eine ausgeschalten ist, verschiebe die Zonen
                    zones[cardsPlayed.length + 1].input.enabled = true;
                }
                cardsPlayed.push(self.player);                                                           //füge die karte am ende ein und verschiebe sie von dort aus im array
                for (let r = 0; r < cardsHand.length; r++) {
                    cardsHand[r].HandNumber = r;
                    cardsHand[r].HandPosition = r;
                }
                moveArrayItemToNewIndex(cardsPlayed, cardsPlayed.length - 1, data[1]);
                for (let p = 0; p < zones.length; p++) {
                    zones[p].x = zones[p].x - cardLayedSize / 2;
                }
                for (let z = data[1] + 1; z < cardsPlayed.length; z++) {
                    cardsPlayed[z].DropNumber = cardsPlayed[z].DropNumber + 1;
                    cardsPlayed[z].Position = cardsPlayed[z].Position + 1;
                }
        })




        this.code = this.add.text(this.game.config.width / 2 , this.game.config.height / 20, ['']).setColor('#f0f8ff').setOrigin(0.5).setFontSize(20).setFontFamily('Trebuchet MS').setAlign('right');



        this.scale.on('enterfullscreen', function() {
            self.game.config.width = 
            self.noFull.visible = true;
            self.full.visible = false;
            self.game.config.width = window.innerWidth * window.devicePixelRatio;
            self.game.config.height = window.innerHeight * window.devicePixelRatio
        });
        this.scale.on('leavefullscreen', function() {
            self.noFull.visible = false;
            self.full.visible = true;
        })


        this.left = this.add.image(this.game.config.width / 40, this.game.config.height / 10 * 8, 'left').setInteractive().setOrigin(0, 0.5)
        this.left.setScale((self.game.config.height / 10) / this.left.height)
        this.left.on('pointerover', function() {
            self.left.setTint(0xaaaaaa);
        })
        this.left.on('pointerout', function() {
            self.left.setTint();
        })
        this.left.depth = 9;
        

        this.right = this.add.image(this.game.config.width / 40 * 39, this.game.config.height / 10 * 8, 'right').setInteractive().setOrigin(1, 0.5)
        this.right.setScale((self.game.config.height / 10) / this.right.height)
        this.right.on('pointerover', function() {
            self.right.setTint(0xaaaaaa);
        })
        this.right.on('pointerout', function() {
            self.right.setTint();
        })
        this.right.depth = 9

        this.reset = this.add.text(this.game.config.width / 8, this.game.config.height / 20, ['<- Zurück']).setInteractive().setColor('#d19f33').setFontSize(40).setFontFamily('Trebuchet MS');
        this.reset.on('pointerover', function() {
            self.reset.setTint();
        })
        this.reset.on('pointerout', function() {
            self.reset.setColor('#d19f33');
        })
        this.reset.on('pointerdown', function () {
            if (self.nameInput) { self.nameInput.destroy(); }
            if (self.roomCode) {
                self.roomCode.destroy()
            }
            checking = false;
            cardsPlayed = [];
            replaceCards = [];
            zones = [];
            started = false;
            playersCards = [];
            playersNumber = [];
            div1 = 0;
            playersName = [];
            LeftisDown = false;
            RightisDown = false;
            paused = false;
            urTurn = false;
            Turn = 0;
            players = [];
            cardsHand = [];
            dropped = false;
            outline = [];
            zonesHand = [];
            cardLayed = false;
            cardOrder = [];
            urTri;
            checked = false;
            document.getElementsByTagName('canvas')[0].style.visibility = 'hidden'
            document.getElementsByTagName('canvas')[0].style.zIndex = '-1'

            self.scene.restart();
            self.socket.emit('entbinden')               //"deconnect"
        })
        this.reset.visible = false;



        this.socket.on('code', (data) => {

            let containerG = document.querySelector('.containerGame')
            containerG.classList.add('active')
            containerG.style.overflowY = 'scroll'

            let bodi = document.querySelector('body')
            let testen = document.querySelector('.test')
            testen.style.display = 'flex'
            document.body.scrollTop = 0
            document.documentElement.scrollTop = 0
            bodi.style.overflow = 'hidden'


            let room = data[0]

            if(data[3]){
            players.push(data[1])
            playersName.push(data[2])
            let element = document.createElement("div");
                    element.id = 'Player_0'
                    element.appendChild(document.createTextNode(data[2]));
                    document.getElementById('plist').appendChild(element);
                    playersId.push('Player_0')
            }

            document.querySelector('.containerGame').style.visibility = 'visible'

            document.querySelector('.selecten').style.display = 'block'

            self.startText.style.display = 'block'
            self.selectBox.style.display = 'block'

            var expanded = false;

            const selectBx = document.getElementById('Btn_select')

            self.socket.emit('urId')

        
        selectBx.onclick = function () {
            const checkboxes = document.getElementById("checkboxes");
          const selectBox = document.querySelector('.selectBox');
        
          if (!expanded) {
            checkboxes.style.display = "block";
            expanded = true;
                selectBox.classList.add('active');
        
          } else {
            checkboxes.style.display = "none";
            expanded = false;
            selectBox.classList.remove('active');
        
          }
        }


            //self.login.style.display = 'none';
            self.login.style.display = 'none'
            self.reset.visible = true;

             /*div1 = document.createElement('div');
                div1.style = 'font: 20px Trebuchet MS; font-weight: bold; color: #f0f8ff';
                div1.innerText = 'Spielraum: ' + room;
                var roomCode = self.add.dom(self.game.config.width / 2, self.game.config.height / 30, div1);
                roomCode.depth = 2*/
            const roomCode = document.getElementById('Beitrittscode')
            roomCode.innerText = 'Spielraum: ' + room

                self.startText.style.display = 'block'
                self.selectBox.style.display = 'block'


            
        })


        this.left.visible = false;                      //everything is invisible
        

        this.right.visible = false;



        /*this.joinGame.on('pointerdown', function() {
            self.nameInput = self.add.dom(self.game.config.width / 2, self.game.config.height / 2).createFromCache('form');
            self.Beitreten = self.add.text(self.game.config.width / 2, self.game.config.height / 5 * 3, ['Beitreten']).setOrigin(0.5).setInteractive().setColor('#d19f33').setFontSize(40).setFontFamily('Trebuchet MS');
            self.Beitreten.on('pointerdown', function() {
                if(self.nameInput) {
                    let Room = self.nameInput.getChildByName("name");
                    if(Room.value != "") {
                        self.socket.emit('joinRoom', Room.value)
                    }}
            })

            self.newGame.visible = false;
            self.reset.visible = true;
            self.joinGame.visible = false;
        })*/

        this.socket.on('dontExist', function() {
            document.getElementById('lbl_dontExist_J').style.visibility = 'visible'
            document.getElementById('lbl_dontExist_N').style.visibility = 'visible'
            
        })

        this.returnKey.on("down", event => {
            if(self.nameInput) {
            let Room = this.nameInput.getChildByName("name");
            if(Room.value != "") {
                self.socket.emit('joinRoom', Room.value)
            }
        }
        });


        this.left.on('pointerdown', function() {
                LeftisDown = true;
                paused = true;
            
        })

        this.left.on('pointerup', function() {
                LeftisDown = false;     
                paused = false;
        })

        this.right.on('pointerdown', function() {
                RightisDown = true;
                paused = true;
            
        })

        this.right.on('pointerup', function() {
                RightisDown = false;
                paused = false;

        })


        this.startText.onclick =  function() {                                           //starte mit dem spiel
            let allofit2 = document.getElementById('all')
            let hunter2 = document.getElementById('hunters')
            let romanGreek2 = document.getElementById('romanGreek')
            let darkAge2_2 = document.getElementById('darkAge2')
            let rennaisance2 = document.getElementById('rennaisance')
            let enlightment2 = document.getElementById('enlightment')
            let industry2 = document.getElementById('industry')
            let now2 = document.getElementById('now')

            if (!allofit2.checked && !hunter2.checked && !romanGreek2.checked && !darkAge2_2.checked && !rennaisance2.checked && !enlightment2.checked && !industry2.checked && !now2.checked) return
            if (started) return;
            self.startText.style.display = 'none'
            self.selectBox.style.display = 'none'
            document.querySelector('.selecten').style.display = 'none'
            document.getElementsByTagName('canvas')[0].style.zIndex = '1'
            document.getElementsByTagName('canvas')[0].style.visibility = 'visible'


            self.left.visible = true;
            self.right.visible = true;
            self.reset.visible = false;
            started = true;
            /*let MaxCards = names.length;                                          //random Reihenfolge
                while(cardOrder.length < MaxCards){
                let r = Math.floor(Math.random() * MaxCards);
            if(cardOrder.indexOf(r) === -1) cardOrder.push(r);
            }*/
            if (allofit2.checked) {
                for(let r = 0; r < names.length; r++){
                    cardOrder[r] = r
                }
            } else {
                if (hunter2.checked) {
                    cardOrder.push(...hunter)
                }
                if(romanGreek2.checked) {
                    cardOrder.push(...romanGreek)
                }
                if(darkAge2_2.checked) {
                    cardOrder.push(...darkAge2)
                }
                if(rennaisance2.checked) {
                    cardOrder.push(...rennaisance)
                }
                if(enlightment2.checked){
                    cardOrder.push(...enlightment)
                }
                if(industry2.checked){
                    cardOrder.push(...industry)
                }
                if(now2.checked){
                    cardOrder.push(...now)
                }
            }
            shuffle(cardOrder)

            startGame(names, cardOrder, self, cardsHand, zonesHand, zones, cardsPlayed, Explain, Dates);        //erstelle die erste Feldkarte
            self.socket.emit('getPlayers');

        }

        this.socket.on('getPlayers', (next) => {


            for(let p = 0; p < playersId.length; p++) {
            let element = document.getElementById(playersId[p]);
                element.parentNode.removeChild(element);
            }

            playersId.length = 0
            playersName.length = 0
            players.length = 0
            players = next;
            Turn = 0;
        })

        this.socket.on('allPlayers', (data) => {
            let dat = [players, playersId, playersName, data[1]]
            self.socket.emit('allPlayers', dat)
        })

        this.socket.on('anotherPlayer', (data)=> {

            let g = data[1]
            let h = data[2]

            

            players.push(g)
            
            playersName.push(h)
            playersId.push('Player_' + (players.length - 1))

            let element = document.createElement("div");
                    element.id = 'Player_' + (players.length - 1)
                    element.appendChild(document.createTextNode(data[2]));
                    document.getElementById('plist').appendChild(element);
        })

        this.socket.on('urPlayers', (data) => {


            players = data[0]
            playersId = data[1]
            playersName = data[2]

            for(let e = 0; e < playersId.length; e++) {

            let element = document.createElement("div");
                    element.id = playersId[e]
                    element.appendChild(document.createTextNode(playersName[e]));
                    document.getElementById('plist').appendChild(element);
            }
        })

        this.socket.on('urId', (id) => {
            urId = id
        })

        this.socket.on('oneDisconnect', (data) => {
            let place = players.indexOf(data);
            let problem = false

            players.splice(place, 1)
            if (Turn == place) {problem = true

            }

            let element = document.getElementById(playersId[place]);
                element.parentNode.removeChild(element);



            playersName.splice(place, 1);
            playersId.splice(place, 1)

            if(problem) {
                if(players.indexOf(urId) == 0) {
                    if(checking){
                        let testen = document.querySelector('.test')
                        testen.classList.remove('slightbottom')
                        let texten =  document.getElementById('testFont')
                            texten.innerText = ''
            
                        if(paused) {
                            for (let z = 0; z < replaceCards.length; z++) {
                                replaceCards[z].destroy();
                            }
                        } else {
                        for (let z = 0; z < replaceCards.length; z++) {
                            self.tweens.add({                       //*fancy animation*
                                targets: replaceCards[z],
                                    x: self.otherCard.x,
                                y: self.otherCard.y,
                                duration: 200,
                                onComplete: () => {
                                    if (z < replaceCards.length) {
                                        for (let z = 0; z < replaceCards.length; z++) {
                                            replaceCards[z].destroy();
                                        }
                                        replaceCards = [];
                                    }
                                }
                            })
                        }}

                        for (let z = 0; z < zones.length; z++) {
                            zones[z].destroy();
                        }
                        zones.length = 0;
                        document.getElementById('lbl_nextTurn').innerText = 'Nächster Zug'

                        replaceCards.length = 0;
                        checking = false;
                        rightDropZone.Number = cardsPlayed.length + 1
                        startGame(names, cardOrder, self, cardsHand, zonesHand, zones, cardsPlayed, Explain, Dates);        //erstelle die erste Feldkarte
                        let data = cardOrder;
        
                        self.socket.emit('destroy')
                        self.socket.emit('dealCard', (data));
                        cardOrder.shift();
                        self.socket.emit('order', (data))
                    }
                    nextTurn(self)
                }
            }
        })

        this.socket.on('starting', function() {

            self.socket.emit('startGame', (players))

            let data = cardOrder;
            self.socket.emit('dealCard', (data));
            cardOrder.shift();
            let data2 = cardOrder;

            //self.socket.emit('startGame', (players))
            //self.socket.emit('startCard', (data2));


            let drawnCards = starterCards
            let c = drawnCards * players.length
            if(c > cardOrder.length){
                let d = cardOrder.length / players.length
                drawnCards = Math.floor(d)
            }

            for (let r = 0; r < players.length; r++) {
                let z = [cardOrder, players[r], drawnCards];
                self.socket.emit('startCard', (z))
                cardOrder.splice(0,drawnCards);
            }
            data = cardOrder
            self.socket.emit('order', (data))
            let b = [players, -1]
            self.socket.emit('usernames', b)


            //self.socket.emit('start', (Turn))


        })

        this.socket.on('usernames', (data) => {
            
            let n = data[1];
            if (n < 0) {
                let data = [players, 1]
                self.socket.emit('usernames', data)
                self.socket.emit('changeNames', 0)
            } else {
                self.socket.emit('changeNames', n)
                n++
                let data = [players, n]
                self.socket.emit('usernames', data)
            }
        })

        this.socket.on('firstTurn', function() {
            nextTurn(self)
        })

        this.socket.on('cardHands', (data) => {

            let n = data[1]
            playersCards[n] = data[0]


            document.getElementById(playersId[n]).innerText = playersName[n] + ': ' + playersCards[n] + ' Karten'
            
        })



        this.socket.on('cardCount', (data) => {
            
            let n = data;
            if (n < 0) {
                let data = [players, 0, cardsHand.length]
                self.socket.emit('cardCount', data)
            } else {
                let data = [players, n, cardsHand.length]
                self.socket.emit('cardCount', data)
            }
            

        })

        this.socket.on('changeNames', (data) => {

            let n = data[1]

            let name = data[0]
            if (name != '') {
                playersName[n] = name
                
            }


        })

        this.socket.on('checkingAnother', () => {
            playersCount++
            console.log(playersCount)
            let b = players.length / 2
            let halfPlayer = Math.floor(b)
            document.getElementById('lbl_nextTurn').innerText = playersCount + ' von ' + halfPlayer + ' Spielern hat gedrückt'

            if(playersCount >= halfPlayer) {
                if(urTurn){
                    if(ending) {
                        let isfalse = [];
                        for (let u = 0; u < notSorted.length; u++) {
                            if (sorted[u] !== notSorted[u]) {                                  //compare array number to card number
                                isfalse.push(false)
                            }
                        }
                        if (isfalse.length > 0) {
                                for (let i = 0; i < zonesHand; i++) {
                                    zonesHand[i].destroy()
                                }
                                zonesHand.length = 0;
                                urTurn = false;
                                //self.socket.emit('nextTurn', (checking))
    
                            HandstartCard(names, cardOrder, self, cardsHand, zonesHand, checking, Explain, Dates);
                                drawCard(names, cardOrder, self, cardsHand, zonesHand, checking, Explain, Dates, rightCardsDraw, 1);
                            let end = true;
                            wasRight(self, end)
                            nextTurn(self)
                            if(paused) {
                                for (let z = 0; z < replaceCards.length; z++) {
                                    replaceCards[z].destroy();
                                }
                                replaceCards.length = 0;
                            } else {
                            for (let z = 0; z < replaceCards.length; z++) {
                                self.tweens.add({                       //*fancy animation*
                                    targets: replaceCards[z],
                                    x: self.otherCard.x,
                                    y: self.otherCard.y,
                                    duration: 200,
                                    onComplete: () => {
                                        for (let z = 0; z < replaceCards.length; z++) {
                                            replaceCards[z].destroy();
                                        }
                                        replaceCards.length = 0;
    
                                    }
                                })
                            }}
                            for (let z = 0; z < zones.length; z++) {
                                zones[z].destroy();
                            }
                            zones.length = 0;
                            for (let g = 0; g < cardsHand.length; g++) {
                                cardsHand[g].input.draggable = false;
                            }
                            let data = cardOrder;
                            rightDropZone.Number = cardsPlayed.length
                            self.socket.emit('destroy')
                            playersCount = 0;
                            pressedVote = false
                            self.socket.emit('dealCard', (data));
                            startGame(names, cardOrder, self, cardsHand, zonesHand, zones, cardsPlayed, Explain, Dates)
                            cardOrder.shift();
                            data = cardOrder;
                            self.socket.emit('order', (data))
                            checking = false;
                            ending = false;
                        } else {
                            let b = [players, -1, 0]
                            self.socket.emit('cardCount', b)
                            self.socket.emit('loser')
                            winxixi()
                            let testen = document.querySelector('.test')
                            testen.style.display = 'flex'
                        }
                    
                    } else {
    
                    document.getElementById('lbl_nextTurn').innerText = 'Nächster Zug'
                    if(paused) {
                        for (let z = 0; z < replaceCards.length; z++) {
                            replaceCards[z].destroy();
                        }
                    } else {
                    for (let z = 0; z < replaceCards.length; z++) {
                        self.tweens.add({                       //*fancy animation*
                            targets: replaceCards[z],
                            x: self.otherCard.x,
                            y: self.otherCard.y,
                            duration: 200,
                            onComplete: () => {
                                if (z < replaceCards.length) {
                                    for (let z = 0; z < replaceCards.length; z++) {
                                        replaceCards[z].destroy();
                                    }
                                    replaceCards = [];
                                }
                            }
                        })
                    }}
                    for (let z = 0; z < zones.length; z++) {
                        zones[z].destroy();
                    }
                    zones = [];
                    startGame(names, cardOrder, self, cardsHand, zonesHand, zones, cardsPlayed, Explain, Dates);        //erstelle die erste Feldkarte
                    let data = cardOrder;
                    rightDropZone.Number = cardsPlayed.length
    
                    self.socket.emit('destroy')
                    playersCount = 0;
                    pressedVote = false
                    self.socket.emit('dealCard', (data));
                    cardOrder.shift();
                    self.socket.emit('order', (data))
                    let isfalse = [];
                for (let u = 0; u < notSorted.length; u++) {
                    if (sorted[u] !== notSorted[u]) {                                  //compare array number to card number
                        isfalse.push(false)
                    }
                }
                if (isfalse.length > 0) {
                    itsFalse(self);
                } else {
                        drawCard(names, cardOrder, self, cardsHand, zonesHand, checking, Explain, Dates, rightCardsDraw, 0);
                    
                    let data = cardOrder;
                    self.socket.emit('order', (data))
                    let end = false;
                    wasRight(self, end)
    
                    for (let t = 0; t < cardsPlayed.length; t++) {
                        cardsPlayed[t].input.draggable = false;
                    }
                    for (let t = 0; t < cardsPlayed.length; t++) {
                        cardsPlayed[t].list[0].setTint();
                    }
                    for (let g = 0; g < cardsHand.length; g++) {
                        cardsHand[g].input.draggable = false;
                    }
                    nextTurn(self)
                    urTurn = false;
                }
                for (let g = 0; g < cardsHand.length; g++) {
                    cardsHand[g].input.draggable = true;
                }
                checking = false;
    
                }
                }
            }
        })


        Btn_nextTurn.onclick = function() {                //nächste zug beginnt
            if(checking) {
                
                if(pressedVote) return

                self.socket.emit('checkingAnother')
                pressedVote = true
                /*if(ending) {
                    let isfalse = [];
                    for (let u = 0; u < notSorted.length; u++) {
                        if (sorted[u] !== notSorted[u]) {                                  //compare array number to card number
                            isfalse.push(false)
                        }
                    }
                    if (isfalse.length > 0) {
                            for (let i = 0; i < zonesHand; i++) {
                                zonesHand[i].destroy()
                            }
                            zonesHand.length = 0;
                            urTurn = false;
                            //self.socket.emit('nextTurn', (checking))

                        HandstartCard(names, cardOrder, self, cardsHand, zonesHand, checking, Explain, Dates);
                            drawCard(names, cardOrder, self, cardsHand, zonesHand, checking, Explain, Dates, rightCardsDraw, 1);
                        let end = true;
                        wasRight(self, end)
                        nextTurn(self)
                        if(paused) {
                            for (let z = 0; z < replaceCards.length; z++) {
                                replaceCards[z].destroy();
                            }
                            replaceCards.length = 0;
                        } else {
                        for (let z = 0; z < replaceCards.length; z++) {
                            self.tweens.add({                       //*fancy animation*
                                targets: replaceCards[z],
                                x: self.otherCard.x,
                                y: self.otherCard.y,
                                duration: 200,
                                onComplete: () => {
                                    for (let z = 0; z < replaceCards.length; z++) {
                                        replaceCards[z].destroy();
                                    }
                                    replaceCards.length = 0;

                                }
                            })
                        }}
                        for (let z = 0; z < zones.length; z++) {
                            zones[z].destroy();
                        }
                        zones.length = 0;
                        for (let g = 0; g < cardsHand.length; g++) {
                            cardsHand[g].input.draggable = false;
                        }
                        let data = cardOrder;
                        rightDropZone.Number = cardsPlayed.length
                        self.socket.emit('destroy')
                        self.socket.emit('dealCard', (data));
                        startGame(names, cardOrder, self, cardsHand, zonesHand, zones, cardsPlayed, Explain, Dates)
                        cardOrder.shift();
                        data = cardOrder;
                        self.socket.emit('order', (data))
                        checking = false;
                        ending = false;
                    } else {
                        let b = [players, -1, 0]
                        self.socket.emit('cardCount', b)
                        self.socket.emit('loser')
                        winxixi()
                        let testen = document.querySelector('.test')
                        testen.style.display = 'flex'
                    }
                
                } else {

                document.getElementById('lbl_nextTurn').innerText = 'Nächster Zug'
                if(paused) {
                    for (let z = 0; z < replaceCards.length; z++) {
                        replaceCards[z].destroy();
                    }
                } else {
                for (let z = 0; z < replaceCards.length; z++) {
                    self.tweens.add({                       //*fancy animation*
                        targets: replaceCards[z],
                        x: self.otherCard.x,
                        y: self.otherCard.y,
                        duration: 200,
                        onComplete: () => {
                            if (z < replaceCards.length) {
                                for (let z = 0; z < replaceCards.length; z++) {
                                    replaceCards[z].destroy();
                                }
                                replaceCards = [];
                            }
                        }
                    })
                }}
                for (let z = 0; z < zones.length; z++) {
                    zones[z].destroy();
                }
                zones = [];
                startGame(names, cardOrder, self, cardsHand, zonesHand, zones, cardsPlayed, Explain, Dates);        //erstelle die erste Feldkarte
                let data = cardOrder;
                rightDropZone.Number = cardsPlayed.length

                self.socket.emit('destroy')
                self.socket.emit('dealCard', (data));
                cardOrder.shift();
                self.socket.emit('order', (data))
                let isfalse = [];
            for (let u = 0; u < notSorted.length; u++) {
                if (sorted[u] !== notSorted[u]) {                                  //compare array number to card number
                    isfalse.push(false)
                }
            }
            if (isfalse.length > 0) {
                itsFalse(self);
            } else {
                    drawCard(names, cardOrder, self, cardsHand, zonesHand, checking, Explain, Dates, rightCardsDraw, 0);
                
                let data = cardOrder;
                self.socket.emit('order', (data))
                let end = false;
                wasRight(self, end)

                for (let t = 0; t < cardsPlayed.length; t++) {
                    cardsPlayed[t].input.draggable = false;
                }
                for (let t = 0; t < cardsPlayed.length; t++) {
                    cardsPlayed[t].list[0].setTint();
                }
                for (let g = 0; g < cardsHand.length; g++) {
                    cardsHand[g].input.draggable = false;
                }
                nextTurn(self)
                urTurn = false;
            }
            for (let g = 0; g < cardsHand.length; g++) {
                cardsHand[g].input.draggable = true;
            }
            checking = false;

            }*/} else {
                if (checking || !urTurn || checked) return;
                if (!dropped) return;
            let data = [dropZoneX, dropZoneNumber, objectNumber];
            self.socket.emit('next', (data));
            if (cardsHand.length < 1) {
                    let b = [players, -1, 0]
                    self.socket.emit('cardCount', b)
                self.socket.emit('end', Turn)
                notSorted.length = 0;
                sorted.length = 0;
                for (let g = 0; g < cardsPlayed.length; g++) {
                    notSorted[g] = cardsPlayed[g].Number;
                }
                for (let g = 0; g < cardsPlayed.length; g++) {
                    sorted[g] = cardsPlayed[g].Number;
                }
                sorted.sort(function(a, b){return a - b});

                checking = true;
                checked = true;
                for (let g = 0; g < cardsHand.length; g++) {
                    cardsHand[g].input.draggable = false;
                }
                for (let t = 0; t < cardsPlayed.length; t++) {              //ersetze die karten die gelegt wurden
                    self.player = new replaceFront({
                        scene: self,
                        x: cardsPlayed[t].x,
                        y: cardsPlayed[t].y,
                        card: 'card',
                        depth: 1,
                        Order: cardsPlayed[t].Number, 
                        cards: notSorted,
                        length: notSorted.length,
                        width: cardLayedSize,
                        t: t,
                    });
                    self.player.Number = cardsPlayed[t].Number;
                    replaceCards.push(self.player);
                }
                for (let b = 0; b < cardsPlayed.length; b++) {
                    cardsPlayed[b].destroy();
                }
                cardsPlayed.length = 0;
                ending = true;
                document.getElementById('lbl_nextTurn').innerText = 'Beenden?'

                //self.Next = self.add.text(self.game.config.width / 10 * 7, self.game.config.height / 6, ['Prüfen']).setInteractive().setColor('#d19f33').setFontSize(40).setFontFamily('Trebuchet MS');

            } else {
            for (let t = 0; t < cardsPlayed.length; t++) {
                cardsPlayed[t].input.draggable = false;
            }
            for (let t = 0; t < cardsPlayed.length; t++) {
                cardsPlayed[t].list[0].setTint();
            }
            for (let g = 0; g < cardsHand.length; g++) {
                cardsHand[g].input.draggable = false;
            }
            nextTurn(self)
            urTurn = false;
            }
        }
    }


            

        Btn_doubt.onclick = function() {                                     //check if it's right
            if (!urTurn || dropped) return;
            if (cardsPlayed.length <= 1) return;
            
            self.socket.emit('check');
            document.getElementById('lbl_nextTurn').innerText = 'Weiter'
            let nomma = [];
            for (let f = 0; f < cardsPlayed.length; f++) {
                nomma[f] = cardsPlayed[f].input.draggable;
            }
            if (nomma.includes(true)) return;
            notSorted.length = 0;
            sorted.length = 0;
                for (let g = 0; g < cardsPlayed.length; g++) {
                    notSorted[g] = cardsPlayed[g].Number;
                }
                for (let g = 0; g < cardsPlayed.length; g++) {
                    sorted[g] = cardsPlayed[g].Number;
                }
                sorted.sort(function(a, b){return a - b});

                checking = true;

                cardOrder.push(...notSorted)
                shuffle(cardOrder)
                let data = cardOrder
                self.socket.emit('order', data)

                for (let g = 0; g < cardsHand.length; g++) {
                    cardsHand[g].input.draggable = false;
                }
                for (let t = 0; t < cardsPlayed.length; t++) {              //ersetze die karten die gelegt wurden
                    self.player = new replaceFront({
                        scene: self,
                        x: cardsPlayed[t].x,
                        y: cardsPlayed[t].y,
                        card: 'card',
                        depth: 1,
                        Order: cardsPlayed[t].Number, 
                        cards: notSorted,
                        length: notSorted.length,
                        width: cardLayedSize,
                        t: t,
                    });
                    self.player.Number = cardsPlayed[t].Number;
                    replaceCards.push(self.player);
                }
                for (let b = 0; b < cardsPlayed.length; b++) {
                    cardsPlayed[b].destroy();
                }
                cardsPlayed.length = 0;


        }

        this.socket.on('check', function() {
            let nomma = [];
            Btn_nextTurn.style.opacity= 1;
            Btn_nextTurn.style.cursor="pointer";
            document.getElementById('lbl_nextTurn').innerText = 'Weiter'    
            let testen = document.querySelector('.test')
            testen.classList.add('slightbottom')
            testen.style.display = 'block'
            let texten =  document.getElementById('testFont')
            texten.innerText = playersName[Turn] + ' ist am Prüfen'


            for (let f = 0; f < cardsPlayed.length; f++) {
                nomma[f] = cardsPlayed[f].input.draggable;
            }

            if (nomma.includes(true)) return;
            notSorted.length = 0;
            sorted.length = 0;
                for (let g = 0; g < cardsPlayed.length; g++) {
                    notSorted[g] = cardsPlayed[g].Number;
                }
                for (let g = 0; g < cardsPlayed.length; g++) {
                    sorted[g] = cardsPlayed[g].Number;
                }
                sorted.sort(function(a, b){return a - b});

                checking = true;
                for (let r = 0; r < cardsPlayed.length; r++) {
                    cardsPlayed[r].input.draggable = false;
                }
                for (let g = 0; g < cardsHand.length; g++) {
                    cardsHand[g].input.draggable = false;
                }
                for (let t = 0; t < cardsPlayed.length; t++) {              //ersetze die karten die gelegt wurden
                    self.player = new replaceFront({
                        scene: self,
                        x: cardsPlayed[t].x,
                        y: cardsPlayed[t].y,
                        card: 'card',
                        depth: 1,
                        Order: cardsPlayed[t].Number, 
                        cards: notSorted,
                        length: notSorted.length,
                        width: cardLayedSize,
                        t: t,
                    });
                    self.player.Number = cardsPlayed[t].Number;
                    replaceCards.push(self.player);
                }
                for (let b = 0; b < cardsPlayed.length; b++) {
                    cardsPlayed[b].destroy();
                }
                cardsPlayed.length = 0;



        })

        

        this.input.on('dragenter', function (pointer, gameObject, dropZone) {                   //damit die karten beim betreten verschoben werden
            if(gameObject.isBigFont) return

            if (dropZone.field) {
                dropped = false;
                for (let u = 0; u < cardsPlayed.length; u++) {
                    if (cardsPlayed[u] !== undefined) {
                        if (dropZone.Number <= cardsPlayed[u].Position) {
                            cardsPlayed[u].x = cardsPlayed[u].x + cardLayedSize / 2;
                        } else {
                            cardsPlayed[u].x = cardsPlayed[u].x - cardLayedSize / 2;
                        }
            }}
            gameObject.overField = true;
            dropZoneX = dropZone.x;
            }
        })

        this.input.on('dragleave', function(pointer, gameObject, dropZone) { 
            if(gameObject.isBigFont) return

            if (dropZone.field) {
            if (!dropped) {
                for (let u = 0; u < cardsPlayed.length; u++) {
                    if (cardsPlayed[u] !== undefined) {
                        if (dropZone.Number <= cardsPlayed[u].Position) {
                            cardsPlayed[u].x = cardsPlayed[u].x - cardLayedSize / 2;
                        } else {
                            cardsPlayed[u].x = cardsPlayed[u].x + cardLayedSize / 2;
                        }
                }
            }}
            gameObject.overField = false;
            } 
        })

        this.input.on('dragstart', function(pointer, gameObject, dropZone) {
            if(gameObject.isBigFont) return

            if (checking) return;
            gameObject.list[0].setTint(0x808080);
            gameObject._rotation = 0;
            if (gameObject.dropped) {                                        //wenn die karte schon gelegt ist, verschiebe die dropzones und karten, mach des am dragende wieder normal
                for (let t = 0; t < cardsPlayed.length; t++) {
                    if (t < gameObject.DropNumber) {
                        cardsPlayed[t].x = cardsPlayed[t].x + cardLayedSize / 2;
                    } else {
                        cardsPlayed[t].x = cardsPlayed[t].x - cardLayedSize / 2;
                    }
                }
                for (let p = 0; p < zones.length; p++) {
                    zones[p].x = zones[p].x + cardLayedSize / 2;
                }
                    zones[cardsPlayed.length].input.enabled = false;
                    for (let r = 0; r < cardsPlayed.length; r++) {
                        cardsPlayed[r].Position = r;
                    if (cardsPlayed[r].Position < gameObject.DropNumber) {
                        cardsPlayed[r].Position = r;
                    }
                        else {
                        cardsPlayed[r].Position = cardsPlayed[r].Position - 1;
                    }
                    
                }
            }
        })


        this.input.on('dragend', function(pointer, gameObject, dropZone, dropped) {
            if(gameObject.isBigFont) return

            if (checking) return;
            if (gameObject.overField) {
            if (gameObject.droppen > 1) {                                                   //weil es beim dragstart event in der Zone noch die dragenter und dragend events erkennt
                for (let p = 0; p < zones.length; p++) {
                    zones[p].x = zones[p].x - cardLayedSize / 2;
                    }
                    zones[cardsPlayed.length].input.enabled = true;
            } else {gameObject.droppen++;}
            if (gameObject.droppen = 1) {
                if (!dropped) {
                    for (let u = 0; u < cardsPlayed.length; u++) {
                            if (gameObject.DropNumber <= cardsPlayed[u].Position) {
                                cardsPlayed[u].x = cardsPlayed[u].x + cardLayedSize / 2;
                            } else {
                                cardsPlayed[u].x = cardsPlayed[u].x - cardLayedSize / 2;
                            }
                }
                for (let p = 0; p < zones.length; p++) {
                    zones[p].x = zones[p].x - cardLayedSize / 2;
                }
                zones[cardsPlayed.length].input.enabled = true;
            }}
        }
        })


        this.input.on('dragenter', function (pointer, gameObject, dropZone) {                   //damit die Handkarten beim betreten verschoben werden
            if(gameObject.isBigFont) return

            if (!dropZone.field) {
                dropped = false;
                for (let u = 0; u < cardsHand.length; u++) {
                    if (cardsHand[u] !== undefined) {
                        if (dropZone.Number <= cardsHand[u].HandPosition) {
                            cardsHand[u].x = cardsHand[u].x + self.game.config.width / 16;
                        } else {
                            cardsHand[u].x = cardsHand[u].x - self.game.config.width / 16;
                        }
                        if (cardsHand[u].HandNumber !== gameObject.HandNumber) {
                            cardsHand[u]._rotation =  cardAngle(self, cardsHand[u].x);  
                            cardsHand[u].y = yWert(self, cardsHand[u].x);
                    }
    
                        
               // }
            }}            
            gameObject.overHand = true;
            
        }
        })
        
        this.input.on('dragleave', function(pointer, gameObject, dropZone) {                    //karten verschieben
            if(gameObject.isBigFont) return

            if (!dropZone.field) {
            if (!dropped) {
                for (let u = 0; u < cardsHand.length; u++) {
                    if (cardsHand[u] !== undefined) {
                        if (dropZone.Number <= cardsHand[u].HandPosition) {
                            cardsHand[u].x = cardsHand[u].x - self.game.config.width / 16;
                        } else {
                            cardsHand[u].x = cardsHand[u].x + self.game.config.width / 16;
                        }
                        if (cardsHand[u].HandNumber !== gameObject.HandNumber) {
                            cardsHand[u]._rotation =  cardAngle(self, cardsHand[u].x);  
                            cardsHand[u].y = yWert(self, cardsHand[u].x);
                    }
    
                        
                }
            }}
            gameObject.overHand = false;

        }
        })
        
        this.input.on('dragstart', function(pointer, gameObject, dropZone) {
            if(gameObject.isBigFont) return

            if (checking) return;
            if (!gameObject.dropped) {                                        //wenn die karte schon gelegt ist, verschiebe die dropzones und karten, mach des am dragende wieder normal
                for (let t = 0; t < cardsHand.length; t++) {
                    if (t < gameObject.HandNumber) {
                        cardsHand[t].x = cardsHand[t].x + self.game.config.width / 16;
                    } else {
                        cardsHand[t].x = cardsHand[t].x - self.game.config.width / 16;
                    }
                }
                for (let p = 0; p < zonesHand.length; p++) {
                    zonesHand[p].x = zonesHand[p].x + self.game.config.width / 16;
                    zonesHand[p].y = yWert(self, zonesHand[p].x);
                }
                    zonesHand[cardsHand.length].input.enabled = false;
                    for (let r = 0; r < cardsHand.length; r++) {
                        cardsHand[r].HandPosition = r;
                    if (cardsHand[r].HandPosition < gameObject.HandNumber) {
                        cardsHand[r].HandPosition = r;
                    }
                        else {
                        cardsHand[r].HandPosition = cardsHand[r].HandPosition - 1;
                    }
                    
                }
            }
        })
        
        
        this.input.on('dragend', function(pointer, gameObject, dropZone, dropped) {                 //wenn es in der Hand fallen gelassen wird
            if(gameObject.isBigFont) return

            if (checking) return;
            if (gameObject.overHand) {
            if (gameObject.droppen > 1) {
                for (let p = 0; p < zonesHand.length; p++) {
                    zonesHand[p].x = zonesHand[p].x - self.game.config.width / 16;
                    //outline[p].x = outline[p].x - self.game.config.width / 16;
                    zonesHand[p].y = yWert(self, zonesHand[p].x);
                    }
                    zonesHand[cardsHand.length].input.enabled = true;
            } else {gameObject.droppen++;}
            if (gameObject.droppen = 1) {
                if (!dropped) {
                    for (let u = 0; u < cardsHand.length; u++) {
                            if (gameObject.HandNumber <= cardsHand[u].HandPosition) {
                                cardsHand[u].x = cardsHand[u].x + self.game.config.width / 16;
                            } else {
                                cardsHand[u].x = cardsHand[u].x - self.game.config.width / 16;
                            }
                }
                for (let p = 0; p < zonesHand.length; p++) {
                    zonesHand[p].x = zonesHand[p].x - self.game.config.width / 16;
                    zonesHand[p].y = yWert(self, zonesHand[p].x);
                }
                zonesHand[cardsHand.length].input.enabled = true;
            }}
        }

        })

        this.input.on('dragend', (pointer, gameObject, dropped, dropZone) => {
            if(gameObject.isBigFont) return

            if (checking) return;
            gameObject.ondragend(pointer, gameObject, dropZone)
            if (!dropped && !gameObject.overField && !gameObject.overHand) {                        //falls es am dragende nirgend hingelegt wird und die karten und zonen 
                if (gameObject.dropped) {                                                           //wieder verschoben werden müssen
                for (let u = 0; u < cardsPlayed.length; u++) {
                    if (cardsPlayed[u] !== undefined) {
                        if (gameObject.DropNumber <= cardsPlayed[u].Position) {
                            cardsPlayed[u].x = cardsPlayed[u].x + cardLayedSize / 2;
                        } else {
                            cardsPlayed[u].x = cardsPlayed[u].x - cardLayedSize / 2;
                        }
                    }
                }
                for (let p = 0; p < zones.length; p++) {
                    zones[p].x = zones[p].x - cardLayedSize / 2;
                }
                zones[cardsPlayed.length].input.enabled = true;
                for (let b = 0; b < cardsPlayed.length; b++) {
                    cardsPlayed[b].Position = b;
                }
            } else {                                                                                    //dasselbe nur mit den Handkarten
                for (let u = 0; u < cardsHand.length; u++) {
                    if (cardsHand[u] !== undefined) {
                        if (gameObject.HandNumber <= cardsHand[u].HandPosition) {
                            cardsHand[u].x = cardsHand[u].x + self.game.config.width / 16;
                        } else {
                            cardsHand[u].x = cardsHand[u].x - self.game.config.width / 16;
                        }
               // }
            }
            }
            for (let p = 0; p < zonesHand.length; p++) {
                zonesHand[p].x = zonesHand[p].x - self.game.config.width / 16;
                zonesHand[p].y = yWert(self, zonesHand[p].x);
            }
            zonesHand[cardsHand.length].input.enabled = true;
            for (let b = 0; b < cardsHand.length; b++) {
                cardsHand[b].HandPosition = b;
            }
            gameObject.list[0].setTint();

            }  
            gameObject.x = gameObject.input.dragStartX;
            gameObject.y = gameObject.input.dragStartY;
            for (let u = 0; u < cardsHand.length; u++) {
                cardsHand[u]._rotation =  cardAngle(self, cardsHand[u].x);  
                cardsHand[u].y = yWert(self, cardsHand[u].x);
            }
        }
        })
    
        
            this.input.on('drop', function (pointer, gameObject, dropZone) {
                if(gameObject.isBigFont) return
                
            if (dropZone.field) {
                gameObject.setScale(cardLayedSize / gameObject.width)
                gameObject.x = zones[dropZone.Number].x
                self.socket.emit('drop', (gameObject, dropZone));
                if (gameObject.DropNumber == undefined) {                                             //wenn ne karte von der hand gelegt wird
                    let zonesTest = [];
                    for (let i = 0; i < zones.length; i++) {                                            //schau welche dropZones angeschaltet sind
                        zonesTest[i] = zones[i].input.enabled 
                    }
                    if (!zonesTest.includes(false)) {                                                   //wenn alle angeschaltet sind, erstelle eine neue
                    self.zoneRight = new dropperRight({                       
                    scene: self,
                    x: zones[zones.length - 1].x + cardLayedSize,
                    y: dropZone.y,
                    depth: 1,
                    x2: cardLayedSize,
                    y2: self.game.config.height / 6,
                })
                self.dropZone = self.zoneRight.renderZone();
                self.dropZone.left = false;
                self.dropZone.field = true;
                self.dropZone.input.enabled = true;
                self.dropZone.Number = zones.length;
                zones.push(self.dropZone);} else {                                                      //wenn eine ausgeschalten ist, verschiebe die Zonen
                    zones[cardsPlayed.length + 1].input.enabled = true;
                }
                gameObject.DropNumber = dropZone.Number;                                                //vergebe die Position der Karte
                gameObject.Position = dropZone.Number;
                gameObject.droppen++;
                cardsHand.splice(gameObject.HandNumber, 1);                                             //überschreibe des alte array
                gameObject.HandNumber = undefined;
                gameObject.HandPosition = undefined;
                cardsPlayed.push(gameObject);                                                           //füge die karte am ende ein und verschiebe sie von dort aus im array
                for (let r = 0; r < cardsHand.length; r++) {
                    cardsHand[r].HandNumber = r;
                    cardsHand[r].HandPosition = r;
                }
                moveArrayItemToNewIndex(cardsPlayed, cardsPlayed.length - 1, dropZone.Number);
                for (let p = 0; p < zones.length; p++) {
                    zones[p].x = zones[p].x - cardLayedSize / 2;
                }
                for (let z = dropZone.Number + 1; z < cardsPlayed.length; z++) {
                    cardsPlayed[z].DropNumber = cardsPlayed[z].DropNumber + 1;
                    cardsPlayed[z].Position = cardsPlayed[z].Position + 1;
                }
                } else {
                    moveArrayItemToNewIndex(cardsPlayed, gameObject.DropNumber, dropZone.Number);               //sortiere gelegte karten um
                    for (let p = 0; p < zones.length; p++) {
                        zones[p].x = zones[p].x - cardLayedSize / 2;
                    }
                    for (let t = 0; t < cardsPlayed.length; t++) {
                        cardsPlayed[t].DropNumber = t;
                        cardsPlayed[t].Position = t;
                    }
                    zones[cardsPlayed.length].input.enabled = true;
                }
                dropped = true;
                gameObject.y = dropZone.y;
                gameObject.dropped = true;
                gameObject.overField = false;

                for (let t = 0; t < cardsHand.length; t++) {
                    cardsHand[t].input.draggable = false;
                }

                dropZoneNumber = dropZone.Number;
                objectNumber = gameObject.Number;
            } else if (!dropZone.field) {                                                   //falls es die Zonen von der Hand sind

                gameObject.setScale(cardHandSize / gameObject.width)
                
                    gameObject.x = dropZone.x;
                    if (gameObject.dropped) {                                             //wenn ne karte von der hand gelegt wird
                    gameObject.HandNumber = dropZone.Number;
                    gameObject.HandPosition = dropZone.Number;
                    gameObject.droppen++;
                    cardsPlayed.splice(gameObject.DropNumber, 1);
                    gameObject.DropNumber = undefined;
                    gameObject.Position = undefined;
                    cardsHand.push(gameObject);
                    for (let r = 0; r < cardsPlayed.length; r++) {
                        cardsPlayed[r].DropNumber = r;
                    }
                    moveArrayItemToNewIndex(cardsHand, cardsHand.length - 1, dropZone.Number);
                    for (let p = 0; p < zonesHand.length; p++) {
                        zonesHand[p].x = zonesHand[p].x - self.game.config.width / 16;
                        zonesHand[p].y = yWert(self, zonesHand[p].x);
                    }
                    for (let z = dropZone.Number + 1; z < cardsHand.length; z++) {
                        cardsHand[z].HandNumber = cardsHand[z].HandNumber + 1;
                        cardsHand[z].HandPosition = cardsHand[z].HandPosition + 1;
                    }        
                    zonesHand[cardsHand.length].input.enabled = true;
    
                    zones[cardsPlayed.length + 1].input.enabled = false;

                    dropped = false;
    
                    } else {
                        moveArrayItemToNewIndex(cardsHand, gameObject.HandNumber, dropZone.Number);               //ordne die gelegte karte neu
                        for (let r = 0; r < cardsHand.length; r++) {
                            cardsHand[r].HandNumber = r;
                            cardsHand[r].HandPosition = r;
                        }
                        for (let p = 0; p < zonesHand.length; p++) {
                            zonesHand[p].x = zonesHand[p].x - self.game.config.width / 16;
                            zonesHand[p].y = yWert(self, zonesHand[p].x);
                        }
                    }
                    gameObject.y = dropZone.y;
                    gameObject.dropped = false;
                    gameObject.overHand = false;
                    gameObject.droppen = 0;
                    gameObject.list[0].setTint();

                    for (let t = 0; t < cardsHand.length; t++) {
                        cardsHand[t].input.draggable = true;
                    }
                    for (let u = 0; u < cardsHand.length; u++) {
                        cardsHand[u]._rotation =  cardAngle(self, cardsHand[u].x);  
                        cardsHand[u].y = yWert(self, cardsHand[u].x);

                    }

                } else {                                                                        //falls es keine zone ist
                    gameObject.x = gameObject.input.dragStartX;
                    gameObject.y = gameObject.input.dragStartY;
                    gameObject.list[0].setTint();
                }}
        
        )
        
    }

    

    update() {

        var rightisDown = keys.right.isDown;
        var leftisDown = keys.left.isDown;

        

        if (started) {
        if (rightisDown || LeftisDown) {
            if (checking && (replaceCards[replaceCards.length - 1].x < 0)) return;
            if (!(checking) && (cardsPlayed[cardsPlayed.length - 1].x < 0)) return;
            if(animationNow) return
            if (checking) {
                for (let p = 0; p < replaceCards.length; p++) {
                    replaceCards[p].x -= 20;
                }
                for (let r = 0; r < zones.length; r++) {
                    zones[r].x -= 20;
                }
            } else  {
                for (let p = 0; p < cardsPlayed.length; p++) {
                    cardsPlayed[p].x -= 20;
                }
                for (let r = 0; r < zones.length; r++) {
                    zones[r].x -= 20;
                }
            }

        }

        if (leftisDown || RightisDown) {
            if (checking && (replaceCards[0].x > this.game.config.width)) return;
            if (!(checking) && (cardsPlayed[0].x > this.game.config.width)) return;
            if(animationNow) return
            if (checking) {
                for (let p = 0; p < replaceCards.length; p++) {
                    replaceCards[p].x += 20;
                }
                for (let r = 0; r < zones.length; r++) {
                    zones[r].x += 20;
                }
            } else  {
                for (let p = 0; p < cardsPlayed.length; p++) {
                    cardsPlayed[p].x += 20;
                }        
                for (let r = 0; r < zones.length; r++) {
                    zones[r].x += 20;
                }    
            }
        }
        }

        
    }

    paused() {
        paused = true;
    }

    resume() {
        paused = false;
    }
}
