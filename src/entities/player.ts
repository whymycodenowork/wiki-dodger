// player.ts
import { Color, Vec2 } from "../utils.js";
import type { Entity } from "../utils.js";
import type SpriteBatch from "../graphics/SpriteBatch.js";
import { keys } from "../engine/controls.js";

export default class Player implements Entity {
    pos: Vec2;
    z: number = 0;
    vel: Vec2 = Vec2.zero;
    size: number = 20;
    w = this.size;
    h = this.size;
    color = Color.white;
    round = false;
    rotation = 0;

    playerTexture: WebGLTexture | null = null;

    /**
     * The main player instance.
     */
    static Instance: Player;

    constructor(pos: Vec2) {
        this.pos = pos;
        Player.Instance = this;
    }

    /**
     * Called every frame
     * @param dt delta time
     */
    update(dt: number) {
        const acceleration = 2000; // pixels per second squared
        const friction = 0.85; // deceleration factor
        const maxSpeed = 1000; // max pixels/sec

        let ax = 0;
        let ay = 0;

        if (keys.up) ay -= acceleration;
        if (keys.down) ay += acceleration;
        if (keys.left) ax -= acceleration;
        if (keys.right) ax += acceleration;

        // Apply acceleration
        this.vel.x += ax * dt;
        this.vel.y += ay * dt;

        // Apply friction
        this.vel.x *= friction;
        this.vel.y *= friction;

        // Clamp speed
        const speed = Math.hypot(this.vel.x, this.vel.y);
        if (speed > maxSpeed) {
            const scale = maxSpeed / speed;
            this.vel.x *= scale;
            this.vel.y *= scale;
        }

        // Update position
        this.pos.x += this.vel.x * dt;
        this.pos.y += this.vel.y * dt;
    }

    draw(batch: SpriteBatch) {
        batch.begin();
        batch.setTexture(this.playerTexture)
        // Player texture
        batch.draw(
            this.pos.x - this.size / 2,
            this.pos.y - this.size / 2,
            this.size,
            this.size,
            0, 0, 1, 1,
            this.color,
            this.rotation,
            this.z
        );
        batch.end();
    }
}
