import { Ball } from "./Ball";
import { Direction } from "./Direction";
import { Player } from "./Player";

export const GAME_WIDTH = 2048;
export const GAME_HEIGHT = 1024;

export class Pong {
    static MAX_PLAYER_SPEED = 5.0 * (GAME_HEIGHT / 256);
    static CENTER_LINE_WIDTH = 2.0 * (GAME_WIDTH / 512);
    
    private player1 = new Player(30 * (GAME_HEIGHT / 256), Direction.Right);
    private player2 = new Player(GAME_WIDTH - 30 * (GAME_HEIGHT / 256), Direction.Left);
    private ball = new Ball();
    
    private currentPlayer = this.player2;
    private wantedCurrentPlayerY = GAME_HEIGHT / 2;
    
    private cumulated = 0;

    onMouseMove(mouseX: number, mouseY: number) {
        this.wantedCurrentPlayerY = mouseY;
    }
    
	update(dt: number) {
        this.cumulated += dt;

        let yDelta = this.wantedCurrentPlayerY - this.currentPlayer.getY();
        if (yDelta > Pong.MAX_PLAYER_SPEED) {
            yDelta = Pong.MAX_PLAYER_SPEED;
        } else if (yDelta < -Pong.MAX_PLAYER_SPEED) {
            yDelta = -Pong.MAX_PLAYER_SPEED;
        }
        
        this.currentPlayer.setY(this.currentPlayer.getY() + yDelta);

        if (this.cumulated > 5) {
            this.ball.update(dt);
        }
        
        if (this.ball.getBoundingBox().intersects(this.player1.getBoundingBox())) {
            this.ball.collideWithPlayer(this.player1);
        }
        if (this.ball.getBoundingBox().intersects(this.player2.getBoundingBox())) {
            this.ball.collideWithPlayer(this.player2);
        }
        
        this.player1.update(dt);
        this.player2.update(dt);
    }
    
    draw(ctx: CanvasRenderingContext2D) {
        // clear canvas
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
        
        // draw center line
        ctx.fillRect(GAME_WIDTH / 2 - Pong.CENTER_LINE_WIDTH / 2, 0, Pong.CENTER_LINE_WIDTH, GAME_HEIGHT);

        // draw all objects
        this.ball.draw(ctx);
        this.player1.draw(ctx);
        this.player2.draw(ctx);
    }
}
