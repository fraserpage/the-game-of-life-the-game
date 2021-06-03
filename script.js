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

    state.currentPlayer === 1 ? state.currentPlayer = 2 
    : state.currentPlayer = 1

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


    
    state.currentPlayer = 1
    state.activeGrid = 0
    state.nextGrid = 1
    state.prevHoveredCell


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
                cellElem[`${row}-${col}`].style.backgroundColor = 'red'
                : cellElem[`${row}-${col}`].style.backgroundColor = 'blue'
        }
        else{
            cellElem[`${row}-${col}`].style.backgroundColor = ''
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
    for (let r = Math.max(row - 1,0); r <= Math.min(row + 1, options.gridHeight - 1); r++){
        for (let c = Math.max(col - 1,0); c <= Math.min(col + 1,options.gridWidth -1); c++){
            if ( r === row && c === col ) continue
            callback(r,c)
        }
    }
    if (options.toroidal){
        toroidalLoop(row, col, callback)
    }
    
}

function toroidalLoop(row, col, callback) {
    if (row === 0){
        let r = options.gridHeight - 1;
        for (let c = Math.max(col - 1,0); c <= Math.min(col + 1,options.gridWidth -1); c++){
            callback(r,c)
        } 
    }
    if (row === options.gridHeight - 1){
        let r = 0;
        for (let c = Math.max(col - 1,0); c <= Math.min(col + 1,options.gridWidth -1); c++){
            callback(r,c)
        } 
    }
    if (col === 0){
        let c = options.gridWidth - 1;
        for (let r = Math.max(row - 1,0); r <= Math.min(row + 1, options.gridHeight - 1); r++){
            callback(r,c)
        } 
    }
    if (col === options.gridWidth - 1){
        let c = 0;
        for (let r = Math.max(row - 1,0); r <= Math.min(row + 1, options.gridHeight - 1); r++){
            callback(r,c)
        } 
    }
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
buildLibraryElem()


// placeLibraryItem(1,1,libraryContent['r-pentomino'].coords)


console.log(cellElem["0-0"].offsetWidth)

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
    e.dataTransfer.dropEffect = "move";
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
                cellElem[`${refRow}-${refCol}`].style.backgroundColor = ''
            }
            else{
                cellElem[`${refRow}-${refCol}`].style.backgroundColor = '#999'
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

function forEachCoord(row,col,coords, callback) {
    for (let coord of coords){
        let refRow = coord[0] + row
        let refCol = coord[1] + col
        if (refRow < options.gridHeight && refCol < options.gridWidth){
            callback(refRow,refCol)
        }
    }
}


function colToroidal(col) {
    if (col <= 0){
        return options.gridWidth - col - 1
    }
    else if(col >= options.gridWidth - 1){
        return 0
    }
    else{
        return col
    }
}

function rowToroidal(row) {
    if (row <= 0){
        return options.gridHeight - 1
    }
    else if(row >= options.gridHeight - 1){
        return 0
    }
    else{
        return row
    }
}

// Utilities

/**
 * Returns a number whose value is limited to the given range.
 *
 * Example: limit the output of this computation to between 0 and 255
 * (x * 255).clamp(0, 255)
 *
 * @param {Number} min The lower boundary of the output range
 * @param {Number} number The number to be clamped
 * @param {Number} max The upper boundary of the output range
 * @returns A number in the range [min, max]
 * @type Number
 */
function clamp(min, number, max) {
    return Math.min(Math.max(number, min), max);
  };

function clampRow(row) {
    return clamp(0, row, options.gridHeight - 1)
}

function clampCol(col) {
    return clamp(0, col, options.gridWidth - 1)
}