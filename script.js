import { libraryContent } from './library.js'

/*----- constants -----*/ 

/*----- app's state (variables) -----*/ 
let options = {}
let state = {}
const gridObj = []

/*----- cached element references -----*/ 
const optionsElem = document.getElementById('options')
const scoreboardElem = document.getElementById('scoreboard')
const gridElem = document.getElementById('grid')
const libraryElem = document.getElementById('library')
const cycleBtn = document.getElementById('cycle')
const switchPlayer = document.getElementById('switch-player')
/*----- event listeners -----*/ 

gridElem.addEventListener('click',function(e){
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
        clearTimeout(state.timer);
    }
});

switchPlayer.addEventListener('click',function(e){

    state.currentPlayer === 1 ? state.currentPlayer = 2 
    : state.currentPlayer = 1

});

/*----- functions -----*/

init()

function init(){
    options = {
        cellSize : 15,
    }
    options.gridWidth =  Math.floor( gridElem.clientWidth / options.cellSize )
    options.gridHeight =  Math.floor( gridElem.clientHeight / options.cellSize )
    // options.gridWidth = 3  
    // options.gridHeight = 3

    state.currentPlayer = 1
    state.activeGrid = 0
    state.nextGrid = 1

    buildGridElem()
    initGridObject()
}

function initGridObject(){
    for (let g = 0; g < 2; g++){
        gridObj[g] = []
        for (let row = 0; row < options.gridHeight; row++){
            gridObj[g][row] = []
            for (let col = 0; col < options.gridWidth; col++){
                gridObj[g][row][col] = {alive: false}
            }
        }
    }
}

function buildGridElem(){
    gridElem.innerHTML = ""
    forEachCell((row,col)=>{
        let cell = document.createElement("div")
        cell.id = 's-'+row+"-"+col
        cell.dataset.row = row
        cell.dataset.col = col            
        cell.className = 'cell'
        gridElem.appendChild(cell)
    })
    
    gridElem.style.gridTemplateColumns = "repeat("+options.gridWidth+", 1fr)"
    gridElem.style.gridTemplateRows = "repeat("+options.gridHeight+", 1fr)"   
}


function render(){

}



function clickOnCell(cell){
    let col = parseInt(cell.dataset.col)
    let row = parseInt(cell.dataset.row)
    
    // highlightSurroundingCells(col,row)
    addCellToBoardObj(row,col)
    updateGridElem(state.activeGrid)
}

function addCellToBoardObj(row,col){
    let cell = gridObj[state.activeGrid][row][col]
    if (cell.alive === false){
        gridObj[state.activeGrid][row][col] = {alive: true, p: state.currentPlayer, new: true}
    }
    // Allow undoing clicked cells
    else if (cell.new === true  && cell.p === state.currentPlayer){
        gridObj[state.activeGrid][row][col] = {alive: false}
    }
}

function life(){
    forEachCell( (row,col)=>{
        let countLife = 0 
        let countPlayer = {1:0,2:0}
        gridObj[state.nextGrid][row][col] = {alive: false}
        
        forEachSurroundingCell(row,col,(r,c)=>{
            let surroundingCell = gridObj[state.activeGrid][r][c]
            if (surroundingCell.alive === true) countLife++
            if (surroundingCell.p === 1) countPlayer[1]++
            if (surroundingCell.p === 2) countPlayer[2]++
        })

        // cell is alive, it stays alive if it has either 2 or 3 live neighbors
        if (gridObj[state.activeGrid][row][col].alive === true && (countLife === 2 || countLife === 3)){
            gridObj[state.nextGrid][row][col] = {alive: true}
            setOwnerOfCell(row,col,countPlayer)
        }
        // cell is dead, it comes to life if it has 3 live neighbors
        else if (gridObj[state.activeGrid][row][col].alive === false && countLife === 3){
            gridObj[state.nextGrid][row][col] = {alive: true}
            setOwnerOfCell(row,col,countPlayer)
        }
        else{
            gridObj[state.nextGrid][row][col] = {alive: false}
        }
    })
    updateGridElem(state.nextGrid)
    swapActiveGrid()
    state.timer = setTimeout(life, 150);
}

function setOwnerOfCell(row,col, countPlayer){
    countPlayer[1] > 1 ? gridObj[state.nextGrid][row][col].p = 1
    : countPlayer[2] > 1 ? gridObj[state.nextGrid][row][col].p = 2 
    : ""
}

function swapActiveGrid(){
    state.activeGrid = state.activeGrid ^ 1
    state.nextGrid = state.nextGrid ^ 1
}

function updateGridElem(whichGridObj){
    forEachCell((row,col)=>{
        if (gridObj[whichGridObj][row][col].alive === true){
            gridObj[whichGridObj][row][col].p === 1 ?
                document.getElementById(`s-${row}-${col}`).style.backgroundColor = 'red'
                : document.getElementById(`s-${row}-${col}`).style.backgroundColor = 'blue'
        }
        else{
            document.getElementById(`s-${row}-${col}`).style.backgroundColor = ''
        }
    })
}

function forEachCell(callback){
    for (let row = 0; row < options.gridHeight; row++){
        for (let col = 0; col < options.gridWidth; col++){
            callback(row,col)
        }
    }
}
// update this with toroidal option
function forEachSurroundingCell(row, col, callback){
    for (let r = Math.max(row - 1,0); r <= Math.min(row + 1, options.gridHeight - 1); r++){
        for (let c = Math.max(col - 1,0); c <= Math.min(col + 1,options.gridWidth -1); c++){
            if ( r === row && c === col ) continue
            callback(r,c)
        }
    }
}

//Library 

function placeLibraryItem(row,col, coords){
    for (let coord of coords){
        addCellToBoardObj(coord[0] + row, coord[1] + col)
    }
    updateGridElem(state.activeGrid)
}

function buildLibraryElem(){

    for (let pattern in libraryContent){
        let patternElm = document.createElement("div")
        patternElm.id = pattern
        patternElm.className = "pattern"
        patternElm.style.gridTemplateColumns = "repeat("+libraryContent[pattern].width+", 1fr)"
        patternElm.style.gridTemplateRows = "repeat("+libraryContent[pattern].height+", 1fr)" 
        
        let grid = []
        for (let row = 0; row < libraryContent[pattern].height; row++){
            grid[row] = []
            for (let col = 0; col < libraryContent[pattern].width; col++){
                grid[row][col] = document.createElement("div")
                patternElm.appendChild(grid[row][col])
            }
        }
        for (let coord of libraryContent[pattern].coords){
            console.log(coord)
            grid[coord[0]][coord[1]].className = "coord"
        }
        console.log("grid",grid)
        libraryElem.appendChild(patternElm)
    } 
}
buildLibraryElem()