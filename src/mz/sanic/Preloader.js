import AssetLoader from './AssetLoader';

class Preloader {
    /**
     * Preloader base de los assets del juego
     * @param {Phaser.Scene} scene Escena del juego
     */
    constructor(scene) {
        this.scene = scene;
    }

    init() {
        AssetLoader.loadFor(this.scene, 'IMAGES', () => {
            this.scene.load.image('star', 'assets/star.png')
            this.scene.load.image('bomb', 'assets/bomb.png')
            //this.scene.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 })

            this.scene.load.multiatlas('sonic3', 'assets/sonic3.json', 'assets')

            // this.scene.load.image('background' , 'assets/background.png')
            this.scene.load.image('background', 'assets/angel_island_cloud.png')

            this.scene.load.multiatlas('sparkle', 'assets/sparkle.json', 'assets')
            this.scene.load.multiatlas('explosion', 'assets/explosion.json', 'assets')

            this.scene.load.image('spin', 'assets/circle.png')

            // cargamos la imagen de la avispa
            this.scene.load.multiatlas('wasp', 'assets/wasp.json', 'assets')

            // cargamos la imagen de la avispa
            this.scene.load.multiatlas('crab_walk', 'assets/crab_walk.json', 'assets')

            // cargamos los tiles del map
            this.scene.load.image('main_map', 'assets/main_map_tiles.png')
            this.scene.load.tilemapTiledJSON('main_map', 'assets/main_map.json')

            this.scene.load.image('factory_map', 'assets/factory_tiles.png')
            this.scene.load.tilemapTiledJSON('factory_map', 'assets/factory_map.json')

            // cargamos las imagenes de los botones
            this.scene.load.image('left_btn', 'assets/buttons/left.png')
            this.scene.load.image('right_btn', 'assets/buttons/right.png')
            this.scene.load.image('a_btn', 'assets/buttons/a.png')
            this.scene.load.image('b_btn', 'assets/buttons/b.png')
        });
    }
}


export default Preloader;