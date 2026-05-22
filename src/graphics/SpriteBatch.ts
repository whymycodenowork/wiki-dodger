// src/graphics/SpriteBatch.ts
import { VERT_SRC, FRAG_SRC } from "./shaders.js";
import { CharUtils, Color, type charMetrics } from "../utils.js";

export default class SpriteBatch {
    private gl: WebGL2RenderingContext;
    private program: WebGLProgram;

    private vao: WebGLVertexArrayObject;
    private vbo: WebGLBuffer;

    private spriteData: Float32Array;
    private spriteCount = 0;

    private maxSprites: number;
    private floatsPerSprite = 6 * 4;
    // (x, y, w, h, u0, v0, u1, v1, r, g, b, a, z)
    // Actually 17 floats, but we expand into 6 vertices (triangles)
    private floatsPerVertex = 9; // pos(2), uv(2), color(4), z(1)

    private projectionLoc: WebGLUniformLocation | null;
    private textureLoc: WebGLUniformLocation | null;
    private currentTexture: WebGLTexture | null = null;

    constructor(gl: WebGL2RenderingContext, maxSprites = 10_000) { // 10 000 should probably be enough
        this.gl = gl;
        this.maxSprites = maxSprites;
        this.spriteData = new Float32Array(maxSprites * 6 * this.floatsPerVertex);

        this.program = this.createProgram(VERT_SRC, FRAG_SRC);
        this.vao = gl.createVertexArray()!;
        this.vbo = gl.createBuffer()!;

        this.projectionLoc = gl.getUniformLocation(this.program, "uProjection");
        this.textureLoc = gl.getUniformLocation(this.program, "uTexture");

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);

        const stride = this.floatsPerVertex * 4;

        // Position (vec2)
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0);

        // UV (vec2)
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 8);

        // Color (vec4)
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, stride, 16);

        // Z (float)
        gl.enableVertexAttribArray(3);
        gl.vertexAttribPointer(3, 1, gl.FLOAT, false, stride, 32);

        gl.bindVertexArray(null);
    }

    begin() {
        this.spriteCount = 0;
    }

    setTexture(tex: WebGLTexture | null) {
        this.currentTexture = tex;
    }

    /**
     * Draws a sprite with the given parameters. Rotation is in radians.
     * @param x the x position of the top left corner of the sprite
     * @param y the y position of the top left corner of the sprite
     * @param w the width of the sprite
     * @param h the height of the sprite
     * @param u0 the u coordinate of the top left corner of the texture
     * @param v0 the v coordinate of the top left corner of the texture
     * @param u1 the u coordinate of the bottom right corner of the texture
     * @param v1 the v coordinate of the bottom right corner of the texture
     * @param color the color of the sprite
     * @param rotation the rotation of the sprite in radians
     * @param z the depth value for rendering order
     * @returns nothing
     */
    draw(
        x: number, y: number,
        w: number, h: number,
        u0: number, v0: number,
        u1: number, v1: number,
        color: Color, rotation = 0, z = 0
    ): void {
        if (this.spriteCount >= this.maxSprites) return; // probably won't happen but just in case

        const base = this.spriteCount * 6 * this.floatsPerVertex;
        const d = this.spriteData;

        // 2 triangles = 6 vertices
        // Rotate vertices around center by `rotation` (radians)
        const cx = x + w * 0.5;
        const cy = y + h * 0.5;
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);

        const tlx = x - cx, tly = y - cy; // top-left
        const trx = x + w - cx, try_ = y - cy; // top-right
        const brx = x + w - cx, bry = y + h - cy; // bottom-right
        const blx = x - cx, bly = y + h - cy; // bottom-left

        const rot = (lx: number, ly: number) => {
            const rx = lx * cos - ly * sin + cx;
            const ry = lx * sin + ly * cos + cy;
            return [rx, ry];
        };

        const [tlrx, tlry] = rot(tlx, tly);
        const [trrx, trry] = rot(trx, try_);
        const [brrx, brry] = rot(brx, bry);
        const [blrX, blrY] = rot(blx, bly);

        const r = color.r;
        const g = color.g;
        const b = color.b;
        const a = color.a;

        const verts = [
            [tlrx, tlry, u0, v0, r, g, b, a, z],
            [trrx, trry, u1, v0, r, g, b, a, z],
            [brrx, brry, u1, v1, r, g, b, a, z],

            [tlrx, tlry, u0, v0, r, g, b, a, z],
            [brrx, brry, u1, v1, r, g, b, a, z],
            [blrX, blrY, u0, v1, r, g, b, a, z],
        ];

        let ptr = base;
        for (const v of verts) {
            d[ptr++] = v[0] ?? 0;
            d[ptr++] = v[1] ?? 0;
            d[ptr++] = v[2] ?? 0;
            d[ptr++] = v[3] ?? 0;
            d[ptr++] = v[4] ?? 0;
            d[ptr++] = v[5] ?? 0;
            d[ptr++] = v[6] ?? 0;
            d[ptr++] = v[7] ?? 0;
            d[ptr++] = v[8] ?? 0;
        }

        this.spriteCount++;
    }

    drawGlyph(char: string, x: number, y: number, fontSize: number, color = Color.white, rotation = 0, italic = false, z = 0): number {

        const fontData = CharUtils.fontData;

        const info: charMetrics = fontData.metrics[char] ?? fontData.metrics['?']!;
        if (!info) return 0;

        const u0 = info.x / fontData.width;
        const v0 = info.y / fontData.height;
        const u1 = (info.x + info.w) / fontData.width;
        const v1 = (info.y + info.h) / fontData.height;

        const scale = fontSize / info.h;
        const w = info.w * scale;
        const h = info.h * scale;

        // Apply italic skew (shift top-right corner to the right)
        let xOffset = 0;
        if (italic) {
            xOffset = h * 0.2; // Skew angle
            // did you know that if you google "askew"
            // it rotates the page slightly
            this.drawSkewed(x, y, w, h, xOffset, u0, v0, u1, v1, color, rotation, z);
        } else {
            this.draw(
                x, y,
                w, h,
                u0, v0,
                u1, v1,
                color,
                rotation,
                z
            );
        }

        return info.advance * scale;
    }

    drawUnderline(x: number, y: number, width: number, height: number, color: Color, z = 0): void {
        this.draw(x, y, width, height, 0, 0, 1, 1, color, 0, z);
    }

    private drawSkewed(
        x: number, y: number,
        w: number, h: number,
        xSkew: number,
        u0: number, v0: number,
        u1: number, v1: number,
        color: Color, rotation = 0, z = 0
    ): void {
        if (this.spriteCount >= this.maxSprites) return;

        const base = this.spriteCount * 6 * this.floatsPerVertex;
        const d = this.spriteData;

        // Apply skew transformation for italic effect
        const cx = x + w * 0.5;
        const cy = y + h * 0.5;
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);

        // Top-left, top-right (skewed), bottom-right (skewed), bottom-left vertices
        const tlx = x - cx, tly = y - cy;
        const trx = x + w + xSkew - cx, try_ = y - cy;
        const brx = x + w - cx, bry = y + h - cy;
        const blx = x - xSkew - cx, bly = y + h - cy;

        const rot = (lx: number, ly: number) => {
            const rx = lx * cos - ly * sin + cx;
            const ry = lx * sin + ly * cos + cy;
            return [rx, ry];
        };

        const [tlrx, tlry] = rot(tlx, tly);
        const [trrx, trry] = rot(trx, try_);
        const [brrx, brry] = rot(brx, bry);
        const [blrX, blrY] = rot(blx, bly);

        const r = color.r;
        const g = color.g;
        const b = color.b;
        const a = color.a;

        const verts = [
            [tlrx, tlry, u0, v0, r, g, b, a, z],
            [trrx, trry, u1, v0, r, g, b, a, z],
            [brrx, brry, u1, v1, r, g, b, a, z],

            [tlrx, tlry, u0, v0, r, g, b, a, z],
            [brrx, brry, u1, v1, r, g, b, a, z],
            [blrX, blrY, u0, v1, r, g, b, a, z],
        ];

        let ptr = base;
        for (const v of verts) {
            d[ptr++] = v[0] ?? 0;
            d[ptr++] = v[1] ?? 0;
            d[ptr++] = v[2] ?? 0;
            d[ptr++] = v[3] ?? 0;
            d[ptr++] = v[4] ?? 0;
            d[ptr++] = v[5] ?? 0;
            d[ptr++] = v[6] ?? 0;
            d[ptr++] = v[7] ?? 0;
            d[ptr++] = v[8] ?? 0;
        }

        this.spriteCount++;
    }

    // not really used anywhere but it's nice to have for like debug UI
    drawText(text: string, x: number, y: number, size: number, color = Color.white, rotation = 0, lineSpacing = 1.2, z = 0) {
        let offsetX = 0;
        let offsetY = 0;
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const lineHeight = size * lineSpacing; // line height relative to font size

        for (const ch of text) {
            // Handle newlines
            if (ch === '\n') {
                offsetX = 0;
                offsetY += lineHeight;
                continue;
            }

            // Rotate character position around text origin
            const rotX = x + offsetX * cos - offsetY * sin;
            const rotY = y + offsetX * sin + offsetY * cos;

            const adv = this.drawGlyph(ch, rotX, rotY, size, color, rotation, false, z);
            
            // Advance along the rotated direction
            offsetX += adv;
        }
    }

    end() {
        const gl = this.gl;
        gl.useProgram(this.program);
        gl.bindVertexArray(this.vao);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.currentTexture);
        gl.uniform1i(this.textureLoc, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            this.spriteData.subarray(0, this.spriteCount * 6 * this.floatsPerVertex),
            gl.DYNAMIC_DRAW
        );

        gl.drawArrays(gl.TRIANGLES, 0, this.spriteCount * 6);

        gl.bindVertexArray(null);
    }

    setProjection(matrix4x4: Float32Array) {
        this.gl.useProgram(this.program);
        this.gl.uniformMatrix4fv(this.projectionLoc, false, matrix4x4);
    }

    private createProgram(vs: string, fs: string): WebGLProgram {
        const gl = this.gl;
        const p = gl.createProgram()!;
        const v = this.compile(gl.VERTEX_SHADER, vs);
        const f = this.compile(gl.FRAGMENT_SHADER, fs);
        gl.attachShader(p, v);
        gl.attachShader(p, f);
        gl.linkProgram(p);

        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(p) || "Program link error");
        }
        return p;
    }

    private compile(type: GLenum, src: string) {
        const gl = this.gl;
        const s = gl.createShader(type)!;
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(s) || "Shader compile error");
        }
        return s;
    }
}

export type fontData = {
    metrics: Record<string, charMetrics>; texture: WebGLTexture; width: number; height: number;
};