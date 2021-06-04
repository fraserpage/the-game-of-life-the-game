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
const showLibraryBtn = document.getElementById('show-library')
const dragHolder = document.getElementById('drag-holder')
const cycleBtn = document.getElementById('cycle')
const switchPlayer = document.getElementById('switch-player')

/*----- event listeners -----*/ 
gridElem.addEventListener('click',function(e){
    if(e.target.classList.contains('cell')){
        clickOnCell(e.target)
    }
});

// Buttons

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
    render(state.activeGrid)
});

showLibraryBtn.addEventListener('click',function(e){
    if (showLibraryBtn.innerText === "Show Library"){
        showLibraryBtn.innerText = "Hide Library"
        libraryElem.classList.remove('hide')
    }
    else{
        showLibraryBtn.innerText = "Show Library"
        libraryElem.classList.add('hide')
    }
});

/*----- Game Setup Functions -----*/

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
    state.scores = [0,0]
    state.pieces = [10,10]

    buildGridElem()
    initGridObject()
    buildLibraryElem()
    render(state.activeGrid)
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
    gridElem.style.flex = "unset"
}

function render(grid){
    updateGridElem(grid)
    updateScoreboard() 
}

/*----- Player Action Functions -----*/

function clickOnCell(cell){
    let col = parseInt(cell.dataset.col)
    let row = parseInt(cell.dataset.row)
    addCellToBoardObj(row,col)
    render(state.activeGrid)
}

function addCellToBoardObj(row,col){
    if (state.pieces[state.currentPlayer] > 0){
        if (gridObj[state.activeGrid][row][col].alive === false){
            gridObj[state.activeGrid][row][col] = {alive: true, player: state.currentPlayer, new: true}
            state.scores[state.currentPlayer]++
            state.pieces[state.currentPlayer]--
        }
        // Allow undoing clicked cells
        else if (gridObj[state.activeGrid][row][col].new === true  && gridObj[state.activeGrid][row][col].player === state.currentPlayer){
            gridObj[state.activeGrid][row][col] = {alive: false}
            state.scores[state.currentPlayer]--
            state.pieces[state.currentPlayer]++
        }
    }
}

/*----- Life Algorithm Functions -----*/

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
            scores[gridObj[state.nextGrid][row][col].player]++
        }
        // cell is dead, it comes to life if it has 3 live neighbors
        else if (gridObj[state.activeGrid][row][col].alive === false && countLife === 3){
            gridObj[state.nextGrid][row][col] = {alive: true}
            setOwnerOfCell(row,col,countPlayer)
            scores[gridObj[state.nextGrid][row][col].player]++
        }
        else{
            gridObj[state.nextGrid][row][col] = {alive: false}
        }
    })

    state.scores = scores
    render(state.nextGrid)

    // Prepare for next life cycle
    swapActiveGrid()
    state.timer = setTimeout(life, 150);
}

function setOwnerOfCell(row,col, countPlayer){
    countPlayer[0] > 1 ? gridObj[state.nextGrid][row][col].player = 0
    : countPlayer[1] > 1 ? gridObj[state.nextGrid][row][col].player = 1 
    : ""
}

// Switching state.activeGrid and state.nextGrid between 1 and 0 using bitwise XOR
function swapActiveGrid(){
    state.activeGrid = state.activeGrid ^ 1
    state.nextGrid = state.nextGrid ^ 1
}

/*----- Render Functions -----*/

function updateGridElem(whichGridObj){
    forEachCell((row,col)=>{
        if (gridObj[whichGridObj][row][col].alive === true){
            cellElem[`${row}-${col}`].classList = `cell player-${gridObj[whichGridObj][row][col].player}`
        }
        else{
            cellElem[`${row}-${col}`].classList = 'cell'
        }
    })
}

function updateScoreboard() {
    scoreboardElem.innerHTML = `<strong>Player ${state.currentPlayer + 1}'s turn</strong> <br>
                                <strong>Scores</strong>
                                Player 1: ${state.scores[0]} Player 2: ${state.scores[1]} <br>
                                <strong>Pieces to place:</strong>
                                Player 1: ${state.pieces[0]} Player 2: ${state.pieces[1]}`
}

/*----- Helper Functions -----*/

function forEachCell(callback){
    for (let row = 0; row < options.gridHeight; row++){
        for (let col = 0; col < options.gridWidth; col++){
            callback(row,col)
        }
    }
}

function forEachSurroundingCell(row, col, callback){
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

/*-----  --------------- -----*/
/*----- Library Functions -----*/
/*-----  --------------- -----*/


function buildLibraryElem(){

    for (let pattern in libraryContent){
        let patternElm = document.createElement("div")
        patternElm.id = pattern
        patternElm.className = "pattern"
        patternElm.style.gridTemplateColumns = `repeat(${libraryContent[pattern].width}, ${options.cellSize}vw)`
        patternElm.style.gridTemplateRows = `repeat(${libraryContent[pattern].height}, ${options.cellSize}vw)`
        patternElm.draggable = true
        patternElm.addEventListener("dragstart", dragstart_handler);
        // patternElm.addEventListener("mousedown", mousedownPattern);
        // patternElm.addEventListener("mousemove", mousemovePattern);

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

/*----- Library Events -----*/

gridElem.addEventListener('dragover',dragover_handler)
gridElem.addEventListener('dragenter',dragenter_handler)
gridElem.addEventListener('dragleave',dragleave_handler)
gridElem.addEventListener('dragend',dragend_handler)
gridElem.addEventListener('drop',drop_handler)

state.dragEnterCounter = 0
let node 
function mousedownPattern(e) {
    console.log(e)
    let pattern = e.path[1]
    node = pattern.cloneNode(true)
    node.style.position = 'absolute'
    node.style.top = e.clientY - e.offsetY+"px"
    node.style.left = e.clientX - e.offsetX+"px"
    dragHolder.innerHTML = ""
    dragHolder.appendChild(node)
}

function mousemovePattern(e) {
    // console.log(e)

    node.style.top = e.clientY+"px"
    node.style.left = e.clientX+"px"
}

function dragstart_handler(e){
    state.offsetX = e.offsetX - (cellElem["0-0"].offsetWidth / 2)
    state.offsetY = e.offsetY - (cellElem["0-0"].offsetWidth / 2)
    state.prevHoveredCell = {row:false, col:false}
    state.patternElm = e.target
    state.patternElm.classList.add('picked-up')
    libraryElem.classList.add('hide')
    showLibraryBtn.innerText = "Show Library"
    state.hoverPattern = e.target.id
    state.hoverTarget = undefined
    state.hoverTargetBounds = {}
}

function dragover_handler(e) {
    e.preventDefault();
    let x = e.clientX - state.offsetX
    let y = e.clientY - state.offsetY

    if (typeof state.hoverTarget === "undefined") setHoverTarget(x,y) 
    if (typeof state.hoverTarget !== "undefined"){
        //calculate the bounds of the cell so we don't have to call document.elementFromPoint(x, y) constantly
        // honestly not sure if this is working entirely correctly
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
}

function dragenter_handler(e) {
    state.dragEnterCounter++
}

function dragleave_handler(e) {
    //erase the shadow
    state.dragEnterCounter--
    if (state.dragEnterCounter === 0){
        setHoverShadow(state.prevHoveredCell.row,state.prevHoveredCell.col,libraryContent[state.hoverPattern].coords, true)
    }
}

function dragend_handler(e) {
    //erase the shadow
    state.dragEnterCounter === 0
    setHoverShadow(state.prevHoveredCell.row,state.prevHoveredCell.col,libraryContent[state.hoverPattern].coords, true)
    
}

function drop_handler(e) {
    e.preventDefault();
    let row = parseInt(state.hoverTarget.dataset.row,10)
    let col = parseInt(state.hoverTarget.dataset.col,10)
    placeLibraryItem(row, col, libraryContent[state.hoverPattern].coords)

}

function setHoverTarget(x,y) {
    let target = document.elementFromPoint(x, y)
    if (target.classList.contains('cell')){
        state.hoverTarget = target
        state.hoverTargetBounds.left = state.hoverTarget.offsetLeft
        state.hoverTargetBounds.right = state.hoverTargetBounds.left + state.hoverTarget.offsetWidth
        state.hoverTargetBounds.top = state.hoverTarget.offsetTop
        state.hoverTargetBounds.bottom = state.hoverTargetBounds.top + state.hoverTarget.offsetHeight
    }
}




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
    render(state.activeGrid)
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
