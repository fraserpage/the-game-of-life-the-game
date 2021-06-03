import { libraryContent } from './library.js'

/*----- constants -----*/ 

/*----- app's state (variables) -----*/ 
let options = {}
let state = {}
const gridObj = []
let cellElem = {}

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

    state.currentPlayer = state.currentPlayer ^ 1

});

/*----- functions -----*/


init()

function init(){
    options = {
        targetCellSize : 20,
        toroidal: true
    }
    options.gridWidth =  Math.floor( gridElem.clientWidth / options.targetCellSize )
    options.gridHeight =  Math.floor( gridElem.clientHeight / options.targetCellSize )
    options.cellSize =  gridElem.clientWidth / options.gridWidth / window.innerWidth * 100
    
    state.currentPlayer = 0
    state.activeGrid = 0
    state.nextGrid = 1
    state.prevHoveredCell

    buildGridElem()
    initGridObject()
    buildLibraryElem()
}

function initGridObject(){
    for (let g = 0; g < 2; g++){
        gridObj[g] = []
        for (let row = 0; row < options.gridHeight; row++){
            gridObj[g][row] = []
            for (let col = 0; col < options.gridWidth; col++){
                gridObj[g][row][col] = {alive: false}
                cellElem[`${row}-${col}`] = document.getElementById(`s-${row}-${col}`)
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
    gridElem.style.gridTemplateColumns = `repeat(${options.gridWidth}, ${options.cellSize}vw)`
    gridElem.style.gridTemplateRows = `repeat(${options.gridHeight}, ${options.cellSize}vw)`
}

function render(){

}



function clickOnCell(cell){
    let col = parseInt(cell.dataset.col)
    let row = parseInt(cell.dataset.row)
    
    addCellToBoardObj(row,col)
    updateGridElem(state.activeGrid)
    // highlightSurroundingCells(row, col)
}

function addCellToBoardObj(row,col){
    let cell = gridObj[state.activeGrid][row][col]
    if (cell.alive === false){
        gridObj[state.activeGrid][row][col] = {alive: true, player: state.currentPlayer, new: true}
    }
    // Allow undoing clicked cells
    else if (cell.new === true  && cell.player === state.currentPlayer){
        gridObj[state.activeGrid][row][col] = {alive: false}
    }
}

function life(){
    let scores = [0,0]
    forEachCell( (row,col)=>{
        let countLife = 0 
        let countPlayer = [0,0]
        gridObj[state.nextGrid][row][col] = {alive: false}
        
        forEachSurroundingCell(row,col,(r,c)=>{
            let surroundingCell = gridObj[state.activeGrid][r][c]
            if (surroundingCell.alive === true) countLife++
            if (surroundingCell.player === 0) countPlayer[0]++
            if (surroundingCell.player === 1) countPlayer[1]++
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
    countPlayer[0] > 1 ? gridObj[state.nextGrid][row][col].player = 0
    : countPlayer[1] > 1 ? gridObj[state.nextGrid][row][col].player = 1 
    : ""
}

function swapActiveGrid(){
    state.activeGrid = state.activeGrid ^ 1
    state.nextGrid = state.nextGrid ^ 1
}

function updateGridElem(whichGridObj){
    forEachCell((row,col)=>{
        if (gridObj[whichGridObj][row][col].alive === true){
            cellElem[`${row}-${col}`].dataset.player = gridObj[whichGridObj][row][col].player
        }
        else{
            cellElem[`${row}-${col}`].dataset.player = ''
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

function forEachSurroundingCell(row, col, callback){
    // loop starts at 0 or 1 up from current
    // loop goes until 1 down from current row or bottom row
    for (let r = sRowMin(row) ; r <= sRowMax(row); r++){
        for (let c = sColMin(col); c <= sColMax(col); c++){
            if ( r === row && c === col ) continue
            let sR = r
            let sC = c
            if ( sR === -1 ) sR = options.gridHeight - 1
            if ( sC === -1 ) sC = options.gridWidth - 1
            if ( sR === options.gridHeight ) sR = 0
            if ( sC === options.gridWidth ) sC = 0
            callback(sR,sC)
        }
    }   
}

function sRowMin(row) {
    return options.toroidal ? row - 1
    : Math.max(row - 1,0)
}
function sRowMax(row) {
    return options.toroidal ? row + 1
    : Math.min(row + 1, options.gridHeight - 1)
}
function sColMin(col) {
    return options.toroidal ? col - 1
    : Math.max(col - 1,0)
}
function sColMax(col) {
    return options.toroidal ? col + 1
    : Math.min(col + 1,options.gridWidth -1)
}

//Library 

function buildLibraryElem(){

    for (let pattern in libraryContent){
        let patternElm = document.createElement("div")
        patternElm.id = pattern
        patternElm.className = "pattern"
        patternElm.style.gridTemplateColumns = `repeat(${libraryContent[pattern].width}, ${options.cellSize}vw)`
        patternElm.style.gridTemplateRows = `repeat(${libraryContent[pattern].height}, ${options.cellSize}vw)`
        patternElm.draggable = true
        patternElm.addEventListener("dragstart", dragstart_handler);

        let grid = []
        for (let row = 0; row < libraryContent[pattern].height; row++){
            grid[row] = []
            for (let col = 0; col < libraryContent[pattern].width; col++){
                grid[row][col] = document.createElement("div")
                patternElm.appendChild(grid[row][col])
            }
        }
        for (let coord of libraryContent[pattern].coords){
            grid[coord[0]][coord[1]].className = "coord"
        }
        libraryElem.appendChild(patternElm)
    } 
}




function dragstart_handler(e){
    state.offsetX = e.offsetX - (cellElem["0-0"].offsetWidth / 2)
    state.offsetY = e.offsetY - (cellElem["0-0"].offsetWidth / 2)
    state.prevHoveredCell = {row:false,col:false}
    state.hoverPattern = e.target.id
    state.hoverTarget = ""
    state.hoverTargetBounds = {}
}

function dragover_handler(e) {
    e.preventDefault();
    let x = e.clientX - state.offsetX
    let y = e.clientY - state.offsetY

    if (state.hoverTarget === "") setHoverTarget(x,y) 

    //calculate the bounds of the cell so we don't have to call document.elementFromPoint(x, y) constantly
    // honestly not sure if this is working
    if ((x < state.hoverTargetBounds.left || x > state.hoverTargetBounds.right) ||
        (y < state.hoverTargetBounds.top || y > state.hoverTargetBounds.bottom)) {
            
        setHoverTarget(x,y) 
    }
    
    let row = parseInt(state.hoverTarget.dataset.row,10)
    let col = parseInt(state.hoverTarget.dataset.col,10)

    if  ( ! Number.isNaN(row) && !Number.isNaN(col)) {
        hover(row, col, libraryContent[state.hoverPattern].coords)
    }
}

function setHoverTarget(x,y) {
    state.hoverTarget = document.elementFromPoint(x, y)
    state.hoverTargetBounds.left = state.hoverTarget.offsetLeft
    state.hoverTargetBounds.right = state.hoverTargetBounds.left + state.hoverTarget.offsetWidth
    state.hoverTargetBounds.top = state.hoverTarget.offsetTop
    state.hoverTargetBounds.bottom = state.hoverTargetBounds.top + state.hoverTarget.offsetHeight
}

function drop_handler(e) {
    e.preventDefault();
    let row = parseInt(state.hoverTarget.dataset.row,10)
    let col = parseInt(state.hoverTarget.dataset.col,10)
    placeLibraryItem(row, col, libraryContent[state.hoverPattern].coords)

}
gridElem.addEventListener('dragover',dragover_handler)
gridElem.addEventListener('drop',drop_handler)


function hover(row, col, coords) {
    if (state.prevHoveredCell.row !== row || state.prevHoveredCell.col !== col){
        // erase the old one
        setHoverShadow(state.prevHoveredCell.row,state.prevHoveredCell.col,coords, true)
        // add the new one
        setHoverShadow(row,col,coords, false)
        state.prevHoveredCell = {row:row,col:col}
    }
}

function setHoverShadow(row,col,coords, erase){
    forEachCoord(row,col,coords, (refRow,refCol)=>{
        if (gridObj[state.activeGrid][refRow][refCol].alive === false){
            if (erase === true){
                cellElem[`${refRow}-${refCol}`].classList.remove('hover')
            }
            else{
                cellElem[`${refRow}-${refCol}`].classList.add('hover')
            }
        }
    })
}

function placeLibraryItem(row,col, coords){
    forEachCoord(row,col,coords, (refRow,refCol)=>{
        addCellToBoardObj(refRow, refCol)
    })
    updateGridElem(state.activeGrid)
}

/**
  * Loop through a library element's coordinates and pass their position on the main grid to a callback function.
  *
  * @function forEachCoord
  * @param {int} row - The row of the main grid that the topmost cells of the library element will be placed in
  * @param {int} col - The col of the main grid that the leftmost cells of the library element will be placed in
  * @param {int[][]} coords - An array of coordinates of the cells in the pattern
  * @param {int} coords[][] - The x, y coordinates of the cell of the pattern
  * @param {function(int, int)} callback - A callback to run with the coordinates of the cell on the main grid
  */
function forEachCoord(row,col,coords, callback) {
    for (let coord of coords){
        let refRow = coord[0] + row
        let refCol = coord[1] + col
        if (refRow < options.gridHeight && refCol < options.gridWidth){
            callback(refRow,refCol)
        }
    }
}
