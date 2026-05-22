import type SpriteBatch from "./graphics/SpriteBatch.js";
import type { fontData } from "./graphics/SpriteBatch.js";

export const Utils = {
    /**
     * converts degrees to radians.
     * @param deg angle in degrees
     * @returns angle in radians
     */
    degToRad(deg: number): number {
        return deg * (Math.PI / 180);
    },

    /**
     * converts radians to degrees.
     * @param rad angle in radians
     * @returns angle in degrees
     */
    radToDeg(rad: number): number {
        return rad * (180 / Math.PI);
    },

    /**
     * clamps a number between a minimum and maximum value.
     * @param value the number to clamp
     * @param min the minimum value
     * @param max the maximum value
     * @returns the clamped value
     */
    clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    },

    /**
     * linear interpolation
     * 
     * this can't be too hard
     * @param a 
     * @param b 
     * @param t 
     * @returns 
     */
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

    /**
     * returns a random number between min (inclusive) and max (exclusive)
     * @param min the minimum number
     * @param max the maximum number
     * @returns a random number between min (inclusive) and max (exclusive)
     */
    random(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    },

    /**
     * returns a random integer between min and max (inclusive)
     * @param min the minimum integer
     * @param max the maximum integer
     * @returns a random integer between min and max (inclusive)
     */
    randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    sign(value: number): number {
        return value === 0 ? 0 : value > 0 ? 1 : -1;
    },

    // ===============================  logging  ==========================================

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

/**
 * a simple 2D vector type
 */
export type Vec2 = { x: number; y: number };

/**
 * stuff for working with vec2s.
 * 
 * if you don't know what a vector is i don't think you should be trying to make a game
 */
export const Vec2 = {
    // --- creation ---
    /**
     * creates a new vec2
     * @param x the x value
     * @param y the y value
     * @returns the new vec2
     */
    new(x = 0, y = 0): Vec2 {
        return { x, y };
    },

    /**
     * clones a vec2 object
     * @param a the vector to copy
     * @returns the cloned vec2
     */
    clone(a: Vec2): Vec2 {
        return { x: a.x, y: a.y };
    },

    // --- arithmetic ---
    /**
     * adds two vectors together
     * @param a the first vector
     * @param b the second vector
     * @returns the result as a new vector object
     */
    add(a: Vec2, b: Vec2): Vec2 {
        return { x: a.x + b.x, y: a.y + b.y };
    },

    /**
     * adds b to a and returns a.
     * @param a the vector to add to
     * @param b the vector to add
     * @returns a after adding
     */
    addTo(a: Vec2, b: Vec2): Vec2 {
        a.x += b.x;
        a.y += b.y;
        return a;
    },

    /**
     * subtracts two vectors
     * @param a the first vector
     * @param b the second vector
     * @returns the result as a new vector object
     */
    sub(a: Vec2, b: Vec2): Vec2 {
        return { x: a.x - b.x, y: a.y - b.y };
    },

    /**
     * multiplies a by b
     * @param a the vector to multiply
     * @param b the vector or scalar to multiply by
     * @returns the result of the multiplication as a new vector object
     */
    mul(a: Vec2, b: Vec2 | number): Vec2 {
        if (typeof b === 'number') {
            return { x: a.x * b, y: a.y * b };
        }
        return { x: a.x * b.x, y: a.y * b.y };
    },

    /**
     * divides a by s
     * @param a the vector to divide
     * @param s the scalar to divide by
     * @returns the divided vector as a new vector object
     */
    div(a: Vec2, s: number): Vec2 {
        return { x: a.x / s, y: a.y / s };
    },

    // --- magnitude or length or whatever you wanna call it ---
    mag(a: Vec2): number {
        return Math.hypot(a.x, a.y);
    },

    /**
     * squared magnitude. useful for comparing distances cheaply
     * @param a the vector to get the squared magnitude of
     * @returns the squared magnitude
     */
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
    z: number; // z for rendering
}

/**
 * implement this for a velocity
 */
export interface Velocity {
    vel: Vec2;
}

/**
 * for having a rotation (radians)
 */
export interface Rotation {
    rotation: number;
}

export interface Transform extends Position, Rotation {}

/**
 * implement for having a collider.
 */
export interface Collider {
    w: number;
    h: number;
    round: boolean; // whether the collider is an ellipse or rectangle
}

function rotatePoint(point: Vec2, origin: Vec2, rotation: number): Vec2 {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const dx = point.x - origin.x;
    const dy = point.y - origin.y;
    return {
        x: origin.x + dx * cos - dy * sin,
        y: origin.y + dx * sin + dy * cos,
    };
}

function rotateVector(direction: Vec2, rotation: number): Vec2 {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    return {
        x: direction.x * cos - direction.y * sin,
        y: direction.x * sin + direction.y * cos,
    };
}

function getColliderCenter(collider: Position & Collider): Vec2 {
    return {
        x: collider.pos.x + collider.w * 0.5,
        y: collider.pos.y + collider.h * 0.5,
    };
}

function getRectCorners(collider: Position & Collider, rotation: number): Vec2[] {
    const center = getColliderCenter(collider);
    const halfW = collider.w * 0.5;
    const halfH = collider.h * 0.5;
    const corners = [
        { x: center.x - halfW, y: center.y - halfH },
        { x: center.x + halfW, y: center.y - halfH },
        { x: center.x + halfW, y: center.y + halfH },
        { x: center.x - halfW, y: center.y + halfH },
    ];
    if (rotation === 0) {
        return corners;
    }
    return corners.map((point) => rotatePoint(point, center, rotation));
}

function projectPoints(points: Vec2[], axis: Vec2) {
    const normalized = Vec2.normalized(axis);
    const firstPoint = points[0]!;
    let min = Vec2.dot(firstPoint, normalized);
    let max = min;
    for (let i = 1; i < points.length; i += 1) {
        const projection = Vec2.dot(points[i]!, normalized);
        if (projection < min) min = projection;
        if (projection > max) max = projection;
    }
    return { min, max };
}

function axisOverlap(projA: { min: number; max: number }, projB: { min: number; max: number }) {
    return projA.max >= projB.min && projB.max >= projA.min;
}

function rotatedRectIntersect(a: Position & Collider, b: Position & Collider, rotA: number, rotB: number): boolean {
    if (rotA === 0 && rotB === 0) {
        return !(a.pos.x > b.pos.x + b.w ||
            a.pos.x + a.w < b.pos.x ||
            a.pos.y > b.pos.y + b.h ||
            a.pos.y + a.h < b.pos.y);
    }

    const cornersA = getRectCorners(a, rotA);
    const cornersB = getRectCorners(b, rotB);
    const axes = [
        Vec2.sub(cornersA[1]!, cornersA[0]!),
        Vec2.sub(cornersA[3]!, cornersA[0]!),
        Vec2.sub(cornersB[1]!, cornersB[0]!),
        Vec2.sub(cornersB[3]!, cornersB[0]!),
    ];

    for (const axis of axes) {
        const projA = projectPoints(cornersA, axis);
        const projB = projectPoints(cornersB, axis);
        if (!axisOverlap(projA, projB)) {
            return false;
        }
    }

    return true;
}

function pointInRotatedRect(point: Vec2, rect: Position & Collider, rotation: number): boolean {
    const center = getColliderCenter(rect);
    const local = rotatePoint(point, center, -rotation);
    return (
        Math.abs(local.x - center.x) <= rect.w * 0.5 &&
        Math.abs(local.y - center.y) <= rect.h * 0.5
    );
}

function pointInRotatedEllipse(point: Vec2, ellipse: Position & Collider, rotation: number): boolean {
    const center = getColliderCenter(ellipse);
    const local = rotatePoint(point, center, -rotation);
    const rx = ellipse.w * 0.5;
    const ry = ellipse.h * 0.5;
    const dx = local.x - center.x;
    const dy = local.y - center.y;
    return dx * dx / (rx * rx) + dy * dy / (ry * ry) <= 1;
}

function transformPointToUnitCircle(point: Vec2, ellipse: Position & Collider, rotation: number): Vec2 {
    const center = getColliderCenter(ellipse);
    const local = rotatePoint(point, center, -rotation);
    return {
        x: (local.x - center.x) / (ellipse.w * 0.5),
        y: (local.y - center.y) / (ellipse.h * 0.5),
    };
}

function segmentIntersectsUnitCircle(a: Vec2, b: Vec2): boolean {
    const ab = Vec2.sub(b, a);
    const ab2 = Vec2.mag2(ab);
    if (ab2 === 0) {
        return Vec2.mag2(a) <= 1;
    }

    const t = Utils.clamp(-Vec2.dot(a, ab) / ab2, 0, 1);
    const closest = Vec2.add(a, Vec2.mul(ab, t));
    return Vec2.mag2(closest) <= 1;
}

function ellipseRectIntersect(ellipse: Position & Collider, rect: Position & Collider, rotEllipse: number, rotRect: number): boolean {
    const rectCorners = getRectCorners(rect, rotRect);
    if (rectCorners.some((corner) => pointInRotatedEllipse(corner, ellipse, rotEllipse))) {
        return true;
    }
    if (pointInRotatedRect(getColliderCenter(ellipse), rect, rotRect)) {
        return true;
    }

    const unitCorners = rectCorners.map((corner) => transformPointToUnitCircle(corner, ellipse, rotEllipse));
    for (let i = 0; i < 4; i += 1) {
        const a = unitCorners[i]!;
        const b = unitCorners[(i + 1) % 4]!;
        if (segmentIntersectsUnitCircle(a, b)) {
            return true;
        }
    }

    return false;
}

function ellipseSupportRadius(ellipse: Position & Collider, direction: Vec2, rotation: number): number {
    const local = rotateVector(direction, -rotation);
    const rx = ellipse.w * 0.5;
    const ry = ellipse.h * 0.5;
    return Math.hypot(local.x * rx, local.y * ry);
}

function ellipseEllipseIntersect(a: Position & Collider, b: Position & Collider, rotA: number, rotB: number): boolean {
    const centerA = getColliderCenter(a);
    const centerB = getColliderCenter(b);

    if (pointInRotatedEllipse(centerA, b, rotB) || pointInRotatedEllipse(centerB, a, rotA)) {
        return true;
    }

    const delta = Vec2.sub(centerB, centerA);
    const distance = Vec2.mag(delta);
    if (distance === 0) {
        return true;
    }

    const direction = Vec2.div(delta, distance);
    const radiusA = ellipseSupportRadius(a, direction, rotA);
    const radiusB = ellipseSupportRadius(b, { x: -direction.x, y: -direction.y }, rotB);
    return distance <= radiusA + radiusB;
}

/**
 * Collider utilities.
 * Rotated rectangles and ellipses are both supported.
 */
export const Collider = {
    intersects(a: Position & Collider & Partial<Rotation>, b: Position & Collider & Partial<Rotation>): boolean {
        const rotA = a.rotation ?? 0;
        const rotB = b.rotation ?? 0;

        if (!a.round && !b.round) {
            return rotatedRectIntersect(a, b, rotA, rotB);
        }

        if (a.round && b.round) {
            return ellipseEllipseIntersect(a, b, rotA, rotB);
        }

        if (a.round) {
            return ellipseRectIntersect(a, b, rotA, rotB);
        }

        return ellipseRectIntersect(b, a, rotB, rotA);
    },
};

/**
 * an interface for any entity.
 */
export interface Entity extends Transform, Velocity, Collider {
    /**
     * must implement this for it to be updated every frame
     * @param dt delta time
     */
    update(dt: number): void;
    /**
     * must implement this for it to be rendered
     * @param batch the batch to draw with. it is usually one instance passed around everywhere
     */
    draw(batch: SpriteBatch): void;
}

/**
 * type for colors. rgba values range from 0-1.
 */
export type Color = {
    r: number;
    g: number;
    b: number;
    a: number;
};

/**
 * alias for color for british people. this is not serious. 
 * typescript type aliases are kinda useless
 */
export type Colour = Color;

export const Color = {
    new(r = 1, g = 1, b = 1, a = 1) {
        return { r, g, b, a };
    },

    /**
     * Clones the given color object.
     * @param c The color to clone.
     * @returns A copy of the color object.
     */
    clone(c: Color) {
        return { r: c.r, g: c.g, b: c.b, a: c.a };
    },

    // shorthands for common colors

    /**
     * Red. RGBA: (1, 0, 0, 1)
     */
    get red(): Color {
        return { r: 1, g: 0, b: 0, a: 1 };
    },

    /**
     * Green. RGBA: (0, 1, 0, 1)
     */
    get green(): Color {
        return { r: 0, g: 1, b: 0, a: 1 };
    },

    /**
     * Blue. RGBA: (0, 0, 1, 1)
     */
    get blue(): Color {

        return { r: 0, g: 0, b: 1, a: 1 };
    },

    /**
     * Black. RGBA: (0, 0, 0, 1)
     */
    get black(): Color {
        return { r: 0, g: 0, b: 0, a: 1 };
    },

    /**
     * White. RGBA: (1, 1, 1, 1)
     */
    get white(): Color {
        return { r: 1, g: 1, b: 1, a: 1 };
    },

    /**
     * Empty. RGBA: (0, 0, 0, 0)
     */
    get empty(): Color {
        return { r: 0, g: 0, b: 0, a: 0 };
    }
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
