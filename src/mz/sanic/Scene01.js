// @ts-check

import Phaser from 'phaser'
import Preloader from './Preloader'
import Background from './Background'
import Player from './Player'
import GameText from './GameText'
import Explosion from './Explosion'
import Spin from './Spin'
import BaseScene from './BaseScene'
import StaticEnemy from './StaticEnemy'
import Tileset from './Tileset'
import GlobalConfig from './GlobalConfig'

const PLAYER_START_POS = { x: 100, y: 3000 }
const ABYSS_LIMIT = 5000
const VOID_DEBUG_TEXT = { init: function () { }, setText: function () { } }

class Scene01 extends BaseScene {
    /**
     * Crea una escena de juego
     * @param {number} worldWidth Anchura del mundo
     * @param {number} worldHeight Altura del mundo
     */
    constructor(worldWidth, worldHeight) {
        super(worldWidth, worldHeight)

        this.preloader = new Preloader(this.gameScene)

        this.player = new Player(this.gameScene) // objeto del heroe
        this.explosion = new Explosion(this.gameScene) // explosion

        this.score = 0
        this.scoreText = new GameText(this.gameScene)
        this.debugText = GlobalConfig.devProfile() ? new GameText(this.gameScene) : VOID_DEBUG_TEXT

        this.bg = new Background(this.gameScene)

        this.spin = new Spin(this.gameScene)

        this.wasp = new StaticEnemy(this.gameScene, { key: 'wasp', prefix: 'wasp_', suffix: '.png', start: 1, end: 37, animDurationMs: 2000 })

        this.tileset = new Tileset(this.gameScene)
    }


    preload() {
        console.log("PRELOAD");
        this.preloader.init();
    }

    create() {
        console.log("CREATE");

        super.create()

        this.scoreText.init(0, 0, 'Score: 0');
        this.debugText.init(0, 32, '');
        this.bg.init(this.half_worldWidth, this.half_worldHeight, this.worldWidth, this.worldHeight);


        this.tileset
            .init('factory_map', 'factory_tiles')
            .createLayer('world')
            .createLayer('back')
            .setCollisionByProperty('world', { stand: true, bounce: true })
        if (GlobalConfig.devProfile()) { this.tileset.renderDebug('world') }

        const worldLayer = this.tileset.getLayer('world')

        this.bombs = this.physics.add.group();

        this.spin.init(this.player);

        this.explosion.init(100, 950);
        this.explosion.disableBody(true, true);

        this.wasp.init(1000, 2900)
        this.wasp.playAnim()

        /* creamos al heroe o jugador----------------------------------------------------------------------------------------------------------------------- */
        // agregamos un ArcadeSprite del jugador

        this.player.init(PLAYER_START_POS.x, PLAYER_START_POS.y)
        this.player.spin = this.spin;
        this.player.setInputManager({
            checkJumpPress: () => this.checkJumpPress(),
            checkLeftPress: () => this.checkLeftPress(),
            checkRightPress: () => this.checkRightPress()
        });

        this.player.setOnDeath(() => {
            this.physics.pause();
            window.setTimeout(() => {
                this.player.resurrect();
                this.scene.restart();
            }, 1000);
        });

        /* when it lands after jumping it will bounce ever so slightly */
        this.player.setBounce(0.0);
        /* Esta funcion hace que el personaje colisione con los limites del juego */
        this.player.setCollideWorldBounds(false);

        //Let's drop a sprinkling of stars into the scene and allow the player to collect them ----------------------------------------------------
        //Groups are able to take configuration objects to aid in their setup
        this.stars = this.physics.add.group({
            key: 'star', //texture key to be the star image by default
            repeat: 6, //Because it creates 1 child automatically, repeating 11 times means we'll get 12 in total
            setXY: { x: 12, y: PLAYER_START_POS.y, stepX: 70 } //this is used to set the position of the 12 children the Group creates. Each child will be placed starting at x: 12, y: 0 and with an x step of 70
        });

        this.stars.children.iterate(function (child) { child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)); });

        /* DETECCION DE COLISION ----------------------------------------------------------------------------------------------------------------- */

        /* In order to allow the player to collide with the platforms we can create a Collider object. 
        This object monitors two physics objects (which can include Groups) and checks for collisions or overlap between them. 
        If that occurs it can then optionally invoke your own callback, but for the sake of just colliding with platforms we don't require that */
        this.physics.add.collider(this.player.sprite, worldLayer, this.player.platformHandler())

        this.physics.add.collider(this.stars, worldLayer);


        //This tells Phaser to check for an overlap between the player and any star in the stars Group
        //this.physics.add.overlap(this.player, this.stars, collectStar, null, this);
        this.physics.add.overlap(this.player.sprite, this.stars, (_, star) => {
            star.disableBody(true, true);

            this.score += 10;
            this.scoreText.setText('Score: ' + this.score);

            //We use a Group method called countActive to see how many this.stars are left alive
            if (this.stars.countActive(true) === 0) {
                //enableBody(reset, x, y, enableGameObject, showGameObject)
                this.stars.children.iterate(child => child.enableBody(true, child.x, PLAYER_START_POS.y, true, true));
                let x = Phaser.Math.Between(PLAYER_START_POS.x, PLAYER_START_POS.x + 300);

                let bomb = this.bombs.create(x, PLAYER_START_POS.y, 'bomb');
                bomb.setBounce(1);
                bomb.setCollideWorldBounds(false);
                bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            }
        });


        this.physics.add.collider(this.bombs, worldLayer);

        this.physics.add.collider(this.player.sprite, this.bombs, (p, _) => {
            this.explosion.explode(this.player.x, this.player.y);
            this.player.die();
        });

        this.physics.add.collider(this.player.sprite, this.wasp.sprite, (p, _) => {
            this.explosion.explode(this.player.x, this.player.y);
            this.player.die();
        });

        this.physics.add.collider(this.spin.sprite, this.wasp.sprite, (p, _) => {
            this.explosion.explode(this.wasp.x, this.wasp.y);
            this.player.bounceOffEnemy(this.wasp.y)
            this.wasp.die();
        });


        this.physics.add.overlap(worldLayer, this.player.spin.sprite, (_w, tile) => {
            this.player.checkWallBounce(tile)
        });

        /* MANEJO DE CAMARA ----------------------------------------------------------------------------------------------------------- */

        /* Con esta funcion podemos establecer los limites de la camara */
        //this.cameras.main.setBounds(0, 0, 800, 600);
        // la camara principal sigue al jugador
        this.cameras.main.startFollow(this.player.sprite);
        this.cameras.main.setZoom(1);
    }


    update() {
        if (this.player.isAlive()) {
            this.player.update()
            this.spin.update()
            this.bg.update(this.player.body.velocity.x, this.player.body.velocity.y)
        }

        /* Si el jugador se cae al fondo, entonces muere y reiniciamos el juego */
        if (this.player.y > ABYSS_LIMIT) {
            this.player.setPosition(0, ABYSS_LIMIT - 100)
            this.player.die()
        }

        this.debugText.setText(`X: ${Math.round(this.player.x)} ; Y: ${Math.round(this.player.y)}, 
p1x: ${Math.round(this.input.pointer1.x)} ; p2x: ${Math.round(this.input.pointer2.x)}`)
    }
}


export default Scene01;
