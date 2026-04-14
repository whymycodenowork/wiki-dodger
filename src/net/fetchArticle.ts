import { Vec2, Color, CharUtils} from '../utils.js';
import ImageEntity from '../entities/ImageEntity.js';
import RectEntity from '../entities/RectEntity.js';

// ============================================================================
// Style Definitions (Wikipedia-like)
// ============================================================================

interface ComputedStyle {
    fontSize: number;
    color: Color;
    backgroundColor: Color | null;
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
    paddingTop: number;
    paddingBottom: number;
    paddingLeft: number;
    paddingRight: number;
    borderWidth: number;
    borderColor: Color | null;
    lineHeight: number;
    fontWeight: 'normal' | 'bold';
    textAlign: 'left' | 'center' | 'right';
}

const DEFAULT_STYLES: Record<string, Partial<ComputedStyle>> = {
    'body': {
        fontSize: 14,
        color: Color.new(0, 0, 0, 1),
        backgroundColor: Color.white,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        lineHeight: 1.6
    },
    'h1': {
        fontSize: 32,
        fontWeight: 'bold',
        marginTop: 21,
        marginBottom: 21,
        lineHeight: 1.3
    },
    'h2': {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 19,
        marginBottom: 10,
        lineHeight: 1.3
    },
    'h3': {
        fontSize: 19,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
        lineHeight: 1.3
    },
    'h4': {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 14,
        marginBottom: 7,
        lineHeight: 1.3
    },
    'h5': {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 12,
        marginBottom: 6,
        lineHeight: 1.3
    },
    'h6': {
        fontSize: 13,
        fontWeight: 'bold',
        marginTop: 11,
        marginBottom: 5,
        lineHeight: 1.3
    },
    'p': {
        marginTop: 0,
        marginBottom: 16,
    },
    'ul': {
        marginTop: 0,
        marginBottom: 16,
        marginLeft: 0,
        paddingLeft: 40
    },
    'ol': {
        marginTop: 0,
        marginBottom: 16,
        marginLeft: 0,
        paddingLeft: 40
    },
    'li': {
        marginBottom: 4
    },
    'table': {
        borderWidth: 1,
        borderColor: Color.new(0.627, 0.627, 0.627, 1),
        marginTop: 8,
        marginBottom: 16,
        backgroundColor: Color.new(0.976, 0.976, 0.976, 1)
    },
    'th': {
        backgroundColor: Color.new(0.918, 0.925, 0.941, 1),
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 8,
        paddingRight: 8,
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: Color.new(0.627, 0.627, 0.627, 1)
    },
    'td': {
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 8,
        paddingRight: 8,
        borderWidth: 1,
        borderColor: Color.new(0.627, 0.627, 0.627, 1)
    },
    'img': {
        marginTop: 4,
        marginBottom: 4
    },
    'strong': {
        fontWeight: 'bold'
    },
    'b': {
        fontWeight: 'bold'
    }
};

function getComputedStyle(tagName: string, parentStyle?: ComputedStyle): ComputedStyle {
    const base: ComputedStyle = parentStyle ? { ...parentStyle } : {
        fontSize: 14,
        color: Color.new(0, 0, 0, 1),
        backgroundColor: null,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        paddingTop: 0,
        paddingBottom: 0,
        paddingLeft: 0,
        paddingRight: 0,
        borderWidth: 0,
        borderColor: null,
        lineHeight: 1.6,
        fontWeight: 'normal',
        textAlign: 'left'
    };

    const tagStyle = DEFAULT_STYLES[tagName.toLowerCase()] || {};
    return { ...base, ...tagStyle };
}

// ============================================================================
// Layout Engine
// ============================================================================

class HTMLRenderer {
    private charEntities: any[] = [];
    private imageEntities: ImageEntity[] = [];
    private rectEntities: RectEntity[] = [];
    private containerWidth: number;
    private currentY: number = 0;
    private gl: WebGLRenderingContext;
    private images: Map<string, WebGLTexture> = new Map();

    constructor(gl: WebGLRenderingContext, containerWidth: number = 800) {
        this.gl = gl;
        this.containerWidth = containerWidth;
    }

    async parseHTML(htmlString: string, CharEntity: any): Promise<void> {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlString, 'text/html');
        const body = doc.body;

        this.charEntities = [];
        this.imageEntities = [];
        this.rectEntities = [];
        this.currentY = 0;

        const bodyStyle = getComputedStyle('body');
        await this.renderElement(body, 0, this.containerWidth, bodyStyle, CharEntity);
    }

    private async renderElement(
        element: Element,
        x: number,
        maxWidth: number,
        parentStyle: ComputedStyle,
        CharEntity: any
    ): Promise<number> {
        const tagName = element.tagName.toLowerCase();
        const style = getComputedStyle(tagName, parentStyle);

        // Apply margins
        x += style.marginLeft;
        this.currentY += style.marginTop;
        const contentX = x + style.paddingLeft + style.borderWidth;
        const contentY = this.currentY + style.paddingTop + style.borderWidth;
        const contentWidth = maxWidth - style.marginLeft - style.marginRight -
            style.paddingLeft - style.paddingRight - (style.borderWidth * 2);

        let startY = this.currentY;

        // Draw background (measure first) - skip for body element
        if (style.backgroundColor) {
            const bgHeight = await this.measureElementHeight(element, contentWidth, style, CharEntity);
            this.rectEntities.push(new RectEntity(
                x,
                this.currentY,
                maxWidth - style.marginLeft - style.marginRight,
                bgHeight,
                style.backgroundColor
            ));
        }

        this.currentY = contentY;

        // Handle specific elements
        if (tagName === 'img') {
            await this.renderImage(element as HTMLImageElement, contentX, contentWidth);
        } else if (tagName === 'table') {
            await this.renderTable(element, contentX, contentWidth, style, CharEntity);
        } else if (tagName === 'ul' || tagName === 'ol') {
            await this.renderList(element, contentX, contentWidth, tagName === 'ol', style, CharEntity);
        } else if (tagName === 'br') {
            this.currentY += style.fontSize * style.lineHeight;
        } else {
            // Render text content and children
            await this.renderTextContent(element, contentX, contentWidth, style, CharEntity);
        }

        this.currentY += style.paddingBottom + style.borderWidth + style.marginBottom;

        // Draw border
        if (style.borderWidth > 0 && style.borderColor) {
            const borderHeight = this.currentY - startY - style.marginBottom;
            this.drawBorder(x, startY, maxWidth - style.marginLeft - style.marginRight,
                borderHeight, style.borderWidth, style.borderColor);
        }

        return this.currentY;
    }

    private createCharEntity(char: string, x: number, y: number, style: ComputedStyle, CharEntity: any): any { // so i don't have to change every use of the constructor if i were to change it
        const charEntity = new CharEntity();
        charEntity.pos = Vec2.new(x, y);
        charEntity.char = char;
        charEntity.size = style.fontSize;
        charEntity.color = style.color;
        return charEntity;
    }

    private async renderTextContent(
        element: Element,
        x: number,
        maxWidth: number,
        style: ComputedStyle,
        CharEntity: any
    ): Promise<void> {
        let currentX = x;
        const lineHeight = style.fontSize * style.lineHeight;
        let hasContent = false;

        for (const node of Array.from(element.childNodes)) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = (node.textContent || '').replace(/\n/g, ' ').replace(/\s+/g, ' ');
                if (!text) continue;

                // Process character by character for better control
                let i = 0;
                while (i < text.length) {
                    const char = text[i];
                    if (!char) continue;
                    const charWidth = CharUtils.getWidth(char, style.fontSize);
                    
                    // Check for word boundaries (space or start of word)
                    if (char !== ' ') {
                        // Find end of word
                        let wordEnd = i;
                        let wordWidth = 0;
                        while (wordEnd < text.length && text[wordEnd] && text[wordEnd] !== ' ') {
                            const wchar = text[wordEnd];
                            if (!wchar) continue;
                            wordWidth += CharUtils.getWidth(wchar, style.fontSize);
                            wordEnd++;
                        }
                        
                        // Word wrap if needed
                        if (currentX + wordWidth > x + maxWidth && currentX > x) {
                            currentX = x;
                            this.currentY += lineHeight;
                            hasContent = false;
                        }
                    } else if (!hasContent) {
                        // Skip leading space on new line
                        i++;
                        continue;
                    }

                    // Create character entity
                    const charEntity = this.createCharEntity(char, currentX, this.currentY, style, CharEntity);
                    this.charEntities.push(charEntity);
                    hasContent = true;

                    // Advance X position
                    currentX += charWidth;
                    i++;
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const childElement = node as Element;
                const childStyle = getComputedStyle(childElement.tagName.toLowerCase(), style);

                // Inline elements continue on same line
                if (this.isInlineElement(childElement.tagName)) {
                    const result = await this.renderInlineElement(
                        childElement,
                        currentX,
                        x,
                        maxWidth,
                        childStyle,
                        CharEntity
                    );
                    currentX = result.x;
                    hasContent = result.hasContent || hasContent;
                } else {
                    // Block elements start new line
                    if (hasContent) {
                        this.currentY += lineHeight;
                        currentX = x;
                        hasContent = false;
                    }
                    await this.renderElement(childElement, x, maxWidth, style, CharEntity);
                    currentX = x;
                    hasContent = false;
                }
            }
        }

        if (hasContent) {
            this.currentY += lineHeight;
        }
    }

    private async renderInlineElement(
        element: Element,
        startX: number,
        lineStartX: number,
        maxWidth: number,
        style: ComputedStyle,
        CharEntity: any
    ): Promise<{x: number, hasContent: boolean}> {
        let currentX = startX;
        const lineHeight = style.fontSize * style.lineHeight;
        let hasContent = false;

        for (const node of Array.from(element.childNodes)) {
            if (node.nodeType === Node.TEXT_NODE) {
                const text = (node.textContent || '').replace(/\n/g, ' ').replace(/\s+/g, ' ');
                if (!text) continue;

                let i = 0;
                while (i < text.length) {
                    const char = text[i];
                    if (!char) continue;
                    const charWidth = CharUtils.getWidth(char, style.fontSize);

                    // Word wrap logic
                    if (char !== ' ') {
                        let wordEnd = i;
                        let wordWidth = 0;
                        while (wordEnd < text.length && text[wordEnd] && text[wordEnd] !== ' ') {
                            const wchar = text[wordEnd];
                            if (!wchar) continue;
                            wordWidth += CharUtils.getWidth(wchar, style.fontSize);
                            wordEnd++;
                        }
                        
                        if (currentX + wordWidth > lineStartX + maxWidth && currentX > lineStartX) {
                            currentX = lineStartX;
                            this.currentY += lineHeight;
                            hasContent = false;
                        }
                    } else if (!hasContent) {
                        i++;
                        continue;
                    }

                    const charEntity = this.createCharEntity(char, currentX, this.currentY, style, CharEntity);
                    this.charEntities.push(charEntity);
                    hasContent = true;

                    currentX += charWidth;
                    i++;
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const childElement = node as Element;
                const childStyle = getComputedStyle(childElement.tagName.toLowerCase(), style);
                
                if (this.isInlineElement(childElement.tagName)) {
                    const result = await this.renderInlineElement(
                        childElement,
                        currentX,
                        lineStartX,
                        maxWidth,
                        childStyle,
                        CharEntity
                    );
                    currentX = result.x;
                    hasContent = result.hasContent || hasContent;
                }
            }
        }

        return { x: currentX, hasContent };
    }

    private async renderImage(img: HTMLImageElement, x: number, maxWidth: number): Promise<void> {
        const src = img.getAttribute('src') || '';
        let width = parseInt(img.getAttribute('width') || '0');
        let height = parseInt(img.getAttribute('height') || '0');

        if (width === 0) width = Math.min(maxWidth, 300);
        if (height === 0) height = width * 0.75;

        const imageEntity = new ImageEntity(x, this.currentY, width, height, src);
        this.imageEntities.push(imageEntity);

        // Load texture
        this.loadImageTexture(src).then(texture => {
            if (!texture) console.log("Failed to load image texture:", src); // for debug
            imageEntity.texture = texture;
        });

        this.currentY += height;
    }

    private async renderTable(
        table: Element,
        x: number,
        maxWidth: number,
        parentStyle: ComputedStyle,
        CharEntity: any
    ): Promise<void> {
        const style = getComputedStyle('table', parentStyle);
        const rows = Array.from(table.querySelectorAll('tr'));

        const firstRow = rows[0];
        const colCount = firstRow ? firstRow.children.length : 0;
        const colWidth = colCount > 0 ? maxWidth / colCount : maxWidth;

        for (const row of rows) {
            const cellHeights: number[] = [];

            const cells = Array.from(row.children);
            for (let i = 0; i < cells.length; i++) {
                const cell = cells[i];
                if (!cell) continue;

                const cellStyle = getComputedStyle(cell.tagName.toLowerCase(), style);
                const height = await this.measureCellHeight(cell, colWidth, cellStyle, CharEntity);
                cellHeights.push(height);
            }

            const maxRowHeight = Math.max(...cellHeights, 0);

            for (let i = 0; i < cells.length; i++) {
                const cell = cells[i];
                if (!cell) continue;

                const cellX = x + (i * colWidth);
                const cellStyle = getComputedStyle(cell.tagName.toLowerCase(), style);

                if (cellStyle.backgroundColor) {
                    this.rectEntities.push(new RectEntity(
                        cellX,
                        this.currentY,
                        colWidth,
                        maxRowHeight,
                        cellStyle.backgroundColor
                    ));
                }

                if (cellStyle.borderWidth > 0 && cellStyle.borderColor) {
                    this.drawBorder(cellX, this.currentY, colWidth, maxRowHeight,
                        cellStyle.borderWidth, cellStyle.borderColor);
                }

                const savedY = this.currentY;
                this.currentY += cellStyle.paddingTop;
                await this.renderTextContent(
                    cell,
                    cellX + cellStyle.paddingLeft,
                    colWidth - cellStyle.paddingLeft - cellStyle.paddingRight,
                    cellStyle,
                    CharEntity
                );
                this.currentY = savedY;
            }

            this.currentY += maxRowHeight;
        }
    }

    private async renderList(
        list: Element,
        x: number,
        maxWidth: number,
        isOrdered: boolean,
        parentStyle: ComputedStyle,
        CharEntity: any
    ): Promise<void> {
        const items = Array.from(list.children).filter(child => child.tagName.toLowerCase() === 'li');

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item) continue;

            const style = getComputedStyle('li', parentStyle);
            const bullet = isOrdered ? `${i + 1}.` : '•';
            let bulletX = x - 25;

            for (let j = 0; j < bullet.length; j++) {
                const char = bullet[j];
                if (!char) continue;
                const charEntity = this.createCharEntity(char, bulletX, this.currentY, style, CharEntity);
                this.charEntities.push(charEntity);
                bulletX += CharUtils.getWidth(char, style.fontSize);
            }

            await this.renderTextContent(item, x, maxWidth, style, CharEntity);
            this.currentY += style.marginBottom;
        }
    }

    private drawBorder(x: number, y: number, w: number, h: number, thickness: number, color: Color): void {
        this.rectEntities.push(new RectEntity(x, y, w, thickness, color));
        this.rectEntities.push(new RectEntity(x, y + h - thickness, w, thickness, color));
        this.rectEntities.push(new RectEntity(x, y, thickness, h, color));
        this.rectEntities.push(new RectEntity(x + w - thickness, y, thickness, h, color));
    }

    private isInlineElement(tagName: string): boolean {
        const inline = ['span', 'a', 'strong', 'em', 'b', 'i', 'u', 'code'];
        return inline.includes(tagName.toLowerCase());
    }

    private async measureCellHeight(
        element: Element,
        maxWidth: number,
        style: ComputedStyle,
        CharEntity: any
    ): Promise<number> {
        const savedY = this.currentY;
        const savedCharCount = this.charEntities.length;

        this.currentY += style.paddingTop;
        await this.renderTextContent(
            element,
            0,
            maxWidth - style.paddingLeft - style.paddingRight,
            style,
            CharEntity
        );
        this.currentY += style.paddingBottom;

        const height = this.currentY - savedY;
        this.currentY = savedY;
        this.charEntities.length = savedCharCount;

        return height;
    }

    private async measureElementHeight(
        element: Element,
        maxWidth: number,
        style: ComputedStyle,
        CharEntity: any
    ): Promise<number> {
        const savedY = this.currentY;
        const savedCharCount = this.charEntities.length;

        await this.renderTextContent(element, 0, maxWidth, style, CharEntity);

        const height = this.currentY - savedY + style.paddingTop + style.paddingBottom;
        this.currentY = savedY;
        this.charEntities.length = savedCharCount;

        return height;
    }

    private async loadImageTexture(url: string): Promise<WebGLTexture | null> {
        if (this.images.has(url)) {
            return this.images.get(url)!;
        }

        return new Promise((resolve) => {
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.onload = () => {
                const texture = this.gl.createTexture();
                if (!texture) { // probably won't happen
                    console.log("Failed to create texture for image:", url);
                    resolve(null);
                    return;
                }

                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA,
                    this.gl.UNSIGNED_BYTE, image);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

                this.images.set(url, texture);
                resolve(texture);
            };
            image.onerror = () => resolve(null);
            image.src = url;
        });
    }

    getCharEntities() {
        return this.charEntities;
    }

    getImageEntities() {
        return this.imageEntities;
    }

    getRectEntities() {
        return this.rectEntities;
    }
}

// ============================================================================
// Progressive Renderer
// ============================================================================

export class ProgressiveHTMLRenderer {
    private renderer: HTMLRenderer;
    private batchSize: number = 50;

    constructor(gl: WebGLRenderingContext, containerWidth: number = 800) {
        this.renderer = new HTMLRenderer(gl, containerWidth);
    }

    async render(htmlString: string, CharEntity: any): Promise<{
        charEntities: any[],
        imageEntities: ImageEntity[],
        rectEntities: RectEntity[]
    }> {
        await this.renderer.parseHTML(htmlString, CharEntity);

        return {
            charEntities: this.renderer.getCharEntities(),
            imageEntities: this.renderer.getImageEntities(),
            rectEntities: this.renderer.getRectEntities()
        };
    }

    async *renderProgressive(htmlString: string, CharEntity: any) {
        await this.renderer.parseHTML(htmlString, CharEntity);

        const chars = this.renderer.getCharEntities();
        for (let i = 0; i < chars.length; i += this.batchSize) {
            yield {
                charEntities: chars.slice(0, i + this.batchSize),
                imageEntities: this.renderer.getImageEntities(),
                rectEntities: this.renderer.getRectEntities(),
                progress: Math.min(100, ((i + this.batchSize) / chars.length) * 100)
            };

            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }
}

export default ProgressiveHTMLRenderer;