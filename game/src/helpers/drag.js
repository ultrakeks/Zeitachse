import Card from './card.js';
import {Events} from './Events.js';
const names = []

for(let f = 0; f < Events.length; f++) {
    names[f] = Events[f].Names;
}

function replaceName(self, newName) {
    self._cardname = newName;
    self.textName.text = self._cardname;
    self.textName.maxWidth = self.spriteCard.width * 16 / 20;
    self.textName.tint = 0x223344;
    self.textName.setFontSize(100);
    while ((-self.textName.width > self.spriteCard.width / 20 * 16)) {
        self.textName.setFontSize(self.textName.fontSize - 1);
    }
    while (self.textName.height > self.spriteCard.height / 20 * 16) {
        self.textName.setFontSize(self.textName.fontSize - 1);
    }
    while (self.textName.x > self.spriteCard.width - (self.textName.x + self.textName.width)) {
        self.textName.x++;
    }
}


export default class Drag extends Card {
    constructor(data) {
        let {ondragend, draggable, width, scene, Order} = data;
        super(data);
        let self = this;
        const cardHand = width / 8
        const cardPlayed = width / 6
        this.originalX = this.x;
        this.originalY = this.y;
        this.draggable = draggable;
        this.ondragend = ondragend;
        this.depth = 1
        this.setSize(this.spriteCard.width, this.spriteCard.height);
        this.setScale(cardHand / this.spriteCard.width, cardHand / this.spriteCard.width)
        this.setInteractive();
        this.scene.input.setDraggable(this);
        this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            if(gameObject.isBigFont) return
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.on('pointerover', function() {
            if(this.dropped) {
            this.setScale(2 * cardPlayed / this.spriteCard.width, 2 * cardPlayed / this.spriteCard.width);
            } else {this.setScale(2 * cardHand / this.spriteCard.width, 2 * cardHand / this.spriteCard.width)}
            this.depth = 10; 
            replaceName(scene.otherCard, names[Order])

        })
        this.on('pointerout', function() {
            if(this.dropped){
            this.setScale(cardPlayed / this.spriteCard.width, cardPlayed / this.spriteCard.width);
            } else {this.setScale(cardHand / this.spriteCard.width, cardHand / this.spriteCard.width)} 
            this.depth = 1;
        })
        this.on('dragstart', function() {
            if(this.dropped){
                this.setScale(cardPlayed / this.spriteCard.width, cardPlayed / this.spriteCard.width);
                } else {this.setScale(cardHand / this.spriteCard.width, cardHand / this.spriteCard.width)}         })

    }
}