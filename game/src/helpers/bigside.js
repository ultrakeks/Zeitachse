import {Events} from './Events.js';
const names = []

for(let f = 0; f < Events.length; f++) {
    names[f] = Events[f].Names;
}

export default class backside extends Phaser.GameObjects.Container {
    constructor(data) {
        let {scene, x, y, name, card, depth, Order} = data;
        let spriteCard = new Phaser.GameObjects.Sprite(scene, 0, 0, card);
        let textName = new Phaser.GameObjects.BitmapText(scene, 0, 0, 'font', names[Order], 100, Phaser.GameObjects.BitmapText.ALIGN_CENTER);
        let nexttext = new Phaser.GameObjects.Text(scene, 0, 0, ['umdrehen']).setInteractive().setColor('#00ffff').setFontSize(18).setFontFamily('Trebuchet MS');
        let left = new Phaser.GameObjects.Text(scene, 0, 0, ['links']).setInteractive().setColor('#00ffff').setFontSize(18).setFontFamily('Trebuchet MS');
        let right = new Phaser.GameObjects.Text(scene, 0, 0, ['rechts']).setInteractive().setColor('#00ffff').setFontSize(18).setFontFamily('Trebuchet MS');
        super(scene, x, y, [spriteCard, textName, nexttext, left, right]);
        this.spriteCard = spriteCard;
        this.textName = textName;
        this.nexttext = nexttext;
        this.right = right;
        this.left = left;
        this.depth = depth;
        this.scene = scene;
        this.cardname = names[Order];
        this.scene.add.existing(this);
        
    }
}