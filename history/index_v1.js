//// SET GLOBALS ////
var $gameBoard,
    $horClues,
    $vertClues,
    $currentSpace,
    $turboIndicator;

var magicWidth = 400;
var gridWidth;

var HISTORY = []
var TURBOCORRECT = false;
var TURBOWRONG = false;
var TURBOCLEAR = false;
var PUZZLE;
var GAMEOVER = false;
var COORDS = [0,0];
var BOARD = [];

//// END GLOBALS ////

/// SETS HORIZONTAL CLUE ROW SIZE TO FIT GAMEBOARD
function setHorizRows(gridWidth){
    for (var i = 0; i < PUZZLE.numRows; i++) {
        var $newRow = $('<div>').addClass('hor-clue');
        $newRow.attr('data-row-num', i);
        $newRow.css({
            'height': gridWidth + 'px',
            'text-align': 'right'
        });
        $horClues.append($newRow)
    }
}

/// SETS VERTICAL CLUE COLUMN SIZE TO FIT GAMEBOARD
function setVertCols(gridWidth){
    for (var i = 0; i < PUZZLE.numRows; i++) {
        var $newCol = $('<div>').addClass('vert-clue')
        $newCol.attr('data-col-num', i);
        $newCol.css({
            'width': gridWidth + 'px'
        })
        $vertClues.css('display', 'flex');
        $vertClues.append($newCol);
    }
}

//// SETS THE SIZE OF THE GAME BOARD GRID BASED ON SIZE OF PUZZLE
function setSizes(){
    var boardWidth = magicWidth;
    var gridWidth = boardWidth / PUZZLE.numRows;
    boardWidth += (PUZZLE.numRows * 2);

    $gameBoard.width((boardWidth) + 'px');
    $('.game-space').css({
        'width': gridWidth + 'px',
        'height': gridWidth + 'px',
        'margin-bottom': '-4px'
    });

    setHorizRows(gridWidth);
    setVertCols(gridWidth);
}

//// SETS THE VALUE OF THE HORIZONTAL CLUES
function setHorizClues(){
    //iterate through each row
    for (var i = 0; i < PUZZLE.numRows; i++) {
        //store the row array
        var currRow = PUZZLE.clueHor[i];
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
function setVertClues(){
    //iterate through each col
    for (var i = 0; i < PUZZLE.numRows; i++) {
        //store the col array
        var currCol = PUZZLE.clueVert[i];
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
function initClueVals(){
    setHorizClues();
    setVertClues();
}

//// AFTER PAGE RENDER GRABS THE ACTUAL PUZZLE AND THEN SETS GLOBAL VARS
function initBoardVars(){
    $gameBoard = $('#game-board');
    $horClues = $('#hor-clues');
    $vertClues = $('#vert-clues');
    $turboIndicator = $('#turbo-indicator');
    PUZZLE = loadPuzzle;
}

//// CREATES THE ACTUAL PUZZLE BOARD DYNAMICALLY
function initTable(){
    for (var i = 0; i < PUZZLE.numRows; i++) {

        for (var j = 0; j < PUZZLE.numRows; j++) {
            var $newSpace = $('<div>').addClass("game-space");
            var vert = i;
            var hor = j;
            $newSpace.attr('data-x-num', j);
            $newSpace.attr('data-y-num', i);
            $gameBoard.append( $newSpace );
            BOARD.push(0);
        }
    }
    setCurrentSpace();
};

//// SETS THE CURSOR TO THE CURRENT SPACE BASED ON COORDINATE CHANGES
function setCurrentSpace(){
    $('div.current-space').removeClass('current-space');
    $('div[data-x-num="'+COORDS[0]+'"][data-y-num="'+COORDS[1]+'"]').addClass('current-space');
}

///// DETERMINES THE 1...X INDEX BASED ON THE COORDINATES OF THE CURRENT CURSOR SPACE
function getSpaceIndex(){
    return (COORDS[1]*PUZZLE.numRows) + COORDS[0];
}

//// CHANGE THE COLOR OF THE SELECTED SPACE AND THEN CHANGES THE VALUE OF THE INPUT BOARD (i.e. the player's current configuration of the gameboard)
function markSpace(status){
    var $space = $('div[data-x-num="'+COORDS[0]+'"][data-y-num="'+COORDS[1]+'"]');
    $space.removeClass('wrong');
    $space.removeClass('correct');
    var spaceIndex = getSpaceIndex();

    switch(status){
        case 'correct':
            $space.addClass('correct');
            BOARD[spaceIndex] = 1;
            break;
        case 'incorrect':
            $space.addClass('wrong');
            BOARD[spaceIndex] = 0;
            break;
        case 'clear':
            BOARD[spaceIndex] = 0;
        default:
            break;
    }
}

function toggleTurboNotice(){
    $turboIndicator.removeClass();
    if (TURBOCORRECT){
        $turboIndicator.addClass('green-turbo');
        $turboIndicator.children('p').text('CORRECT TURBO');
    } else if (TURBOWRONG){
        $turboIndicator.addClass('red-turbo');
        $turboIndicator.children('p').text('WRONG TURBO');
    } else if (TURBOCLEAR){
        $turboIndicator.addClass('yellow-turbo');
        $turboIndicator.children('p').text('CLEAR TURBO');
    } else {
        $turboIndicator.addClass('no-turbo');
        $turboIndicator.children('p').text('No Turbo');
    }
}

//// THIS FUNCTION CHANGES THE VALUE OF THE CURRENT COORDINATES
//// THEN CALLS FUNCTION TO MOVE CURSOR AND FINALLY TRIGGERS A TEST TO SEE IF THE PLAYER HAS WON
function handleMove(e){
    var keyCode = e.keyCode; // left 37 up 38 right 39 down 40 z 90 x 88
    var boundNum = PUZZLE.numRows - 1;

    if (keyCode === 37){        // LEFT
        if (COORDS[0] === 0){
            COORDS[0] = (boundNum);
        } else {
            COORDS[0] = (COORDS[0]-1);
        }
    } else if (keyCode == 38){ // UP
        if (COORDS[1] === 0){
            COORDS[1] = (boundNum);
        } else {
            COORDS[1] = (COORDS[1] - 1);
        }
    } else if (keyCode == 39){ // RIGHT
        if (COORDS[0] === boundNum){
            COORDS[0] = 0;
        } else {
            COORDS[0] += 1;
        }
    } else if (keyCode == 40){ // DOWN
        if (COORDS[1] === boundNum){
            COORDS[1] = 0;
        } else {
            COORDS[1] += 1;
        }
    } else if (keyCode == 90){ // Z
        markSpace('correct');
    } else if (keyCode == 88){ // X
        markSpace('incorrect');
    } else if (keyCode == 67){
        markSpace('clear');
    } else if (keyCode == 65){
        TURBOCORRECT = !TURBOCORRECT;
        TURBOWRONG = false;
        TURBOCLEAR = false;
        markSpace('correct');
    } else if (keyCode == 83){
        TURBOCORRECT = false;
        TURBOWRONG = !TURBOWRONG;
        TURBOCLEAR = false;
        markSpace('incorrect');
    } else if (keyCode == 68){
        TURBOCORRECT = false;
        TURBOWRONG = false;
        TURBOCLEAR = !TURBOCLEAR;
        markSpace('clear');
    }

    if (TURBOCORRECT){
        markSpace('correct');
    } else if (TURBOWRONG){
        markSpace('incorrect');
    } else if (TURBOCLEAR){
        markSpace('clear');
    }

    toggleTurboNotice();
    //
    // A 65
    // var TURBOCORRECT = false;
    // var TURBOWRONG = false;
    // var TURBOCLEAR = false;
    setCurrentSpace();
    didWin();
}

//// BINDS THE HANDLE MOVE FUNCTION TO THE KEYDOWN EVENT
function initControls(){
    // handleButtons();
    $('body').on('keydown', handleMove);
}

//// INITIALIZES THE GAME BY CREATED THE BOARD, TABLE, CLUES AND THEN CALLS THE EVENT BINDING
function initEnvironment(){

    initBoardVars();
    initTable();

    setSizes();
    initClueVals();

    initControls();
}

//// TEST FOR END GAME CONDITIONS
function didWin(){
    if (JSON.stringify(BOARD) === JSON.stringify(PUZZLE.solutionGrid)){
        console.log('nice');
        // $('body').off(handleMove);
    } else{
        console.log('no good');
        console.log(PUZZLE.solutionGrid);
    }
}

function testFuncs(){
    console.log(determineHorizontalClues(PUZZLE.solutionGrid));
    // console.log(determineVerticalClues(PUZZLE.solutionGrid));
}


//// READY? GO! ////
$(function(){
    initEnvironment();
    testFuncs();
})
