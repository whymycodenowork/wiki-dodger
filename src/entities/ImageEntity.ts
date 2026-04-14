import type SpriteBatch from "../graphics/SpriteBatch.js";
import { Vec2, Color } from "../utils.js";

/**
 * this serves mainly as an entity but also is nice for just drawing temporary and/or moving images
 */
export default class ImageEntity {
    pos: Vec2;
    size: Vec2;
    texture: WebGLTexture | null = null;
    imageUrl: string;
    color: Color;

    constructor(x: number, y: number, w: number, h: number, url: string) {
        this.pos = Vec2.new(x, y);
        this.size = Vec2.new(w, h);
        this.imageUrl = url;
        this.color = Color.white;
    }

    update(dt: number) {
        // Physics would go here
    }

    /**
     * must be drawn when there is no sprite batch started
     * @param spriteBatch the sprite batch to draw with
     */
    draw(spriteBatch: SpriteBatch) {
        if (this.texture) {
            spriteBatch.begin();
            spriteBatch.setTexture(this.texture);
            spriteBatch.draw(
                this.pos.x, this.pos.y,
                this.size.x, this.size.y,
                0, 0, 1, 1,
                this.color
            );
            spriteBatch.end(); // draw the image to the canvas
        }
    }
}