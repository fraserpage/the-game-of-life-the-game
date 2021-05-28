### Background

> (The Game of Life)[https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life], also known simply as Life, is a cellular automaton devised by the British mathematician John Horton Conway in 1970.[1] It is a zero-player game, meaning that its evolution is determined by its initial state, requiring no further input. One interacts with the Game of Life by creating an initial configuration and observing how it evolves. It is Turing complete and can simulate a universal constructor or any other Turing machine.

<img src="https://upload.wikimedia.org/wikipedia/commons/e/e5/Gospers_glider_gun.gif">

The Game of Life is played on a 2-dimensional grid. Cells are either alive or dead, full or empty, and evolve according to these rules:
* If a cell is alive, it stays alive if it has either 2 or 3 live neighbors
* If the cell is dead, it comes alive if it has 3 live neighbors

### But is it a game?

But what if it were a two player turn based game? We will asign a color to cells created by each user and add a new rule: cells take on the color of the majority of its neighbours. A user can defeat their opponent by either taking over their cells or by crowding them and causing them to die.

The boardgame size will be determined by the viewport size. A bigger window, a bigger board. 

To start, the board is divided into halves and each player places a predetermined number of peices on their half of the board. While they are placing their peices, the other half of the board is hidden. 

The game is then allowed to run for a number of cycles (this number is configurable in game settings) after which the players get to place more peices, this time anywhere on the board. This repeats a number of times (another setting) after which the game ends. The player with the most pieces remaining is the winner. 

### Basic program design

On initialization we determine our starting values:
* Gameboard sized based on browser viewport
The following based on game settings
* Initial number of peices players may place
* Number of peices players may place on subsequent turns (perhaps players get a limited number to use, period? This might add some more strategy.)
* Number of lifecycles to run for between turns
* Number of turns after which game ends

On 'start':
