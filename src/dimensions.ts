import { ifChained } from '/app/util.js';
import type { WidthHeight } from './types';


const htmlElementSize = (el: HTMLElement): WidthHeight => {
    // const { width, height } = getComputedStyle(el);
    // const borders = getBordersSize(el);

    // return { width: parseFloat(width) - borders.left - borders.right, height: parseFloat(height) - borders.top - borders.bottom };
    // It includes padding but excludes borders, margins, and vertical scrollbars (if present).
    return { width: el.clientWidth, height: el.clientHeight };
};

const imageSize = (img: HTMLImageElement): WidthHeight => ({ width: img.naturalWidth, height: img.naturalHeight });


export const imageDimensions = (img: HTMLImageElement, requiredWidth?: number): WidthHeight => {
    const bodyDim = htmlElementSize(document.body);
    const imgDim = imageSize(img);

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
        .next({ if: requiredWidth > 0, then: { width: requiredWidth, height: requiredWidth * r.wh } })
        .next({ if: isVertical && imgDim.width > max.v.width, then: { width: max.v.width, height: max.v.width * r.wh } })
        .next({ if: !isVertical && imgDim.height > max.h.height, then: { width: max.h.height * r.hw, height: max.h.height } })
        .next({ then: { width: imgDim.width, height: imgDim.width * r.wh } })
        .value;

    return canvasDim;
};
