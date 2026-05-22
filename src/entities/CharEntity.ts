// CharEntity.ts
import { Vec2, Color, Utils, CharUtils } from "../utils.js";
import type { Entity, Position, Velocity } from "../utils.js";
import SpriteBatch, { type fontData } from "../graphics/SpriteBatch.js";
import Player from "./player.js";
import { entities } from "../index.js";

/**
 * behaviors for characters that determine what they do
 */
export enum charBehaviors {
    /**
     * Dead characters fall and are removed when they fall off the screen
     */
    dead,
    /**
     * Marks the character to be removed.
     */
    remove,
    /**
     * Static characters have no behavior and just sit there blocking the way.
     */
    static,
    /**
     * Enemy characters belong to an enemy and move together with the rest of the characters of the enemy
     */
    enemy,
    /**
     * Characters that are bullets shot by the player or by an enemy
     */
    bullet
}

export default class CharEntity implements Entity {
    /**
     * the character
     */
    char: string;
    /**
     * position
     */
    pos: Vec2;
    z: number = 0.5;
    /**
     * velocty
     */
    vel: Vec2;
    /**
     * the font size. and the height of the character
     */
    h: number;
    w: number;
    round = false;
    rotation: number;
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
    /**
     * whether the character is bold
     */
    bold: boolean = false;
    /**
     * whether the character is italic
     */
    italic: boolean = false;
    /**
     * whether the character is underlined
     */
    underline: boolean = false;

    /**
     * whether the character hurts the player or enemies. only used for bullets.
     */
    friendly: boolean;

    constructor(
        char: string,
        x: number, y: number,
        size = 16,
        color = Color.white,
        behavior = charBehaviors.static,
        lifetime = Infinity,
        rotation: number = 0,
        friendly = false
    ) {
        this.char = char;
        this.pos = Vec2.new(x, y);
        this.vel = Vec2.new(0, 0);
        this.behavior = behavior;
        this.color = color;
        this.lifetime = lifetime;
        this.w = CharUtils.getWidth(char, size);
        this.h = size;
        this.rotation = rotation;
        this.friendly = friendly;
    }

    /**
     * stuff it should do every frame
     */
    update(dt: number): void {
        this.lifetime -= dt;

        if (this.lifetime <= 0) {
            this.behavior = charBehaviors.remove; // remove when lifetime over
        }

        Vec2.addTo(this.pos, Vec2.mul(this.vel, dt)); // add velocity to position

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

    draw(batch: SpriteBatch): void {
        let x = this.pos.x;
        
        // Draw bold effect by rendering offset
        if (this.bold) {
            batch.drawGlyph(
                this.char,
                x + 1,
                this.pos.y,
                this.h,
                this.color,
                0,
                this.italic,
                this.z
            );
        }
        
        // Draw main glyph with italic if needed
        batch.drawGlyph(
            this.char,
            x,
            this.pos.y,
            this.h,
            this.color,
            0,
            this.italic,
            this.z
        );
        
        // Draw underline if needed
        if (this.underline) {
            const underlineY = this.pos.y + this.h - Math.max(1, this.h * 0.08);
            const underlineThickness = Math.max(1, this.h * 0.05);
            batch.drawUnderline(
                x,
                underlineY,
                this.w,
                underlineThickness,
                this.color
            );
        }
    }

    /**
     * unlaive the character (censored for compliance with content guidelines /j)
     */
    unalive(): void {
        this.behavior = charBehaviors.dead;
    }

    /**
     * returns if it is alive
     */
    get alive(): boolean {
        return this.behavior !== charBehaviors.dead;
    }

    /**
     * returns if it is not alive
     */
    get dead(): boolean {
        return this.behavior === charBehaviors.dead;
    }

    /**
     * try to shoot at the target
     * @param bulletsOut the array to put the bullet(s) in
     * @param dt delta time
     */
    tryShoot(dt: number): void {
        if (this.behavior !== charBehaviors.enemy) {
            console.error("erm, aktually, that's not an enemy ☝🤓");
            return;
        }
        // Update shot cooldown
        this.shotCooldown -= dt;
        if (this.shotCooldown <= 0) {
            this.shoot();
        }
    }

    /**
     * shoot at the target
     * @param target what to shoot at (must implement Position)
     */
    shoot(target: Position = Player.Instance): void {
        // Create a bullet copy
        const bullet = new CharEntity(this.char, this.pos.x, this.pos.y, this.h, Color.white, charBehaviors.bullet, 5);
        bullet.vel = Vec2.mul(Vec2.normalized(Vec2.sub(target.pos, this.pos)), 600);
        bullet.color = Color.clone(this.color);
        entities.push(bullet);

        this.shotCooldown = this.shootCooldown; // reset cooldown
    }
}
