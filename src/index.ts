// browser ES Module compels to have extension at the end (TS does not care if we add .js)
// browser ES Module compels to have / or ./ at the beginning, so I added in tsconfig.json an alias /app => src/
import easelJS, { EaselBitmap } from '/app/easeljs.js';
import { waitForImageFile } from '/app/image-picker.js';
import { addSelection } from '/app/select-area.js';
import { sceneDim } from '/app/scene-dim.js';


const canvas = document.getElementById('canvas') as HTMLCanvasElement;


const loop = async (imageEl: HTMLImageElement) => {
    const stage = new easelJS.Stage(canvas);
    stage.autoClear = false;

    const { width, height } = sceneDim(imageEl);

    canvas.width = width;
    canvas.height = height;

    const imageEasel = new EaselBitmap(imageEl);
    imageEasel.destRect = new easelJS.Rectangle(0, 0, width, height);

    stage.addChild(imageEasel);

    addSelection(stage, area => {
        console.log(area);
    });


    const removeTick = easelJS.Ticker.on('tick', (event: createjs.Event) => stage.update(event));

    waitForImageFile().then(newImage => {
        // kill stuff
        removeTick();
        stage.enableDOMEvents(false);
        stage.clear();
        loop(newImage);
    });
};

const start = async () => {
    const imageEl = await waitForImageFile();
    loop(imageEl);
};


start();
