import type { Area, WidthHeight, HTMLMediaElement } from './types';
import easelJS from '/app/easeljs.js';
import { removableEventListeners, elementVisibility } from '/app/util.js';
import { dropZone, onNewImage, resetImagePicker } from '/app/image-picker.js';
import { EaselBitmap } from '/app/image-bitmap.js';
import { DragableSelection } from '/app/dragable-selection.js';
import { imageDimensions } from '/app/dimensions.js';
import { ImageRecursive } from '/app/recursive-image.js';
import { listenToInputSettings } from '/app/intput.js';


const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const inputSettings = listenToInputSettings();

const { on, removeAllListeners } = removableEventListeners();


const defaultCanvasSize = {
    width: canvas.width ?? 100,
    height: canvas.height ?? 100
};

const setCanvasDimensions = (dim: WidthHeight) => {
    Object.assign(canvas, dim);
    inputSettings.canvasWidth.setValue(dim.width);
};

const resetCanvasSize = () => {
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
        mediaEl: HTMLMediaElement;
        selection: DragableSelection;
        imageRecursive: ImageRecursive;
    };

    constructor() { }

    public run() {
        this.initSettings();
        onNewImage(imageEl => {
            this.canvasVisibility(true);
            this.clear();
            this.runLogic(imageEl);
        });
    }

    private canvasVisibility(visible: boolean) {
        elementVisibility(canvas, visible);
        elementVisibility(dropZone, !visible);
    }

    private init() {

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

    private initButtons() {
        on(buttons.clearAll, 'click', () => {
            this.canvasVisibility(false);
            this.clear();
        }, { passive: true });

        on(buttons.clearSelection, 'click', () => {
            this.state?.selection.clear();
            this.removeImageRecursive();
        }, { passive: true });
    }

    private initInputSettings() {
        inputSettings.canvasWidth.onChange(width => {
            const selection = this.state.selection;
            const oldWith = canvas.width;

            this.runLogic(this.state.mediaEl);
            this.state.selection.copyFromSelection(selection, width / oldWith);
        });

        inputSettings.nbRecursion.onChange(() => this.createImageRecursive());
    }

    private initSettings() {
        this.initButtons();
        this.initInputSettings();
    }

    private async runLogic(mediaEl: HTMLMediaElement) {

        this.init();
        this.state.mediaEl = mediaEl;

        const { stage } = this.state;

        const easelImage = this.createImage();
        stage.addChild(easelImage);

        this.addDragableSelection();

        // run tick (rAF in the background calling every time stage.update => calling .draw
        easelJS.Ticker.on('tick', (event: createjs.Event) => stage.update(event));
    }


    private createImage(): EaselBitmap {
        const { state } = this;

        const inputWidth = inputSettings.canvasWidth;

        state.sceneDimension = imageDimensions(state.mediaEl, { width: inputWidth.enabled() && inputWidth.getValue() });
        const { width, height } = state.sceneDimension;

        setCanvasDimensions({ width, height });

        const imageEasel = new EaselBitmap(state.mediaEl);
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

        state.imageRecursive = new ImageRecursive({ width, height }, areaToDraw, state.mediaEl, inputSettings.nbRecursion.getValue(true) || 5);
        const imageRecursiveObj = state.imageRecursive.create();

        state.stage.addChild(imageRecursiveObj);
    }


    private removeImageRecursive() {
        const { state } = this;

        if (state?.imageRecursive) {
            state.stage.removeChild(state.imageRecursive.image);
            state.imageRecursive = undefined;
        }
    }


    private clear() {
        // kill stuff
        easelJS.Ticker.removeAllEventListeners();

        const { state } = this;

        state?.stage.enableDOMEvents(false);
        state?.stage.clear();

        resetCanvasSize();
        this.state = undefined;

        resetImagePicker();
    }
}
