import React, { useRef, useState } from 'react'
import { makeReadable } from '../../utils/utils';

const Input = React.memo(({label = '', id, value = '', defaultValue = '', onInput, onFocus, onBlur, ...props}) => {

    const [val, setVal] = useState(value);
    const ref = useRef(null);

    function handleChange(newVal) {
        setVal(newVal)
        onInput && onInput(id, newVal);
    }

    function handleFocus() {
        onFocus && onFocus(id, val);
        onInput && onInput(id, val);
        setTimeout(() => {
            ref.current?.focus();
        }, 10)
    }

    function handleBlur() {
        onBlur && onBlur('');
    }
    
    return (
        <div className='grid items-center grid-cols-3 input__form place-items-start'>
            {
                label && <label className='col-span-1' htmlFor={id}>{makeReadable(label)}:</label>
            }
            <input
                ref={ref}
                id={id}
                className="w-full col-span-2 form_controller"
                name={label}
                {...props}
                value={val}
                onChange={(e) => handleChange(e.currentTarget.value)}
                autoComplete='off'
                autoCorrect='off'
                onClick={handleFocus}
                onBlur={handleBlur}
            />
        </div>
    )
}, (prevProps, nextProps) => {
    // Only re-render if `value` or other critical props change
    return (prevProps.value === nextProps.value && prevProps.id === nextProps.id && nextProps.onFocus === prevProps.onFocus);
})

export default Input