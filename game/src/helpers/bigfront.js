import backside from './bigside.js';
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

export default class bigfront extends backside {
    constructor(data) {
        let {Order, scene, length, t, cards} = data;
        super(data);
        let self = this;
        let pressed = false;
        this.x = scene.game.config.width / 2;
        this.y = scene.game.config.height / 2;
        this.setSize(this.spriteCard.width, this.spriteCard.height);
        this.setScale(0.8, 0.8)
        this.setInteractive();
        this.scene.input.setDraggable(this);
        this.scene.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.nexttext.on('pointerdown', function() {
            if (pressed) {
                replaceName(self, names[cards[t]])
                pressed = false;
            } else {
                replaceName(self, Dates[cards[t]] + '\n' + '\n' + Explain[cards[t]])
                pressed = true;
            }
        })
        this.nexttext.x = this.spriteCard.width / 2;
        this.nexttext.y = this.spriteCard.height / 2;
        this.on('pointerdown', function() {
            self.destroy();
        })

        this.left.on('pointerdown', function() {
            if (t >= 1) t--;
            if (!pressed) {
                replaceName(self, names[cards[t]])
            } else {
                replaceName(self, Dates[cards[t]] + '\n' + '\n' + Explain[cards[t]])
            }
        })

        this.left.x = -this.spriteCard.width / 2;


        this.right.on('pointerdown', function() {
            if (t < length - 1) t++;
            if (!pressed) {
                replaceName(self, names[cards[t]])
            } else {
                replaceName(self, Dates[cards[t]] + '\n' + '\n' + Explain[cards[t]])
            }
        })

        this.right.x = this.spriteCard.width / 2;


    }

    set cardname(newName) {
        let self = this;
        this._cardname = newName;
        this.textName.text = this._cardname;
        this.textName.maxWidth = this.spriteCard.width * 16 / 20;
        this.textName.x = this.textName.x - (this.spriteCard.width / 2) + (this.spriteCard.width / 10);
        this.textName.y = this.textName.y - (this.spriteCard.height / 2) + (this.spriteCard.height / 10);
        this.textName.tint = 0x223344;
        while ((-this.textName.width > this.spriteCard.width / 20 * 16)) {
            this.textName.setFontSize(self.textName.fontSize - 1);
        }
        while (this.textName.height > this.spriteCard.height / 20 * 16) {
            this.textName.setFontSize(self.textName.fontSize - 1);
        }
    }
}