import BaseGroup from './BaseGroup';

/**
 * staticGroup de paredes.
 */
class WallGroup extends BaseGroup {
    /**
     * Crea una pared y la agrega al grupo de paredes existentes.
     * @param {Number} x Posicion x
     * @param {Number} y Posicion y
     * @param {{scaleX:number,scaleY:number}} scale Escala en los ejes x e y.
     * @returns {WallGroup} this.
     */
    create(x, y, { scaleX, scaleY } = { scaleX: 1, scaleY: 1 }) {
        const vsx = scaleX || 1;
        const vsy = scaleY || 1;
        this.legroup.create(x, y, 'wall').setScale(vsx, vsy).refreshBody();
        return this;
    }
}

export default WallGroup;