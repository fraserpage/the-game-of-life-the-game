import { libraryContent, txtPatternLibrary } from './library.js'

/*----- app state -----*/ 
let options = {}
let state = {}
const gridObj = []
let cellElem = {}

/*----- cached element references -----*/ 
// Options
const optionsElem = document.getElementById('options')
const cellSizeOptInput = document.getElementById('cell-size')
const toroidalOptInput = document.getElementById('toroidal')
const highLifeOptInput = document.getElementById('highLife')
const cyclesPerTurnOptInput = document.getElementById('cyclesPerTurn')
const lifeCycleTimingOptInput = document.getElementById('life-cycle-timing')
const piecesPerPlayerOptInput = document.getElementById('piecesPerPlayer')
const initBtn = document.getElementById('go')

//Gameplay buttons
const showLibraryBtn = document.getElementById('show-library')
const closeLibraryBtn = document.getElementById('close-library')
const startStopBtn = document.getElementById('start-stop')
const switchPlayer = document.getElementById('switch-player')

//Elements
const gameplayBtnsElem = document.getElementById('gameplay-btns')
const scoreboardElem = document.getElementById('scoreboard')
const gridWrapperElem = document.getElementById('grid-wrapper')
const gridElem = document.getElementById('grid')
const libraryElem = document.getElementById('library')


/*----- event listeners -----*/ 
gridElem.addEventListener('click',(e)=>{
    if(e.target.classList.contains('cell')){
        clickOnCell(e.target)
    }
});

optionsElem.addEventListener('change',(e)=>{
    if (e.target.nodeName === "INPUT"){
        enforceMinMaxInput(e.target)
    }
})

initBtn.addEventListener('click', init)

startStopBtn.addEventListener('click', startStop );

switchPlayer.addEventListener('click',()=>{
    state.currentPlayer = state.currentPlayer ^ 1
    render(state.activeGrid)
});

//Library buttons
showLibraryBtn.addEventListener('click',()=>{
    if (showLibraryBtn.innerText === "Show Library"){
        showLibraryBtn.innerText = "Hide Library"
        libraryElem.classList.remove('hide')
    }
    else{
        showLibraryBtn.innerText = "Show Library"
        libraryElem.classList.add('hide')
    }
});
closeLibraryBtn.addEventListener('click',()=>{
    showLibraryBtn.innerText = "Show Library"
    libraryElem.classList.add('hide')
})

/*----- Game Setup Functions -----*/

function init(){
    options = {
        targetCellSize : parseInt(cellSizeOptInput.value),
        toroidal: toroidalOptInput.checked,
        cyclesPerTurn: parseInt(cyclesPerTurnOptInput.value),
        piecesPerPlayer: parseInt(piecesPerPlayerOptInput.value),
        highLife: highLifeOptInput.checked,
        lifeCycleTiming: parseInt(lifeCycleTimingOptInput.value)
    }
    
    state.currentPlayer = 0
    state.activeGrid = 0
    state.nextGrid = 1
    state.prevHoveredCell
    state.scores = [0,0]
    state.pieces = [options.piecesPerPlayer, options.piecesPerPlayer]
    state.cycleCount = 0

    setupGameScreen()
    buildGridElem()
    initGridObject()
    buildLibraryElem()
    render(state.activeGrid)
}

function initGridObject(){
    for (let g = 0; g < 2; g++){
        gridObj[g] = []
        for (let row = 0; row < state.gridHeight; row++){
            gridObj[g][row] = []
            for (let col = 0; col < state.gridWidth; col++){
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
    gridElem.style.gridTemplateColumns = `repeat(${state.gridWidth}, ${state.cellSize}vw)`
    gridElem.style.gridTemplateRows = `repeat(${state.gridHeight}, ${state.cellSize}vw)`
    gridElem.style.flex = "unset"
}

function render(grid){
    updateGridElem(grid)
    updateScoreboard() 
}

/*----- Options Screen Functions -----*/

function setupGameScreen(){
    optionsElem.style.display = 'none'
    scoreboardElem.style.display = 'block'
    gridWrapperElem.style.display = 'flex'
    gameplayBtnsElem.style.display = 'block'

    state.gridWidth =  Math.floor( gridElem.clientWidth / options.targetCellSize )
    state.gridHeight =  Math.floor( gridElem.clientHeight / options.targetCellSize )
    state.cellSize =  gridElem.clientWidth / state.gridWidth / window.innerWidth * 100
}

function enforceMinMaxInput(input){
    if (parseInt(input.value) > input.max){
        input.value = input.max
    }
    else if (parseInt(input.value) < input.min){
        input.value = input.min
    }
}

/*----- Player Action Functions -----*/

function startStop(){
    if (startStopBtn.innerText === "Go"){
        startStopBtn.innerText = "Stop"
        life()
    }
    else{
        startStopBtn.innerText = "Go"
        clearTimeout(state.timer);
    }
}

function clickOnCell(cell){
    let col = parseInt(cell.dataset.col)
    let row = parseInt(cell.dataset.row)
    addCellToBoardObj(row,col)
    render(state.activeGrid)
}

function addCellToBoardObj(row,col){
    if (state.pieces[state.currentPlayer] > 0 || options.piecesPerPlayer === 0){
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

        let comesToLife = options.highLife ? 
            gridObj[state.activeGrid][row][col].alive === false && (countLife === 3 || countLife === 6 )
            : gridObj[state.activeGrid][row][col].alive === false && (countLife === 3)

        // cell is alive, it stays alive if it has either 2 or 3 live neighbors
        if (gridObj[state.activeGrid][row][col].alive === true && (countLife === 2 || countLife === 3)){
            gridObj[state.nextGrid][row][col] = {alive: true}
            setOwnerOfCell(row,col,countPlayer)
            scores[gridObj[state.nextGrid][row][col].player]++
        }
        // cell is dead, it comes to life if it has 3 live neighbors (or 6 for highlife)
        else if (comesToLife){
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
    state.cycleCount++
    if (state.cycleCount < options.cyclesPerTurn  || options.cyclesPerTurn === 0){
        state.timer = setTimeout(life, options.lifeCycleTiming);
    }
    else{
        state.cycleCount = 0
        startStopBtn.innerText = "Go"
    }
    
}

function setOwnerOfCell(row,col, countPlayer){
    countPlayer[0] > countPlayer[1] ? gridObj[state.nextGrid][row][col].player = 0
    : countPlayer[1] > countPlayer[0] ? gridObj[state.nextGrid][row][col].player = 1 
    : gridObj[state.nextGrid][row][col].player = Math.floor(Math.random() * 2)
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
                                ${displayPiecesPerPlayer()}`
}

function displayPiecesPerPlayer(){
    return options.piecesPerPlayer === 0 ? ""
    : `
       <strong>Pieces to place:</strong>
       Player 1: ${state.pieces[0]} Player 2: ${state.pieces[1]}`
}
/*----- Helper Functions -----*/

function forEachCell(callback){
    for (let row = 0; row < state.gridHeight; row++){
        for (let col = 0; col < state.gridWidth; col++){
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
            if ( sR === -1 ) sR = state.gridHeight - 1
            if ( sC === -1 ) sC = state.gridWidth - 1
            if ( sR === state.gridHeight ) sR = 0
            if ( sC === state.gridWidth ) sC = 0
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
    : Math.min(row + 1, state.gridHeight - 1)
}
function sColMin(col) {
    return options.toroidal ? col - 1
    : Math.max(col - 1,0)
}
function sColMax(col) {
    return options.toroidal ? col + 1
    : Math.min(col + 1,state.gridWidth -1)
}

/*-----  --------------- -----*/
/*----- Library Functions -----*/
/*-----  --------------- -----*/


function buildLibraryElem(){
    for(let pattern = 0; pattern < txtPatternLibrary.length; pattern++){

        interpretTxtPattern(txtPatternLibrary[pattern])
    }
    for(let pattern in libraryContent){
        buildPattern(libraryContent[pattern], pattern)
    } 
}

function interpretTxtPattern(txtPattern){

    let nameSearch = new RegExp("!Name: (.+)")
    let urlSearch = new RegExp("!URL: (.+)")
    let patternLinesSearch = new RegExp("^[.|O]+","gm")
    
    let name = txtPattern.match(nameSearch)
    name ? name = name[1] : name = ""
    let id = kebabCase(name)
    let url = txtPattern.match(urlSearch)
    url ? url = url[1] : ""
    let pattern = [...txtPattern.matchAll(patternLinesSearch)]

    let coords = []
    let width = 0
    for (let row = 0; row < pattern.length; row++){
        let cells = pattern[row][0].split('')
        for (let col = 0; col < cells.length; col++){
            if (cells[col] === "O"){
                coords.push([row,col])
            }
            if (cells.length > width) width = cells.length
        }
    }

    libraryContent[id] = {
        name: name,
        coords: coords,
        url: url,
        height: pattern.length,
        width: width,
    }
}

// Takes a libraryElement pattern object and adds it to the Library DOM element
function buildPattern(pattern, id){
    let label = document.createElement("a")
    label.innerText = pattern.name
    label.href = pattern.url
    label.target = "_blank"
    let patternElm = document.createElement("div")
    patternElm.id = id
    patternElm.className = "pattern"
    patternElm.style.gridTemplateColumns = `repeat(${pattern.width}, ${state.cellSize}vw)`
    patternElm.style.gridTemplateRows = `repeat(${pattern.height}, ${state.cellSize}vw)`
    patternElm.draggable = true
    patternElm.addEventListener("dragstart", dragstart_handler);

    let grid = []
    for (let row = 0; row < pattern.height; row++){
        grid[row] = []
        for (let col = 0; col < pattern.width; col++){
            grid[row][col] = document.createElement("div")
            patternElm.appendChild(grid[row][col])
        }
    }
    for (let coord of pattern.coords){
        grid[coord[0]][coord[1]].className = "coord"
    }
    libraryElem.appendChild(label)
    libraryElem.appendChild(patternElm)
}

const kebabCase = string => string.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase()

/*----- Library Events -----*/

gridElem.addEventListener('dragover',dragover_handler)
gridElem.addEventListener('dragenter',dragenter_handler)
gridElem.addEventListener('dragleave',dragleave_handler)
gridElem.addEventListener('dragend',dragend_handler)
gridElem.addEventListener('drop',drop_handler)

state.dragEnterCounter = 0

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
    if (target !== null){
        if (target.classList.contains('cell')){
            state.hoverTarget = target
            state.hoverTargetBounds.left = state.hoverTarget.offsetLeft
            state.hoverTargetBounds.right = state.hoverTargetBounds.left + state.hoverTarget.offsetWidth
            state.hoverTargetBounds.top = state.hoverTarget.offsetTop
            state.hoverTargetBounds.bottom = state.hoverTargetBounds.top + state.hoverTarget.offsetHeight
        }
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

function forEachCoord(row,col,coords, callback) {
    for (let coord of coords){
        let refRow = coord[0] + row
        let refCol = coord[1] + col
        if (refRow < state.gridHeight && refCol < state.gridWidth){
            callback(refRow,refCol)
        }
    }
}

