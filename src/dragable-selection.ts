import type { Area } from './types';
import easelJS from '/app/easeljs.js';
import { removableEventListeners, zoomFromMouseWheel } from '/app/util.js';


const { on, removeAllListeners, removeListenerById } = removableEventListeners();


type Point = { x: number; y: number; };

export type OnSelection = (area: Area) => void;

export interface Constraints {
    ratioWtoH: number;
}

export interface DragableSelectionOptions {
    constraints?: Constraints;
}



export class DragableSelection {
    public constraints: Constraints;
    private selection: createjs.Shape & { zIndex: number; };
    private lastMousePosition: Point;
    private rect: createjs.Graphics.Rect;
    private listeners: OnSelection[] = [];
    private isVisible: boolean;


    constructor(public stage: createjs.Stage, options: DragableSelectionOptions = {}) {
        this.constraints = Object.assign({ ratioWtoH: undefined }, options.constraints);
        this.init();
        // Enables or disables (by passing a frequency of 20ms) mouse over (mouseover and mouseout)
        // and roll over events (rollover and rollout) for this stage's display list.
        this.stage.enableMouseOver(100);
        // this.stage.cursor = 'crosshair';
    }

    private init() {
        removeAllListeners();
        this.listenStage();

        this.isVisible = false;
    }

    private initSelection() {
        if (this.selection)
            this.stage.removeChild(this.selection);

        this.selection = new easelJS.Shape() as createjs.Shape & { zIndex: number; };
        this.selection.zIndex = Infinity;
        this.stage.addChild(this.selection);

        on(this.selection, 'mouseover', (event: createjs.MouseEvent) => {
            if (!this.selection.cursor?.startsWith('grab'))
                this.selection.cursor = 'grab';
        });

        on(this.selection, 'mouseout', (event: createjs.MouseEvent) => this.selection.cursor = 'default');

        on(this.stage.canvas as HTMLCanvasElement, 'wheel', (event: WheelEvent) => this.onZoom(event));
    }

    private initRect() {
        const g = this.selection.graphics.setStrokeStyle(1).beginStroke('#000').beginFill('rgba(0,0,0,0.05)');
        this.rect = g.drawRect(0, 0, 0, 0).command as createjs.Graphics.Rect;
    }

    public copyFromSelection(dragableSelection: DragableSelection, zoom = 1) {
        const from = dragableSelection;

        this.initSelection();
        this.initRect();

        this.selection.cursor = from.selection.cursor;

        const r = this.rect;

        r.w = from.rect.w;
        r.h = from.rect.h;

        const o = this.selection;

        o.x = from.selection.x;
        o.y = from.selection.y;

        this.scale(zoom, (x, dx) => x * zoom);
        this.onStageEnd();
    }

    private listenSelection() {
        this.unlistenSelection();
        on(this.selection, 'mousedown', (event: createjs.MouseEvent) => this.onSelectionStart(event), { id: 'selection-mouse' });
    }

    private listenStage() {
        this.unlistenStage();
        on(this.stage, 'stagemousedown', (event: createjs.MouseEvent) => this.onStageStart(event), { id: 'stage-mouse-down' });
    }


    private unlistenSelection() {
        removeListenerById('selection-mouse');
    }

    private unlistenStage() {
        removeListenerById('stage-mouse-down');
    }

    private isMouseOnSelection(mouse: Point): boolean {
        // object on top is selection area
        // return this.stage.getObjectsUnderPoint(mouse.x, mouse.y, 0).some(obj => obj === this.selection);
        const { x, y, width, height } = this.area();

        return mouse.x > x && mouse.x < x + width && mouse.y > y && mouse.y < y + height;
    }

    public area() {
        const r = this.rect;
        // corner up left
        const o = this.selection;

        const x = r.w < 0 ? o.x + r.w : o.x;
        const y = r.h < 0 ? o.y + r.h : o.y;

        return { x, y, width: Math.abs(r.w), height: Math.abs(r.h) };
    }


    /************************************
         Stage Area Create Selection
     ************************************/

    private onStageStart(event: createjs.MouseEvent) {
        const mouse = { x: event.stageX, y: event.stageY };

        if (this.isVisible && this.isMouseOnSelection(mouse))
            return;

        this.init();

        // set corner up left of rectangle
        // of course we could do this.rect.x = mouse.x and this.rect.y = mouse.y
        // but if we do a "negative" rectangle (width or height < 0) => we will have to
        // switch the corner from bottom right to top left
        // So it is better to fix the upper left corner and use this.rect just for the w/h
        this.lastMousePosition = mouse;

        this.unlistenSelection();
        on(this.stage, 'stagemouseup', (event: createjs.MouseEvent) => this.onStageEnd(event), { id: 'stage-mouse-up' });
        on(this.stage, 'stagemousemove', (event: createjs.MouseEvent) => this.stageMove(event), { id: 'stage-mouse-move' });
    }

    private stageMove(event: createjs.MouseEvent) {
        if (this.lastMousePosition) {
            this.initSelection();
            this.initRect();
            this.selection.set(this.lastMousePosition);
            this.lastMousePosition = undefined;
        }

        const w = event.stageX - this.selection.x;
        const h = event.stageY - this.selection.y;

        const r = this.rect;
        r.w = w;

        const { ratioWtoH } = this.constraints;

        if (ratioWtoH)
            r.h = Math.sign(h) * Math.sign(w) * r.w * ratioWtoH;
        else
            r.h = h;
    }

    private onStageEnd(event?: createjs.MouseEvent) {
        removeListenerById('stage-mouse-up');
        removeListenerById('stage-mouse-move');
        this.change();
        this.isVisible = true;
        this.listenSelection();
    }


    /****************************
         Selection Area Drag
     ****************************/
    private onSelectionStart(event: createjs.MouseEvent) {
        this.unlistenStage();
        event.stopPropagation();

        this.lastMousePosition = { x: event.stageX, y: event.stageY };

        on(this.selection, 'pressup', (event: createjs.MouseEvent) => this.onSelectionEnd(event), { id: 'selection-mouse' });
        on(this.selection, 'pressmove', (event: createjs.MouseEvent) => this.onSelectionDrag(event), { id: 'selection-press-move' });
    }

    private onSelectionEnd(event: createjs.MouseEvent) {
        event.stopPropagation();

        this.selection.cursor = 'grab';

        this.lastMousePosition = undefined;
        removeListenerById('selection-press-move');
        this.listenStage();
    }

    private onSelectionDrag(event: createjs.MouseEvent) {
        if (!this.isVisible)
            return;

        this.selection.cursor = 'grabbing';

        const last = this.lastMousePosition;
        const mouse = { x: event.stageX, y: event.stageY };

        const dx = mouse.x - last.x;
        const dy = mouse.y - last.y;

        this.lastMousePosition = mouse;

        // corner up left
        this.selection.x += dx;
        this.selection.y += dy;

        this.change();
    }

    private onZoom(event: WheelEvent) {
        event.preventDefault();

        const zoom = zoomFromMouseWheel(event);
        this.scale(zoom, (x, dx) => x - dx / 2);
    }

    private scale(zoom: number, shift: (x: number, dx: number) => number) {
        const r = this.rect;
        const { w, h } = r;

        r.w *= zoom;
        r.h *= zoom;

        const dw = r.w - w; // or (zoom -1) * w
        const dh = r.h - h;

        const o = this.selection;

        o.x = shift(o.x, dw);
        o.y = shift(o.y, dh);

        this.change();
    }

    clear() {
        this.init();
        this.initRect();
        this.initSelection();
    }

    private change() {
        if (!this.rect)
            return;

        const area = this.area();

        if (area.width === 0 && area.height === 0)
            return;

        this.listeners.forEach(onChange => onChange(area));
    }

    onChange(...listeners: OnSelection[]) {
        this.listeners.push(...listeners);
    }

    removeListeners() {
        this.listeners = [];
    }
}
