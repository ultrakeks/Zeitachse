import {Events} from './Events.js';
const names = []
const Dates = []
const Explain = []

for(let f = 0; f < Events.length; f++) {
    names[f] = Events[f].Names;
    Dates[f] = Events[f].Dates;
    Explain[f] = Events[f].Explain
}

export default class backside extends Phaser.GameObjects.Container {
    constructor(data) {

        let {scene, x, y, name, card, depth, Order, BigCard} = data;
        let spriteCard = new Phaser.GameObjects.Sprite(scene, 0, 0, card);
        if(!BigCard){spriteCard.setScale(1, 2)}
        let textName = new Phaser.GameObjects.BitmapText(scene, 0, 0, 'font', names[Order], 100, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        super(scene, x, y, [spriteCard, textName]);
        this.spriteCard = spriteCard;
        this.textName = textName;
        this.depth = depth;
        this.scene = scene;
        if(BigCard){this.cardname = names[Order]
        } else {this.cardname = names[Order] + '\n' + '--------------------------' + '\n' + Dates[Order] + '\n' + '--------------------------' + '\n' + Explain[Order];}
        this.scene.add.existing(this);
        
    }
}