// var removeClass = function(el, )

var Picross = function(){
    //SETS THE WIDTH OF THE ENTIRE GAMEBOARD AND ITS GRIDS
    this.magicWidth = 400;
    this.gridWidth;

    //DOM LOCATIONS FOR VARIABLE PORTIONS OF THE BOARD
    this.gameBoard;
    this.horClues;
    this.vertClues;
    this.turboIndicator;
    this.turboText;


    this.undoStack = [];
    this.redoStack = [];

    this.turbocorrect = false;
    this.turbowrong = false;
    this.turboclear = false;
    this.turboMode = 'off'
    this.puzzle;
    this.gameOver = false;
    this.coords = [0,0];
    this.board = [];

    this.createMode;
}

/// SETS HORIZONTAL CLUE ROW SIZE TO FIT GAMEBOARD
Picross.prototype.setHorizRows = function(gridWidth){
    for (var i = 0; i < this.puzzle.numRows; i++) {
        var newRow = document.createElement('div');

        newRow.classList.add('hor-clue');
        newRow.setAttribute('data-row-num', i);
        newRow.style.height = gridWidth + 'px';
        newRow.style['text-align'] = 'right';

        this.horClues.appendChild(newRow);
    }
}

/// SETS VERTICAL CLUE COLUMN SIZE TO FIT GAMEBOARD
Picross.prototype.setVertCols = function(gridWidth){
    for (var i = 0; i < this.puzzle.numRows; i++) {

        var newCol = document.createElement('div');
        newCol.classList.add('vert-clue-col');
        newCol.setAttribute('data-col-num', i);
        newCol.style.width = gridWidth + 'px';

        this.vertClues.style.display = 'flex';
        this.vertClues.appendChild(newCol);
    }
}

//// SETS THE SIZE OF THE GAME BOARD GRID BASED ON SIZE OF PUZZLE
Picross.prototype.setSizes = function(){
    var boardWidth = this.magicWidth;
    var gridWidth = boardWidth / this.puzzle.numRows;
    boardWidth += (this.puzzle.numRows * 2);

    this.gameBoard.style.width = (boardWidth) + 'px';
    var gameSpaces = document.getElementsByClassName('game-space');
    for (var i = 0; i < gameSpaces.length; i++) {
        gameSpaces[i].style.width = gridWidth + 'px';
        gameSpaces[i].style.height = gridWidth + 'px';
        gameSpaces[i].style['margin-bottom'] = '-4px';
    }
    this.setHorizRows(gridWidth);
    this.setVertCols(gridWidth);
}

//// SETS THE VALUE OF THE HORIZONTAL CLUES
Picross.prototype.setHorizClues = function(){
    //iterate through each row
    for (var i = 0; i < this.puzzle.numRows; i++) {
        //store the row array
        var currRow = this.puzzle.clueHor[i];
        //store the div to put the values into
        var currRowDiv = document.querySelector('div[data-row-num="'+i+'"]');
        currRowDiv.innerHTML = "";
        //iterate throug the numbers in the row array
        for (var j = 0; j < currRow.length; j++) {
            //create a span with the clue number
            currRowDiv.innerHTML += '<span class="hor-clue">'+currRow[j]+'</span>';
        }
    }
}

//// SETS THE VALUE OF THE VERTICAL CLUES
Picross.prototype.setVertClues = function(){
    //iterate through each col
    for (var i = 0; i < this.puzzle.numRows; i++) {
        //store the col array
        var currCol = this.puzzle.clueVert[i];
        //store the div to put the values into
        var currColDiv = document.querySelector('div[data-col-num="'+i+'"]');
        currColDiv.innerHTML = "";
        //iterate throug the numbers in the col array
        for (var j = 0; j < currCol.length; j++) {
            //create a span with the clue number
            currColDiv.innerHTML += '<div class="vert-clue">'+currCol[j]+'</div>';
        }
    }
}

//// TRIGGERS THE SETTING OF THE CLUE ROWS AND COLUMNS
Picross.prototype.initClueVals = function(){
    this.setHorizClues();
    this.setVertClues();
}

//// AFTER PAGE RENDER GRABS THE ACTUAL puzzle AND THEN SETS GLOBAL VARS
Picross.prototype.initBoardVars = function(){
    this.gameBoard = document.getElementById('game-board');
    this.horClues = document.getElementById('hor-clues');
    this.vertClues = document.getElementById('vert-clues');
    this.turboIndicator = document.getElementById('turbo-indicator');
    this.turboText = document.getElementById('turbo-text');
}

Picross.prototype.loadPuzzle = function(){
    this.puzzle = loadPuzzle;
}

//// CREATES THE ACTUAL puzzle BOARD DYNAMICALLY
Picross.prototype.initTable = function(){
    for (var i = 0; i < this.puzzle.numRows; i++) {
        for (var j = 0; j < this.puzzle.numRows; j++) {
            var newSpace = document.createElement('div');
            newSpace.classList.add('game-space');
            newSpace.setAttribute('data-x-num', j);
            newSpace.setAttribute('data-y-num', i);
            newSpace.setAttribute('data-current-space', 'N');
            newSpace.setAttribute('data-status', 'clear');
            this.gameBoard.appendChild(newSpace);
            this.createMode ? this.puzzle.solutionGrid.push(0) : this.board.push(0);
        }
    }
    this.setCurrentSpace();
};

//// SETS THE CURSOR TO THE CURRENT SPACE BASED ON COORDINATE CHANGES
Picross.prototype.setCurrentSpace = function(){
    var currentSpace = document.querySelector('[data-current-space="Y"]');
    console.log(this.coords);
    var newSpace = document.querySelector(
        '[data-x-num="'+this.coords[0]+
        '"][data-y-num="'+
        this.coords[1]+
        '"]');
    if (currentSpace){
        currentSpace.setAttribute('data-current-space', 'N');
    }
    newSpace.setAttribute('data-current-space', 'Y');
}

///// DETERMINES THE 1...X INDEX BASED ON THE COORDINATES OF THE CURRENT CURSOR SPACE
Picross.prototype.getSpaceIndex = function(){
    return (this.coords[1]* this.puzzle.numRows) + this.coords[0];
}

Picross.prototype.getCurrentSpaceDiv = function(){
    return document.querySelector('[data-x-num="'+this.coords[0]+'"][data-y-num="'+this.coords[1]+'"]')
}

Picross.prototype.getSpaceByCoords = function(x,y){
    return document.querySelector('[data-x-num="'+x+'"][data-y-num="'+y+'"]')
}

//// CHANGE THE COLOR OF THE SELECTED SPACE AND THEN CHANGES THE VALUE OF THE INPUT BOARD (i.e. the player's current configuration of the gameboard)
Picross.prototype.markSpace = function(status){
    var space = this.getCurrentSpaceDiv();

    var formerState = space.getAttribute('data-status');
    var xCoord = space.getAttribute('data-x-num');
    var yCoord = space.getAttribute('data-y-num');
    var spaceIndex = this.getSpaceIndex();

    var savedMove = {
        coords: [xCoord, yCoord],
        newState: status,
        formerState: formerState,
        spaceIndex: spaceIndex
    }

    switch(status){
        case 'correct':
            space.setAttribute('data-status', 'correct');
            this.createMode ? this.puzzle.solutionGrid[spaceIndex] = 1 : this.board[spaceIndex] = 1;
            break;
        case 'wrong':
            space.setAttribute('data-status', 'wrong');
            this.createMode ? this.puzzle.solutionGrid[spaceIndex] = 0 : this.board[spaceIndex] = 0;
            break;
        case 'clear':
            space.setAttribute('data-status', 'clear');
            this.createMode ? this.puzzle.solutionGrid[spaceIndex] = 0 : this.board[spaceIndex] = 0;
        default:
            break;
    }
    this.undoStack.push(savedMove);
    this.redoStack = [];
}

Picross.prototype.toggleTurboNotice = function(){
    if (this.turbocorrect){
        this.turboIndicator.className = 'green-turbo';
        this.turboText.innerHTML = 'CORRECT TURBO';
    } else if (this.turbowrong){
        this.turboIndicator.className = 'red-turbo';
        this.turboText.innerHTML = 'WRONG TURBO';
    } else if (this.turboclear){
        this.turboIndicator.className = 'clear-turbo';
        this.turboText.innerHTML = 'CLEAR TURBO';
    } else {
        this.turboIndicator.className = 'no-turbo';
        this.turboText.innerHTML = 'No Turbo';
    }
}

Picross.prototype.undoMove = function(){
    var lastMove = this.undoStack.pop();
    if (lastMove){
        this.redoStack.unshift(lastMove);
        console.log(lastMove);
        var space = this.getSpaceByCoords(lastMove.coords[0], lastMove.coords[1]);
        this.coords = [
            parseInt(lastMove.coords[0]),
            parseInt(lastMove.coords[1])
        ];
        if (lastMove.formerState === 'correct'){
            this.createMode
                ? this.puzzle.solutionGrid[lastMove.spaceIndex] = 1
                : this.board[lastMove.spaceIndex] = 1;
        } else {
            this.createMode
                ? this.puzzle.solutionGrid[lastMove.spaceIndex] = 0
                : this.board[lastMove.spaceIndex] = 0;
        }

        this.setCurrentSpace();
        space.setAttribute('data-status', lastMove.formerState);
    }
}

Picross.prototype.redoMove = function(){
    var redoMove = this.redoStack.shift();
    if (redoMove){
        this.undoStack.push(redoMove);
        var space = this.getSpaceByCoords(redoMove.coords[0], redoMove.coords[1]);
        this.coords = [
            parseInt(redoMove.coords[0]),
            parseInt(redoMove.coords[1])
        ];

        if (redoMove.newState === 'correct'){
            this.createMode
                ? this.puzzle.solutionGrid[redoMove.spaceIndex] = 1
                : this.board[redoMove.spaceIndex] = 1;
        } else {
            this.createMode
                ? this.puzzle.solutionGrid[redoMove.spaceIndex] = 0
                : this.board[redoMove.spaceIndex] = 0;
        }

        this.setCurrentSpace();
        space.setAttribute('data-status', redoMove.newState);
    }
}

Picross.prototype.checkTurboMove = function(){
    if (this.turbocorrect){
        this.markSpace('correct');
    } else if (this.turbowrong){
        this.markSpace('wrong');
    } else if (this.turboclear){
        this.markSpace('clear');
    }
}

//// THIS FUNCTION CHANGES THE VALUE OF THE CURRENT COORDINATES
//// THEN CALLS FUNCTION TO MOVE CURSOR AND FINALLY TRIGGERS A TEST TO SEE IF THE PLAYER HAS WON
Picross.prototype.handleMove = function(e){
    var keyCode = e.keyCode; // left 37 up 38 right 39 down 40 z 90 x 88
    var boundNum = this.puzzle.numRows - 1;

    if (keyCode === 37){        // LEFT
        if (this.coords[0] === 0){
            this.coords[0] = (boundNum);
        } else {
            this.coords[0] = (this.coords[0]-1);
        }
        this.checkTurboMove();
    } else if (keyCode == 38){ // UP
        if (this.coords[1] === 0){
            this.coords[1] = (boundNum);
        } else {
            this.coords[1] = (this.coords[1] - 1);
        }
        this.checkTurboMove();
    } else if (keyCode == 39){ // RIGHT
        if (this.coords[0] === boundNum){
            this.coords[0] = 0;
        } else {
            this.coords[0] += 1;
        }
        this.checkTurboMove();
    } else if (keyCode == 40){ // DOWN
        if (this.coords[1] === boundNum){
            this.coords[1] = 0;
        } else {
            this.coords[1] += 1;
        }
        this.checkTurboMove();
    } else if (keyCode == 90){ // Z
        this.markSpace('correct');
    } else if (keyCode == 88){ // X
        this.markSpace('wrong');
    } else if (keyCode == 67){
        this.markSpace('clear');
    } else if (keyCode == 65){
        this.turbocorrect = !this.turbocorrect;
        this.turbowrong = false;
        this.turboclear = false;
        this.markSpace('correct');
    } else if (keyCode == 83){
        this.turbocorrect = false;
        this.turbowrong = !this.turbowrong;
        this.turboclear = false;
        this.markSpace('wrong');
    } else if (keyCode == 68){
        this.turbocorrect = false;
        this.turbowrong = false;
        this.turboclear = !this.turboclear;
        this.markSpace('clear');
    } else if (keyCode == 81){ // Q -- UNDO
        console.log(this.undoStack)
        this.undoMove();
    } else if (keyCode == 87){ // W -- REDO
        console.log(this.redoStack);
        this.redoMove();
    }

    this.toggleTurboNotice();

    this.setCurrentSpace();

    if (this.createMode){
        this.determineVerticalClueColumns();
        this.determineHorizontalClueColumns();
    }

    this.didWin();
};

//// BINDS THE HANDLE MOVE FUNCTION TO THE KEYDOWN EVENT
Picross.prototype.initControls = function(){
    // MUST BIND THE HANDLER TO THIS IN ORDER TO MAINTAIN PICROSS CONTEXT FOR CALLBACK
    $('body').on('keydown', this.handleMove.bind(this));
    // window.addEventListener('keydown', this.handleMove.bind(this));
}

//// INITIALIZES THE GAME BY CREATED THE BOARD, TABLE, CLUES AND THEN CALLS THE EVENT BINDING
Picross.prototype.initGameEnvironment = function(){

    this.initBoardVars();
    this.loadPuzzle();
    this.initTable();

    this.setSizes();
    this.initClueVals();

    this.initControls();
}

//// TEST FOR END GAME CONDITIONS
Picross.prototype.didWin = function(){
    if (JSON.stringify(this.board) === JSON.stringify(this.puzzle.solutionGrid)){
        console.log('nice');
        // STOPS GAMEPLAY... SHOULD POSSIBLY CHANGE WHAT ELEMENT IS BEING BINDED
        $('body').off();
        // window.removeEventListener('keydown', this.handleMove);
        // document.querySelector('body').detachEvent('keydown', this.handleMove);
    } else{
        //
        console.log('nope!');
    }
}

Picross.prototype.testFuncs = function(){
    console.log('testing...');
}


/////////////// CREATOR FUNCTIONS ///////////

Picross.prototype.promptQuizSize = function(){
    // THIS WILL PROBABLY BE A NON-LIB FUNCTION
    // WILL CODE A PROMPT HERE LATER, WILL START WITH 10x10
    this.puzzle.solutionGrid = []
    this.puzzle.numRows = 10;

}

Picross.prototype.determineVerticalClueColumns = function(){
    this.puzzle.clueVert = determineVerticalClues(this.puzzle.solutionGrid);
    this.setVertClues();
}

Picross.prototype.determineHorizontalClueColumns = function(){
    this.puzzle.clueHor = determineHorizontalClues(this.puzzle.solutionGrid);
    this.setHorizClues();
}

Picross.prototype.puzzle2JSON = function(){
    console.log(this.puzzle);
    return this.puzzle;
}

Picross.prototype.initSaveButton = function(){
    var saveButton = document.getElementById('save-puzzle');
    var self = this;
    saveButton.addEventListener('click', function(e){
        e.preventDefault();
        var puzzleJSON = self.puzzle2JSON();
        console.log(puzzleJSON);
    })
}

Picross.prototype.initCreatorEnvironment = function(){
    this.initBoardVars();
    this.loadPuzzle();
    this.promptQuizSize();

    this.createMode = true;
    this.initTable();

    this.setSizes();

    this.initControls();
    this.initSaveButton();

}
