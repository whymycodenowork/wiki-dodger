import type { fontData } from "graphics/SpriteBatch.js";

export const Utils = {
    degToRad(deg: number): number {
        return deg * (Math.PI / 180);
    },

    radToDeg(rad: number): number {
        return rad * (180 / Math.PI);
    },

    clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    },

    lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    },

    /**
     * Converts a number from one range to another (linear scaling).
     *
     * Useful when you have a value measured in one domain (e.g. 0–100 health)
     * and need to reinterpret it in another (e.g. 0–1 UI bar fill amount).
     *
     * Formula:
     *   out = outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin)
     *
     * @param value  The number to convert.
     * @param inMin  Lower bound of the value’s original range.
     * @param inMax  Upper bound of the value’s original range.
     * @param outMin Lower bound of the desired output range.
     * @param outMax Upper bound of the desired output range.
     *
     * @returns The value scaled into the output range.
     *
     * Notes:
     * - If `inMin === inMax`, the result will be `NaN` (division by zero).
     *   Make sure the input range actually spans something.
     * - Values outside the input range will map proportionally outside the output range.
     *
     * Example:
     *   map(50, 0, 100, 0, 1) → 0.5
     *   map(200, 100, 300, 0, 10) → 5
     */
    map(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
        return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
    },

    random(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    },

    randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    sign(value: number): number {
        return value === 0 ? 0 : value > 0 ? 1 : -1;
    },

    // ===============================  logging  ==========================================
    // these are my go-to things to log to the console so i keep my sanity when debugging.
    // ====================================================================================

    /**
     * yummers
     * @param y optional thing to log
     */
    yummers(...y: any[]) {
        console.log("yummers" + " " + y.map(x => String(x)).join(", "));
    },

    /**
     * buh
     * @param b optional thing to log
     */
    buh(...b: any[]) {
        console.log("buh" + " " + b.map(x => String(x)).join(", "));
    },

    /**
     * pluh
     * @param p optional thing to log.
     */
    pluh(...p: any[]) {
        console.log("pluh" + " " + p.map(x => String(x)).join(", "));
    },
}

export type Vec2 = { x: number; y: number };

export const Vec2 = {
    // --- creation ---
    new(x = 0, y = 0): Vec2 {
        return { x, y };
    },

    clone(a: Vec2): Vec2 {
        return { x: a.x, y: a.y };
    },

    // --- arithmetic ---
    add(a: Vec2, b: Vec2): Vec2 {
        return { x: a.x + b.x, y: a.y + b.y };
    },

    /**
     * adds b to a
     * @param a the vector to add to
     * @param b the vector to add
     * @returns a + b
     */
    addTo(a: Vec2, b: Vec2): Vec2 {
        a.x += b.x;
        a.y += b.y;
        return a;
    },

    sub(a: Vec2, b: Vec2): Vec2 {
        return { x: a.x - b.x, y: a.y - b.y };
    },

    mul(a: Vec2, b: Vec2 | number): Vec2 { // multiply vectors together or by scalar
        if (typeof b === 'number') {
            return { x: a.x * b, y: a.y * b };
        }
        return { x: a.x * b.x, y: a.y * b.y };
    },

    div(a: Vec2, s: number): Vec2 {
        return { x: a.x / s, y: a.y / s };
    },

    // --- magnitude or length or whatever you wanna call it ---
    mag(a: Vec2): number {
        return Math.hypot(a.x, a.y);
    },

    mag2(a: Vec2): number {
        return a.x * a.x + a.y * a.y;
    },

    /**
     * normalized vector
     * @param a the vector to normalize
     * @returns the normalized vector
     */
    normalized(a: Vec2): Vec2 {
        const len = Vec2.mag(a);
        return len === 0 ? Vec2.zero : { x: a.x / len, y: a.y / len };
    },

    /**
     * normalizes the given vector
     * @param a the vector to normalize
     * @returns the normalized vector
     */
    normalize(a: Vec2): Vec2 {
        const len = Vec2.mag(a);
        if (len !== 0) {
            a.x /= len;
            a.y /= len;
        }

        return a;
    },

    // --- vector math ---
    dot(a: Vec2, b: Vec2): number {
        return a.x * b.x + a.y * b.y;
    },

    // 2D cross product result is a scalar (z-component)
    cross(a: Vec2, b: Vec2): number {
        return a.x * b.y - a.y * b.x;
    },

    dist(a: Vec2, b: Vec2): number {
        return Math.hypot(b.x - a.x, b.y - a.y);
    },

    dist2(a: Vec2, b: Vec2): number {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        return dx * dx + dy * dy;
    },

    lerp(a: Vec2, b: Vec2, t: number): Vec2 {
        return {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t
        };
    },

    clampMag(a: Vec2, maxLen: number): Vec2 {
        const m2 = Vec2.mag2(a);
        if (m2 > maxLen * maxLen) {

            return Vec2.mul(Vec2.normalized(a), maxLen);
        }
        return a;
    },

    angle(a: Vec2): number {
        return Math.atan2(a.y, a.x);
    },

    // you should've understood those if you know even a little bit about vectors.
    // if you don't, please learn it because it is very important.

    // --- constants ---
    get zero(): Vec2 {
        return { x: 0, y: 0 };
    },
    get one(): Vec2 {
        return { x: 1, y: 1 };
    },
    get up(): Vec2 {
        return { x: 0, y: 1 };
    },
    get down(): Vec2 {
        return { x: 0, y: -1 };
    },
    get left(): Vec2 {
        return { x: -1, y: 0 };
    },
    get right(): Vec2 {
        return { x: 1, y: 0 };
    },
};

/**
 * implement this for a position
 */
export interface Position {
    pos: Vec2;
}

/**
 * implement this for a velocity
 */
export interface Velocity {
    vel: Vec2;
}

export type Rect = { pos: Vec2; w: number; h: number; };

export const Rect = {
    intersects(a: Rect, b: Rect): boolean {
        return !(a.pos.x > b.pos.x + b.w ||
            a.pos.x + a.w < b.pos.x ||
            a.pos.y > b.pos.y + b.h ||
            a.pos.y + a.h < b.pos.y);
    }
};

export type Color = {
    r: number;
    g: number;
    b: number;
    a: number;
};

export const Color = {
    new(r = 1, g = 1, b = 1, a = 1) {
        return { r, g, b, a };
    },

    clone(c: Color) {
        return { r: c.r, g: c.g, b: c.b, a: c.a };
    },

    get red(): Color {
        return { r: 1, g: 0, b: 0, a: 1 };
    },

    get green(): Color {
        return { r: 0, g: 1, b: 0, a: 1 };
    },

    get blue(): Color {
        return { r: 0, g: 0, b: 1, a: 1 };
    },

    get black(): Color {
        return { r: 0, g: 0, b: 0, a: 1 };
    },

    get white(): Color {
        return { r: 1, g: 1, b: 1, a: 1 };
    },

    get empty(): Color {
        return { r: 0, g: 0, b: 0, a: 0 };
    },
}

export function generateFontAtlas(fontSize = 32, font = "sans-serif") {
    const canvas = document.getElementById("texture") as HTMLCanvasElement;
    if (!canvas) throw new Error("Canvas element not found");
    const ctx = canvas.getContext("2d")!;

    const chars =
        "`1234567890-=qwertyuiop[]\\asdfghjkl;'zxcvbnm,./~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:\"ZXCVBNM<>? •";

    const padding = 4;
    const perRow = 16;

    canvas.width = perRow * (fontSize + padding);
    canvas.height =
        Math.ceil(chars.length / perRow) * (fontSize + padding);

    ctx.fillStyle = "white";
    ctx.font = `${fontSize}px ${font}`;
    ctx.textBaseline = "top";

    const metrics: Record<string, charMetrics> = {};

    let x = 0, y = 0;

    for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        if (!ch) continue; // will never happen but ts complaing

        const m = ctx.measureText(ch);
        const w = Math.ceil(m.width);
        const h = fontSize;

        // Draw glyph onto atlas
        ctx.fillText(ch, x, y);

        // Store metrics
        metrics[ch] = {
            x,
            y,
            w,
            h,
            advance: m.width,
        };

        x += fontSize + padding;
        if ((i + 1) % perRow === 0) {
            x = 0;
            y += fontSize + padding;
        }
    }

    return { canvas, metrics };
}

export function createTextureFromCanvas(gl: WebGL2RenderingContext, canvas: HTMLCanvasElement) {
    const tex = gl.createTexture()!;

    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA,
        gl.RGBA, gl.UNSIGNED_BYTE,
        canvas
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return tex;
}

export type charMetrics = {
    /**
     * the x position in the atlas
     * 
     * you don't really need to worry about this because SpriteBatch will handle it for you
     */
    x: number;
    /**
     * the y position in the atlas
     * 
     * you don't really need to worry about this because SpriteBatch will handle it for you
     */
    y: number;
    /**
     * the width of the character glyph
     */
    w: number; 
    /**
     * the height of the character glyph
     */
    h: number;
    /**
     * how much to advance the cursor after drawing this character
     * 
     * useful for finding out where to draw the next character
     */
    advance: number;
}

/**
 * some handy utilities for characters
 */
export class CharUtils {
    /**
     * the data of the current font
     */
    static fontData: fontData;

    /**
     * get the width of a character in the current font at given size
     * @param char the character
     * @param fontSize the font size
     * @returns the width of the character
     */
    static getWidth(char: string, fontSize: number): number {
        const metrics = this.fontData.metrics[char];
        return metrics ? (fontSize / metrics.h) * metrics.advance : 0;
    }
}
