import { Ball, type NewBallState } from "./Ball";
import { Direction } from "./Direction";
import { Player } from "./Player";

export const GAME_WIDTH = 2048;
export const GAME_HEIGHT = 1024;

export enum PlayerRole {
    PLAYER1,
    PLAYER2,
    SPECTATOR,
}

export interface PongPacket {
    tick: number;
}

export interface PlayerMovement extends PongPacket {
    player: PlayerRole,
    moveTarget: number;
}

export interface BallOut extends PongPacket {
    player1Score: number;
    player2Score: number;
}

export class Pong {
    static MAX_PLAYER_SPEED = 5.0 * (GAME_HEIGHT / 256);
    static CENTER_LINE_WIDTH = 2.0 * (GAME_WIDTH / 512);
    
    private updateBall = true;

    private player1 = new Player(30 * (GAME_HEIGHT / 256), Direction.Right);
    private player2 = new Player(GAME_WIDTH - 30 * (GAME_HEIGHT / 256), Direction.Left);
    private ball = new Ball(this);

    private cumulated = 0;
    private currentTick = 0;
    private lastTickWithPlayerEvent = 0;
    private tickPerSecond: number;

    private onBallBounceCallback: (nbs: NewBallState) => void = null;
    private onPlayerMoveCallback: (pm: PlayerMovement) => void = null;
    private onBallOutCallback: (bo: BallOut) => void = null;

    public sendBallBounceToCallback() {
        if (this.onBallBounceCallback) {
            this.onBallBounceCallback({
                tick: this.currentTick,
                x: this.ball.x,
                y: this.ball.y,
                velX: this.ball.velocityX,
                velY: this.ball.velocityY,
                speed: this.ball.speed,
            });
        }
    }

    private handleTicks(serverTick: number) {
        const tickDiff = serverTick - this.currentTick;
        if (tickDiff > 5) {
            console.log("Server is " + Math.abs(tickDiff) + " ticks ahead");
        } else if (serverTick - this.currentTick < -5) {
            console.log("Server is " + Math.abs(tickDiff) + " ticks behind");
        }
        
        this.currentTick = serverTick;
        this.cumulated = this.currentTick / this.tickPerSecond;
    }
    
    public setBallState(state: NewBallState) {
        this.handleTicks(state.tick);
        
        this.ball.x = state.x;
        this.ball.y = state.y;
        this.ball.velocityX = state.velX;
        this.ball.velocityY = state.velY;
    }

    constructor(tickPerSecond: number) {
        this.tickPerSecond = tickPerSecond;
    }

    getPlayer(role: PlayerRole,) {
        if (role === PlayerRole.PLAYER1) {
            return this.player1;
        } else if (role === PlayerRole.PLAYER2) {
            return this.player2;
        }
        return null;
    }

    setPlayerMoveTarget(role: PlayerRole, y: number) {
        const player = this.getPlayer(role);
        if (player) {
            player.moveTarget = y;
        }
        if (this.onPlayerMoveCallback && this.lastTickWithPlayerEvent !== this.currentTick) {
            this.lastTickWithPlayerEvent = this.currentTick;
            this.onPlayerMoveCallback({
               tick: this.currentTick,
               player: role,
               moveTarget: y,
            });
        }
    }

    getPlayerY(role: PlayerRole) {
        const player = this.getPlayer(role);
        if (player) {
            return player.getY();
        }
        return null;
    }

    onBallBounce(cb: (nbs: NewBallState) => void) {
        this.onBallBounceCallback = cb;
    }

    onPlayerMove(cb: (pm: PlayerMovement) => void) {
        this.onPlayerMoveCallback = cb;
    }
    
    onBallOut(cb: (bo: BallOut) => void) {
        this.onBallOutCallback = cb;
    }

    private movePlayers() {
        let player1yDelta = this.player1.moveTarget - this.player1.getY();
        if (player1yDelta > Pong.MAX_PLAYER_SPEED) {
            player1yDelta = Pong.MAX_PLAYER_SPEED;
        } else if (player1yDelta < -Pong.MAX_PLAYER_SPEED) {
            player1yDelta = -Pong.MAX_PLAYER_SPEED;
        }

        let player2yDelta = this.player2.moveTarget - this.player2.getY();
        if (player2yDelta > Pong.MAX_PLAYER_SPEED) {
            player2yDelta = Pong.MAX_PLAYER_SPEED;
        } else if (player2yDelta < -Pong.MAX_PLAYER_SPEED) {
            player2yDelta = -Pong.MAX_PLAYER_SPEED;
        }

        this.player1.setY(this.player1.getY() + player1yDelta);
        this.player2.setY(this.player2.getY() + player2yDelta);
    }

    update(dt: number) {
        this.cumulated += dt;
        this.currentTick = Math.floor(this.cumulated * this.tickPerSecond);
        this.movePlayers();

        if (this.updateBall) {
            this.ball.update(dt);
        }

        if (this.updateBall && this.ball.x < 0) {
            this.updateBall = false;
            if (this.onBallOutCallback) {
                this.onBallOutCallback({
                    tick: this.currentTick,
                    player1Score: this.player1.score,
                    player2Score: this.player2.score + 1,
                });
            }
        }
        if (this.updateBall && this.ball.x > GAME_WIDTH) {
            this.updateBall = false;
            if (this.onBallOutCallback) {
                this.onBallOutCallback({
                    tick: this.currentTick,
                    player1Score: this.player1.score + 1,
                    player2Score: this.player2.score,
                });
            }
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

    reset(player1Score: number, player2Score: number) {
        this.ball.reset();
        this.player1.score = player1Score;
        this.player2.score = player2Score;
        this.updateBall = true;
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

        ctx.font = '100px tekoregular';
        ctx.fillText(this.player1.score.toFixed(), GAME_WIDTH / 4, 28 * (GAME_HEIGHT / 256));
        ctx.fillText(this.player2.score.toFixed(), GAME_WIDTH * (3 / 4), 28 * (GAME_HEIGHT / 256));
    }
}
