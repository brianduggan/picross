function getColumnArray(board){
    var rowLength = Math.sqrt(board.length);
    var colArr = [];
    //CREATE MULTI-D ARRAY FOR COLUMNS
    for(var i = 0; i < rowLength; i++){
      colArr.push([]);
    }
    // DIVIDE BOARD INTO COLUMNS
    for(var i = 0; i < board.length; i++){
      colArr[ i % rowLength ].push(board[i]);
    }
    return colArr;
}


function getRowArray(board){
    var rowLength = Math.sqrt(board.length);
    var horzArr = [];
    /// DIVIDE BOARD INTO ROW ARRAYS
    for (var i = 0; i < rowLength; i++){
        var newArr = board.slice( (i * rowLength) , (rowLength * (i+1))   );
        horzArr.push(newArr);
    }
    return horzArr;
}

function getClueArrays(rowArr){
  var arrClues = [];
  for (var i = 0; i < rowArr.length; i++){
    var currRow = rowArr[i];
    var counter = 0;
    var clueRow = [];
    for(var j = 0; j < currRow.length; j++){
      // increases counter if there is a 1, otherwise pushes counter to   array and resets counter
      if(currRow[j] === 1){
        counter += 1;
      } else if (currRow[j] === 0 && counter){
        clueRow.push(counter);
        counter = 0;
      }

      if (j === (currRow.length-1) && counter){
        clueRow.push(counter);
        arrClues.push(clueRow);
      } else if (j === (currRow.length-1) && clueRow.length === 0){
        arrClues.push([0])
      } else if (j === (currRow.length-1)){
        arrClues.push(clueRow);
      }
    }
  }
  return arrClues;
}


function determineHorizontalClues(board){
    return getClueArrays( getRowArray(board) );
}

function determineVerticalClues(board){
    return getClueArrays( getColumnArray(board) );
}

// console.log(vertClues);


//console.log(horClues);
