import SpriteBatch, { type fontData as fontData } from "./graphics/SpriteBatch.js";
import { generateFontAtlas, createTextureFromCanvas, Vec2, Color, CharUtils, type Entity } from "./utils.js";
import Player from "./entities/player.js";
import CharEntity, { charBehaviors } from "./entities/CharEntity.js";
import Enemy from "./entities/Enemy.js";
import { fetchArticle, ProgressiveHTMLRenderer } from "./net/fetchArticle.js";
import ImageEntity from "./entities/ImageEntity.js";
import RectEntity from "./entities/RectEntity.js";

// get canvas and webgl context
const canvas = document.querySelector("canvas")!;
// set size to window so projection matches viewport
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const gl = canvas.getContext("webgl2")!;

if (!gl) {
    throw new Error("No webgl!!!")
}

// enable blending (yummy)
gl.enable(gl.BLEND);
// premultiplied alpha blending (i have no idea what this means, i'm not a graphics programmer)
// gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

// Setup projection
const proj = new Float32Array([
    2 / canvas.width, 0, 0, 0,
    0, -2 / canvas.height, 0, 0,
    0, 0, 1, 0,
    -1, 1, 0, 1,
]);

// batches for drawing more efficiently by minimizing texture binds and draw calls
const batches = {
    /**
     * batch for drawing solid color rectangles
     */
    solid: new SpriteBatch(gl),
    /**
     * batch for drawing characters
     */
    font: new SpriteBatch(gl),
    /**
     * batch for drawing dynamic textures such as images that are loaded at runtime
     */
    dynamic: new SpriteBatch(gl)
};

// Set projection for the batches
for (const batch of Object.values(batches)) {
    batch.setProjection(proj);
}

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

// set textures of the batches after creating all required textures
// except for dynamic
batches.solid.setTexture(whiteTex);
batches.font.setTexture(fontTex);

CharUtils.fontData = { metrics, texture: fontTex, width: fontCanvas.width, height: fontCanvas.height };

// Game state
const player = new Player(Vec2.new(canvas.width / 2, canvas.height - 100));

let url = "cursor.png";

player.playerTexture = await new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
        const texture = gl.createTexture();
        if (!texture) { // probably won't happen
            console.log("Failed to create texture for image:", url);
            resolve(null);
            return;
        }

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
            gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        resolve(texture);
    };
    image.onerror = () => resolve(null);
    image.src = url;
});

// Entity array
export const entities: Entity[] = [];

// array of enemies
// it is a separate array because enemies are not entities and are just groupers of char entities to update them together
const enemies: Enemy[] = [];

const imagesThisFrame: ImageEntity[] = [];
const rectsThisFrame: RectEntity[] = [];

entities.push(player);

const renderer = new ProgressiveHTMLRenderer(gl, 1600);

let html = "<h1>Loading article...</h1>";

async function loadArticle(url: string) {
    try {
        const articleHtml = await fetchArticle(url);
        entities.push(...await renderer.render(articleHtml, CharEntity));
    } catch (error) {
        console.error("Failed to fetch article:", error);
        entities.push(...await renderer.render(
            "<h1>Sorry, the article failed to load due to CORS or network error.</h1>",
            CharEntity
        ));
    }
}

// initial placeholder while the Wikipedia article loads in the background
entities.push(...await renderer.render(html, CharEntity));
// loadArticle("https://en.wikipedia.org/wiki/Cat");

// temp array of chars to put into an enemy for testing, will be removed when the actual level loading is implemented
let temp = [
    new CharEntity("q", 100, 100, 30, Color.blue, charBehaviors.enemy),
    new CharEntity("w", 120, 100, 30, Color.blue, charBehaviors.enemy),
    new CharEntity("e", 140, 100, 30, Color.blue, charBehaviors.enemy),
    new CharEntity("r", 160, 100, 30, Color.blue, charBehaviors.enemy),
    new CharEntity("t", 100, 125, 30, Color.blue, charBehaviors.enemy),
    new CharEntity("y", 120, 125, 30, Color.blue, charBehaviors.enemy),
    new CharEntity("u", 140, 125, 30, Color.blue, charBehaviors.enemy),
    new CharEntity("i", 160, 125, 30, Color.blue, charBehaviors.enemy)
];

entities.push(...temp); // add temp chars to entities so they get drawn and updated

const testEnemy = new Enemy(...temp);

enemies.push(testEnemy); // temp enemy for testing

let lastTime = performance.now();


 html = `
    <h1><u>Physics Browser!</u></h1>
    <p>This should be a paragraph with <strong>bold text</strong>.</p>
    <p>This should be a paragraph with <i>italic text</i>.</p>
    <p>This should be a paragraph with <u>underlined text</u>.</p>
    <p><b><i><u>All at once!</u></i></b></p>
    <p>All the characters typable on my keyboard: \`1234567890-=qwertyuiop[]\\asdfghjkl;'zxcvbnm,./~!@#$%^&*()_+QWERTYUIOP{}|ASDFGHJKL:\"ZXCVBNM<>? lol 你好</p>
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


entities.push(...await renderer.render(html, CharEntity));

// i hate you stupid AI refactor you broke everything

/**
 * stuff done each frame
 * @param currentTime current time in milliseconds, provided by requestAnimationFrame
 */
function frame(currentTime: number) {
    const dt = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;

    // Clear the color buffer
    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    batches.solid.begin();
    batches.font.begin();

    // Update entities
    for (let i = entities.length - 1; i >= 0; i--) {
        const entity = entities[i];
        if (!entity) continue;

        if (entity instanceof Player) {
            entity.update(dt);
            // do not draw the player now
        } else if (entity instanceof CharEntity) {
            entity.update(dt);
            if (entity.behavior === charBehaviors.remove) {
                entities.splice(i, 1);
            }
            entity.draw(batches.font);
        } else if (entity instanceof ImageEntity) {
            imagesThisFrame.push(entity);
        } else if (entity instanceof RectEntity) {
            rectsThisFrame.push(entity);
        }
    }

    // Update enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i]!; // the null assertion here will probably be a problem later but whatever
        enemy.update(dt);
        if (!enemy.alive) {
            enemies.splice(i, 1);
        }
    }
    
    rectsThisFrame.sort((a, b) => a.z - b.z); // sort by z value
    for (let i: number = 0; i < rectsThisFrame.length; i++) {
        rectsThisFrame[i]!.draw(batches.solid);
    }

    // draw solid texture objects in the back
    batches.solid.end();
    // draw text in the middle
    batches.font.end();

    // sort and draw the images
    imagesThisFrame.sort((a, b) => a.z - b.z);
    for (let i: number = 0; i < imagesThisFrame.length; i++) {
        imagesThisFrame[i]!.draw(batches.dynamic);
    }

    // draw the player last for it to appear on the top
    player.draw(batches.dynamic);

    // start the next frame
    requestAnimationFrame(frame);
}

// start the loop
requestAnimationFrame(frame);