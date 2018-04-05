var Picross = function(){
    this.magicWidth = 400;
    this.gridWidth;

    this.$gameBoard;
    this.$horClues;
    this.$vertClues;
    this.$currentSpace;
    this.$turboIndicator;


    this.history = [];
    this.TURBOCORRECT = false;
    this.TURBOWRONG = false;
    this.TURBOCLEAR = false;
    this.puzzle;
    this.gameOver = false;
    this.coords = [0,0];
    this.board = [];
}

/// SETS HORIZONTAL CLUE ROW SIZE TO FIT GAMEBOARD
Picross.prototype.setHorizRows = function(gridWidth){
    for (var i = 0; i < this.puzzle.numRows; i++) {
        var $newRow = $('<div>').addClass('hor-clue');
        $newRow.attr('data-row-num', i);
        $newRow.css({
            'height': gridWidth + 'px',
            'text-align': 'right'
        });
        this.$horClues.append($newRow)
    }
}

/// SETS VERTICAL CLUE COLUMN SIZE TO FIT GAMEBOARD
Picross.prototype.setVertCols = function(gridWidth){
    for (var i = 0; i < this.puzzle.numRows; i++) {
        var $newCol = $('<div>').addClass('vert-clue')
        $newCol.attr('data-col-num', i);
        $newCol.css({
            'width': gridWidth + 'px'
        })
        this.$vertClues.css('display', 'flex');
        this.$vertClues.append($newCol);
    }
}

//// SETS THE SIZE OF THE GAME BOARD GRID BASED ON SIZE OF PUZZLE
Picross.prototype.setSizes = function(){
    var boardWidth = this.magicWidth;
    var gridWidth = boardWidth / this.puzzle.numRows;
    boardWidth += (this.puzzle.numRows * 2);

    this.$gameBoard.width((boardWidth) + 'px');
    $('.game-space').css({
        'width': gridWidth + 'px',
        'height': gridWidth + 'px',
        'margin-bottom': '-4px'
    });

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
        var $currRowDiv = $('div[data-row-num="'+i+'"]');
        //iterate throug the numbers in the row array
        for (var j = 0; j < currRow.length; j++) {
            //create a span with the clue number
            $currRowDiv.append('<span class="hor-clue">'+currRow[j]+'</span>');
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
        var $currColDiv = $('div[data-col-num="'+i+'"]');
        //iterate throug the numbers in the col array
        for (var j = 0; j < currCol.length; j++) {
            //create a span with the clue number
            $currColDiv.append('<div class="hor-clue">'+currCol[j]+'</span>');
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
    this.$gameBoard = $('#game-board');
    this.$horClues = $('#hor-clues');
    this.$vertClues = $('#vert-clues');
    this.$turboIndicator = $('#turbo-indicator');
    this.puzzle = loadPuzzle;
}

//// CREATES THE ACTUAL puzzle BOARD DYNAMICALLY
Picross.prototype.initTable = function(){
    for (var i = 0; i < this.puzzle.numRows; i++) {

        for (var j = 0; j < this.puzzle.numRows; j++) {
            var $newSpace = $('<div>').addClass("game-space");
            var vert = i;
            var hor = j;
            $newSpace.attr('data-x-num', j);
            $newSpace.attr('data-y-num', i);
            this.$gameBoard.append( $newSpace );
            this.board.push(0);
        }
    }
    this.setCurrentSpace();
};

//// SETS THE CURSOR TO THE CURRENT SPACE BASED ON COORDINATE CHANGES
Picross.prototype.setCurrentSpace = function(){
    $('div.current-space').removeClass('current-space');
    $('div[data-x-num="'+this.coords[0]+'"][data-y-num="'+this.coords[1]+'"]').addClass('current-space');
}

///// DETERMINES THE 1...X INDEX BASED ON THE COORDINATES OF THE CURRENT CURSOR SPACE
Picross.prototype.getSpaceIndex = function(){
    return (this.coords[1]* this.puzzle.numRows) + this.coords[0];
}

//// CHANGE THE COLOR OF THE SELECTED SPACE AND THEN CHANGES THE VALUE OF THE INPUT BOARD (i.e. the player's current configuration of the gameboard)
Picross.prototype.markSpace = function(status){
    var $space = $('div[data-x-num="'+this.coords[0]+'"][data-y-num="'+this.coords[1]+'"]');
    $space.removeClass('wrong');
    $space.removeClass('correct');
    var spaceIndex = this.getSpaceIndex();

    switch(status){
        case 'correct':
            $space.addClass('correct');
            this.board[spaceIndex] = 1;
            break;
        case 'incorrect':
            $space.addClass('wrong');
            this.board[spaceIndex] = 0;
            break;
        case 'clear':
            this.board[spaceIndex] = 0;
        default:
            break;
    }
}

Picross.prototype.toggleTurboNotice = function(){
    this.$turboIndicator.removeClass();
    if (this.TURBOCORRECT){
        this.$turboIndicator.addClass('green-turbo');
        this.$turboIndicator.children('p').text('CORRECT TURBO');
    } else if (this.TURBOWRONG){
        this.$turboIndicator.addClass('red-turbo');
        this.$turboIndicator.children('p').text('WRONG TURBO');
    } else if (this.TURBOCLEAR){
        this.$turboIndicator.addClass('yellow-turbo');
        this.$turboIndicator.children('p').text('CLEAR TURBO');
    } else {
        this.$turboIndicator.addClass('no-turbo');
        this.$turboIndicator.children('p').text('No Turbo');
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
}

//// BINDS THE HANDLE MOVE FUNCTION TO THE KEYDOWN EVENT
Picross.prototype.initControls = function(){
    // MUST BIND THE HANDLER TO THIS IN ORDER TO MAINTAIN CONTEXT FOR CALLBACK
    $('body').on('keydown', this.handleMove.bind(this));
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
