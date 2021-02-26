import { ifChained } from '/app/util.js';
import type { HTMLMediaElement, WidthHeight } from './types';


const htmlElementSize = (el: HTMLElement): WidthHeight => {
    // const { width, height } = getComputedStyle(el);
    // const borders = getBordersSize(el);

    // return { width: parseFloat(width) - borders.left - borders.right, height: parseFloat(height) - borders.top - borders.bottom };
    // It includes padding but excludes borders, margins, and vertical scrollbars (if present).
    return { width: el.clientWidth, height: el.clientHeight };
};

const mediaSize = (media: HTMLMediaElement): WidthHeight => {
    if (media instanceof HTMLImageElement)
        return { width: media.naturalWidth, height: media.naturalHeight };

    return { width: media.videoWidth, height: media.videoHeight };
};


export const imageDimensions = (img: HTMLMediaElement, requiredDim: { width?: number, height?: number; } = {}): WidthHeight => {
    const bodyDim = htmlElementSize(document.body);
    const imgDim = mediaSize(img);

    const r = {
        wh: imgDim.height / imgDim.width,
        hw: imgDim.width / imgDim.height
    };


    const max = {
        h: { width: bodyDim.width, height: 600 }, // horizontal
        v: { width: 500, height: NaN }, // vertical
    };

    const isVertical = r.wh > 1;

    const canvasDim = ifChained()
        .next({ if: requiredDim?.width > 0, then: { width: requiredDim.width, height: requiredDim.width * r.wh } })
        .next({ if: requiredDim?.height > 0, then: { width: requiredDim.height * r.hw, height: requiredDim.height } })
        .next({ if: isVertical && imgDim.width > max.v.width, then: { width: max.v.width, height: max.v.width * r.wh } })
        .next({ if: !isVertical && imgDim.height > max.h.height, then: { width: max.h.height * r.hw, height: max.h.height } })
        .next({ then: { width: imgDim.width, height: imgDim.width * r.wh } })
        .value;

    return canvasDim;
};
