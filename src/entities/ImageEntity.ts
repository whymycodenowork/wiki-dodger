import type SpriteBatch from "../graphics/SpriteBatch.js";
import { Vec2, Color, type Entity } from "../utils.js";

/**
 * this serves mainly as an entity but also is nice for just drawing temporary and/or moving images
 */
export default class ImageEntity implements Entity {
    pos: Vec2;
    z: number = 0.9;
    vel: Vec2;
    rotation = 0;
    w: number;
    h: number;
    // Always rectangular unless in certain cases.
    round = false;
    texture: WebGLTexture | null = null;
    imageUrl: string;
    color: Color;

    /**
     * 
     * @param x x position of the image
     * @param y y position of the image
     * @param w width
     * @param h height
     * @param url link to the image to draw. this can be a local file or a link to an image on the internet.
     */
    constructor(x: number, y: number, w: number, h: number, url: string) {
        this.pos = Vec2.new(x, y);
        this.imageUrl = url;
        this.color = Color.white;
        this.vel = Vec2.zero;
        this.w = w;
        this.h = h;
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
            // begin sprite batch
            spriteBatch.begin();
            // set the texture
            spriteBatch.setTexture(this.texture);
            // draw the image to the sprite batch
            spriteBatch.draw(
                this.pos.x, this.pos.y,
                this.w, this.h,
                0, 0, 1, 1,
                this.color
            );
            // end the sprite batch
            spriteBatch.end();
        }
    }
}