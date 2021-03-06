// @ts-check

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
     */
    constructor() {
        super('Scene01')

        this.preloader = new Preloader(this)

        this.player = new Player(this) // objeto del heroe
        this.explosion = new Explosion(this) // explosion

        this.score = 0
        this.scoreText = new GameText(this)
        this.debugText = GlobalConfig.devProfile() ? new GameText(this) : VOID_DEBUG_TEXT

        this.bg = new Background(this)

        this.spin = new Spin(this)

        this.tileset = new Tileset(this)

        // Enemigos tipo avispa
        const newWasp = () => {
            return new StaticEnemy(this, { key: 'wasp', prefix: 'wasp_', suffix: '.png', start: 1, end: 37, animDurationMs: 2000 })
        }
        this.wasps = [
            { pos: { x: 1000, y: 2900 }, enemy: newWasp() },
            {
                pos: { x: 1900, y: 2800 }, enemy: newWasp(),
                tweencfg: { props: { x: 1735 }, duration: 1000, yoyo: true, repeat: -1, flipX: true }
            }
        ]

        const newCrab = () => {
            return new StaticEnemy(this, { key: 'crab_walk', prefix: 'crab_', suffix: '.png', start: 8, end: 18, animDurationMs: 2000, scale: 0.5 })
        }
        this.crabs = [
            {
                pos: { x: 280, y: 3300 }, enemy: newCrab(),
                tweencfg: { props: { x: 700 }, duration: 3000, yoyo: true, repeat: -1, flipX: true, hold: 500, repeatDelay: 500 }
            },
            {
                pos: { x: 1260, y: 2220 }, enemy: newCrab(),
                tweencfg: { props: { x: 1450 }, duration: 2500, yoyo: true, repeat: -1, flipX: true, hold: 500, repeatDelay: 500 }
            },
        ]
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
        const wd = Scene01.getWorldDimensions()
        this.bg.init(wd.half_worldWidth, wd.half_worldHeight, wd.worldWidth, wd.worldHeight);


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

        this.wasps.forEach(w => w.enemy.init(w.pos.x, w.pos.y).playAnim())
        this.crabs.forEach(c => c.enemy.init(c.pos.x, c.pos.y, true).playAnim())

        /* creamos al heroe o jugador----------------------------------------------------------------------------------------------------------------------- */
        // agregamos un ArcadeSprite del jugador

        this.player.init(PLAYER_START_POS.x, PLAYER_START_POS.y)
        this.player.spin = this.spin;
        this.player.setInputManager({
            checkJumpPress: () => this.checkJumpPress(),
            checkLeftPress: () => this.checkLeftPress(),
            checkRightPress: () => this.checkRightPress()
        })

        this.player.setOnDeath(() => {
            this.explosion.explode(this.player.x, this.player.y)
            this.physics.pause()
            this.time.delayedCall(1000, () => {
                this.player.resurrect()
                this.scene.restart()
            })
        })

        /* when it lands after jumping it will bounce ever so slightly */
        this.player.setBounce(0.0)
        /* Esta funcion hace que el personaje colisione con los limites del juego */
        this.player.setCollideWorldBounds(false)

        //Let's drop a sprinkling of stars into the scene and allow the player to collect them ----------------------------------------------------
        //Groups are able to take configuration objects to aid in their setup
        this.stars = this.physics.add.group({
            key: 'star', //texture key to be the star image by default
            repeat: 6, //Because it creates 1 child automatically, repeating 11 times means we'll get 12 in total
            setXY: { x: 12, y: PLAYER_START_POS.y, stepX: 70 } //this is used to set the position of the 12 children the Group creates. Each child will be placed starting at x: 12, y: 0 and with an x step of 70
        });

        this.stars.children.iterate(child => { child.setBounceY(this.numberBetween(0.4, 0.8)) })

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
                let x = this.numberBetween(PLAYER_START_POS.x, PLAYER_START_POS.x + 300);

                let bomb = this.bombs.create(x, PLAYER_START_POS.y, 'bomb');
                bomb.setBounce(1);
                bomb.setCollideWorldBounds(false);
                bomb.setVelocity(this.numberBetween(-200, 200), 20);
            }
        });


        this.physics.add.collider(this.bombs, worldLayer);

        this.physics.add.collider(this.player.sprite, this.bombs, (p, _) => {
            this.player.die();
        });

        this.wasps.forEach(w => {
            const wasp = w.enemy

            this.physics.add.collider(this.player.sprite, wasp.sprite, (p, _) => {
                this.player.die()
            })

            this.physics.add.collider(this.spin.sprite, wasp.sprite, (p, _) => {
                this.explosion.explode(wasp.x, wasp.y)
                this.player.bounceOffEnemy(wasp.y)
                wasp.die()
            })

            if (w.tweencfg) this.tweens.add({ ...w.tweencfg, targets: wasp })
        })

        this.crabs.forEach(c => {
            const crab = c.enemy
            this.physics.add.collider(crab.sprite, worldLayer)

            this.physics.add.collider(this.player.sprite, crab.sprite, (p, _) => {
                this.player.die()
            })

            this.physics.add.collider(this.spin.sprite, crab.sprite, (p, _) => {
                this.explosion.explode(crab.x, crab.y)
                this.player.bounceOffEnemy(crab.y)
                crab.die()
            })

            if (c.tweencfg) this.tweens.add({ ...c.tweencfg, targets: crab })
        })


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
