// オセロゲームクラス
class OthelloGame {
    constructor() {
        this.board = this.createBoard();
        this.currentPlayer = 2; // 1: 白, 2: 黒
        this.validMoves = [];
        this.gameOver = false;
        this.initializeBoard();
        this.updateValidMoves();
    }

    // 8x8のボードを作成
    createBoard() {
        const board = [];
        for (let i = 0; i < 8; i++) {
            board[i] = [];
            for (let j = 0; j < 8; j++) {
                board[i][j] = 0;
            }
        }
        return board;
    }

    // 初期配置
    initializeBoard() {
        // 中央に4つの石を配置
        this.board[3][3] = 1; // 白
        this.board[3][4] = 2; // 黒
        this.board[4][3] = 2; // 黒
        this.board[4][4] = 1; // 白
    }

    // 指定された位置に石を置けるかチェック
    isValidMove(row, col) {
        if (this.board[row][col] !== 0) {
            return false;
        }

        // 8方向をチェック
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dr, dc] of directions) {
            if (this.canFlip(row, col, dr, dc)) {
                return true;
            }
        }
        return false;
    }

    // 指定された方向に石をひっくり返せるかチェック
    canFlip(row, col, dr, dc) {
        let r = row + dr;
        let c = col + dc;

        // 境界チェック
        if (r < 0 || r >= 8 || c < 0 || c >= 8) {
            return false;
        }

        // 隣の石が相手の色でない場合は無効
        if (this.board[r][c] !== (3 - this.currentPlayer)) {
            return false;
        }

        // その方向に進んで、自分の石があるかチェック
        r += dr;
        c += dc;
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (this.board[r][c] === 0) {
                return false;
            }
            if (this.board[r][c] === this.currentPlayer) {
                return true;
            }
            r += dr;
            c += dc;
        }
        return false;
    }

    // 石を置いて、挟まれた石をひっくり返す
    makeMove(row, col) {
        if (!this.isValidMove(row, col)) {
            return false;
        }

        this.board[row][col] = this.currentPlayer;

        // 8方向の石をひっくり返す
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dr, dc] of directions) {
            this.flipStones(row, col, dr, dc);
        }

        // プレイヤーを交代
        this.currentPlayer = 3 - this.currentPlayer;
        this.updateValidMoves();

        // ゲーム終了チェック
        this.checkGameOver();

        return true;
    }

    // 指定された方向の石をひっくり返す
    flipStones(row, col, dr, dc) {
        const stonesToFlip = [];
        let r = row + dr;
        let c = col + dc;

        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (this.board[r][c] === 0) {
                break;
            }
            if (this.board[r][c] === this.currentPlayer) {
                // 挟まれた石をひっくり返す
                for (const [flipR, flipC] of stonesToFlip) {
                    this.board[flipR][flipC] = this.currentPlayer;
                }
                break;
            }
            stonesToFlip.push([r, c]);
            r += dr;
            c += dc;
        }
    }

    // 有効な手を更新
    updateValidMoves() {
        this.validMoves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.isValidMove(row, col)) {
                    this.validMoves.push([row, col]);
                }
            }
        }
    }

    // スコアを取得
    getScore() {
        let blackCount = 0;
        let whiteCount = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === 2) {
                    blackCount++;
                } else if (this.board[row][col] === 1) {
                    whiteCount++;
                }
            }
        }
        
        return { black: blackCount, white: whiteCount };
    }

    // ゲーム終了チェック
    checkGameOver() {
        if (this.validMoves.length === 0) {
            // 現在のプレイヤーが置けない場合、相手の番をチェック
            const tempPlayer = this.currentPlayer;
            this.currentPlayer = 3 - this.currentPlayer;
            this.updateValidMoves();
            const opponentHasMoves = this.validMoves.length > 0;
            this.currentPlayer = tempPlayer;
            this.updateValidMoves();
            
            if (!opponentHasMoves) {
                this.gameOver = true;
            }
        }
    }

    // ゲームをリセット
    reset() {
        this.board = this.createBoard();
        this.currentPlayer = 2;
        this.validMoves = [];
        this.gameOver = false;
        this.initializeBoard();
        this.updateValidMoves();
    }
}

// ゲームインスタンス
let game = new OthelloGame();

// DOM要素
const gameBoard = document.getElementById('game-board');
const blackCount = document.getElementById('black-count');
const whiteCount = document.getElementById('white-count');
const currentPlayer = document.getElementById('current-player');
const movesCount = document.getElementById('moves-count');
const gameResult = document.getElementById('game-result');
const resultText = document.getElementById('result-text');

// ボードを描画
function renderBoard() {
    gameBoard.innerHTML = '';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // 石の表示
            if (game.board[row][col] === 1) {
                cell.classList.add('white');
            } else if (game.board[row][col] === 2) {
                cell.classList.add('black');
            }
            
            // 有効な手のハイライト
            if (game.validMoves.some(([r, c]) => r === row && c === col)) {
                cell.classList.add('valid');
            }
            
            // クリックイベント
            cell.addEventListener('click', () => handleCellClick(row, col));
            
            // タッチイベント（スマホ対応）
            cell.addEventListener('touchstart', (e) => {
                e.preventDefault();
                handleCellClick(row, col);
            });
            
            gameBoard.appendChild(cell);
        }
    }
}

// セルクリック処理
function handleCellClick(row, col) {
    if (game.gameOver) {
        return;
    }
    
    if (game.makeMove(row, col)) {
        updateUI();
        renderBoard();
    }
}

// UI更新
function updateUI() {
    const score = game.getScore();
    blackCount.textContent = score.black;
    whiteCount.textContent = score.white;
    
    // 現在のプレイヤー表示
    const currentPlayerElement = currentPlayer.querySelector('span:last-child');
    const currentStoneElement = currentPlayer.querySelector('.stone');
    
    if (game.currentPlayer === 2) {
        currentStoneElement.textContent = '⚫';
        currentPlayerElement.textContent = '黒の番です';
    } else {
        currentStoneElement.textContent = '⚪';
        currentPlayerElement.textContent = '白の番です';
    }
    
    // 有効な手の数
    movesCount.textContent = game.validMoves.length;
    
    // ゲーム終了時の処理
    if (game.gameOver) {
        showGameResult();
    }
}

// ゲーム結果表示
function showGameResult() {
    const score = game.getScore();
    let result;
    
    if (score.black > score.white) {
        result = `⚫ 黒の勝ち！ (${score.black} - ${score.white})`;
    } else if (score.white > score.black) {
        result = `⚪ 白の勝ち！ (${score.white} - ${score.black})`;
    } else {
        result = `引き分け！ (${score.black} - ${score.white})`;
    }
    
    resultText.textContent = result;
    gameResult.style.display = 'block';
}

// ゲームリスタート
function restartGame() {
    game.reset();
    gameResult.style.display = 'none';
    updateUI();
    renderBoard();
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    renderBoard();
    updateUI();
});

// スマホでのダブルタップズームを無効化
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}, { passive: false });

// ページの読み込み完了後に初期化
window.addEventListener('load', () => {
    // タッチデバイスかどうかを判定
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        // タッチデバイス用の設定
        document.body.style.touchAction = 'manipulation';
    }
}); 