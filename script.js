/*----- constants -----*/ 

/*----- app's state (variables) -----*/ 
let options = {}
const gameBoardObj = []
let timer;
/*----- cached element references -----*/ 
const optionsElem = document.getElementById('options')
const scoreboardElem = document.getElementById('scoreboard')
const gameBoardElem = document.getElementById('gameboard')
const cycleBtn = document.getElementById('cycle')
/*----- event listeners -----*/ 

gameBoardElem.addEventListener('click',function(e){
    if(e.target.className == 'cell'){
        clickOnCell(e.target)
    }
});

cycleBtn.addEventListener('click',function(e){

    if (cycleBtn.innerText === "Go"){
        cycleBtn.innerText = "Stop"
        life()
    }
    else{
        cycleBtn.innerText = "Go"
        clearTimeout(timer);
    }
});

/*----- functions -----*/

init()

function init(){
    options = {
        cellSize : 25,
    }
    options.boardWidth =  Math.floor( gameBoardElem.clientWidth / options.cellSize )
    options.boardHeight =  Math.floor( gameBoardElem.clientHeight / options.cellSize )

    buildGameBoardElem()
    buildGameBoardObject()
}

function buildGameBoardObject(){
    for (let row = 0; row < options.boardHeight; row++){
        gameBoardObj[row] = []
        for (let col = 0; col < options.boardWidth; col++){
            gameBoardObj[row][col] = {} 
        }
    }
}

function buildGameBoardElem(){
    gameBoardElem.innerHTML = ""
    loopThroughGameBoard((row,col)=>{
        let cell = document.createElement("div")
        cell.id = 's-'+row+"-"+col
        cell.dataset.row = row
        cell.dataset.col = col            
        cell.className = 'cell'
        gameBoardElem.appendChild(cell)
    })
    
    gameBoardElem.style.gridTemplateColumns = "repeat("+options.boardWidth+", 1fr)"
    gameBoardElem.style.gridTemplateRows = "repeat("+options.boardHeight+", 1fr)"   
}

function clickOnCell(cell){
    let col = parseInt(cell.dataset.col)
    let row = parseInt(cell.dataset.row)
    
    // highlightSurroundingCells(col,row)
    addCellToBoard(row,col)
    drawToGameBoard()
}

function addCellToBoard(row,col){
    let cell = gameBoardObj[row][col]
    if (typeof cell.v === "undefined" || cell.v === 0){
        gameBoardObj[row][col].v = 1
    }
}

function render(){

}

function drawToGameBoard(){
    loopThroughGameBoard((row,col)=>{
        if (gameBoardObj[row][col].v === 1){
            document.getElementById(`s-${row}-${col}`).style.backgroundColor = 'red'
        }
        else{
            document.getElementById(`s-${row}-${col}`).style.backgroundColor = ''
        }
    })
}

function loopThroughGameBoard(callback){
    for (let row = 0; row < options.boardHeight; row++){
        for (let col = 0; col < options.boardWidth; col++){
            callback(row,col)
        }
    }
}
// params: row and col of cell
// callback: row and col of surrounding cells 
function loopThroughSurroundingCells(row, col, callback){
    for (let r = Math.max(row - 1,0); r <= Math.min(row + 1, options.boardHeight - 1); r++){
        for (let c = Math.max(col - 1,0); c <= Math.min(col + 1,options.boardWidth -1); c++){
            if ( r === row && c === col ) continue
            callback(r,c)
        }
    }
}



function life(){
    loopThroughGameBoard((row,col)=>{
        let countLife = 0
        loopThroughSurroundingCells(row,col,(r,c)=>{
            if (gameBoardObj[r][c].v === 1) countLife++
        })
        // cell is alive, it stays alive if it has either 2 or 3 live neighbors
        if (gameBoardObj[row][col].v === 1 && (countLife === 2 || countLife === 3)){}
        // cell is dead, it comes to life if it has 3 live neighbors
        else if (gameBoardObj[row][col].v === 0 && countLife === 3){
            gameBoardObj[row][col].v = 1
        }
        else{ gameBoardObj[row][col].v = 0 }
    })
    drawToGameBoard()
    timer = setTimeout(life, 200);
}

