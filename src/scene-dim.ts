import { ifChained } from '/app/util.js';


const htmlDimensions = (el: HTMLElement) => {
    // const { width, height } = getComputedStyle(el);
    // const borders = getBordersSize(el);

    // return { width: parseFloat(width) - borders.left - borders.right, height: parseFloat(height) - borders.top - borders.bottom };
    // It includes padding but excludes borders, margins, and vertical scrollbars (if present).
    return { width: el.clientWidth, height: el.clientHeight };
};

const imageDimensions = (img: HTMLImageElement) => ({ width: img.naturalWidth, height: img.naturalHeight });


export const sceneDim = (img: HTMLImageElement): { width: number; height: number; } => {
    const bodyDim = htmlDimensions(document.body);
    const imgDim = imageDimensions(img);

    const max = {
        h: { width: bodyDim.width, height: 600 }, // horizontal
        v: { width: 500, height: NaN }, // vertical
    };

    const r = {
        wh: imgDim.height / imgDim.width,
        hw: imgDim.width / imgDim.height
    };

    const isVertical = r.wh > 1;

    const canvasDim = ifChained()
        .next({ if: isVertical && imgDim.width > max.v.width, then: { width: max.v.width, height: max.v.width * r.wh } })
        .next({ if: !isVertical && imgDim.height > max.h.height, then: { width: max.h.height * r.hw, height: max.h.height } })
        .next({ then: { width: imgDim.width, height: imgDim.width * r.wh } })
        .value;

    return canvasDim;
};
