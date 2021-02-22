/* import '/lib/easeljs/lib/easeljs.js';
export default createjs; */

import easelJS from '/lib/easeljs/lib/easeljs.js';

const easel = easelJS as typeof createjs; // createjs is a global namespace in node_modules/@types/easeljs
export default easelJS;


export interface ImageSource {
    getImage(): HTMLImageElement;
}


export class EaselBitmap extends easel.Bitmap {
    public destRect: createjs.Rectangle;

    constructor(imageOrUrl: string | ImageSource | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement) {
        super(imageOrUrl);
    }

    getImage() {
        return (this.image as any as ImageSource)?.getImage?.() || this.image;
    }

    draw(ctx: CanvasRenderingContext2D, ignoreCache: boolean) {
        const { destRect, sourceRect } = this;

        if (!destRect)
            return super.draw(ctx, ignoreCache);

        if ((this as any).DisplayObject_draw(ctx, ignoreCache)) { return true; }

        const img = this.getImage();
        if (!img) { return true; }


        if (sourceRect && destRect)
            ctx.drawImage(img, sourceRect.x, sourceRect.y, sourceRect.width, sourceRect.height, destRect.x, destRect.y, destRect.width, destRect.height);
        else if (destRect && destRect.width && destRect.height)
            ctx.drawImage(img, destRect.x, destRect.y, destRect.width, destRect.height);
        else if (destRect)
            ctx.drawImage(img, destRect.x, destRect.y);
        else
            ctx.drawImage(img, 0, 0);

        return true;
    }
}


export interface StrokeStyle {
    width: number;
    caps: number | string;
    joints: 'bevel' | 'round' | 'miter';
    miterLimit: 'butt' | 'round' | 'square';
    ignoreScale: boolean;
}

export interface StrokeDash {
    segments: string;
    offset: number;
}


export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}
