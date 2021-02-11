import BaseGroup from './BaseGroup';

/**
 * staticGroup de plataformas.
 */
class PlatformGroup extends BaseGroup {
    /**
     * Crea una plataforma y la agrega al grupo de plataformas existentes.
     * @param {Number} x Posicion x
     * @param {Number} y Posicion y
     * @param {{scaleX:number,scaleY:number}} scale Escala en los ejes x e y.
     * @returns {PlatformGroup} this.
     */
    create(x, y, { scaleX, scaleY } = { scaleX: 1, scaleY: 1 }) {
        /* we scale this platform x2 with the function setScale(2) */
        /* The call to refreshBody() is required because we have scaled a static physics body, so we have to tell the physics world about the changes we made */
        const vsx = scaleX || 1;
        const vsy = scaleY || 1;
        this.legroup.create(x, y, 'ground').setScale(vsx, vsy).refreshBody();
        return this;
    }
}

export default PlatformGroup;