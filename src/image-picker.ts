const imagePicker = document.getElementById('image-picker') as HTMLInputElement;

export const waitForImageFile = (): Promise<HTMLImageElement> => {
    return new Promise<HTMLImageElement>((res, rej) => {

        imagePicker.addEventListener('change', () => {
            const img = new Image();
            const file = imagePicker.files[ 0 ];

            if (file)
                img.src = URL.createObjectURL(file);

            img.addEventListener('load', () => res(img));
        });
    });
};