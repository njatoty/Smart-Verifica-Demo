import React, { useEffect, useRef, useState } from 'react'
import { Search, StorageRounded } from '@mui/icons-material';
import { makeReadable } from '../../../utils/utils';
import StandarLookup from './Lookup';
import { useFloating, autoUpdate, offset, flip, shift } from '@floating-ui/react-dom';
import { getSuppliers } from '../../services/datasource-service';

export const InputLookup = React.memo(({label = '', id, value = '', defaultValue = '', onInput, onFocus, onBlur, onSelect, ...props}) => {

    const [val, setVal] = useState(value);
    const [open, setOpen] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);
    const ref = useRef(null);
    const { refs, floatingStyles } = useFloating({
        placement: 'bottom-end', // Adjust placement as needed
        middleware: [
            offset(8), // Adds space between the input and popup
            flip(), // Ensures the popup stays visible when near the viewport edges
            shift({ padding: 8 }) // Prevents the popup from overflowing the viewport
        ],
        whileElementsMounted: autoUpdate // Updates position on scroll, resize, or DOM changes
    });

    useEffect(() => {
        setLoading(true);
        getSuppliers().then(data => {
            setDataSource(data);
        }).finally(() => setLoading(false));
    }, [])
    

    function handleChange(newVal) {
        setVal(newVal)
        onInput && onInput(id, newVal);
    }

    function handleFocus() {
        onInput && onInput(id, val);
        setTimeout(() => {
            onFocus && onFocus(id, val);
        }, 10);
    }

    function handleBlur() {
        onBlur && onBlur('');
    }

    function handleOpenLookup() {
        setOpen(!open);
    }

    function handleSelect(supplier) {
        setVal(supplier.name);
        setOpen(false);
        onSelect && onSelect(supplier)
    }
    
    return (
        <div className='grid items-center grid-cols-3 input__form place-items-start relative'>
            {
                label && <label className='col-span-1' htmlFor={id}>{makeReadable(label)}:</label>
            }
            <div ref={refs.setReference}  className={`w-full flex items-stretch col-span-2 relative ${open ? 'outline outline-2 outline-orange-300' : ''}`}>
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
                    className='border border-[#cccccc] border-l-0 px-1 text-orange-400 hover:bg-slate-200 relative' title='Lookup'
                    onClick={handleOpenLookup}
                >
                    <StorageRounded fontSize='small'/>
                </button>
                {
                    open && 
                    <div
                        ref={refs.setFloating} 
                        style={floatingStyles} 
                        className='absolute top-0 right-0 z-[100] -translate-y-full w-full flex justify-end p-4 bg-white border border-[#ccc] outline-2 outline-orange-300 shadow-xl'
                    >
                        <StandarLookup dataSource={dataSource} value={val} onClose={() => setOpen(false)} onSubmit={handleSelect}/>
                    </div>
                }
            </div>
        </div>
    )
}, (prevProps, nextProps) => {
    // Only re-render if `value` or other critical props change
    return (prevProps.value === nextProps.value && prevProps.id === nextProps.id && nextProps.onFocus === prevProps.onFocus);
})

export default InputLookup