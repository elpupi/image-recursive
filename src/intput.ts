import { removableEventListeners } from '/app/util.js';

const { on, removeAllListeners, removeListenerById } = removableEventListeners();


const input = {
    canvasWidth: document.getElementById('canvas-width') as HTMLElement,
    nbRecursion: document.getElementById('nb-recursion') as HTMLElement
};

const passiveEventOptions = { event: { passive: true } };

export type OnRangeChange = (value: number) => void;

const addListenerToRange = (el: HTMLElement, onChange: OnRangeChange, id: string | symbol) => {
    const output = el.querySelector('.range__output') as HTMLElement;
    const input = el.querySelector('input[type="range"]') as HTMLInputElement;
    const disable = el.querySelector('input[type="checkbox"]') as HTMLInputElement;

    if (!input || !output) {
        console.error(`Could not init intput range listener in addListenerToRange`);
        return;
    }

    const value = () => {
        const value = parseFloat(input.value);
        return isNaN(value) ? undefined : value;
    };

    const getValue = (force: boolean = false) => !disable.checked || force ? value() : defaultValue;
    const defaultValue = value();


    const onCheck = () => {
        input.disabled = disable.checked;
        if (disable.checked) {
            output.textContent = `${defaultValue}`;
            input.value = `${defaultValue}`;
        } else
            output.textContent = input.value;

        onChange(getValue());
    };

    on(input, 'input', (e: InputEvent) => {
        output.textContent = input.value;
        onChange(getValue());
    }, { ...passiveEventOptions, id });


    if (disable) {
        on(disable, 'input', (e: InputEvent) => onCheck(), { ...passiveEventOptions, id });
        onCheck();
        onChange(getValue());
    }

    const setValue = (v: number | string) => {
        output.textContent = `${v}`;
    };

    const enabled = () => !disable.checked;

    return { setValue, getValue, enabled };
};


export type OnChangeListeners<T> = {
    [ K in keyof T ]: {
        onChange: (onChangeListener: OnRangeChange) => void;
        removeAllListeners: () => void;
        setValue: (v: number | string) => void;
        getValue: (force?: boolean) => number;
        enabled: () => boolean;
    }
};

export const listenToInputSettings = () => {
    const onChangeListeners = Object.entries(input).reduce((o, [ name, el ]) => {
        let listeners: OnRangeChange[] = [];
        const listener = (value: number) => { listeners.forEach(onChange => onChange(value)); };

        const id = Symbol();
        const elements = addListenerToRange(el, listener, id);

        o[ name ] = {
            onChange: (onChangeListener: OnRangeChange) => listeners.push(onChangeListener),
            removeAllListeners: () => {
                listeners = [];
                removeListenerById(id);
            },
            ...elements
        };

        return o;
    }, {}) as OnChangeListeners<typeof input>;


    return { removeAllListeners, ...onChangeListeners };
};
