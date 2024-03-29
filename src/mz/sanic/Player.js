// @ts-check

import AssetLoader from './AssetLoader'
import Spin from './Spin'

const MAX_SPEED_X = 400;
const MAX_SPEED_Y = 1100;

/* Aceleracion del jugador mientras camina */
const ACCEL = MAX_SPEED_X * 0.90;
const HALF_ACCEL = ACCEL * 0.5;
const DOUBLE_ACCEL = ACCEL * 3;
const TRIPLE_ACCEL = ACCEL * 3;

const NEG_ACCEL = -ACCEL;
const NEG_DOUBLE_ACCEL = -DOUBLE_ACCEL;
const NEG_TRIPLE_ACCEL = -TRIPLE_ACCEL;

const RAW_JUMP_POWER = 700;
const JUMP_POWER = -RAW_JUMP_POWER;
const BOUNCE_POWER = JUMP_POWER * 1
const NEG_BOUNCE_POWER = -BOUNCE_POWER
const DEFAULT_BOUNCE_FRAME = -1
const BOUNCE_FRAME_SPAN = 5;

const SPIN_TIMEOUT_MS = 200;

const SPIN_ANGLE = 360 * 2;

const EMPTY_LAMBDA = () => { };

/* Variables temporales */
const TEMP = { angle: 0, mustDie: false, landSuccess: false, angularAccel: 0 };


class Player {
    /**
     * Crea un objeto de tipo jugador
     * @param {Phaser.Scene} scene Escena del juego
     */
    constructor(scene) {
        this.scene = scene;
    }

    /**
     * Inicializa el jugador en una posicion.
     * @param {Number} x Posicion x.
     * @param {Number} y Posicion y.
     */
    init(x, y) {
        let scene = this.scene
        this.player = scene.physics.add.sprite(x, y, 'sonic3', 'stand/sonic3_sprites_01.png')

        AssetLoader.loadFor(scene, 'player', () => {
            /* The function generateFrameNames() creates a whole bunch of frame names by creating zero-padded numbers between start and end, 
            surrounded by prefix and suffix). 1 is the start index, 13 the end index and the 2 is the number of digits to use */
            // let standFrames = scene.anims.generateFrameNames('sonic3', {
            //     start: 1, end: 13, zeroPad: 2, prefix: 'stand/sonic3_sprites_', suffix: '.png'
            // })
            const standFrames = scene.anims.generateFrameNames('sonic3', {
                start: 1, end: 1, zeroPad: 2, prefix: 'stand/sonic3_sprites_', suffix: '.png'
            })
            const walkFrames = scene.anims.generateFrameNames('sonic3', {
                start: 18, end: 25, zeroPad: 2, prefix: 'walk/sonic3_sprites_', suffix: '.png'
            })
            const jumpFrames = scene.anims.generateFrameNames('sonic3', {
                start: 55, end: 55, zeroPad: 2, prefix: 'jump/sonic3_sprites_', suffix: '.png'
            })
            /* creamos la animacion del movimiento hacia la izquierda */
            scene.anims.create({ key: 'left', frames: walkFrames, frameRate: 10, repeat: -1 })
            /* creamos la animacion de quedarse quieto */
            scene.anims.create({ key: 'stand', frames: standFrames, frameRate: 1, repeat: -1 })
            /* creamos la animacion del movimiento hacia la derecha */
            scene.anims.create({ key: 'right', frames: walkFrames, frameRate: 10, repeat: -1 })
            /* creamos la animacion de salto */
            scene.anims.create({ key: 'jump', frames: jumpFrames, frameRate: 1, repeat: -1 })
        })

        /* Seteo la velocidad maxima del sprite en el eje x e y */
        this.player.setMaxVelocity(MAX_SPEED_X, MAX_SPEED_Y)

        /* Determina si el personaje esta muerto */
        this.dead = false
        this.onDeath = EMPTY_LAMBDA

        /* Manejadores de input desde el mundo exterior */
        this.checkJumpPress = EMPTY_LAMBDA
        this.checkLeftPress = EMPTY_LAMBDA
        this.checkRightPress = EMPTY_LAMBDA
        this.checkAttackPress = EMPTY_LAMBDA

        /* Controla si el personaje puede girar */
        this.canSpin = false

        /* El frame en el que el jugador reboto */
        this.bounceFrame = DEFAULT_BOUNCE_FRAME
    }

    get sprite() { return this.player }

    get body() { return this.player.body }

    get velocity() { return this.player.body.velocity }

    get angularVelocity() { return this.body.angularVelocity }

    get angularAcceleration() { return this.body.angularAcceleration }

    get x() { return this.player.x }

    get y() { return this.player.y }

    get width() { return this.player.width }

    get height() { return this.player.height }

    get anims() { return this.player.anims }

    get angle() { return this.player.angle }

    /**
     * Establece el componente de giro.
     * @param {Spin} s Spin o giro
     */
    set spin(s) { this._spin = s }

    get spin() { return this._spin }

    /**
     * Retorna true si el jugador esta girando
     */
    get spinning() { return this.spin.spinning }

    /**
     * Voltea sprite del jugador.
     * 
     * @param {Boolean} value True para voltear sprite.
     */
    set flipX(value) { this.player.flipX = value }

    /**
     * Establece los manejadores de input (teclado y tactil)
     * @param {Object} inputHandler Manejador de los inputs del mundo exterior. 
     */
    setInputManager({ checkJumpPress, checkLeftPress, checkRightPress, checkAttackPress }) {
        this.checkJumpPress = checkJumpPress
        this.checkLeftPress = checkLeftPress
        this.checkRightPress = checkRightPress
        this.checkAttackPress = checkAttackPress
    }

    /**
     * Establece el rebote del jugador
     * @param {Number} value Valor de rebote.
     */
    setBounce(value) { this.player.setBounce(value) }

    /**
     * Determina si el sprite del jugador debe rebotar contra los limites del mundo o no.
     * @param {Boolean} value True para que el sprite del jugador rebote.
     */
    setCollideWorldBounds(value) { this.player.setCollideWorldBounds(value) }

    /**
     * Establece la posicion.
     * @param {Number} x posicion x.
     * @param {Number} y posicion y.
     */
    setPosition(x, y) { this.sprite.setPosition(x, y) }

    /**
     * Establece la velocidad Horizontal
     * @param {Number} value valor de velocidad.
     */
    setVelocityX(value) { this.sprite.setVelocityX(value) }

    /**
     * Establece la velocidad Vertical
     * @param {Number} value valor de velocidad.
     */
    setVelocityY(value) { this.sprite.setVelocityY(value) }

    /**
     * Establece la aceleracion Horizontal
     * @param {Number} value Valor de aceleracion. 
     */
    setAccelerationX(value) { this.sprite.setAccelerationX(value) }

    /**
     * Establece la aceleracion Vertical
     * @param {Number} value Valor de aceleracion. 
     */
    setAccelerationY(value) { this.sprite.setAccelerationY(value) }

    /**
     * Rota el sprite del jugador
     * @param {Number} degrees Grados horarios de rotacion.
     */
    rotate(degrees) { this.player.angle = this.player.angle + degrees }

    /**
     * Establece la velocidad angular del cuerpo.
     * 
     * @param {Number} value Velocidad angular.
     */
    setAngularVelocity(value) { this.player.setAngularVelocity(value) }

    /**
     * Establece la aceleracion angular del cuerpo.
     * 
     * @param {Number} value Aceleracion angular.
     */
    setAngularAcceleration(value) { this.player.setAngularAcceleration(value) }

    resetRotation() {
        this.player.angle = 0
        this.setAngularVelocity(0)
    }

    /**
     * Reproduce una animacion.
     * @param {String} anim Nombre de la animacion.
     * @param {Boolean} ignoreIfPlaying If an animation is already playing then ignore this call.
     */
    playAnim(anim, ignoreIfPlaying = true) { this.sprite.anims.play(anim, ignoreIfPlaying) }

    goingLeft() { return this.velocity.x < 0 }

    goingRight() { return !this.goingLeft() }

    goingUp() { return this.velocity.y < 0 }

    touchingDown() { return this.body.touching.down }

    blockedDown() { return this.body.blocked.down }

    /**
     * Marca al jugador como muerto
     */
    die() {
        this.sprite.setTint(0xff0000)
        this.sprite.anims.play('stand')
        this.dead = true

        this.onDeath()
    }

    /**
     * Marca al jugador como vivo
     */
    resurrect() {
        this.dead = false;
    }

    isDead() {
        return this.dead
    }

    isAlive() {
        return !this.isDead()
    }

    /**
     * Genera un manejador de colision con plataformas.
     * 
     */
    platformHandler() {
        return (_selfSprite, _platformSprite) => {
            this.disableSpin()
            this.resetRotation()
        }
    }


    /**
     * Establece la funcion a ejecutar cuando el jugador muere.
     * @param {Function} f funcion a ejecutar cuando el jugador muere.
     */
    setOnDeath(f) { this.onDeath = f }

    /**
     * Actualiza el estado del jugador a partir de los inputs del mundo real.
     */
    update() {
        if (this.blockedDown()) {
            // en el piso
            if (this.checkJumpPress()) { return this.jump() }
            if (this.checkLeftPress()) { return this.walkLeft() }
            if (this.checkRightPress()) { return this.walkRight() }


            // si no presiono ningun boton y el personaje se esta moviendo lento...
            if (Math.abs(this.velocity.x) < HALF_ACCEL) {
                this.playAnim('stand', true)
                this.setAccelerationX(0)
                this.setVelocityX(0)
                return
            }

            this.playAnim(this.goingLeft() ? 'left' : 'right', true)
            return this.setAccelerationX(this.goingLeft() ? ACCEL : NEG_ACCEL)
        } else {
            // en el aire
            this.setAccelerationX(0)
            this.playAnim('jump')

            if (this.checkAttackPress()) { return this.doSpin() }
            if (this.checkLeftPress()) { return this.floatLeft() }
            if (this.checkRightPress()) { return this.floatRight() }
        }
    }

    walkLeft() {
        this.moveLeft()
        this.flipX = true
        this.playAnim('left', true)
    }

    moveLeft() { this.setAccelerationX(this.goingRight() ? NEG_TRIPLE_ACCEL : NEG_ACCEL) }

    floatLeft() { this.setAccelerationX(NEG_ACCEL) }

    walkRight() {
        this.moveRight()
        this.flipX = false
        this.playAnim('right', true)
    }

    moveRight() { this.setAccelerationX(this.goingLeft() ? TRIPLE_ACCEL : ACCEL) }

    floatRight() { this.setAccelerationX(ACCEL) }

    jump() {
        this.setVelocityY(JUMP_POWER)
        this.playAnim('jump', true)
        this.initialAngularVelocity = this.velocity.x
        this.setAngularVelocity(this.initialAngularVelocity)

        this.scene.time.delayedCall(SPIN_TIMEOUT_MS, this.enableSpin, [], this)
    }

    enableSpin() { this.canSpin = true }

    disableSpin() { this.canSpin = false }

    bounce() {
        const bf = this.getGameFrame()
        /* Para prevenir doble rebotes, verifico si pasaron mas de $BOUNCE_FRAME_SPAN frames del ultimo rebote */
        if (this.bounceFrame === DEFAULT_BOUNCE_FRAME || Math.abs(bf - this.bounceFrame) > BOUNCE_FRAME_SPAN) {
            this.bounceFrame = bf
            const bounceFactor = Math.abs(this.velocity.x) / MAX_SPEED_X
            this.setVelocityY(BOUNCE_POWER * bounceFactor)
            this.setVelocityX(this.velocity.x * -1)
        }
    }

    getGameFrame() {
        return this.scene.game.getFrame()
    }

    /**
     * Hace rebotar al personaje contra un enemigo
     * @param {number} enemyY Posicion enemigo Y
     */
    bounceOffEnemy(enemyY) {
        const bp = this.y < enemyY ? BOUNCE_POWER : NEG_BOUNCE_POWER
        this.setVelocityY(bp)
    }

    /**
     * Chequea condicion de rebote contra un TILE
     * @param {Phaser.Tilemaps.Tile} tile 
     */
    checkWallBounce(tile) {
        return tile.properties.bounce && this.goingUp()
    }

    /* Ejecuta un rebote desactivando tambien el cuerpo del giro */
    executeBounce() {
        this.bounce()
        this.spin.disableBody(true, false)
    }

    /**
     * Chequea y ejecuta condicion de muerte contra un obstaculo peligroso
     * @param {Phaser.Tilemaps.Tile} tile 
     */
    checkHazard(tile) {
        return tile.properties.deadly
    }

    rotateLeftMidair() {
        TEMP.angularAccel = Math.abs(this.initialAngularVelocity) * -1
        return this.setAngularAcceleration(TEMP.angularAccel)
    }

    rotateRightMidair() {
        TEMP.angularAccel = Math.abs(this.initialAngularVelocity)
        return this.setAngularAcceleration(TEMP.angularAccel)
    }

    doSpin() {
        if (this.canSpin) {
            this.disableSpin()
            this.spin.playAnim({
                completeCb: () => { this.enableSpin() }
            })

            const self = this
            this.scene.tweens.add({
                targets: self.sprite,
                angle: self.goingRight() ? self.angle + SPIN_ANGLE : self.angle - SPIN_ANGLE,
                ease: 'Power1',
                duration: self.spin.duration
            })
        }
    }
}

export default Player
