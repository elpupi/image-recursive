import type { WidthHeight } from './types';
import easelJS from '/app/easeljs.js';
import { waitForImageFile } from '/app/image-picker.js';
import { EaselBitmap } from '/app/image-bitmap.js';
import { createDragableSelection, DragableSelection } from '/app/select-area.js';
import { sceneDim } from '/app/dimensions.js';
import { imageRecursion } from '/app/recursive-image.js';


const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const resetCanvasSize = () => {
    canvas.width = 100;
    canvas.height = 100;
};

resetCanvasSize();

const buttons = {
    clearAll: document.getElementById('clear-all') as HTMLButtonElement,
    clearSelection: document.getElementById('clear-selection') as HTMLButtonElement,
};

const removeListeners: Array<Function> = [];

const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement, type: K, listener: (this: HTMLButtonElement, ev: HTMLElementEventMap[ K ]) => any, options?: boolean | AddEventListenerOptions) => {
    el.addEventListener(type, listener, options);
    const removeListener = () => el.removeEventListener(type, listener, options);

    removeListeners.push(removeListener);
    return removeListener;
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
        imageRecursive: createjs.Container;
    };

    constructor() { }

    public async run() {
        const runLogic = async (imageEl: HTMLImageElement) => {

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
            return runLogic(nextImage);
        };


        const imageEl = await waitForImageFile();
        await runLogic(imageEl);
    }

    private init() {
        this.addEvents();

        this.state = {} as any;

        this.state.stage = new easelJS.Stage(canvas);
        this.state.stage.autoClear = false;
    }

    private addEvents() {
        on(buttons.clearAll, 'click', () => this.clear(), { passive: true });
        on(buttons.clearSelection, 'click', () => {
            this.state.selection.clear();
            this.removeImageRecursive();
        }, { passive: true });
    }

    private removeImageRecursive() {
        const { state } = this;

        if (state.imageRecursive)
            state.stage.removeChild(state.imageRecursive);
    }

    private createImage(): EaselBitmap {
        const { state } = this;

        state.sceneDimension = sceneDim(state.imageEl);
        const { width, height } = state.sceneDimension;

        canvas.width = width;
        canvas.height = height;

        const imageEasel = new EaselBitmap(state.imageEl);
        imageEasel.destRect = new easelJS.Rectangle(0, 0, width, height);

        return imageEasel;
    }

    private addDragableSelection() {
        const { state } = this;

        const { width, height } = state.sceneDimension;

        state.selection = createDragableSelection({ stage: state.stage, constraints: { ratioWtoH: height / width } }, area => {
            state.imageRecursive = imageRecursion({ width, height }, area, state.imageEl);
            this.removeImageRecursive();
            state.stage.addChild(state.imageRecursive);
        });
    }

    private clear() {
        // kill stuff
        easelJS.Ticker.removeAllEventListeners();
        removeListeners.forEach(remove => remove());
        this.state.stage.enableDOMEvents(false);
        this.state.stage.clear();
        resetCanvasSize();
        this.state = undefined;
    }
}
