// @ts-check

import Phaser from 'phaser';
import Preloader from './Preloader';
import Background from './Background';
import Player from './Player';
import GameText from './GameText';
import Sparkle from './Sparkle';
import Explosion from './Explosion';
import Spin from './Spin';
import BaseScene from './BaseScene';
import PlatformGroup from './PlatformGroup';
import WallGroup from './WallGroup';
import TowerGroup from './TowerGroup';
import StaticEnemy from './StaticEnemy'


class Scene01 extends BaseScene {
    constructor(worldWidth, worldHeight) {
        super(worldWidth, worldHeight)

        this.preloader = new Preloader(this.gameScene);

        this.player = new Player(this.gameScene); // objeto del heroe
        this.sparkle = new Sparkle(this.gameScene); // objeto brillo o sparkle
        this.explosion = new Explosion(this.gameScene); // explosion

        this.platforms = new PlatformGroup(this.gameScene);
        this.walls = new WallGroup(this.gameScene);

        this.score = 0;
        this.scoreText = new GameText(this.gameScene);
        this.debugText = new GameText(this.gameScene);

        this.bg = new Background(this.gameScene);

        this.spin = new Spin(this.gameScene);

        this.towers = new TowerGroup(this.gameScene);

        this.wasp = new StaticEnemy(this.gameScene, { key: 'wasp', prefix: 'wasp_', suffix: '.png', start: 1, end: 37, animDurationMs: 2000 })
    }


    preload() {
        console.log("PRELOAD");
        this.preloader.init();
    }

    create() {
        console.log("CREATE");


        this.bg.init(this.half_worldWidth, this.half_worldHeight, this.worldWidth, this.worldHeight);
        this.scoreText.init(0, 0, 'Score: 0');
        this.debugText.init(0, 32, '');

        const map = this.gameScene.make.tilemap({ key: 'main_map' })
        const tileset = map.addTilesetImage('main_map', 'main_map')
        const worldLayer = map.createLayer('world', tileset, 0, 0)
        worldLayer.setCollisionByProperty({stand: true, bounce:true})

        const debugGraphics = this.gameScene.add.graphics().setAlpha(0.5)
        worldLayer.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(255,255,50,255),
            faceColor: new Phaser.Display.Color(0,255,0,255)
        })


        this.platforms.init();

        this.towers.init();

        this.walls.init();

        this.bombs = this.physics.add.group();

        this.sparkle.init();
        this.sparkle.disableBody(true, true);

        this.spin.init(this.player);

        this.explosion.init(100, 950);
        this.explosion.disableBody(true, true);

        this.wasp.init(750, 1000)
        this.wasp.playAnim()

        /* creamos al heroe o jugador----------------------------------------------------------------------------------------------------------------------- */
        // agregamos un ArcadeSprite del jugador

        this.player.init(100, 1000);
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
            setXY: { x: 12, y: 500, stepX: 70 } //this is used to set the position of the 12 children the Group creates. Each child will be placed starting at x: 12, y: 0 and with an x step of 70
        });

        this.stars.children.iterate(function (child) { child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8)); });

        /* DETECCION DE COLISION ----------------------------------------------------------------------------------------------------------------- */

        /* In order to allow the player to collide with the platforms we can create a Collider object. 
        This object monitors two physics objects (which can include Groups) and checks for collisions or overlap between them. 
        If that occurs it can then optionally invoke your own callback, but for the sake of just colliding with platforms we don't require that */
        this.physics.add.collider(this.player.sprite, this.platforms.group, this.player.platformHandler());
        this.physics.add.collider(this.player.sprite, this.towers.group, this.player.platformHandler());
        this.physics.add.collider(this.player.sprite, this.walls.group, this.player.wallHandler());
        
        this.physics.add.collider(this.player.sprite, worldLayer, this.player.platformHandler())

        this.physics.add.collider(this.stars, this.platforms.group);
        this.physics.add.collider(this.stars, this.towers.group);
        this.physics.add.collider(this.stars, worldLayer);
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
                this.stars.children.iterate(child => child.enableBody(true, child.x, 0, true, true));
                let x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

                let bomb = this.bombs.create(x, 516, 'bomb');
                bomb.setBounce(1);
                bomb.setCollideWorldBounds(false);
                bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            }
        });


        this.physics.add.collider(this.bombs, this.platforms.group);

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

        let text = '';
        this.physics.add.overlap(this.platforms.group, this.spin.sprite, (p, s) => {
            text = p.y < s.y ? 'bounce up' : 'bounce down';
            this.debugText.setText(text);
        });

        this.physics.add.overlap(worldLayer, this.player.spin, (_w, tile) => {
            if (tile.properties.bounce && this.player.canBounce && this.player.goingUp()) {
                this.player.bounce();
            }
        });

        /* MANEJO DE CAMARA ----------------------------------------------------------------------------------------------------------- */

        /* Con esta funcion podemos establecer los limites de la camara */
        //this.cameras.main.setBounds(0, 0, 800, 600);
        // la camara principal sigue al jugador
        this.cameras.main.startFollow(this.player.sprite);
        this.cameras.main.setZoom(1);
    }


    update() {
        this.player.update();
        this.spin.update();
        this.bg.update(this.player.body.velocity.x, this.player.body.velocity.y);
    }
}


export default Scene01;
