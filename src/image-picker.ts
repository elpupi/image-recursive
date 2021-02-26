import { removableEventListeners } from '/app/util.js';

const picker = document.getElementById('image-picker') as HTMLElement;
export const imagePicker = picker.querySelector('input[type="file"]') as HTMLInputElement;
export const dropZone = document.getElementById('drop-zone') as HTMLElement;


const { once, on } = removableEventListeners();

const acceptableTypes = [ 'image/', 'video/' ] as const;

const acceptFile = (file: File) => acceptableTypes.some(type => file.type.startsWith(type));

export const onNewImage = (onChange: (image: HTMLImageElement) => void): void => {
    const onNewFile = (files: FileList) => {
        if (files.length === 0)
            return;

        const img = new Image();
        const acceptableFiles = Array(files.length).fill(0).map((_v, i) => files.item(i)).filter(file => acceptFile(file));

        if (acceptableFiles.length === 0) {
            console.warn(`Files must be one of the types: [ ${acceptableTypes.join(', ')} ]`);
            return;
        }

        img.src = URL.createObjectURL(acceptableFiles[ 0 ]);

        once(img, 'load', () => {
            onChange(img);
        }, { passive: true });
    };

    on(imagePicker, 'change', () => onNewFile(imagePicker.files), { passive: true });

    for (const droppable of [ picker, dropZone ]) {

        on(droppable, 'dragenter', event => {
            droppable.classList.add('dragging');
            event.dataTransfer.effectAllowed = 'copy';

            event.preventDefault(); // obliged to do it, if not, browser disallows draggable
        });

        on(droppable, 'dragover', event => {
            event.dataTransfer.dropEffect = 'copy';
            event.preventDefault();
        });

        on(droppable, 'dragleave', () => droppable.classList.remove('dragging'), { passive: true });

        on(droppable, 'drop', event => {
            droppable.classList.remove('dragging');

            const { files = [] as unknown as FileList } = event.dataTransfer;
            onNewFile(files);

            event.preventDefault();
        });
    }
};


export const resetImagePicker = () => {
    // allow to react to change event when the same file is choosen
    imagePicker.value = null;
};
