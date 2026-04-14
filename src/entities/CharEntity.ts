// CharEntity.ts
import { Vec2, Color, Utils } from "../utils.js";
import type { Position, Velocity } from "../utils.js";
import SpriteBatch, { type fontData } from "../graphics/SpriteBatch.js";
import Player from "./player.js";

export enum charBehaviors {
    dead, // dead characters fall and then disappear
    remove, // characters to be removed
    static, // static characters that do not move
    enemy, // enemy characters belong to an enemy and move together with the rest of the characters of the enemy
    bullet // characters that are bullets shot by the player or by an enemy
}

export default class CharEntity implements Position, Velocity {
    /**
     * the character
     */
    char: string;
    /**
     * position
     */
    pos: Vec2;
    /**
     * velocty
     */
    vel: Vec2;
    /**
     * how big it is
     */
    size: number;
    /**
     * what it should do
     */
    behavior: charBehaviors;
    /**
     * self explanatory
     */
    color: Color;
    /**
     * how long until it can shoot again in seconds
     */
    readonly shootCooldown = 1.5;
    /**
     * timer for the shooting
     * 
     * not to be confused with shootCooldown
     */
    shotCooldown = 0;
    fadeInDuration = 0.3; // Time to fade back in after shooting
    isFadingIn = false;
    fadingInTime = 0;
    /** 
     * lifetime in seconds 
     */
    lifetime: number;

    constructor(
        char: string,
        x: number, y: number,
        size = 16,
        color = Color.white,
        behavior = charBehaviors.static,
        lifetime = Infinity
    ) {
        this.char = char;
        this.pos = Vec2.new(x, y);
        this.vel = Vec2.new(0, 0);
        this.size = size;
        this.behavior = behavior;
        this.color = color;
        this.lifetime = lifetime;
    }

    /**
     * stuff it should do every frame
     */
    update(dt: number) {
        this.lifetime -= dt;

        if (this.lifetime <= 0) {
            this.behavior = charBehaviors.remove; // remove when lifetime over
        }

        Vec2.addTo(this.pos, Vec2.mul(this.vel, dt)); // add velocity to position

        if (this.behavior === charBehaviors.bullet) {
            Utils.buh("buh");
        }

        // Update fade-in effect
        this.color.a = Utils.map(this.shotCooldown, 0, this.shootCooldown, 4, -1);

        if (this.behavior === charBehaviors.dead) {
            // Apply gravity
            this.vel.y += 300 * dt; // gravity acceleration
            // If fallen below screen, mark to be removed
            if (this.pos.y > 500) {
                this.behavior = charBehaviors.remove;
            }
        } else if (this.behavior === charBehaviors.static) {
            this.pos.y -= 10 * dt;
        }

        // if off screen and is bullet remove
        if (this.behavior !== charBehaviors.static) {
            if (this.pos.x < -50 || this.pos.x > 850 || this.pos.y < -50 || this.pos.y > 550) {
                this.behavior = charBehaviors.remove;
            }
        }
    }

    draw(batch: SpriteBatch) {
        batch.drawGlyph(
            this.char,
            this.pos.x,
            this.pos.y,
            this.size,
            this.color
        );
    }

    kill() {
        this.behavior = charBehaviors.dead;
    }

    get alive() {
        return this.behavior !== charBehaviors.dead;
    }

    get dead() {
        return this.behavior === charBehaviors.dead;
    }

    /**
     * try to shoot at the target
     * @param bulletsOut the array to put the bullet(s) in
     * @param dt delta time
     */
    tryShoot(bulletsOut: CharEntity[], dt: number) {
        if (this.behavior !== charBehaviors.enemy) {
            console.error("erm, aktually ☝🤓"); // nerd emoji
            return;
        }
        // Update shot cooldown
        this.shotCooldown -= dt;
        if (this.shotCooldown <= 0) {
            this.shoot(bulletsOut);
        }
    }

    /**
     * shoot at the target
     * @param bulletsOut the array to put the bullet(s) in
     * @param target what to shoot at (must implement Position)
     */
    shoot(bulletsOut: CharEntity[]) {
        // Create a bullet copy
        const bullet = new CharEntity(this.char, this.pos.x, this.pos.y, this.size, Color.white, charBehaviors.bullet, 5);
        bullet.vel = Vec2.mul(Vec2.normalized(Vec2.sub(Player.Instance.pos, this.pos)), 600);
        bullet.color = Color.clone(this.color);
        bulletsOut.push(bullet);

        this.shotCooldown = this.shootCooldown; // reset cooldown
    }
}
