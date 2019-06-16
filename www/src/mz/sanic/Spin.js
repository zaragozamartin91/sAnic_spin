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

        this.p_sprite = scene.physics.add.sprite(100, 450, 'spin');
        this.player = player;
        this.p_sprite.body.setCircle(this.p_sprite.width/2);
        this.p_sprite.body.allowGravity = false;
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
    playAnim() { 
        this.sprite.scaleX = this.sprite.scaleY = 0.1;
        const self = this;
        this.scene.tweens.add({
            targets: self.sprite,
            scaleX: 1,
            scaleY: 1,
            
            ease: 'Power1',
            duration: 1000,
            yoyo: true,
            repeat: 10,
            onStart: function () { console.log('onStart'); console.log(arguments); },
            onComplete: function () { console.log('onComplete'); console.log(arguments); },
            onYoyo: function () { console.log('onYoyo'); console.log(arguments); },
            onRepeat: function () { console.log('onRepeat'); console.log(arguments); },
        });    
     }

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

    update() {
        this.sprite.x = this.player.x;
        this.sprite.y = this.player.y;
    }
}

export default Spin;



/*
const radius = 10;

        const circle = this.gameScene.add.circle(100, 450, radius, 0xABCDEF)
        this.physics.add.existing(circle, true);
        circle.body.setCircle(radius);
        circle.body.x -= radius / 2;
        circle.body.y -= radius / 2;
        this.physics.add.overlap(this.player.sprite, circle, (p, _) => {
            this.explosion.enableBody(true, this.player.x, this.player.y);
            this.explosion.setPosition(this.player.x, this.player.y);
            this.explosion.playAnim();
            console.log("Circle collision!");
        });
        this.physics.add.collider(this.platforms.group, circle);
        window.circle = circle;


*/
