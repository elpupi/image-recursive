import type { Area } from './types';
import easelJS from '/app/easeljs.js';


export class Scene extends easelJS.Container {
    public debug: any = undefined;

    constructor(public coordonates: Area) {
        super();

        const mtx = this.getMatrix();
        mtx.translate(coordonates.x, coordonates.y);
        this.transformMatrix = mtx;

        this.setBounds(0, 0, coordonates.width, coordonates.height);
    }

    draw(ctx: CanvasRenderingContext2D, ignoreCache: boolean) {
        // if ((this as any).DisplayObject_draw(ctx, ignoreCache)) { return true; }

        return super.draw(ctx, ignoreCache);
        // return true;
    }
}
