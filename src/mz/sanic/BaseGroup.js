
/**
 * staticGroup de elementos.
 */
class BaseGroup {
    /**
     * Crea un grupo de componentes
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        this.scene = scene;
    }

    get physics() { return this.scene.physics; }

    /**
     * Obtiene el grupo de plataformas. group y sprite son sinonimos
     */
    get group() { return this.legroup; }

    /**
     * Obtiene el grupo de plataformas. group y sprite son sinonimos
     */
    get sprite() { return this.legroup; }

    /**
     * Inicializa el grupo de plataformas.
     */
    init() {
        /* creo un grupo de cuerpos estaticos con iguales propiedades */
        this.legroup = this.physics.add.staticGroup();
        return this;
    }
}

export default BaseGroup;