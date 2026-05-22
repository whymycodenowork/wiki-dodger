import type SpriteBatch from "../graphics/SpriteBatch.js";
import { Vec2, Color, type Entity } from "../utils.js";

export default class RectEntity implements Entity {
    pos: Vec2;
    z: number = 1;
    color: Color;

    vel: Vec2 = Vec2.new(0, 0);
    rotation: number;
    round: boolean;
    w: number;
    h: number;

    constructor(x: number, y: number, w: number, h: number, color: Color, round: boolean = false, rotation: number = 0, z = 0) {
        this.pos = Vec2.new(x, y);
        this.w = w;
        this.h = h;
        this.color = color;
        this.round = round;
        this.rotation = rotation;
        this.z = z;
    }

    update(dt: number) {
        // TODO: Physics for RectEntity
    }

    /**
     * must be drawn when the current texture is the basic white one
     * @param spriteBatch the sprite batch to draw with
     */
    draw(spriteBatch: SpriteBatch) {
        spriteBatch.draw(
            this.pos.x, this.pos.y,
            this.w, this.h,
            0, 0, 1, 1,
            this.color,
            0,
            this.z
        );
    }
}