import {io} from 'socket.io-client';
import Drag from '../helpers/drag.js';
import dropperRight from '../helpers/dropperRight.js';
import replaceFront from '../helpers/replaceFront.js';
import bigFont from '../helpers/bigFont.js';
import {names, Explain, Dates} from '../helpers/Events.js';


var keys;
var checking = false;
var cardsPlayed = [];
var replaceCards = [];
var zones = [];
var started = false;
var playersCards = [];
var playersNumber = [];
var playersRectangle = [];
var playersName = [];
const MaxCards = 7;
var LeftisDown = false;
var RightisDown = false;
var paused = false;
var urTurn = false;
var Turn = 0;
var players = [];
let div1;


function yWert(self, x) {
    let y = -1 * Math.sqrt(((self.game.config.height**(2)*(0.25*self.game.config.width**(2)-(x-0.5*self.game.config.width)**(2)))/(4*self.game.config.width**(2))))+self.game.config.height
    return y
}

function cardAngle(self, x) {
    let a = (self.game.config.height * (x - self.game.config.width / 2) / (2 * self.game.config.width * Math.sqrt(self.game.config.width ** 2 / 4 - (x - self.game.config.width / 2) ** 2)))
    return a
}

function nextTurn(self) {
    Turn++;
        if (Turn >= players.length) {
            Turn = 0;
        }
        self.socket.emit('nextTurn', players[Turn])
        let g = [Turn, Turn - 1];
        if (g[1] < 0) {g[1] = players.length - 1}
        self.socket.emit('start', (Turn))
        self.socket.emit('Turn', (g))
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
    //io.to(players[o]).emit('itsFalse');
    //io.to(socket.room).emit('wasFalse', (o))
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
    for (let h = -1; h < 2; h++) {
        self.zoneRight = new dropperRight({                       
        scene: self,
        x: self.game.config.width / 2 + h * self.game.config.width / 16,
        y: self.game.config.height / 2,
        depth: 1,
        x2: self.game.config.width / 8,
        y2: self.game.config.height / 6,
    })
    self.dropZone = self.zoneRight.renderZone();
    self.dropZone.input.enabled = true;
    self.dropZone.field = true;
    if (h < 0) {
        self.dropZone.left = true;
        self.dropZone.Number = 0;
    } else {self.dropZone.left = false;
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
        width: self.game.config.width / 8,
        ondragend: (pointer, gameObject, dropZone) => {}
    });
    self.player.Number = cardOrder[0];
    self.player.input.draggable = false;
    self.player.DropNumber = 0;
    self.player.Position = 0;
    self.player.droppen = 0;
    self.player.HandNumber = 'undefined';
    self.player.HandPosition = 'undefined';
    self.player.dropped = true;
    self.player.overField = false;
    self.player.input.draggable = false;
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
        width: self.game.config.width / 8,
        ondragend: (pointer, gameObject, dropZone, dropped) => {}
    });
    self.player.Number = cardOrder[0];
    self.player.DropNumber = 'undefined';
    self.player.Position = 'undefined';
    self.player.HandPosition = 0;
    self.player.HandNumber = 0;
    self.player.dropped = false;
    self.player.droppen = 0;
    self.player.input.draggable = true;
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
    if ((i + cardsHand.length) > 7) {
        i = 7 - cardsHand.length
    }
    if (cardsHand.length + i > 7) return;
    for (let u = 0; u < cardsHand.length; u++) {
        //let x = cardsHand[u].x - self.game.config.width / 16;
        //let y = -Math.sqrt((self.game.config.width)**2 - (cardsHand[u].x - self.game.config.width / 2)**2) + 2.4 * self.game.config.height;
        //let angle = ((cardsHand[u].x - self.game.config.width / 2)/ (Math.sqrt((self.game.config.width)**2 - (cardsHand[u].x - self.game.config.width / 2)**2))) * (180 / 3.14);
        cardsHand[u].x = cardsHand[u].x - i * self.game.config.width / 16;
        cardsHand[u]._rotation =  cardAngle(self, cardsHand[u].x);  
        cardsHand[u].y = yWert(self, cardsHand[u].x);
    }
    for (let e = 0; e < i; e++) {
    self.player = new Drag({
        scene: self,
        x: self.game.config.width / 20 * 19,
        y: self.game.config.height / 10 * 7,
        card: 'card',
        depth: 1,
        draggable: true,
        Order: cardOrder[0],
        width: self.game.config.width / 8,
        ondragend: (pointer, gameObject, dropZone, dropped) => {}
    });
    self.player.Number = cardOrder[0];
    self.player.DropNumber = 'undefined';
    self.player.HandNumber = cardsHand.length;
    self.player.HandPosition = cardsHand.length;
    self.player.Position = 'undefined';
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
                    }}
                }          
            })
        }
    }

    console.log(cardsHand);
    console.log(zonesHand)

}

export default class Game extends Phaser.Scene {
    constructor() {
        super('Game');
        };


    preload() {


        this.load.image('card', './src/assets/card3.png');
        this.load.image('itsFalse', './src/assets/false.png');        
        this.load.image('blau', './src/assets/blauerpunkt.png');
        this.load.bitmapFont('font', './src/assets/font_0.png', './src/assets/font.fnt');
        this.load.image('nope', './src/assets/nope.png');
        this.load.image('urTurn', './src/assets/urTurn.png');
        this.load.image('uWon', './src/assets/uWon.png');
        this.load.image('loser', './src/assets/loser.png');
        this.load.image('arrow', './src/assets/arrow.png');
        this.load.html('form', './src/helpers/textInput.html');
        this.load.image('bigger', './src/assets/bigger.png');
        this.load.image('smaller', './src/assets/smaller.png')
        this.load.html('login', './src/helpers/login.html')


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
        let pressedSmol = true
        keys = this.input.keyboard.addKeys({
            left: 'right',
            right: 'left'
        });
        this.returnKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        const rightCardsDraw = 2;
        const falseCardsDraw = 3;
        let arrowY;

        var objectNumber = 'undefined';
        var dropZoneNumber = 'undefined';
        var dropZoneX = 'undefined';

        self.login = self.add.dom(0, 0).createFromCache('login');
        const signinBtn = document.querySelector('.signinBtn');
            const signupBtn = document.querySelector('.signupBtn');
            const formBx = document.querySelector('.formBx');
            const canvas1 = document.querySelector('.canvas1')

            const Btn_createGame = document.getElementById('Btn_createGame')
            
            const body= document.querySelector('body');

            Btn_createGame.onclick = function() {
                const f = document.getElementsByTagName('canvas')[0].style.display='block'
                self.login.destroy()
            }


            signupBtn.onclick = function(){
                formBx.classList.add('active');
                body.classList.add('active');
                
            }

            signinBtn.onclick = function(){
                formBx.classList.remove('active');
                body.classList.remove('active');
                
            }

        self.deckCard = self.add.image(self.game.config.width / 20 * 19, self.game.config.height / 10 * 7, 'card')
        self.deckCard.setScale((self.game.config.width / 8) / self.deckCard.width, (self.game.config.width / 8) / self.deckCard.width);
        self.deckCard.depth = 2;
        self.deckCard._rotation = 3.14 / 2;
        /*for (let c = 0; c < 10; c++) {
            self.anotherCards = self.add.image(self.game.config.width / 20 * 19 + self.game.config.width / 1000 * c, self.game.config.height / 10 * 7 + self.game.config.height / 1000 * c, 'card')
            self.anotherCards.setScale((self.game.config.width / 8) / self.anotherCards.width, (self.game.config.width / 8) / self.anotherCards.width);
            self.anotherCards._rotation = 3.14 / 2;
        }*/

        
        this.otherCard = new bigFont({
            scene: self,
            x: self.game.config.width / 2,
            y: self.game.config.height / 10 * 2,
            card: 'card',
            depth: 2,
            Order: 'undefined', 
            width: self.game.config.width / 8
        });
        /*self.otherCard = self.add.image(self.game.config.width / 2, self.game.config.height / 10 * 2, 'card')
        self.otherCard.setScale((self.game.config.width / 8) / self.deckCard.width, (self.game.config.width / 8) / self.deckCard.width);*/


        this.game.events.addListener(Phaser.Core.Events.FOCUS, function() {paused = false});
        this.game.events.addListener(Phaser.Core.Events.BLUR, function() {paused = true});


        this.socket = io('http://167.86.74.64:3000', {transports : ["websocket"] }) 

        this.socket.on('dealCard', (data) => {
            startGame(names, data, self, cardsHand, zonesHand, zones, cardsPlayed, Explain, Dates);
            self.startText.visible = false;
        })
        this.socket.on('startCard', (z) => {                //das Spiel beginnt und legt Karten aus
            started = true;
            cardOrder = z;
            HandstartCard(names, cardOrder, self, cardsHand, zonesHand, zones, cardsPlayed, Explain, Dates, 6, 1);
                drawCard(names, cardOrder, self, cardsHand, zonesHand, checking, Explain, Dates, 5, 1)
                //drawCard(names, cardOrder, self, cardsHand, zonesHand, checking, Explain, Dates);                            //ziehe eine Karte
            
            //data = cardOrder;
            //self.socket.emit('startCard', (data));
        })

        this.socket.on('nextTurn', () => {                  //es ist dein Zug
            for (let g = 0; g < cardsHand.length; g++) {
                cardsHand[g].input.draggable = true;
            }
            urTurn = true;
            checked = false;
            dropped = false;
            self.ur = self.add.image(self.game.config.width / 4 * 3, self.game.config.height / 10, 'urTurn');
            self.ur.setScale(self.game.config.width / 6 / self.ur.width)
            self.ur.depth = 3;
        })

        /*self.test = self.add.text(self.game.config.width / 10 * 6, self.game.config.height / 5, ['test']).setInteractive().setColor('#d19f33').setFontSize(40).setFontFamily('Trebuchet MS');
        self.test.on('pointerdown', function() {
            console.log(playersName)
            
        })*/

        this.socket.on('Turn', (g) => {                     //updated die Kartenzahl beim Zugwechsel
            playersCards[g[1]]--;
            playersNumber[g[1]].setText(playersCards[g[1]] + ' Karten');
            playersNumber[g[0]].setColor('#007700')
            playersNumber[g[1]].setColor('#000000')
            playersName[g[0]].setColor('#007700')
            playersName[g[1]].setColor('#000000')
            Turn = g[0]
            //self.arrow.y = self.game.config.height / 10 + self.game.config.height / 20 * g[0];
            //arrowY = self.game.config.height / 10 + self.game.config.height / 20 * g[0];
            playersName[g[1]].setColor('#555555')
        })

        /*this.socket.on('start', (n) => {                //die Kartenanzahl von den Spielern
            self.small.visible = true;
            playersNumber[Turn].setColor('#007700');
            playersName[Turn].setColor('#007700');
            self.arrow = self.add.image(self.game.config.width / 40 * 32, self.game.config.height / 10 * (Turn + 1), 'arrow')
            arrowY = self.game.config.height / 10 * (Turn);
        })*/

        this.socket.on('end', (n) => {                                  //das Endsegment vom Spiel
            self.Next = self.add.text(self.game.config.width / 3 * 2, self.game.config.height / 5, ['am Prüfen']).setInteractive().setColor('#d19f33').setFontSize(40).setFontFamily('Trebuchet MS');
            let notSorted = [];
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
                    width: self.game.config.width / 8,
                    t: t,
                });
                self.player.Number = cardsPlayed[t].Number;
                replaceCards.push(self.player);
            }
            for (let b = 0; b < cardsPlayed.length; b++) {
                cardsPlayed[b].destroy();
            }
            cardsPlayed.length = 0;
            playersNumber[n].setText('0 Karten')
        })

        this.socket.on('itsFalse', () => {                                                                //zieh karten wenn es falsch war
                drawCard(names, cardOrder, self, cardsHand, zonesHand, checking, Explain, Dates, falseCardsDraw, 0);
            
            let data = cardOrder;
            self.socket.emit('order', (data))
        })

        this.socket.on('wasFalse', (b) => {                                         //updatet die Kartenzahl bei allen wenn es beim checken falsch war
            playersCards[b] = playersCards[b] + falseCardsDraw;
            if (playersCards[b] > MaxCards) {playersCards[b] = MaxCards}
            console.log(b)
            console.log(playersNumber)
            playersNumber[b].setText(playersCards[b] + ' Karten');
        })

        this.socket.on('wasRight', (data) => {                                         //updatet die Kartenzahl bei allen wenn es bei checken richtig war
            if (data[1]) {playersCards[data[0]] = playersCards[data[0]] + (rightCardsDraw + 1);} else {
            playersCards[data[0]] = playersCards[data[0]] + (rightCardsDraw + 1);}
            if (playersCards[data[0]] > MaxCards) {playersCards[data[0]] = MaxCards}
            playersNumber[data[0]].setText(playersCards[data[0]] + ' Karten');
        })

        this.socket.on('ur', (r) => {                           //updated das Rechteck bei der Kartenanzahl
            playersRectangle[r].destroy();
            self.rectangle = self.add.rectangle(self.game.config.width / 40 * 37, self.game.config.height / 10 + self.game.config.height / 20 * r, self.game.config.width / 7, self.game.config.height / 20, 0x777777, 1);
            playersNumber[r].depth = 1;
            playersName[r].depth = 1;            
            playersRectangle[r] = self.rectangle;
            urTri = r;
        })

        this.socket.on('loser', function() {                    //wenn man verloren hat
            self.winner = self.add.image(self.game.config.width / 2, self.game.config.height / 10, 'loser')
            self.winner.depth = 3;
            for (let r = 0; r < cardsHand; r++) {
                cardsHand[r].input.draggable = false;
            }
        })

        this.socket.on('destroy', function() {                  //zerstöre alles
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
            replaceCards.length = 0;
            self.Next.destroy();
            checking = false;
        })

        this.socket.on('endGame', function () {              //beende das Spiel
            self.nameInput.destroy();
            self.roomCode.destroy();
             checking = false;
             cardsPlayed = [];
             replaceCards = [];
             zones = [];
             started = false;
             playersCards = [];
             playersNumber = [];
            playersRectangle = [];
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
             pressedSmol = true
            self.scene.restart();
            self.socket.emit('entbinden')               //"deconnect"
        })

        this.socket.on('order', (data) => {             //update das Kartendeck
            cardOrder = data;
        })

        this.socket.on('newGame', (player) => {         //erstelle die Kartenanzahlanzeige
            self.PlayerRectangle = self.add.rectangle(self.game.config.width / 40 * 37, self.game.config.height / 10 - self.game.config.height / 20, self.game.config.width / 7, self.game.config.height / 20, 0xcaaa64, 1);
            for (let r = 0; r < player; r++) {
                playersCards[r] = 6;
                self.rectangle = self.add.rectangle(self.game.config.width / 40 * 37, self.game.config.height / 10 + self.game.config.height / 20 * r, self.game.config.width / 7, self.game.config.height / 20, 0xcaaa64, 1);
                self.player = self.add.text(self.game.config.width / 10 * 9 - self.game.config.width / 23, self.game.config.height / 10 + self.game.config.height / 20 * r - self.game.config.height / 50, 'Player' + r + ':').setColor('#000000').setFontSize(18).setFontFamily('Trebuchet MS');
                self.playerNumber = self.add.text(self.game.config.width / 10 * 9 + self.game.config.width / 60, self.game.config.height / 10 + self.game.config.height / 20 * r - self.game.config.height / 50, [playersCards[r]] + ' Karten').setColor('#000000').setFontSize(18).setFontFamily('Trebuchet MS');
                playersRectangle[r] = self.rectangle;
                playersNumber[r] = self.playerNumber;
                playersName[r] = self.player;
            }
            self.small.visible = true;
            self.left.visible = true;
            self.right.visible = true;
            self.nextTurn.visible = true;
            self.checkit.visible = true;
            self.reset.visible = false;
        })

        /*this.input.on('wheel',  (pointer, gameObjects, deltaX, deltaY, deltaZ) => {         //karten mit mausrad verschieben
            /*if (!checking) {
            if ((deltaY < 0) && (cardsPlayed[0].x > self.game.config.width)) return;
            if ((deltaY > 0) && (cardsPlayed[cardsPlayed.length - 1].x < 0)) return;
            /*for (let p = 0; p < cardsPlayed.length; p++) {
                if (!cardsPlayed[p].dropped) return;

                if (deltaY > 0) {
                  cardsPlayed[p].x -= 40;
                }
              
                if (deltaY < 0) {
                  cardsPlayed[p].x += 40;
                }}
            } else {
            if ((deltaY < 0) && (replaceCards[0].x > self.game.config.width)) return;
            if ((deltaY > 0) && (replaceCards[replaceCards.length - 1].x < 0)) return;
            for (let p = 0; p < replaceCards.length; p++) {

                if (deltaY > 0) {
                  replaceCards[p].x -= 40;
                }
              
                if (deltaY < 0) {
                  replaceCards[p].x += 40;
                }}
            }
            for (let r = 0; r < zones.length; r++) {
                if (!zones[r].field) return;

                if (deltaY > 0) {
                  zones[r].x -= 40;
                }
              
                if (deltaY < 0) {
                  zones[r].x += 40;
                }
                if (deltaY < 0) {leftisDown}
                else {RightisDown}
            }
            if (deltaY < 0) {LeftisDown = true;
            RightisDown = false}
            if (deltaY > 0) {RightisDown = true;
            LeftisDown = false}
            if (deltaY = 0) {RightisDown = false;
            LeftisDown = false;}
          });*/


        this.socket.on('next', (data) => {                      //nächster zug karte legen
            if (paused) {                                       //wenn des spiel pausiert ist, keine animation. Führt zu bugs (rausgetabbt und so)
            for (let u = 0; u < cardsPlayed.length; u++) {
                if (cardsPlayed[u] !== 'undefined') {
                    if (data[1] <= cardsPlayed[u].Position) {
                        cardsPlayed[u].x = cardsPlayed[u].x + self.game.config.width / 16;
                    } else {
                        cardsPlayed[u].x = cardsPlayed[u].x - self.game.config.width / 16;
                    }
            }}} else {
                for (let u = 0; u < cardsPlayed.length; u++) {
                    if (cardsPlayed[u] !== 'undefined') {
                        if (data[1] <= cardsPlayed[u].Position) {
                            self.tweens.add({                       //*fancy animation*
                                targets: cardsPlayed[u],
                                x: cardsPlayed[u].x + self.game.config.width / 16,
                                duration: 200
                            })
                        } else {
                            self.tweens.add({
                                targets: cardsPlayed[u],
                                x: cardsPlayed[u].x - self.game.config.width / 16,
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
                width: self.game.config.width / 8,
                ondragend: (pointer, gameObject, dropZone) => {}
            });
            self.player.Number = data[2];
            self.player.DropNumber = data[1];
            self.player.Position = data[1];
            self.player.droppen = 0;
            self.player.HandNumber = 'undefined';
            self.player.HandPosition = 'undefined';
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
                })
            }

            let zonesTest = [];
                    for (let i = 0; i < zones.length; i++) {                                            //schau welche dropZones angeschaltet sind
                        zonesTest[i] = zones[i].input.enabled 
                    }
                    if (!zonesTest.includes(false)) {                                                   //wenn alle angeschaltet sind, erstelle eine neue
                    self.zoneRight = new dropperRight({                       
                    scene: self,
                    x: zones[zones.length - 1].x + self.game.config.width / 8,
                    y: self.game.config.height / 2,
                    depth: 1,
                    x2: self.game.config.width / 8,
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
                    zones[p].x = zones[p].x - self.game.config.width / 16;
                }
                for (let z = data[1] + 1; z < cardsPlayed.length; z++) {
                    cardsPlayed[z].DropNumber = cardsPlayed[z].DropNumber + 1;
                    cardsPlayed[z].Position = cardsPlayed[z].Position + 1;
                }
        })


        this.newGame = this.add.text(this.game.config.width / 3, this.game.config.height / 2, ['neues Spiel']).setInteractive().setColor('#d19f33').setFontSize(40).setFontFamily('Trebuchet MS').setOrigin(0.5);

        this.joinGame = this.add.text(this.game.config.width / 3 * 2, this.game.config.height / 2, ['Spielerraum beitreten']).setInteractive().setColor('#d19f33').setFontSize(40).setFontFamily('Trebuchet MS').setOrigin(0.5);

        this.code = this.add.text(this.game.config.width / 2 , this.game.config.height / 20, ['']).setColor('#caaa64').setOrigin(0.5).setFontSize(20).setFontFamily('Trebuchet MS').setAlign('right');

        //fullscreen functions

        this.full = this.add.image(this.game.config.width / 20, this.game.config.height / 20, 'bigger').setOrigin(0).setInteractive().setScale(0.2  );
        this.full.on('pointerdown', function() {
            self.scale.startFullscreen();

        })

        this.noFull = this.add.image(this.game.config.width / 20, this.game.config.height / 20, 'smaller').setOrigin(0).setInteractive().setScale(0.2);
        this.noFull.visible = false;
        this.noFull.on('pointerdown', function() {
            self.scale.stopFullscreen();

        })
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



        this.startText = this.add.text(this.game.config.width / 8, this.game.config.height / 10 * 4, ['Spiel starten']).setInteractive().setColor('#d19f33').setFontSize(40).setFontFamily('Trebuchet MS');
        this.startText.on('pointerover', function() {
            self.startText.setColor('#caaa64');
        })
        this.startText.on('pointerout', function() {
            self.startText.setColor('#d19f33');
        })

        this.checkit = this.add.text(this.game.config.width / 8, this.game.config.height / 10 * 3, ['Anzweifeln']).setInteractive().setColor('#d19f33').setFontSize(40).setFontFamily('Trebuchet MS');
        this.checkit.on('pointerover', function() {
            self.checkit.setColor('#caaa64');
        })
        this.checkit.on('pointerout', function() {
            self.checkit.setColor('#d19f33');
        })

        this.nextTurn = this.add.text(this.game.config.width / 8, this.game.config.height / 10 * 2, ['Nächster Zug']).setInteractive().setColor('#d19f33').setFontSize(40).setFontFamily('Trebuchet MS');
        this.nextTurn.on('pointerover', function() {
            self.nextTurn.setColor('#caaa64');
        })
        this.nextTurn.on('pointerout', function() {
            self.nextTurn.setColor('#d19f33');
        })


        this.left = this.add.text(this.game.config.width / 40, this.game.config.height / 10 * 8, ['<']).setInteractive().setColor('#d19f33').setFontSize(80).setFontFamily('Trebuchet MS');
        this.left.on('pointerover', function() {
            self.left.setColor('#caaa64');
        })
        this.left.on('pointerout', function() {
            self.left.setColor('#d19f33');
        })
        this.left.depth = 1;

        this.right = this.add.text(this.game.config.width / 20 * 19, this.game.config.height / 10 * 8, ['>']).setInteractive().setColor('#d19f33').setFontSize(80).setFontFamily('Trebuchet MS');
        this.right.on('pointerover', function() {
            self.right.setColor('#caaa64');
        })
        this.right.on('pointerout', function() {
            self.right.setColor('#d19f33');
        })
        this.reset = this.add.text(this.game.config.width / 8, this.game.config.height / 20, ['<- Zurück']).setInteractive().setColor('#d19f33').setFontSize(40).setFontFamily('Trebuchet MS');
        this.reset.on('pointerover', function() {
            self.reset.setColor('#caaa64');
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
            playersRectangle = [];
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
            pressedSmol = true
            self.scene.restart();
            self.socket.emit('entbinden')               //"deconnect"
        })
        this.reset.visible = false;

        this.small = this.add.text(self.game.config.width / 10 * 9 - self.game.config.width / 23, this.game.config.height / 35, ['Players ▼']).setInteractive().setColor('#000000').setFontSize(30).setFontFamily('Trebuchet MS');
        this.small.on('pointerover', function() {
            self.small.setColor('#666666');
        })
        this.small.on('pointerout', function() {
            self.small.setColor('#000000');
        })
        this.small.depth = 3;
        this.small.visible = false;
        this.small.on('pointerdown', function() {               //Kartenanzeige der Spieler
            if (!started) return;
            if (pressedSmol) {
                self.small.setText('Players ▲')
            for (let t = 0; t < playersCards.length; t++) {
                self.tweens.add({
                targets: playersName[t],
                //x: self.game.config.width / 50 * 48 + self.small.width / 2,
                y: self.small.y + self.small.height,
                scaleY: 0,
                duration: 500
            })
            self.tweens.add({
                targets: playersNumber[t],
                //x: self.game.config.width / 50 * 48 + self.small.width / 2,
                y: self.small.y + self.small.height,
                scaleY: 0,
                duration: 500
            })
            self.tweens.add({
                targets: playersRectangle[t],
                //x: self.game.config.width / 50 * 48 + self.small.width / 2,
                y: self.small.y + self.small.height,
                scaleY: 0,
                duration: 500
            })
            }
            self.tweens.add({
                targets: self.arrow,
                //x: self.game.config.width / 50 * 48 + self.small.width / 2,
                //y: self.small.y + self.small.height,
                scale: 0,
                duration: 500
            })
            pressedSmol = false;
            } else {
                self.small.setText('Players ▼')
                for (let t = 0; t < playersCards.length; t++) {
                    self.tweens.add({
                    targets: playersName[t],
                    //x: self.game.config.width / 10 * 9 - self.game.config.width / 23,
                    y: self.game.config.height / 10 + self.game.config.height / 20 * t - self.game.config.height / 50,
                    scaleY: 1,
                    duration: 500
                })
                self.tweens.add({
                    targets: playersNumber[t],
                    //x: self.game.config.width / 10 * 9 + self.game.config.width / 60,
                    y: self.game.config.height / 10 + self.game.config.height / 20 * t - self.game.config.height / 50,
                    scaleY: 1,
                    duration: 500
                })
                self.tweens.add({
                    targets: playersRectangle[t],
                    //x: self.game.config.width / 40 * 37,
                    y: self.game.config.height / 10 + self.game.config.height / 20 * t,
                    scaleY: 1,
                    duration: 500
                })
                
                }
                self.tweens.add({
                    targets: self.arrow,
                    //x: self.game.config.width / 40 * 32,
                    //y: arrowY,
                    scale: 1,
                    duration: 500
                })
                pressedSmol = true;
            }
        })

        this.newGame.on('pointerdown', function() {
            self.startText.visible = true;
            self.newGame.visible = false;
            self.reset.visible = true;
            self.joinGame.visible = false;
            self.checkit.visible = false;
            self.nextTurn.visible = false;
            self.right.visible = false;
            self.left.visible = false;
            self.socket.emit('newGame')
        })

        this.socket.on('code', (room) => {
            //self.code.setText(room);

             div1 = document.createElement('div');
                div1.style = 'font: 20px Trebuchet MS; font-weight: bold; color: #caaa64';
                div1.innerText = 'Spielraum: ' + room;
                self.roomCode = self.add.dom(self.game.config.width / 2, self.game.config.height / 30, div1);

            if(self.nameInput) {
                self.nameInput.destroy();
                self.Beitreten.destroy();
                self.startText.visible = true;
                if(self.dontExist) {
                    self.dontExist.destroy();
                }
            }
        })


        this.left.visible = false;                      //everything is invisible
        this.startText.visible = false;
        this.right.visible = false;
        this.nextTurn.visible = false;
        this.checkit.visible = false;



        this.joinGame.on('pointerdown', function() {
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
        })

        this.socket.on('dontExist', function() {
            if(!self.dontExist) {
            self.dontExist = self.add.text(self.game.config.width / 2, self.game.config.height / 3, ['Raum existiert nicht']).setOrigin(0.5).setColor('#d19f33').setFontSize(40).setFontFamily('Trebuchet MS').setOrigin(0.5);
            }
        })

        this.returnKey.on("down", event => {
            if(self.nameInput) {
            let Room = this.nameInput.getChildByName("name");
            if(Room.value != "") {
                self.socket.emit('joinRoom', Room.value)
            }
            console.log(Room.value)}
        });

        this.right.depth = 1;    

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

        this.startText.on('pointerdown', function() {                                           //starte mit dem spiel
            if (started) return;
            self.startText.visible = false;
            self.left.visible = true;
            self.right.visible = true;
            self.nextTurn.visible = true;
            self.checkit.visible = true;
            self.reset.visible = false;
            self.small.visible = true;
            started = true;
            let MaxCards = names.length;                                          //random Reihenfolge
                while(cardOrder.length < MaxCards){
                let r = Math.floor(Math.random() * MaxCards);
            if(cardOrder.indexOf(r) === -1) cardOrder.push(r);
            }
            startGame(names, cardOrder, self, cardsHand, zonesHand, zones, cardsPlayed, Explain, Dates);        //erstelle die erste Feldkarte
            self.socket.emit('getPlayers');


            ///abschnitt-----------------------------------------------------------------------
            /*let data = cardOrder;
            self.socket.emit('dealCard', (data));
            cardOrder.shift();
            let data2 = cardOrder;
            //self.socket.emit('startGame', (players))
            self.socket.emit('startCard', (data2));

            let z = data2;
            io.to(players[0]).emit('nextTurn');
    
            for (let r = 0; r < players.length; r++) {
                io.to(players[r]).emit('startCard', (z))
                z.splice(0,6);
            }
            let data = z
            io.to(socket.room).emit('order', (data))
            let h = n - 1
            io.to(socket.room).emit('start', (n))*/
            //-----------------------------------------------------------------------------------
        })

        this.socket.on('getPlayers', (next) => {
            players = next;
            Turn = 0;
        })

        this.socket.on('starting', () => {

            self.socket.emit('startGame', (players))

            let data = cardOrder;
            self.socket.emit('dealCard', (data));
            cardOrder.shift();
            let data2 = cardOrder;

            //self.socket.emit('startGame', (players))
            //self.socket.emit('startCard', (data2));
            self.socket.emit('nextTurn', players[0])


            for (let r = 0; r < players.length; r++) {
                let z = [cardOrder, players[r]];
                self.socket.emit('startCard', (z))
                cardOrder.splice(0,6);
            }
            data = cardOrder
            self.socket.emit('order', (data))
            //self.socket.emit('start', (Turn))


        })


        this.nextTurn.on('pointerdown', function() {                //nächste zug beginnt
            if (checking || !urTurn || checked) return;
            if (!dropped) return;
            let data = [dropZoneX, dropZoneNumber, objectNumber];
            self.socket.emit('next', (data));
            if (cardsHand.length < 1) {
                self.socket.emit('end')
                let notSorted = [];
                let sorted = [];
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
                        width: self.game.config.width / 8,
                        t: t,
                    });
                    self.player.Number = cardsPlayed[t].Number;
                    replaceCards.push(self.player);
                }
                for (let b = 0; b < cardsPlayed.length; b++) {
                    cardsPlayed[b].destroy();
                }
                cardsPlayed.length = 0;

                self.Next = self.add.text(self.game.config.width / 10 * 7, self.game.config.height / 6, ['Prüfen']).setInteractive().setColor('#d19f33').setFontSize(40).setFontFamily('Trebuchet MS');
                self.Next.on('pointerdown', function() {
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
                        self.Next.destroy();
                        for (let g = 0; g < cardsHand.length; g++) {
                            cardsHand[g].input.draggable = false;
                        }
                        let data = cardOrder;
                        self.socket.emit('destroy')
                        self.socket.emit('dealCard', (data));
                        startGame(names, cardOrder, self, cardsHand, zonesHand, zones, cardsPlayed, Explain, Dates)
                        cardOrder.shift();
                        data = cardOrder;
                        self.socket.emit('order', (data))
                        self.ur.destroy();
                        checking = false;
                    } else {
                        playersNumber[urTri].setText('0 Karten');
                        self.socket.emit('loser')
                        self.winner = self.add.image(self.game.config.width / 2, self.game.config.width / 10, 'uWon')
                        self.winner.depth = 3;
                        self.Next.destroy();
                        self.ur.destroy();
                        self.nextGame = self.add.text(self.game.config.width / 3 * 2, self.game.config.height / 15, ['nächstes Spiel']).setInteractive().setColor('#d19f33').setFontSize(40).setFontFamily('Trebuchet MS');
                        self.nextGame.on('pointerdown', function() {
                            self.socket.emit('endGame');
                        })
                    }
                })
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
            self.ur.destroy();
            nextTurn(self)
            urTurn = false;
            }
        })

        this.checkit.on('pointerdown', function() {                                     //check if it's right
            if (!urTurn ) return;
            if (cardsPlayed.length <= 1) return;
            self.socket.emit('check');
            let nomma = [];
            for (let f = 0; f < cardsPlayed.length; f++) {
                nomma[f] = cardsPlayed[f].input.draggable;
            }
            if (nomma.includes(true)) return;
                let notSorted = [];
                let sorted = [];
                for (let g = 0; g < cardsPlayed.length; g++) {
                    notSorted[g] = cardsPlayed[g].Number;
                }
                for (let g = 0; g < cardsPlayed.length; g++) {
                    sorted[g] = cardsPlayed[g].Number;
                }
                sorted.sort(function(a, b){return a - b});

                checking = true;
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
                        width: self.game.config.width / 8,
                        t: t,
                    });
                    self.player.Number = cardsPlayed[t].Number;
                    replaceCards.push(self.player);
                }
                for (let b = 0; b < cardsPlayed.length; b++) {
                    cardsPlayed[b].destroy();
                }
                cardsPlayed.length = 0;

                self.Next = self.add.text(self.game.config.width / 10 * 7, self.game.config.height / 6, ['Weiter']).setInteractive().setColor('#d19f33').setFontSize(40).setFontFamily('Trebuchet MS');
                self.Next.on('pointerdown', function() {

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
                    self.Next.destroy();
                    startGame(names, cardOrder, self, cardsHand, zonesHand, zones, cardsPlayed, Explain, Dates);        //erstelle die erste Feldkarte
                    let data = cardOrder;
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
                    self.ur.destroy();
                    nextTurn(self)
                    urTurn = false;
                }
                for (let g = 0; g < cardsHand.length; g++) {
                    cardsHand[g].input.draggable = true;
                }
                checking = false;

                })
        })

        this.socket.on('check', function() {
            let nomma = [];
            for (let f = 0; f < cardsPlayed.length; f++) {
                nomma[f] = cardsPlayed[f].input.draggable;
            }
            if (nomma.includes(true)) return;
                let notSorted = [];
                let sorted = [];
                for (let g = 0; g < cardsPlayed.length; g++) {
                    notSorted[g] = cardsPlayed[g].Number;
                }
                for (let g = 0; g < cardsPlayed.length; g++) {
                    sorted[g] = cardsPlayed[g].Number;
                }
                sorted.sort(function(a, b){return a - b});
                console.log(cardsPlayed);

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
                        width: self.game.config.width / 8,
                        t: t,
                    });
                    self.player.Number = cardsPlayed[t].Number;
                    replaceCards.push(self.player);
                }
                for (let b = 0; b < cardsPlayed.length; b++) {
                    cardsPlayed[b].destroy();
                }
                cardsPlayed.length = 0;

                self.Next = self.add.text(self.game.config.width / 3 * 2, self.game.config.height / 6, ['am Prüfen']).setInteractive().setColor('#d19f33').setFontSize(40).setFontFamily('Trebuchet MS');
                self.Next.on('pointerdown', function() {
                    if (!urTurn) return;
                    for (let g = 0; g < cardsHand.length; g++) {
                        cardsHand[g].input.draggable = true;
                    }
                    checking = false;

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
                    self.Next.destroy();
                    startGame(names, cardOrder, self, cardsHand, zonesHand, zones, cardsPlayed, Explain, Dates);        //erstelle die erste Feldkarte
                    let data = cardOrder;
                    self.socket.emit('destroy')
                    self.socket.emit('dealCard', (data));
                    cardOrder.shift();
                for (let u = 0; u < notSorted.length; u++) {
                    if (sorted[u] !== notSorted[u]) {                                  //compare array number to card number
                        drawCard(names, cardOrder, self, cardsHand, zonesHand, checking, Explain, Dates, rightCardsDraw, 0);

                         
                        let data = cardOrder;
                        self.socket.emit('order', (data))
                        return;
                    }
                }
                })

        })

        

        this.input.on('dragenter', function (pointer, gameObject, dropZone) {                   //damit die karten beim betreten verschoben werden
            if (dropZone.field) {
                dropped = false;
                for (let u = 0; u < cardsPlayed.length; u++) {
                    if (cardsPlayed[u] !== 'undefined') {
                        if (dropZone.Number <= cardsPlayed[u].Position) {
                            cardsPlayed[u].x = cardsPlayed[u].x + self.game.config.width / 16;
                        } else {
                            cardsPlayed[u].x = cardsPlayed[u].x - self.game.config.width / 16;
                        }
            }}
            gameObject.overField = true;
            dropZoneX = dropZone.x;
            }
        })

        this.input.on('dragleave', function(pointer, gameObject, dropZone) { 
            if (dropZone.field) {
            if (!dropped) {
                for (let u = 0; u < cardsPlayed.length; u++) {
                    if (cardsPlayed[u] !== 'undefined') {
                        if (dropZone.Number <= cardsPlayed[u].Position) {
                            cardsPlayed[u].x = cardsPlayed[u].x - self.game.config.width / 16;
                        } else {
                            cardsPlayed[u].x = cardsPlayed[u].x + self.game.config.width / 16;
                        }
                }
            }}
            gameObject.overField = false;
            } 
        })

        this.input.on('dragstart', function(pointer, gameObject, dropZone) {
            if (checking) return;
            gameObject.list[0].setTint(0x808080);
            gameObject._rotation = 0;
            if (gameObject.dropped) {                                        //wenn die karte schon gelegt ist, verschiebe die dropzones und karten, mach des am dragende wieder normal
                for (let t = 0; t < cardsPlayed.length; t++) {
                    if (t < gameObject.DropNumber) {
                        cardsPlayed[t].x = cardsPlayed[t].x + self.game.config.width / 16;
                    } else {
                        cardsPlayed[t].x = cardsPlayed[t].x - self.game.config.width / 16;
                    }
                }
                for (let p = 0; p < zones.length; p++) {
                    zones[p].x = zones[p].x + self.game.config.width / 16;
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
            if (checking) return;
            if (gameObject.overField) {
            if (gameObject.droppen > 1) {                                                   //weil es beim dragstart event in der Zone noch die dragenter und dragend events erkennt
                for (let p = 0; p < zones.length; p++) {
                    zones[p].x = zones[p].x - self.game.config.width / 16;
                    }
                    zones[cardsPlayed.length].input.enabled = true;
            } else {gameObject.droppen++;}
            if (gameObject.droppen = 1) {
                if (!dropped) {
                    for (let u = 0; u < cardsPlayed.length; u++) {
                            if (gameObject.DropNumber <= cardsPlayed[u].Position) {
                                cardsPlayed[u].x = cardsPlayed[u].x + self.game.config.width / 16;
                            } else {
                                cardsPlayed[u].x = cardsPlayed[u].x - self.game.config.width / 16;
                            }
                }
                for (let p = 0; p < zones.length; p++) {
                    zones[p].x = zones[p].x - self.game.config.width / 16;
                }
                zones[cardsPlayed.length].input.enabled = true;
            }}
        }
        })


        this.input.on('dragenter', function (pointer, gameObject, dropZone) {                   //damit die Handkarten beim betreten verschoben werden
            if (!dropZone.field) {
                dropped = false;
                for (let u = 0; u < cardsHand.length; u++) {
                    if (cardsHand[u] !== 'undefined') {
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
            if (!dropZone.field) {
            if (!dropped) {
                for (let u = 0; u < cardsHand.length; u++) {
                    if (cardsHand[u] !== 'undefined') {
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
            if (checking) return;
            gameObject.ondragend(pointer, gameObject, dropZone)
            if (!dropped && !gameObject.overField && !gameObject.overHand) {                        //falls es am dragende nirgend hingelegt wird und die karten und zonen 
                if (gameObject.dropped) {                                                           //wieder verschoben werden müssen
                for (let u = 0; u < cardsPlayed.length; u++) {
                    if (cardsPlayed[u] !== 'undefined') {
                        if (gameObject.DropNumber <= cardsPlayed[u].Position) {
                            cardsPlayed[u].x = cardsPlayed[u].x + self.game.config.width / 16;
                        } else {
                            cardsPlayed[u].x = cardsPlayed[u].x - self.game.config.width / 16;
                        }
                    }
                }
                for (let p = 0; p < zones.length; p++) {
                    zones[p].x = zones[p].x - self.game.config.width / 16;
                }
                zones[cardsPlayed.length].input.enabled = true;
                for (let b = 0; b < cardsPlayed.length; b++) {
                    cardsPlayed[b].Position = b;
                }
            } else {                                                                                    //dasselbe nur mit den Handkarten
                for (let u = 0; u < cardsHand.length; u++) {
                    if (cardsHand[u] !== 'undefined') {
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
                
            if (dropZone.field) {
                gameObject.x = dropZone.x;
                self.socket.emit('drop', (gameObject, dropZone));
                if (gameObject.DropNumber == 'undefined') {                                             //wenn ne karte von der hand gelegt wird
                    let zonesTest = [];
                    for (let i = 0; i < zones.length; i++) {                                            //schau welche dropZones angeschaltet sind
                        zonesTest[i] = zones[i].input.enabled 
                    }
                    if (!zonesTest.includes(false)) {                                                   //wenn alle angeschaltet sind, erstelle eine neue
                    self.zoneRight = new dropperRight({                       
                    scene: self,
                    x: zones[zones.length - 1].x + self.game.config.width / 8,
                    y: dropZone.y,
                    depth: 1,
                    x2: self.game.config.width / 8,
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
                gameObject.HandNumber = 'undefined';
                gameObject.HandPosition = 'undefined';
                cardsPlayed.push(gameObject);                                                           //füge die karte am ende ein und verschiebe sie von dort aus im array
                for (let r = 0; r < cardsHand.length; r++) {
                    cardsHand[r].HandNumber = r;
                    cardsHand[r].HandPosition = r;
                }
                moveArrayItemToNewIndex(cardsPlayed, cardsPlayed.length - 1, dropZone.Number);
                for (let p = 0; p < zones.length; p++) {
                    zones[p].x = zones[p].x - self.game.config.width / 16;
                }
                for (let z = dropZone.Number + 1; z < cardsPlayed.length; z++) {
                    cardsPlayed[z].DropNumber = cardsPlayed[z].DropNumber + 1;
                    cardsPlayed[z].Position = cardsPlayed[z].Position + 1;
                }
                } else {
                    moveArrayItemToNewIndex(cardsPlayed, gameObject.DropNumber, dropZone.Number);               //sortiere gelegte karten um
                    for (let p = 0; p < zones.length; p++) {
                        zones[p].x = zones[p].x - self.game.config.width / 16;
                    }
                    for (let t = 0; t < cardsPlayed.length; t++) {
                        cardsPlayed[t].DropNumber = t;
                        cardsPlayed[t].Position = t;
                    }
                    console.log('test');
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
                
                    gameObject.x = dropZone.x;
                    if (gameObject.dropped) {                                             //wenn ne karte von der hand gelegt wird
                    gameObject.HandNumber = dropZone.Number;
                    gameObject.HandPosition = dropZone.Number;
                    gameObject.droppen++;
                    cardsPlayed.splice(gameObject.DropNumber, 1);
                    gameObject.DropNumber = 'undefined';
                    gameObject.Position = 'undefined';
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
                        moveArrayItemToNewIndex(cardsHand, gameObject.HandNumber, dropZone.Number);               //rearrange layed cards
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
