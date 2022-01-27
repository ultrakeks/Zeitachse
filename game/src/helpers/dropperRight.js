export default class dropperRight {
    constructor(data) {
        let {scene, x, y, x2, y2, depth} = data;
        this.renderZone = () => {
            let dropZone = scene.add.zone(x, y, x2, y2).setRectangleDropZone(x2, y2);
            dropZone.setData({ cards: 0 });
            return dropZone;
        };
        this.renderOutline = (dropZone) => {
            let outline = new Phaser.GameObjects.Sprite(scene, x, y, 'blau');

            //let dropZoneOutline = scene.add.graphics();
            //dropZoneOutline.lineStyle(4, 0xff69b4);
            //dropZoneOutline.strokeRect(dropZone.x - dropZone.input.hitArea.width / 2, dropZone.y - dropZone.input.hitArea.height / 2, dropZone.input.hitArea.width, dropZone.input.hitArea.height)
        }
    }
}