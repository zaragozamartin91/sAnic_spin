import BaseGroup from './BaseGroup';

const SPRITE_NAME = 'tower';

/**
 * staticGroup de torres.
 */
class TowerGroup extends BaseGroup {
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