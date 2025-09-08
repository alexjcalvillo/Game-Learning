import { Game } from './core/game'

const canvas = document.getElementById('game') as HTMLCanvasElement
const game = new Game(canvas)
game.start()
