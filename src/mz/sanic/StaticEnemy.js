// @ts-check

import AssetLoader from './AssetLoader';

const REPEAT_FOREVER = -1

class StaticEnemy {
    /**
     * Crea un objeto de tipo Enemigo estatico
     * @param {Phaser.Scene} scene Escena del juego
     * @param {{key:string, prefix:string, suffix:string, start:number, end:number, animDurationMs:number}} config Configuracion del enemigo
     */
    constructor(scene, { key, prefix, suffix, start, end, animDurationMs }) {
        this.scene = scene;
        this.key = key;
        this.prefix = prefix;
        this.suffix = suffix || '.png'
        this.start = start === undefined ? 1 : start
        this.end = end
        this.animKey = `${key}_anim`
        this.animDurationMs = animDurationMs || 500
    }

    /**
     * Inicializa el enemigo en una posicion.
     * @param {Number} x Posicion x.
     * @param {Number} y Posicion y.
     */
    init(x, y) {
        const scene = this.scene;
        const startFrame = `${this.prefix}0${this.start}${this.suffix}` // algo como wasp_01.png
        console.log('Loading ', this.key, ' static enemy with startFrame ', startFrame)
        this.p_sprite = scene.physics.add.staticSprite(x, y, this.key, startFrame);

        AssetLoader.loadFor(scene, this.key, () => {
            const frames = scene.anims.generateFrameNames(this.key, {
                start: this.start, end: this.end, zeroPad: 2, prefix: this.prefix, suffix: this.suffix
            });

            scene.anims.create({ key: this.animKey, frames: frames, duration: this.animDurationMs, repeat: REPEAT_FOREVER });
        });
    }

    get sprite() { return this.p_sprite; }

    get anims() { return this.sprite.anims; }

    /**
     * Establece la posicion.
     * @param {Number} x posicion x.
     * @param {Number} y posicion y.
     */
    setPosition(x, y) { this.sprite.setPosition(x, y); }


    /**
     * Reproduce la animacion.
     */
    playAnim() { this.sprite.anims.play(this.animKey, true); }

    /**
     * Desactiva un cuerpo de phaser.
     * @param {boolean} disableGameObject Desactiva el game object.
     * @param {boolean} hideGameObject Oculta el game object.
     */
    disableBody(disableGameObject = true, hideGameObject = true) {
        this.sprite.disableBody(disableGameObject, hideGameObject);
    }

    /**
     * Activa el cuerpo del sprite
     * @param {Boolean} reset Resetea el cuerpo del objeto y lo posiciona en (x,y)
     * @param {Number} x posicion x
     * @param {Number} y posicion y
     * @param {Boolean} enableGameObject Activa el objeto
     * @param {Boolean} showGameObject Muestra el objeto
     */
    enableBody(reset, x, y, enableGameObject = true, showGameObject = true) {
        this.sprite.enableBody(reset, x, y, enableGameObject, showGameObject);
    }

    get x() { return this.sprite.x; }

    get y() { return this.sprite.y; }

    die() {
        this.disableBody()
    }
}

export default StaticEnemy;
