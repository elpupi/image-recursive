import type { Area, WidthHeight } from './types';
import easelJS from '/app/easeljs.js';
import { removableEventListeners } from '/app/util.js';
import { waitForImageFile } from '/app/image-picker.js';
import { EaselBitmap } from '/app/image-bitmap.js';
import { DragableSelection } from '/app/dragable-selection.js';
import { imageDimensions } from '/app/dimensions.js';
import { ImageRecursive } from '/app/recursive-image.js';
import { listenToInputSettings } from '/app/intput.js';


const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const inputSettings = listenToInputSettings();

const { on, removeAllListeners } = removableEventListeners();


const defaultCanvasSize = {
    width: canvas.width || 100,
    height: canvas.height || 100
};

const setCanvasDimensions = (dim: WidthHeight) => {
    Object.assign(canvas, dim);
    inputSettings.canvasWidth.setValue(dim.width);
};

const resetCanvasSize = () => {
    if (!inputSettings.canvasWidth.enabled())
        Object.assign(canvas, defaultCanvasSize);
};

resetCanvasSize();

const buttons = {
    clearAll: document.getElementById('clear-all') as HTMLButtonElement,
    clearSelection: document.getElementById('clear-selection') as HTMLButtonElement,
};


/*********************************
 *********************************
            APPLICATION
 *********************************
 *********************************/


export class App {
    state: {
        stage: createjs.Stage;
        sceneDimension: WidthHeight;
        imageEl: HTMLImageElement;
        selection: DragableSelection;
        imageRecursive: ImageRecursive;
    };

    constructor() { }

    public async run() {
        this.initSettings();
        const imageEl = await waitForImageFile();
        await this.runLogic(imageEl);
    }

    private init() {
        this.addEvents();

        this.state = {} as any;

        this.state.stage = new easelJS.Stage(canvas);
        const { stage } = this.state;

        const addChild = stage.addChild.bind(stage);

        stage.addChild = function (...children: createjs.DisplayObject[]): createjs.DisplayObject {
            const child = addChild(...children);

            stage.sortChildren((o1: createjs.DisplayObject & { zIndex?: number; }, o2: createjs.DisplayObject & { zIndex?: number; }) => {
                const z1 = o1.zIndex || 0;
                const z2 = o2.zIndex || 0;

                return z1 > z2 ? 1 : z1 < z2 ? -1 : 0;
            });

            return child;
        };

        stage.autoClear = false;
    }

    private addEvents() {
        on(buttons.clearAll, 'click', () => this.clear(), { event: { passive: true } });
        on(buttons.clearSelection, 'click', () => {
            this.state.selection.clear();
            this.removeImageRecursive();
        }, { event: { passive: true } });
    }

    private initSettings() {
        inputSettings.canvasWidth.onChange(width => {
            const selection = this.state.selection;
            const oldWith = canvas.width;

            this.runLogic(this.state.imageEl);
            this.state.selection.copyFromSelection(selection, width / oldWith);
        });

        inputSettings.nbRecursion.onChange(nbRecursion => this.createImageRecursive());
    }

    private async runLogic(imageEl: HTMLImageElement) {

        this.init();
        this.state.imageEl = imageEl;

        const { stage } = this.state;

        const easelImage = this.createImage();
        stage.addChild(easelImage);

        this.addDragableSelection();

        // run tick (rAF in the background calling every time stage.update => calling .draw
        easelJS.Ticker.on('tick', (event: createjs.Event) => stage.update(event));

        // loop
        const nextImage = await waitForImageFile();
        this.clear();

        return this.runLogic(nextImage);
    }


    private createImage(): EaselBitmap {
        const { state } = this;

        state.sceneDimension = imageDimensions(state.imageEl, inputSettings.canvasWidth.getValue());
        const { width, height } = state.sceneDimension;

        setCanvasDimensions({ width, height });

        const imageEasel = new EaselBitmap(state.imageEl);
        imageEasel.destRect = new easelJS.Rectangle(0, 0, width, height);

        return imageEasel;
    }

    private addDragableSelection() {
        const { state } = this;

        const { width, height } = state.sceneDimension;

        state.selection = new DragableSelection(state.stage, { constraints: { ratioWtoH: height / width } });

        state.selection.onChange(area => this.createImageRecursive(area));
    }

    private createImageRecursive(area?: Area) {
        const { state } = this;
        const { width, height } = state.sceneDimension;

        const areaToDraw = area || state.imageRecursive?.initArea;

        if (!areaToDraw)
            return;

        this.removeImageRecursive();

        state.imageRecursive = new ImageRecursive({ width, height }, areaToDraw, state.imageEl, inputSettings.nbRecursion.getValue(true) || 5);
        const imageRecursiveObj = state.imageRecursive.create();

        state.stage.addChild(imageRecursiveObj);
    }


    private removeImageRecursive() {
        const { state } = this;

        if (state.imageRecursive) {
            state.stage.removeChild(state.imageRecursive.image);
            state.imageRecursive = undefined;
        }
    }


    private clear() {
        // kill stuff
        easelJS.Ticker.removeAllEventListeners();
        removeAllListeners();
        this.state?.stage.enableDOMEvents(false);
        this.state?.stage.clear();
        resetCanvasSize();
        this.state = undefined;
    }
}
