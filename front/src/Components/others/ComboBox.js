import React, { useEffect, useRef, useState } from 'react';
import { makeReadable } from '../../utils/utils';
import { ArrowDropDown } from '@mui/icons-material';

const ComboBox = React.memo(({label = '', id, value = '', defaultValue = '', onInput, onFocus, onBlur, options = [], ...props}) => {

    const [val, setVal] = useState(value);
    const [showOptions, setShowOptions] = useState(false);
    const ref = useRef(null);
    const dropdownRef = useRef(null);

    function handleChange(newVal) {
        setVal(newVal);
        onInput && onInput(id, newVal);
    }

    function handleFocus() {
        onFocus && onFocus(id, val);
        setTimeout(() => {
            ref.current?.focus();
        }, 10);
    }

    function handleBlur() {
        onBlur && onBlur('');
    }

    function toggleOptions() {
        setShowOptions((prev) => !prev);
    }

    function selectOption(option) {
        handleChange(option);
        setShowOptions(false);
    }

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowOptions(false);
            }
        }

        if (showOptions) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptions]);

    return (
        <div className='relative grid items-center w-full grid-cols-3 input__form place-items-start' ref={dropdownRef}>
            <label className='col-span-1' htmlFor={id}>{makeReadable(label)}:</label>
            <div className="relative flex items-stretch w-full col-span-2">
                <input
                    ref={ref}
                    id={id}
                    className="w-full form_controller"
                    name={label}
                    {...props}
                    value={val}
                    onChange={(e) => handleChange(e.currentTarget.value)}
                    autoComplete='off'
                    autoCorrect='off'
                    onClick={handleFocus}
                    onBlur={handleBlur}
                />
                <button 
                    type="button" 
                    className="border focus:outline-none"
                    onClick={toggleOptions}
                >
                    <ArrowDropDown />
                </button>
                
                {showOptions && (
                    <ul className={`absolute left-0 ${props.position === 'top' ? 'top-0 -translate-y-full' : 'bottom-0 translate-y-full'}  mt-1 w-full bg-white border rounded shadow-md z-10 text-sm max-h-[400px] overflow-y-auto`}>
                        {options.map((option, index) => (
                            <li 
                                key={index} 
                                className={`p-2 cursor-pointer hover:bg-gray-200 ${option === val || option.value === val ? 'text-cyan-600 bg-cyan-50' : ''}`}
                                onMouseDown={() => selectOption(option.value ?? option)}
                            >
                                {option.label ?? option}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}, (prevProps, nextProps) => {
    // Only re-render if `value` or other critical props change
    return prevProps.value === nextProps.value && prevProps.id === nextProps.id;
});

export default ComboBox;
