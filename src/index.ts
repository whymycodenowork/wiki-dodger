import SpriteBatch, { type fontData as fontData } from "./graphics/SpriteBatch.js";
import { generateFontAtlas, createTextureFromCanvas, Utils, Vec2, Color, CharUtils, Rect } from "./utils.js";
import Player from "./entities/player.js";
import CharEntity, { charBehaviors } from "./entities/CharEntity.js";
import Enemy from "./entities/Enemy.js";
import { ProgressiveHTMLRenderer } from "./net/fetchArticle.js";
import type ImageEntity from "./entities/ImageEntity.js";
import type RectEntity from "./entities/RectEntity.js";

const canvas = document.querySelector("canvas")!;
// set size to window so projection matches viewport
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext("webgl2")!;

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

const batch = new SpriteBatch(gl);

// Setup projection
const proj = new Float32Array([
    2 / canvas.width, 0, 0, 0,
    0, -2 / canvas.height, 0, 0,
    0, 0, 1, 0,
    -1, 1, 0, 1,
]);
batch.setProjection(proj);

const whiteTex = gl.createTexture()!;
gl.bindTexture(gl.TEXTURE_2D, whiteTex);

// 1x1 white pixel
const pixel = new Uint8Array([255, 255, 255, 255]);
gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    pixel
);

// Required for non-power-of-two textures
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

// create font atlas and texture
const { canvas: fontCanvas, metrics } = generateFontAtlas(32);
const fontTex = createTextureFromCanvas(gl, fontCanvas)

CharUtils.fontData = { metrics, texture: fontTex, width: fontCanvas.width, height: fontCanvas.height };

// Game state
const player = new Player(Vec2.new(canvas.width / 2, canvas.height / 2));
const enemies: Enemy[] = [];
const chars: CharEntity[] = [];

const imageEntities: ImageEntity[] = [];
const rectEntities: RectEntity[] = [];

// initializeLevel("Fanta Cake").catch(console.error); // TODO: make the stuff actually work

const testEnemy = new Enemy(
    new CharEntity("q", 100, 100, 30, Color.blue, charBehaviors.enemy),
    new CharEntity("w", 120, 100, 30, Color.blue, charBehaviors.enemy),
    new CharEntity("e", 140, 100, 30, Color.blue, charBehaviors.enemy),
    new CharEntity("r", 160, 100, 30, Color.blue, charBehaviors.enemy),
    new CharEntity("t", 100, 125, 30, Color.blue, charBehaviors.enemy),
    new CharEntity("y", 120, 125, 30, Color.blue, charBehaviors.enemy),
    new CharEntity("u", 140, 125, 30, Color.blue, charBehaviors.enemy),
    new CharEntity("i", 160, 125, 30, Color.blue, charBehaviors.enemy)
);

enemies.push(testEnemy); // temp enemy for testing


let lastTime = performance.now();

const renderer = new ProgressiveHTMLRenderer(gl, 1600);

const html = `
    <h1>Physics Browser!</h1>
    <p>This should be a paragraph with <strong>bold text</strong>.</p>
    <p>All the characters typable on my keyboard: \`1234567890-=qwertyuiop[]\\asdfghjkl;'zxcvbnm,./~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:\"ZXCVBNM<>? lol</p>
    <p>Here is a list:</p>
    <ul>
        <li>First item</li>
        <li>Second item</li>
    </ul>
    <p>Here is another list, this time numbered:</p>
    <ol>
        <li>First item</li>
        <li>Second item</li>
    </ol>
    <p>Here is a table:</p>
    <table>
        <tr>
            <th>Header 1</th>
            <th>Header 2</th>
            <th>Header 3</th>
        </tr>
        <tr>
            <td>Cell 1</td>
            <td>Cell 2</td>
            <td>Cell 3</td>
        </tr>
        <tr>
            <td>Cell 4</td>
            <td>Cell 5</td>
            <td>Cell 6</td>
        </tr>
    </table>
    <p>Here is an image:</p>
    <img src="image.png" width="200" height="150">
`;

const result = await renderer.render(html, CharEntity);

chars.push(...result.charEntities);
imageEntities.push(...result.imageEntities);
rectEntities.push(...result.rectEntities);


function frame(currentTime: number) {
    const dt = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    // Update
    player.update(dt);

    // Update enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (!enemy) continue;
        // Only start attacking when player scrolls to their Y position
        const firstChar = enemy.chars[0];
        if (firstChar && Math.abs(player.pos.y - firstChar.pos.y) < 400) {
            enemy.update(dt, chars);
            if (!enemy.alive) {
                // Remove dead enemy
                enemies.splice(i, 1);
            }
        }
    }

    for (let i = chars.length - 1; i >= 0; i--) {
        const char = chars[i];

        if (!char) continue; // ts complains when i don't do this

        char.update(dt);

        if (char.behavior === charBehaviors.remove) {
            chars.splice(i, 1);
        }
    }

    // Render
    gl.clearColor(0, 0.5, 0.5, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // draw stuff with blank texture
    batch.begin();

    batch.setTexture(whiteTex);

    player.draw(batch);

    // draw rects
    for (const rect of rectEntities) {
        rect.draw(batch);
    }

    batch.end();

    // draw glyphs
    batch.begin();

    batch.setTexture(fontTex);

    // Draw enemies
    for (const enemy of enemies) {
        enemy.draw(batch);
    }

    // Draw bullets
    for (const bullet of chars) {
        bullet.draw(batch);
    }

    batch.end();

    // draw stuff with other textures

    // draw images
    for (const img of imageEntities) {
        img.draw(batch);
    }

    // draw top layer (players, ui, etc)
    batch.begin();

    batch.setTexture(whiteTex);

    player.draw(batch);

    batch.end();

    // loop
    requestAnimationFrame(frame);
}
requestAnimationFrame(frame);