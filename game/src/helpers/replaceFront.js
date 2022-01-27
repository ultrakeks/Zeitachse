import backside from './backside.js';
import bigfront from './bigfront.js';
import {Events} from './Events.js';
const Dates = []
const Explain = []
const names = []

for(let f = 0; f < Events.length; f++) {
    Dates[f] = Events[f].Dates;
    Explain[f] = Events[f].Explain;
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

export default class replaceFront extends backside {
    constructor(data) {
        let {Order, x, y, scene, length, t, cards, width} = data;
        super(data);
        let self = this;
        let pressed = false;
        this.originalX = this.x;
        this.originalY = this.y;
        this.setSize(this.spriteCard.width, 2 * this.spriteCard.height);
        this.setScale(width / this.spriteCard.width, width / this.spriteCard.width)
        this.setInteractive();

        this.on('pointerover', function() {
            this.setScale(2 * width / this.spriteCard.width, 2 * width / this.spriteCard.width);
            this.depth = 10;
            replaceName(scene.otherCard, names[Order] + '\n' + '--------------------------' + '\n' + Dates[Order] + '\n' + '--------------------------' + '\n' + Explain[Order])
        })
        this.on('pointerout', function() {
            this.setScale(width / this.spriteCard.width, width / this.spriteCard.width);
            this.depth = 1;
        })
        this.on('dragstart', function() {
            this.setScale(width / this.spriteCard.width, width / this.spriteCard.width);
        })
    }
    
    set cardname(newName) {
        let self = this;
        this._cardname = newName;
        this.textName.text = this._cardname;
        this.textName.maxWidth = this.spriteCard.width * 16 / 20;
        this.textName.x = this.textName.x - (this.spriteCard.width / 2) + (this.spriteCard.width / 10);
        this.textName.y = this.textName.y - (this.spriteCard.height) + (this.spriteCard.height / 5);
        this.textName.tint = 0x223344;
        while ((-this.textName.width > this.spriteCard.width / 20 * 16)) {
            this.textName.setFontSize(self.textName.fontSize - 1);
        }
        while (this.textName.height > this.spriteCard.height / 10 * 16) {
            this.textName.setFontSize(self.textName.fontSize - 1);
        }
    }
}