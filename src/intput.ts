import { removableEventListeners } from '/app/util.js';

const { on, removeAllListeners, removeListenerById } = removableEventListeners();


const inputs = [
    {
        name: 'canvasWidth',
        el: document.getElementById('canvas-width') as HTMLElement,
        default: 'auto'
    },
    {
        name: 'nbRecursion',
        el: document.getElementById('nb-recursion') as HTMLElement,
        default: 5
    }
] as const;

type InputType = typeof inputs extends (infer U)[] | readonly (infer U)[] ? U : never;
type InputNames = {
    [ K in keyof InputType ]: InputType[ 'name' ]
}[ keyof InputType ];


export type OnRangeChange = (value: number) => void;

const addListenerToRange = (el: HTMLElement, onChange: OnRangeChange, defaultValue: string | number, id: string | symbol) => {
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

    const getValue = (force: boolean = false) => !disable.checked || force ? value() : typeof defaultValue === 'number' ? defaultValue : undefined;
    //  const defaultValue = value();


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
    }, { passive: true, id });


    if (disable) {
        on(disable, 'input', (e: InputEvent) => onCheck(), { passive: true, id });
        onCheck();
        onChange(getValue());
    }

    const setValue = (v: number | string) => {
        output.textContent = `${v}`;
        input.value = `${v}`;
    };

    const enabled = () => !disable.checked;

    return { setValue, getValue, enabled };
};


export type OnChangeListeners = {
    [ K in InputNames ]: {
        onChange: (onChangeListener: OnRangeChange) => void;
        removeAllListeners: () => void;
        setValue: (v: number | string) => void;
        getValue: (force?: boolean) => number;
        enabled: () => boolean;
    }
};

export const listenToInputSettings = () => {
    const onChangeListeners = inputs.reduce((o, { name, el, default: defaultV }) => {
        let listeners: OnRangeChange[] = [];
        const listener = (value: number) => { listeners.forEach(onChange => onChange(value)); };

        const id = Symbol();
        const elements = addListenerToRange(el, listener, defaultV, id);

        o[ name ] = {
            onChange: (onChangeListener: OnRangeChange) => listeners.push(onChangeListener),
            removeAllListeners: () => {
                listeners = [];
                removeListenerById(id);
            },
            ...elements
        };

        return o;
    }, {}) as OnChangeListeners;


    return { removeAllListeners, ...onChangeListeners };
};
