import Field from './Field';

export default class GameState {

    constructor() {
        this._board = [];
        this._createEmptyBoard();
    }

    get board() {
        return this._board;
    }

    _createEmptyBoard() {
        for(let i = 0; i < 9; i++) {
            this._board.push(new Field(Field.TYPE.EMPTY));
        }
    }

    move(player, index) {
        this._board[index].type = player;
    }

    isGameOver() {
        for(let i = 0; i < this._board.length; i++) {
            if(this._board[i].type === Field.TYPE.EMPTY) {
                return false;
            }
        }

        return true;
    }

    clearMove(index) {
        this._board[index].type = Field.TYPE.EMPTY;
    }

    resetBoard() {
        this._board = [];
        this._createEmptyBoard();
    }

    toString() {
        let arr = [];
        this._board.forEach((field) => {
            arr.push(field.type);
        });

        return JSON.stringify(arr);
    }

    fromString(str) {
        this._board = [];
        const gameStateArr = JSON.parse(str);
        gameStateArr.forEach((field) => {
            this.board.push(new Field(field));
        });
    }
}