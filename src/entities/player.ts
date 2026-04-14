// player.ts
import { CharUtils, Color, Utils, Vec2 } from "../utils.js";
import type { Position, Velocity } from "../utils.js";
import type SpriteBatch from "../graphics/SpriteBatch.js";
import { keys } from "../engine/controls.js";

export default class Player implements Position, Velocity {
    pos: Vec2;
    vel: Vec2 = Vec2.zero;
    size: number = 20;

    static Instance: Player;

    constructor(pos: Vec2) {
        this.pos = pos;
        Player.Instance = this;
    }

    update(dt: number) {
        const acceleration = 2000; // pixels/sec²
        const friction = 0.85; // deceleration factor per frame
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
        // Player is just an o for now

        batch.drawGlyph(
            "o",
            this.pos.x,
            this.pos.y,
            32,
            Color.red
        );
    }
}
