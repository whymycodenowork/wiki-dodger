
import type SpriteBatch from "../graphics/SpriteBatch.js";
import CharEntity, { charBehaviors } from "./CharEntity.js";

export default class Enemy {
    chars: CharEntity[];
    alive = true;

    constructor(...chars: CharEntity[]) {
        this.chars = chars;
    }

    update(dt: number, bulletsOut: CharEntity[]) {
        // Update all chars
        this.chars.forEach(c => c.update(dt));

        // If has more than 1 char, try to shoot
        if (this.chars.length > 1) this.chars.forEach(c => c.tryShoot(bulletsOut, dt));
        else {
            if (this.chars[0]) {
                this.chars[0].behavior = charBehaviors.bullet;
            }
            this.alive = false;
        }
    }

    draw(batch: SpriteBatch) {
        this.chars.forEach(c => c.draw(batch));
    }

    center() {
        const xs = this.chars.map(c => c.pos.x);
        const ys = this.chars.map(c => c.pos.y);
        return {
            x: (Math.min(...xs) + Math.max(...xs)) / 2,
            y: (Math.min(...ys) + Math.max(...ys)) / 2
        };
    }
}
