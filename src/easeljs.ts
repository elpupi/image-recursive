/* import '/lib/easeljs/lib/easeljs.js';
export default createjs; */

import type { Area } from './types';
import easelJS from '/lib/easeljs/lib/easeljs.js';

const easel = easelJS as typeof createjs; // createjs is a global namespace in node_modules/@types/easeljs
export default easel;



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
