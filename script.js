let players = []

const Player = (marker) => {

    const placeMove = (tile) => {
        gameboard.updateTile(tile, marker);
    }

    return {
        placeMove,
        marker
    }
};

const ComputerPlayer = (marker) => {

    const computeMove = () => {

        let simulTiles = [...gameboard.getTiles()];
        let simulTilesMarked = gameboard.getTilesMarked();
        let simulActiveMarker = 'o';

        let winCounts = []

        for (let i=0; i<9; ++i) {

            if (!gameboard.getTiles()[i]) {

                winCounts[i] = 0;
                simulTiles[i] = simulActiveMarker;
                simulTilesMarked++;

                for (let j=0; j<256; ++j) {

                    while (simulTilesMarked < 9) {

                        simulActiveMarker === 'o' ? simulActiveMarker = 'x' : simulActiveMarker = 'o';
        
                        simulTiles = makeRandomPlay(simulTiles, simulActiveMarker);
                        simulTilesMarked++;

                        if (Gameplay.checkWin(simulTiles, simulActiveMarker)) {

                            console.log(`${simulActiveMarker} win detected!`);

                            simulTilesMarked = gameboard.getTilesMarked();
                            simulTiles = [...gameboard.getTiles()];

                            simulActiveMarker === 'o' ? ++winCounts[i] : --winCounts[i];
                            simulActiveMarker = 'o';

                            console.log(winCounts);

                            break
                        }
                    }   

                    simulTilesMarked = gameboard.getTilesMarked();
                    simulTiles = [...gameboard.getTiles()];
                }   
            }

            simulTiles = [...gameboard.getTiles()];

            console.log(winCounts);
        }

        let winningIndex;
        let highest;

        for (let i=0; i<winCounts.length; ++i) {
            if (winCounts[i]) {
                winningIndex = i;
                highest = winCounts[i];
                break
            }
        }

        console.log(winningIndex);
        console.log(highest);

        for (let i=winningIndex; i<winCounts.length; ++i) {
            if (winCounts[i] && winCounts[i] > highest) {
                winningIndex = i;
                highest = winCounts[i];
            }
        }

        console.log(winningIndex);

        placeMove(winningIndex);
    }

    const makeRandomPlay = (currTiles, marker) => {

        let tileChoice = Math.floor(Math.random() * 9);

        while(currTiles[tileChoice]) {
            tileChoice = Math.floor(Math.random() * 9);
        }

        currTiles[tileChoice] = marker;

        return currTiles
    }

    const {placeMove} = Player(marker);

    return {
        computeMove,
        placeMove,
        makeRandomPlay
    }
};


let player1, player2;

player1 = Player('x');
player2 = Player('o');

let computerPlayer = ComputerPlayer('o');

players = [player1, player2];


const gameboard = (() => {

    const gameboardElement = document.querySelector('.gameboard');
    const winnerElement = document.querySelector('.winner');
    const restartElement = document.querySelector('.restart');

    let tiles = new Array(9);
    let tilesMarked = 0;

    const getTilesMarked = () => {
        return tilesMarked
    }

    const getTiles = () => {
        return tiles
    }
    
    const reset = () => {

        let tileElements = document.querySelectorAll('.tile');

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
                        Gameplay.getActivePlayer().placeMove(parseInt(newTile.id));
                    });
                gameboardElement.append(newTile);
            }    
        }

        tilesMarked = 0;

        if (Gameplay.getActivePlayer().marker === 'o'){
            Gameplay.switchPlayer();
        }


        winnerElement.style.display = 'none';
        gameboardElement.style.opacity = '1';

    }

    const updateTile = (tile, marker) => {

        if (tiles[tile] || tilesMarked === 9) {
            return false
        }

        tiles[tile] = marker;
        tilesMarked++;

        updateDisplay(tile, marker);

        if(Gameplay.checkWin(tiles, marker)) {
            console.log('winner!')
            updateWinner(Gameplay.getActivePlayer().marker);

        }

        else if (tilesMarked === 9){
            updateWinner(null);
        }

        else {
            Gameplay.switchPlayer();
        }

        return true
    }

    const updateDisplay = (tile, marker) => {
        let updatedTile = document.getElementById(tile);
        updatedTile.innerHTML = marker;
    }

    const updateWinner = (winner) => {

        let player;

        winner === 'x' ? player = 'P1' : player = 'P2';
        if (winner) {
            winnerElement.innerHTML = `${player} has won!`;
            console.log(`${player} has won!`);
        }
        else {
            winnerElement.innerHTML = "It's a tie!";
            console.log("it's a tie!");
        }

        tilesMarked = 9;
        winnerElement.style.display = 'block';
        gameboardElement.style.opacity = '0.5';
    }

    restartElement.addEventListener('click', function() {reset()});

    return {
        getTiles,
        getTilesMarked,
        reset,
        updateTile,
        updateDisplay,
        updateWinner,
    }
})();

const Gameplay =(() => {

    let activePlayer = players[0];

    const checkWin = (tiles, marker) => {

        let tilesGrid = [];

        for (let i=0; i<3; ++i){

            let tilesRow = [];

            for (let j=0; j<3; ++j) {
                tilesRow[j] = tiles[j + (i*3)];
            }
            tilesGrid[i] = tilesRow;
        }

        let horizontalCount = 0;
        let verticalCount = 0;
        let downslopeCount = 0;
        let upslopeCount = 0;

        for (let i=0; i<3; ++i) {
            if (horizontalCount === 3) {
                break
            }

            horizontalCount = 0;

            if (verticalCount === 3) {
                break
            }

            verticalCount = 0;

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
            }
        }
        
        let counts = [];
        counts.push(horizontalCount, verticalCount, downslopeCount, upslopeCount);

        for (let count of counts ) {
            if (count === 3) {
                return true
            }
        }

        return false
    }

    const switchPlayer = () => {
        activePlayer === players[0] ? activePlayer = players[1] : activePlayer = players[0];
    }

    const getActivePlayer = () => {
        return activePlayer;
    }

    return {    
        switchPlayer,
        checkWin,
        getActivePlayer
    }
})();

gameboard.reset();