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


    this.history = [];
    this.TURBOCORRECT = false;
    this.TURBOWRONG = false;
    this.TURBOCLEAR = false;
    this.turboMode = 'off'
    this.puzzle;
    this.gameOver = false;
    this.coords = [0,0];
    this.board = [];
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
        newCol.classList.add('vert-clue');
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
        //iterate throug the numbers in the col array
        for (var j = 0; j < currCol.length; j++) {
            //create a span with the clue number
            currColDiv.innerHTML += '<div class="hor-clue">'+currCol[j]+'</div>';
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
            newSpace.setAttribute('data-current-space', 'N')
            this.gameBoard.appendChild(newSpace);
            this.board.push(0);
        }
    }
    this.setCurrentSpace();
};

//// SETS THE CURSOR TO THE CURRENT SPACE BASED ON COORDINATE CHANGES
Picross.prototype.setCurrentSpace = function(){
    var currentSpace = document.querySelector('[data-current-space="Y"]');
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

// Picross.prototype.classChange = function(el, classRemove, classAdd){
//     el.classList.map(function(class){
//         console.log(class);
//     })
// }

//// CHANGE THE COLOR OF THE SELECTED SPACE AND THEN CHANGES THE VALUE OF THE INPUT BOARD (i.e. the player's current configuration of the gameboard)
Picross.prototype.markSpace = function(status){
    var space = document.querySelector('[data-x-num="'+this.coords[0]+'"][data-y-num="'+this.coords[1]+'"]')
    space.classList.remove('correct', 'wrong');
    var spaceIndex = this.getSpaceIndex();
    switch(status){
        case 'correct':
            space.classList.add('correct');
            this.board[spaceIndex] = 1;
            break;
        case 'incorrect':
            space.classList.add('wrong');
            this.board[spaceIndex] = 0;
            break;
        case 'clear':
            this.board[spaceIndex] = 0;
        default:
            break;
    }
}

Picross.prototype.toggleTurboNotice = function(){
    if (this.TURBOCORRECT){
        this.turboIndicator.className = 'green-turbo';
        this.turboText.innerHTML = 'CORRECT TURBO';
    } else if (this.TURBOWRONG){
        this.turboIndicator.className = 'red-turbo';
        this.turboText.innerHTML = 'WRONG TURBO';
    } else if (this.TURBOCLEAR){
        this.turboIndicator.className = 'clear-turbo';
        this.turboText.innerHTML = 'CLEAR TURBO';
    } else {
        this.turboIndicator.className = 'no-turbo';
        this.turboText.innerHTML = 'No Turbo';
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
    } else if (keyCode == 38){ // UP
        if (this.coords[1] === 0){
            this.coords[1] = (boundNum);
        } else {
            this.coords[1] = (this.coords[1] - 1);
        }
    } else if (keyCode == 39){ // RIGHT
        if (this.coords[0] === boundNum){
            this.coords[0] = 0;
        } else {
            this.coords[0] += 1;
        }
    } else if (keyCode == 40){ // DOWN
        if (this.coords[1] === boundNum){
            this.coords[1] = 0;
        } else {
            this.coords[1] += 1;
        }
    } else if (keyCode == 90){ // Z
        this.markSpace('correct');
    } else if (keyCode == 88){ // X
        this.markSpace('incorrect');
    } else if (keyCode == 67){
        this.markSpace('clear');
    } else if (keyCode == 65){
        this.TURBOCORRECT = !this.TURBOCORRECT;
        this.TURBOWRONG = false;
        this.TURBOCLEAR = false;
        this.markSpace('correct');
    } else if (keyCode == 83){
        this.TURBOCORRECT = false;
        this.TURBOWRONG = !this.TURBOWRONG;
        this.TURBOCLEAR = false;
        this.markSpace('incorrect');
    } else if (keyCode == 68){
        this.TURBOCORRECT = false;
        this.TURBOWRONG = false;
        this.TURBOCLEAR = !this.TURBOCLEAR;
        this.markSpace('clear');
    }

    if (this.TURBOCORRECT){
        this.markSpace('correct');
    } else if (this.TURBOWRONG){
        this.markSpace('incorrect');
    } else if (this.TURBOCLEAR){
        this.markSpace('clear');
    }

    this.toggleTurboNotice();

    this.setCurrentSpace();
    this.didWin();
};

//// BINDS THE HANDLE MOVE FUNCTION TO THE KEYDOWN EVENT
Picross.prototype.initControls = function(){
    // MUST BIND THE HANDLER TO THIS IN ORDER TO MAINTAIN PICROSS CONTEXT FOR CALLBACK
    $('body').on('keydown', this.handleMove.bind(this));
    // document.addEventListener('keydown', this.handleMove.bind(this));
}

//// INITIALIZES THE GAME BY CREATED THE BOARD, TABLE, CLUES AND THEN CALLS THE EVENT BINDING
Picross.prototype.initEnvironment = function(){

    this.initBoardVars();
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
        // document.querySelector('body').removeEventListener('keydown', this.handleMove);
        // document.querySelector('body').detachEvent('keydown', this.handleMove);
    } else{
        //
    }
}

Picross.prototype.testFuncs = function(){
    console.log('testing...');
    // var helloGame123 = new Picross();
    // console.log(helloGame123);
    // // console.log(determineHorizontalClues(puzzle.solutionGrid));
    // // console.log(determineVerticalClues(puzzle.solutionGrid));
}
