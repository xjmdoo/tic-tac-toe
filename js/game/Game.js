import GameState from './GameState';
import Field from './Field';

export default class Game {

    constructor() {
        this.state = new GameState();
        this.$board = $('.ttt-container');
        this.$popup = $('.result-popup');
        this._loadFromLocalStorage();
        this._addEventListeners();
        this._animateIn();
        this._isGameInactive = false;
        this._currentPlayer = Field.TYPE.X;

        this._showPopup = this._showPopup.bind(this);
        this._hidePopup = this._hidePopup.bind(this);
    }

    _loadFromLocalStorage() {
        const storage = window.localStorage.getItem('gameBoard');
        const isGameInactive = window.localStorage.getItem('isGameInactive');
        this._isGameInactive = isGameInactive === 'false' ? false : true;
        if(storage !== null) {
            if(!this._isGameInactive) {
                this.state.fromString(storage);
                
                let cntX = 0;
                let cntO = 0;
                this.state.board.forEach((field, index) => {
                    if(field.type === Field.TYPE.X) {
                        cntX++;
                        $('.ttt__field-inner[data-index="' + index + '"]').children('svg.lines').addClass('active');
                    } else if(field.type === Field.TYPE.O) {
                        cntO++;
                        $('.ttt__field-inner[data-index="' + index + '"]').children('svg.circle').addClass('active');
                    }
                });

                if(cntX !== cntO) {
                    this._computerMove();
                }

            } else {
                this._isGameInactive = false;
            }
        }
    }

    _clearLocalStorage() {
        window.localStorage.setItem('gameBoard', null);
        window.localStorage.setItem('isGameInactive', null);
    }

    _addEventListeners() {
        let self = this;
        $('.ttt__field-inner').click(function() {
            const index = $(this).attr('data-index');
            if(self.state.board[index].type === Field.TYPE.EMPTY && self._currentPlayer === Field.TYPE.X) {
                self.movePlayer(index);
            }
        });

        $('.reset-game-btn').click(function() {
            self._hidePopup();
            self.$board.fadeOut(300, function() {
                $('.ttt__field-inner svg').removeClass('active');
                self.state.resetBoard();
                self._isGameInactive = false;
                self._currentPlayer = Field.TYPE.X;
                $(this).fadeIn(300);
            });
        });
    }

    _updateLocalStorage() {
        window.localStorage.setItem('gameBoard', this.state.toString());
        window.localStorage.setItem('isGameInactive', this._isGameInactive);
    }


    _animateIn() {
        window.setTimeout(() => {
            this.$board.addClass('active');
        }, 400);
    }

    _updateUIMove(player, index) {
        if(player === Field.TYPE.X) {
            $('.ttt__field-inner[data-index="' + index + '"]').children('svg.lines').addClass('active');
        } else {
            $('.ttt__field-inner[data-index="' + index + '"]').children('svg.circle').addClass('active');
        }
    }

    _showPopup(text) {
        this.$popup.find('.result-popup__content').html(text);
        this.$popup.addClass('active');
    }

    _hidePopup() {
        this.$popup.removeClass('active');
    }

    movePlayer(index) {
        if(this._isGameInactive) return;
        this._updateUIMove(Field.TYPE.X, index);
        this.state.move(Field.TYPE.X, index);
        this._currentPlayer = Field.TYPE.O;

        this._updateLocalStorage();

        if(this._isWinningPosition(Field.TYPE.X)) {
            this._isGameInactive = true;
            this._showPopup('You have won the game! :)');
            this._clearLocalStorage();
        } else if(this.state.isGameOver()) {
            this._isGameInactive = true;
            this._showPopup('Draw!');
            this._clearLocalStorage();
        } else {
            this._computerMove();
        }
    
    }

    _computerMove() {
        if(this._isGameInactive) return;
        const bestMove = this._minimax(Field.TYPE.O, 2);

        window.setTimeout(() => {
            this._updateUIMove(Field.TYPE.O, bestMove.index);
            this.state.move(Field.TYPE.O, bestMove.index);

            this._updateLocalStorage();
            this._currentPlayer = Field.TYPE.X;

            if(this._isWinningPosition(Field.TYPE.O)) {
                this._isGameInactive = true;
                this._showPopup('You have lost the game! :(');
                this._clearLocalStorage();
            } else if(this.state.isGameOver()) {
                this._isGameInactive = true;
                this._showPopup('Draw!');
                this._clearLocalStorage();
            }
        }, 800);
    }

    _debugConsole() {
        let str = '';
        for(let i = 1; i <= 9; i++) {
            str += this.state.board[i-1].type + ' ';
            if(i % 3 === 0) {
                console.log(str);
                str = '';
            }
        }
    }

    _calcWinningLine(line, player) {
        let cnt = 0;      
        line.forEach((field, index) => {
            if(field.type === player) {
                cnt++;
            }
        });

        if(cnt === 3) {
            return 1;
        } else {
            return 0;
        }
    }

    _isWinningPosition(player) {
        let sum = 0;
        sum += this._calcWinningLine([this.state.board[0], this.state.board[1], this.state.board[2]], player);
        sum += this._calcWinningLine([this.state.board[3], this.state.board[4], this.state.board[5]], player);
        sum += this._calcWinningLine([this.state.board[6], this.state.board[7], this.state.board[8]], player);

        sum += this._calcWinningLine([this.state.board[0], this.state.board[3], this.state.board[6]], player);
        sum += this._calcWinningLine([this.state.board[1], this.state.board[4], this.state.board[7]], player);
        sum += this._calcWinningLine([this.state.board[2], this.state.board[5], this.state.board[8]], player);

        sum += this._calcWinningLine([this.state.board[0], this.state.board[4], this.state.board[8]], player);
        sum += this._calcWinningLine([this.state.board[2], this.state.board[4], this.state.board[6]], player);

        if(sum > 0) {
            return true;
        } else {
            return false;
        }
    }

    _minimax(player, depth) {

        let bestScore, currentScore;
        let bestIndex = -1;
       
        if(player === Field.TYPE.X) {
            bestScore = -100000;
        } else {
            bestScore = 100000;
        }

        if(this.state.isGameOver() || depth === 0) {
            bestScore = this._calcBest();
        } else {
            this.state.board.forEach((field, index) => {
                if(field.type === Field.TYPE.EMPTY) {

                    if(player === Field.TYPE.X) {
                        this.state.move(player, index);
                        currentScore = this._minimax(Field.TYPE.O, depth - 1).value;

                        if(currentScore > bestScore) {
                            bestScore = currentScore;
                            bestIndex = index;
                        }
                    } else {
                        this.state.move(player, index);
                        currentScore = this._minimax(Field.TYPE.X, depth - 1).value;

                        if(currentScore < bestScore) {
                            bestScore = currentScore;
                            bestIndex = index;
                        }
                    }

                    this.state.clearMove(index);
                }
            });
        }

        return {
            value: bestScore,
            index: bestIndex
        };
    }

    _calcLine(lineArr) {
        let numOfEmpty = 0;
        let numOfX = 0;
        let numOfO = 0;
        let sum = 0;
        
        lineArr.forEach((field, index) => {
            if(field.type === Field.TYPE.EMPTY) {
                numOfEmpty++;
            } else if(field.type === Field.TYPE.X) {
                numOfX++
            } else {
                numOfO++;
            }
        });

        if(numOfEmpty === 2 && numOfX === 1) {
            sum += 1;
        }

        if(numOfEmpty === 1 && numOfX === 2) {
            sum += 10;
        }

        if(numOfX === 3) {
            sum += 100;
        }

        if(numOfEmpty === 2 && numOfO === 1) {
            sum += -1;
        }

        if(numOfEmpty === 1 && numOfO === 2) {
            sum += -10;
        }

        if(numOfO === 3) {
            sum += -100;
        }

        return sum;
    }

    _calcBest() {
        let sum = 0;

        sum += this._calcLine([this.state.board[0], this.state.board[1], this.state.board[2]]);
        sum += this._calcLine([this.state.board[3], this.state.board[4], this.state.board[5]]);
        sum += this._calcLine([this.state.board[6], this.state.board[7], this.state.board[8]]);

        sum += this._calcLine([this.state.board[0], this.state.board[3], this.state.board[6]]);
        sum += this._calcLine([this.state.board[1], this.state.board[4], this.state.board[7]]);
        sum += this._calcLine([this.state.board[2], this.state.board[5], this.state.board[8]]);

        sum += this._calcLine([this.state.board[0], this.state.board[4], this.state.board[8]]);
        sum += this._calcLine([this.state.board[2], this.state.board[4], this.state.board[6]]);

        return sum;
    }
}