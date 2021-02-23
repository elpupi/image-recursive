import type { Area, WidthHeight } from './types';
import { EaselBitmap } from '/app/image-bitmap.js';
import easelJS from '/app/easeljs.js';

interface Factor { x: number; y: number; }
interface Translate { dx: number; dy: number; }


export const imageRecursion = (canvasDim: WidthHeight, initArea: Area, img: HTMLImageElement, maxRecursion = 5) => {
    const factor: Factor = {
        x: initArea.width / canvasDim.width,
        y: initArea.height / canvasDim.height
    };

    const container = new easelJS.Container();

    const nextImage = (scene: Area, step: number): createjs.Container => {
        if (step === 0)
            return container;

        const image = new EaselBitmap(img);
        image.destRect = scene;

        container.addChild(image);

        const F = factor;

        const nextScene = {
            width: F.x * scene.width,
            height: F.y * scene.height,
            x: initArea.x + F.x * scene.x,
            y: initArea.y + F.y * scene.y
        };

        return nextImage(nextScene, step - 1);
    };



    return nextImage(initArea, maxRecursion);
};
