export default class Field {

    static get TYPE() {
        return {
            X: 'x',
            O: 'o',
            EMPTY: '-'
        };
    }

    constructor(type) {
        this._type = type;
    }

    get type() {
        return this._type;
    }

    set type(t) {
        this._type = t;
    }
}