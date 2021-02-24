// browser ES Module compels to have extension at the end (TS does not care if we add .js)
// browser ES Module compels to have / or ./ at the beginning, so I added in tsconfig.json an alias /app => src/
import { DragableSelection } from './dragable-selection.js';
import { ifChained } from '/app/util.js';

const imagePicker = document.getElementById('image-picker') as HTMLInputElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;


const htmlDimensions = (el: HTMLElement) => {
    // const { width, height } = getComputedStyle(el);
    // const borders = getBordersSize(el);

    // return { width: parseFloat(width) - borders.left - borders.right, height: parseFloat(height) - borders.top - borders.bottom };
    // It includes padding but excludes borders, margins, and vertical scrollbars (if present).
    return { width: el.clientWidth, height: el.clientHeight };
};

const imageDimensions = (img: HTMLImageElement) => ({ width: img.naturalWidth, height: img.naturalHeight });


const canvasDim = () => {
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


const ctx = canvas.getContext('2d');
const img = new Image();


img.addEventListener('load', () => updateCanvas(), false);

imagePicker.addEventListener('change', () => {
    const file = imagePicker.files[ 0 ];

    if (file)
        img.src = URL.createObjectURL(file);
});


/* const resizeObserver = new ResizeObserver(() => updateCanvas());
resizeObserver.observe(document.body, { box: 'content-box' }); */


let willUpdate = false;

const updateCanvas = () => {

    const update = () => {
        const { width, height } = canvasDim();

        canvas.width = width;
        canvas.height = height;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, width, height);
        // createDragableSelection(canvas);
    };

    if (!willUpdate && img.width && img.height) {
        willUpdate = true;

        requestAnimationFrame(() => {
            willUpdate = false;
            update();
        });
    }
};
