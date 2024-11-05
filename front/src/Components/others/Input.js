import React, { useRef, useState } from 'react'
import { makeReadable } from '../../utils/utils';

const Input = React.memo(({label = '', id, value = '', defaultValue = '', onInput, onFocus, onBlur, ...props}) => {

    const [val, setVal] = useState(value);
    const ref = useRef(null);
    console.log('Input re-rendered!', value)

    function handleChange(newVal) {
        setVal(newVal)
        onInput && onInput(id, newVal);
    }

    function handleFocus() {
        onFocus && onFocus(val);
        setTimeout(() => {
            ref.current?.focus();
        }, 10)
    }

    function handleBlur() {
        onBlur && onBlur('');
    }
    
    return (
        <div className='input__form grid grid-cols-3 place-items-start items-center'>
            <label className='col-span-1' htmlFor={id}>{makeReadable(label)}:</label>
            <input
                ref={ref}
                id={id}
                className="form_controller col-span-2 w-full"
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
    return prevProps.value === nextProps.value && prevProps.id === nextProps.id;
})

export default Input