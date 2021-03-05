// @ts-check

import Phaser from 'phaser';
import ActionButton from './ActionButton'

class BaseScene {
    constructor(worldWidth, worldHeight) {
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.half_worldWidth = worldWidth / 2;
        this.half_worldHeight = worldHeight / 2;

        // create a new scene named "Game"
        this.gameScene = new Phaser.Scene('Scene01');

        this.leftButton = new ActionButton(this.gameScene, 'left_btn')
        this.rightButton = new ActionButton(this.gameScene, 'right_btn')
        this.aButton = new ActionButton(this.gameScene, 'a_btn')
        this.bButton = new ActionButton(this.gameScene, 'b_btn')
    }

    get input() { return this.gameScene.input; }

    get physics() { return this.gameScene.physics; }

    get cameras() { return this.gameScene.cameras; }

    /** Obtiene el manejador del puntero tactil */
    get pointer1() { return this.input.pointer1; }

    /** Obtiene el manejador de teclado */
    get cursors() {
        //Phaser has a built-in Keyboard manager 
        //This populates the cursors object with four properties: up, down, left, right, that are all instances of Key objects. 
        if (!this.cs) { this.cs = this.input.keyboard.createCursorKeys(); }
        return this.cs;
    }

    /** Obtiene el SceneManager de esta escena */
    get scene() { return this.gameScene.scene; }

    checkLeftPress() {
        return this.cursors.left.isDown || this.leftPress
        // return this.cursors.left.isDown || (this.pointer1.isDown && this.pointer1.x <= this.half_worldWidth)
    }

    checkRightPress() {
        return this.cursors.right.isDown || this.rightPress
        // return this.cursors.right.isDown || (this.pointer1.isDown && this.pointer1.x > this.half_worldWidth)
    }

    checkJumpPress() {
        return this.cursors.up.isDown || this.jumpPress
        // return this.cursors.up.isDown || (this.pointer1.isDown && this.pointer1.y < this.half_worldHeight)
    }

    preload() { throw new Error('Not implemented') }

    create() {

        this.leftButton.init()
            .setPosition({ x: this.leftButton.displayWidth * 0.6, y: this.worldHeight - this.leftButton.displayHeight })
            .pointerdown((pointer, localX, localY) => {
                console.log(pointer, localX, localY)
                this.leftPress = true
            })
            .pointerup(() => this.leftPress = false)
            .pointerout(() => this.leftPress = false)

        this.rightButton.init()
            .setPosition({ x: this.rightButton.displayWidth * 1.65, y: this.worldHeight - this.rightButton.displayHeight })
            .pointerdown(() => {console.log('right!') ; this.rightPress = true})
            .pointerup(() => this.rightPress = false)
            .pointerout(() => this.rightPress = false)

        this.aButton.init()
            .setPosition({ x: this.worldWidth - (this.aButton.displayWidth * 1.65), y: this.worldHeight - this.aButton.displayHeight })
            .pointerdown(() => this.jumpPress = true)
            .pointerup(() => this.jumpPress = false)
            .pointerout(() => this.jumpPress = false)


        this.bButton.init().setPosition({ x: this.worldWidth - this.bButton.displayWidth * 0.6, y: this.worldHeight - this.bButton.displayHeight })
    }

    update() { throw new Error('Not implemented') }

    build() {
        this.gameScene.preload = () => this.preload();
        this.gameScene.create = () => this.create();
        this.gameScene.update = () => this.update();

        return this.gameScene;
    }
}


export default BaseScene;
