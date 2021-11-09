let players = []

const getAverage = (array) => {
    return array.reduce((a, b) => a + b) / array.length;
}

const exponentiate = (array) => {

    let i = 0;

    while (array[i]) {
        array[i] = array[i] ** 2;
        ++i;
    }

    return array
}

const Player = (marker) => {

    const isHuman = true;

    const placeMove = (tile) => {
        gameboard.updateTile(tile, marker);
    }

    return {
        placeMove,
        marker,
        isHuman
    }
};

const ComputerPlayer = (marker) => {

    const isHuman = false;

    const computeMove = () => {

        let simulTiles = [...gameboard.getTiles()];
        let scores = [];

        let playerCounts;
        let computerCounts;

        let highScore;
        let winningIndex;

        for (let i=0; i<9; ++i) {

            simulTiles = [...gameboard.getTiles()];

            if (!gameboard.getTiles()[i]) {

                simulTiles[i] = marker;
                computerCounts = exponentiate(Gameplay.getCounts(simulTiles, marker));

                simulTiles[i] = players[0].marker;
                playerCounts = exponentiate(Gameplay.getCounts(simulTiles, players[0].marker));

                computerAverage = getAverage(computerCounts);
                playerAverage = getAverage(playerCounts);

                scores[i] = computerAverage + playerAverage;

                if (!highScore) {
                    highScore = scores[i];
                    winningIndex = i;
                }

                else if (scores[i] > highScore) {
                    highScore = scores[i];
                    winningIndex = i;
                }
            }
        }

        setTimeout(() => {placeMove(winningIndex);}, 2000);
    }

    const {placeMove} = Player(marker);

    return {
        computeMove,
        placeMove,
        isHuman,
    }
};

const gameboard = (() => {

    const gameboardElement = document.querySelector('.gameboard');
    const winnerElement = document.querySelector('.winner');
    const restartElement = document.querySelector('.restart');
    const ellipsisElements = document.querySelectorAll('.dot');

    let tiles = new Array(9);
    let tilesMarked = 0;

    const getTilesMarked = () => {
        return tilesMarked
    }

    const getTiles = () => {
        return tiles
    }

    const getTilesGrid = (tilesInput) => {

        let tilesGrid = [];

        for (let i=0; i<3; ++i){

            let tilesRow = [];

            for (let j=0; j<3; ++j) {
                tilesRow[j] = tilesInput[j + (i*3)];
            }
            tilesGrid[i] = tilesRow;
        }

        return tilesGrid
    }
    
    const reset = () => {
        gameboardElement.style.opacity = '0.5';

        let tileElements = document.querySelectorAll('.tile');

        winnerElement.style.display = 'none';

        for (const selector of playerSelectors) {
            selector.style.opacity = '1';
            selector.classList.remove('underline');
            selector.classList.add('hoverEffect');
        }

        for (const dot of ellipsisElements) {
            dot.classList.remove('blinking');
        }

        if (tileElements.length === 9) {
            for (let element of tileElements) {
                element.innerHTML = '';
                element.className = 'tile';
            }
            for (let i=0; i<9; ++i) {
                tiles[i] = undefined;
            }
        }

        else {

            for (let i=0; i<9; ++i) {
                let newTile = document.createElement('div');
                newTile.classList.add('tile');
                newTile.setAttribute('id', i)
                newTile.addEventListener('click', function() {
                    if (Gameplay.getActivePlayer().isHuman) {
                        Gameplay.getActivePlayer().placeMove(parseInt(newTile.id));
                    }
                });
                gameboardElement.append(newTile);
            }    
        }

        players[1] = null;
    }

    const activateBoard = () => {

        tilesMarked = 0;

        gameboardElement.style.opacity = '1';

        for (const selector of playerSelectors) {
            selector.classList.remove('hoverEffect');
        }
    }

    const updateTile = (tile, marker) => {

        for (const dot of ellipsisElements) {
            dot.classList.remove('blinking');
        }

        if (tiles[tile] || tilesMarked === 9 || !players[1]) {
            return false
        }

        tiles[tile] = marker;
        tilesMarked++;

        updateDisplay(tile, marker);

        if(Gameplay.checkWin(marker)) {
            updateWinner(Gameplay.getActivePlayer().marker);

            for (const dot of ellipsisElements) {
                dot.classList.remove('blinking');
            }
        }

        else if (tilesMarked === 9){
            updateWinner(null);

            for (const dot of ellipsisElements) {
                dot.classList.remove('blinking');
            }
        }

        else {
            Gameplay.switchPlayer();
        }

        return true
    }

    const updateDisplay = (tile, marker) => {
        let updatedTile = document.getElementById(tile);
        updatedTile.innerHTML = marker;

        let ellipsisStart;

        Gameplay.getActivePlayer() === players[0] ? ellipsisStart = 3 : ellipsisStart = 0;

        for (let i=0; i<3; ++i) {
            ellipsisElements[ellipsisStart + i].classList.add('blinking');
        }
    }

    const updateWinner = (winner) => {

        let player;

        winner === 'x' ? player = 'P1' : player = 'P2';
        if (winner) {
            winnerElement.innerHTML = `${player} has won!`;
        }
        else {
            winnerElement.innerHTML = "It's a tie!";
        }

        tilesMarked = 9;
        winnerElement.style.display = 'block';
        gameboardElement.style.opacity = '0.5';

        if (Gameplay.getActivePlayer() === players [1]) {
            Gameplay.switchPlayer();
        }
    }

    restartElement.addEventListener('click', function() {reset()});

    return {
        getTiles,
        getTilesMarked,
        reset,
        updateTile,
        updateDisplay,
        updateWinner,
        getTilesGrid,
        activateBoard,
    }
})();

const Gameplay =(() => {

    let activePlayer;

    const checkWin = (marker) => {

        let counts = [...getCounts(gameboard.getTiles(), marker)];

        for (let count of counts ) {
            if (count === 3) {
                return true
            }
        }

        return false
    }

    const getCounts = (tilesInput, marker) => {

        let opponentMarker;

        marker === 'x' ? opponentMarker = 'o' : opponentMarker = 'x';

        let tilesGrid = [...gameboard.getTilesGrid(tilesInput)];

        let maxHorizontalCount = 0;
        let maxVerticalCount = 0;
        let downslopeCount = 0;
        let upslopeCount = 0;

        for (let i=0; i<3; ++i) {
            
            verticalCount = 0;
            horizontalCount = 0;

            for (let j=0; j<3; ++j) {
                if (tilesGrid[i][j] === marker) {
                    ++horizontalCount;
                }
                if (tilesGrid[j][i] === marker) {
                    ++verticalCount;
                }
                if (i === j && tilesGrid[i][j] === marker) {
                    ++downslopeCount;
                }
                if(i === (2-j) && tilesGrid[i][j] === marker) {
                    ++upslopeCount;
                }

                if (tilesGrid[i][j] === opponentMarker) {
                    --horizontalCount;
                }
                if (tilesGrid[j][i] === opponentMarker) {
                    --verticalCount;
                }
                if (i === j && tilesGrid[i][j] === opponentMarker) {
                    --downslopeCount;
                }
                if(i === (2-j) && tilesGrid[i][j] === opponentMarker) {
                    --upslopeCount;
                }
            }

            if (verticalCount > maxVerticalCount) {
                maxVerticalCount = verticalCount;
            }
            if (horizontalCount > maxHorizontalCount) {
                maxHorizontalCount = horizontalCount;
            }
        }

        let counts = [];
        counts.push(maxHorizontalCount, maxVerticalCount, downslopeCount, upslopeCount);

        for (let count of counts) {
            if (count > 3) {
                count = 3;
            }
            if (count < 0) {
                count = 0;
            }
        }

        return counts
    }

    const switchPlayer = () => {

        activePlayer.marker === players[0].marker ? activePlayer = players[1] : activePlayer = players[0];
        if (!activePlayer.isHuman) {
            activePlayer.computeMove();
        }
    }

    const getActivePlayer = () => {
        if (!activePlayer) {
            activePlayer = players[0];
        }
        return activePlayer;
    }

    return {    
        switchPlayer,
        checkWin,
        getActivePlayer,
        getCounts,
    }
})();

const playerSelectors = document.querySelectorAll('.playerType');

for (const selector of playerSelectors) {
    selector.onclick = () => {
        if (!players[1]) {

            if (selector.innerHTML === 'Human') {
                players = [Player('x'), Player('o')]
                playerSelectors[1].style.opacity = '0.3';
                playerSelectors[0].classList.add('underline');
            }
            else {
                players = [Player('x'), ComputerPlayer('o')]
                playerSelectors[0].style.opacity = '1';
                playerSelectors[1].classList.add('underline');
            }

            gameboard.activateBoard();
        }
    }
}

window.addEventListener('DOMContentLoaded', () => {gameboard.reset();});
