import easelJS, { Rect, StrokeDash } from '/app/easeljs.js';
import type { Area } from './types';



export type OnSelection = (area: Area) => void;

export interface AddSelectionOptions {
    stage: createjs.Stage;
    constraints?: {
        ratioWtoH: number;
    };
}

export interface DragableSelection {
    clear: () => void;
}

export const createDragableSelection = (options: AddSelectionOptions, onSelection: OnSelection): DragableSelection => {
    const { stage, constraints = { ratioWtoH: 1 } } = options;

    const selection = new easelJS.Shape();

    const g = selection.graphics.setStrokeStyle(1).beginStroke('#000').beginFill('rgba(0,0,0,0.05)');
    const r = g.drawRect(0, 0, 0, 0).command as Rect;

    let moveListener: Function = undefined;
    let start: { x: number; y: number; } = undefined;

    const dragStart = (event: createjs.MouseEvent) => {
        start = { x: event.stageX, y: event.stageY };
        stage.addChild(selection).set(start);
        r.w = 0;
        r.h = 0;
        moveListener = stage.on('stagemousemove', drag);
    };

    const drag = (event: createjs.MouseEvent) => {
        const w = event.stageX - selection.x;
        const h = event.stageY - selection.y;

        r.w = w;

        if (constraints.ratioWtoH)
            r.h = Math.sign(h) * Math.sign(w) * r.w * constraints.ratioWtoH;
        else
            r.h = h;
    };

    const dragEnd = (event: createjs.MouseEvent) => {
        stage.off('stagemousemove', moveListener);
        const x = r.w < 0 ? start.x + r.w : start.x;
        const y = r.h < 0 ? start.y + r.h : start.y;

        onSelection({ x, y, width: Math.abs(r.w), height: Math.abs(r.h) });
    };

    stage.on('stagemousedown', dragStart);
    stage.on('stagemouseup', dragEnd);

    return {
        clear: () => {
            r.w = 0;
            r.h = 0;
        }
    };
};
