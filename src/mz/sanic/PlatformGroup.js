import BaseGroup from './BaseGroup';

/**
 * staticGroup de plataformas.
 */
class PlatformGroup extends BaseGroup {
    /**
     * Crea una plataforma y la agrega al grupo de plataformas existentes.
     * @param {Number} x Posicion x
     * @param {Number} y Posicion y
     * @param {Number} scale Escala de la plataforma. Valor por defecto = 1.
     * @returns {PlatformGroup} this.
     */
    create(x, y, scale = 1) {
        /* we scale this platform x2 with the function setScale(2) */
        /* The call to refreshBody() is required because we have scaled a static physics body, so we have to tell the physics world about the changes we made */
        if (scale == 1) { this.legroup.create(x, y, 'ground'); }
        else { this.legroup.create(x, y, 'ground').setScale(scale).refreshBody(); }
        return this;
    }
}

export default PlatformGroup;