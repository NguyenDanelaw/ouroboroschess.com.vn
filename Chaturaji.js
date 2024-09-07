const chessboard = document.getElementById('chessboard');
const rows = 8;
const columns = 8;
let selectedPiece = null;
let currentPlayer = 'w'; // 'w' for White, 'b' for Black

const pieces = [
    ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
    ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
    ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR'],
];

// Function to render the board
function renderBoard() {
    chessboard.innerHTML = ''; // Clear previous board
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.dataset.row = row;
            square.dataset.col = col;

            if ((row + col) % 2 === 0) {
                square.classList.add('white');
            } else {
                square.classList.add('black');
            }

            // Add piece if there is one
            const piece = pieces[row][col];
            if (piece) {
                const pieceImg = document.createElement('img');
                pieceImg.src = `images/${piece}.png`;
                pieceImg.className = 'piece';
                pieceImg.dataset.piece = piece;
                pieceImg.dataset.row = row;
                pieceImg.dataset.col = col;
                square.appendChild(pieceImg);

                // Click event for piece selection
                pieceImg.addEventListener('click', selectPiece);
            } else {
                // Click event for empty square selection
                square.addEventListener('click', movePiece);
            }

            chessboard.appendChild(square);
        }
    }
    highlightPotentialMoves();
}

// Function to select a piece
function selectPiece(event) {
    const pieceImg = event.target;
    const piece = pieceImg.dataset.piece;

    // Ensure the player can only select their own pieces
    if (piece[0] !== currentPlayer) {
        return;
    }

    selectedPiece = {
        piece: piece,
        row: parseInt(pieceImg.dataset.row),
        col: parseInt(pieceImg.dataset.col)
    };

    // Re-render board to highlight potential moves
    renderBoard();
}

// Function to move the piece
function movePiece(event) {
    if (!selectedPiece) {
        console.log("No piece selected.");
        return;
    }

    const targetSquare = event.target.closest('.square');
    const targetRow = parseInt(targetSquare.dataset.row);
    const targetCol = parseInt(targetSquare.dataset.col);

    console.log(`Trying to move piece ${selectedPiece.piece} to (${targetRow}, ${targetCol})`);

    const targetPiece = pieces[targetRow][targetCol];
    const isCapturing = targetPiece !== '' && targetPiece[0] !== currentPlayer;

    if (isValidMove(selectedPiece.piece, selectedPiece.row, selectedPiece.col, targetRow, targetCol)) {
        console.log(`Move is valid.`);
        pieces[selectedPiece.row][selectedPiece.col] = '';
        pieces[targetRow][targetCol] = selectedPiece.piece;

        if (isCapturing) {
            console.log(`Captured ${targetPiece} at (${targetRow}, ${targetCol})`);
        }

        selectedPiece = null;
        currentPlayer = currentPlayer === 'w' ? 'b' : 'w';
        renderBoard();
    } else {
        console.log("Invalid move.");
        selectedPiece = null;
        renderBoard();
    }
}


// Function to check if the move is valid for the selected piece
function isValidMove(piece, startRow, startCol, targetRow, targetCol) {
    const pieceType = piece[1];
    const rowDiff = Math.abs(targetRow - startRow);
    const colDiff = Math.abs(targetCol - startCol);
    const targetPiece = pieces[targetRow][targetCol];

    // Ensure the target square is either empty or contains an opponent's piece
    const isCapturing = targetPiece !== '' && targetPiece[0] !== piece[0];
    const isMovingToEmptySquare = targetPiece === '';

    switch (pieceType) {
        case 'R': // Rook
            return (startRow === targetRow || startCol === targetCol) && !isPathBlocked(startRow, startCol, targetRow, targetCol) && (isMovingToEmptySquare || isCapturing);

        case 'B': // Bishop
            return (rowDiff === colDiff) && !isPathBlocked(startRow, startCol, targetRow, targetCol) && (isMovingToEmptySquare || isCapturing);

        case 'Q': // Queen
            return ((startRow === targetRow || startCol === targetCol) || (rowDiff === colDiff)) && !isPathBlocked(startRow, startCol, targetRow, targetCol) && (isMovingToEmptySquare || isCapturing);

        case 'N': // Knight
            return ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) && (isMovingToEmptySquare || isCapturing);

        case 'P': // Pawn
            const direction = piece[0] === 'w' ? -1 : 1;
            const startRowPawn = piece[0] === 'w' ? 6 : 1;

            if (targetCol === startCol) {
                if (targetRow === startRow + direction && isMovingToEmptySquare) {
                    return true;
                }
                if (startRow === startRowPawn && targetRow === startRow + 2 * direction && pieces[startRow + direction][startCol] === '' && isMovingToEmptySquare) {
                    return true;
                }
            }
            if (rowDiff === 1 && colDiff === 1 && isCapturing) {
                return true;
            }
            return false;

        case 'K': // King
            return (rowDiff <= 1 && colDiff <= 1) && (isMovingToEmptySquare || isCapturing);

        default:
            return false;
    }
}



// Function to check if there are any pieces blocking the path for Rooks, Bishops, and Queens
function isPathBlocked(startRow, startCol, targetRow, targetCol) {
    const rowDirection = targetRow > startRow ? 1 : (targetRow < startRow ? -1 : 0);
    const colDirection = targetCol > startCol ? 1 : (targetCol < startCol ? -1 : 0);

    let currentRow = startRow + rowDirection;
    let currentCol = startCol + colDirection;

    while (currentRow !== targetRow || currentCol !== targetCol) {
        if (pieces[currentRow][currentCol] !== '') {
            return true;
        }
        currentRow += rowDirection;
        currentCol += colDirection;
    }
    return false;
}

// Function to highlight potential moves for the selected piece
function highlightPotentialMoves() {
    if (!selectedPiece) return;

    const { piece, row, col } = selectedPiece;
    const potentialMoves = [];

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            if (isValidMove(piece, row, col, r, c)) {
                potentialMoves.push({ row: r, col: c });
            }
        }
    }

    document.querySelectorAll('.highlight').forEach(el => el.classList.remove('highlight'));

    potentialMoves.forEach(move => {
        const square = document.querySelector(`.square[data-row="${move.row}"][data-col="${move.col}"]`);
        const highlight = document.createElement('div');
        highlight.className = 'highlight';
        square.appendChild(highlight);
    });
}


// Initial rendering of the board
renderBoard();
