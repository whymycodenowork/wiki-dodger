import type SpriteBatch from "../graphics/SpriteBatch.js";
import { Vec2, Color } from "../utils.js";

export default class RectEntity {
    pos: Vec2;
    size: Vec2;
    color: Color;

    constructor(x: number, y: number, w: number, h: number, color: Color) {
        this.pos = Vec2.new(x, y);
        this.size = Vec2.new(w, h);
        this.color = color;
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
            this.size.x, this.size.y,
            0, 0, 1, 1,
            this.color
        );
    }
}