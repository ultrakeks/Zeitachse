import {Events} from './Events.js';
const names = []

for(let f = 0; f < Events.length; f++) {
    names[f] = Events[f].Names;
}

export default class Card extends Phaser.GameObjects.Container {
    

    constructor(data) {
        let {scene, x, y, card, depth, Order, Explain, Dates} = data;
        let spriteCard = new Phaser.GameObjects.Sprite(scene, 0, 0, card);
        let textName = new Phaser.GameObjects.BitmapText(scene, 0, 0, 'font', names[Order], 100, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        super(scene, x, y, [spriteCard, textName]);
        this.spriteCard = spriteCard;
        this.textName = textName;
        this.cardname = names[Order];
        this.depth = depth;
        this.scene = scene;
        this.scene.add.existing(this);
        
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
        while (this.textName.x > this.spriteCard.width - (this.textName.x + this.textName.width)) {
            this.textName.x++;
        }
       }
}