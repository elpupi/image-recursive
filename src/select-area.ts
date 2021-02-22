import easelJS, { Rect, StrokeDash } from '/app/easeljs.js';

export interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}

export type OnSelection = (area: Area) => void;


export const addSelection = (stage: createjs.Stage, onSelection: OnSelection) => {
    const selection = new easelJS.Shape();

    const g = selection.graphics.setStrokeStyle(1).beginStroke('#000').beginFill('rgba(0,0,0,0.05)');
    // const sd = g.setStrokeDash([ 10, 5 ], 0).command as StrokeDash;
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
        r.w = event.stageX - selection.x;
        r.h = event.stageY - selection.y;
    };

    const dragEnd = (event: createjs.MouseEvent) => {
        stage.off('stagemousemove', moveListener);
        onSelection({ ...start, width: r.w, height: r.h });
    };

    /*  const tick = (event: createjs.Event) => {
         stage.update(event);
         sd.offset--;
     };


     easelJS.Ticker.on('tick', tick); */

    stage.on('stagemousedown', dragStart);
    stage.on('stagemouseup', dragEnd);
};
