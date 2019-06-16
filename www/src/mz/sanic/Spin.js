import AssetLoader from './AssetLoader';

class Spin {
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Inicializa el componente de giro.
     * @param {Player} player Jugador.
     */
    init(player) {
        const scene = this.scene;

        this.p_sprite = scene.physics.add.staticSprite(100, 450, 'spin');
        this.player = player;
        this.p_sprite.body.setCircle(45);
    }

    get sprite() { return this.p_sprite; }

    /**
     * Establece la posicion.
     * @param {Number} x posicion x.
     * @param {Number} y posicion y.
     */
    setPosition(x, y) { this.sprite.setPosition(x, y); }


    /**
     * Reproduce la animacion.
     */
    playAnim() { this.sprite.anims.play(ANIM_KEY, true); }

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
}

export default Spin;
