# The Game of Life: The Game

## Background

> [The Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life), also known simply as Life, is a cellular automaton devised by the British mathematician John Horton Conway in 1970.[1] It is a zero-player game, meaning that its evolution is determined by its initial state, requiring no further input. One interacts with the Game of Life by creating an initial configuration and observing how it evolves. It is Turing complete and can simulate a universal constructor or any other Turing machine.

<img src="https://upload.wikimedia.org/wikipedia/commons/e/e5/Gospers_glider_gun.gif">

The Game of Life is played on a 2-dimensional grid. Cells are either alive or dead, full or empty, and evolve according to these rules:
* If a cell is alive, it stays alive if it has either 2 or 3 live neighbors
* If the cell is dead, it comes to life if it has 3 live neighbors


## But is it a game?

What if Conway's Life were a two player turn based game? I'm honestly not too sure how well it will work but let's try. 

We will asign a color to cells created by each user and add a new rule: cells take on the color of the majority of its neighbours. A user can defeat their opponent by either taking over their cells or by crowding them and causing them to die.

The boardgame size will be determined by the viewport size. A bigger window, a bigger board. Why not?

To start, the board is divided into halves and each player places their peices on their half of the board. While they are placing their peices, the other half of the board is hidden so that player 2 doesn't get an unfair advantage. 

The game is then allowed to run for a number of cycles (this number is configurable in game settings) after which the players get to place more peices, this time anywhere on the board. Player 1's moves are agian hidden from player 2 while player 2 places their pieces. If players have placed pieces on the same square, they cancel each other out. 

Players have a fixed number of pieces they may place (a game setting). They may place as many or as few as they like on each turn. When neither player has any pieces left the game runs for a final cycle and then ends. The player with the most pieces remaining is the winner. 

## Mockup
<img src="Mockup.png">
<a href="https://www.figma.com/file/qr4g6X5nYcG97pEG1GGE64/The-Game-of-Life-The-Game">Figma document</a>

## High level program design

**On initialization** we determine our starting values:
* Gameboard sized based on browser viewport - initalized as a 2d array
The following based on game settings
* Number of peices per player
* Number of lifecycles to run for between turns
* A scoreboard object to hold a count of each player's pieces

**On 'start'** 
* Player's turn:
  * If first turn, hide other player's half of the board
  * Else if second to place pieces, hide other player's moves
  * Player places their pieces
  * Player clicks 'finish turn' - finish turn function runs

**On finish turn**
* Store moves to a 'moves' object (two moves to same square cancel each other)
* If other play need a turn, start their turn
  * Else, merge moves into gameboard and start lifecycle

**On start lifecyce**
* Iterate lifecycle counter. If counter === Number of lifecycles to run for between turns: start player turn
* Run life algorithm on gameboard array
* Run render
* If both players out of pieces, and finished last cycle, update messageboard with winner message
* Else, repeat

**On render**
* Update gameboard
* Update scoreboard
* Update pieces remaining
* Update message board
