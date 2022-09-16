import { Rectangle } from "./Rectangle";

export class Game {
	static readonly DISTANCE_TO_WALL = 30;
	static readonly PLAYER_WIDTH = 30;
	static readonly PLAYER_HEIGHT = 80;

	private width: number;
	private height: number;
	private players: Rectangle[];
	private obstacles: Rectangle[];

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.obstacles = [];
		this.players = [
			new Rectangle(
				Game.DISTANCE_TO_WALL,
				Game.DISTANCE_TO_WALL + Game.PLAYER_WIDTH,
				0,
				Game.PLAYER_HEIGHT
			),
		];
	}
}
