
const SPRITE_NAME = 'tower';

/**
 * staticGroup de torres.
 */
class TowerGroup {
    constructor(scene) { this.scene = scene; }

    get physics() { return this.scene.physics; }

    /**
     * Obtiene el grupo de torres. group y sprite son sinonimos
     */
    get group() { return this.legroup; }

    /**
     * Obtiene el grupo de torres. group y sprite son sinonimos
     */
    get sprite() { return this.legroup; }

    /**
     * Inicializa el grupo de torres.
     */
    init() {
        /* creo un grupo de cuerpos estaticos con iguales propiedades */
        this.legroup = this.physics.add.staticGroup();
        return this;
    }

    /**
     * Crea una plataforma y la agrega al grupo de torres existentes.
     * @param {Number} x Posicion x
     * @param {Number} y Posicion y
     * @param {Number} scale Escala de la plataforma. Valor por defecto = 1.
     * @returns {TowerGroup} this.
     */
    create(x, y, { scaleX, scaleY } = { scaleX: 1, scaleY: 1 }) {
        const vsx = scaleX || 1;
        const vsy = scaleY || 1;
        this.legroup.create(x, y, SPRITE_NAME).setOrigin(0.5, 0).setScale(vsx, vsy).refreshBody();
        return this;
    }
}

export default TowerGroup;