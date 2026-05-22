import CharEntity, { charBehaviors } from "./CharEntity.js";

/**
 * groups characters together and handles their behavior as a group
 */
export default class Enemy {
    /**
     * the characters that make up the enemy
     */
    chars: CharEntity[];

    /**
     * whether the enemy is alive or not. Enemies are removed when they are not alive
     */
    alive = true;

    constructor(...chars: CharEntity[]) {
        this.chars = chars;
    }

    update(dt: number) {
        // If has more than 1 char, try to shoot
        if (this.chars.length > 1) this.chars.forEach(c => c.tryShoot(dt));
        else {
            if (this.chars[0]) {
                this.chars[0].behavior = charBehaviors.bullet;
            }
            this.alive = false;
        }
    }

    /**
     * kind of useless
     * @returns the center
     */
    center() {
        const xs = this.chars.map(c => c.pos.x);
        const ys = this.chars.map(c => c.pos.y);
        return {
            x: (Math.min(...xs) + Math.max(...xs)) / 2,
            y: (Math.min(...ys) + Math.max(...ys)) / 2
        };
    }
}
