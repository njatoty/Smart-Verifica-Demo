import React, { useRef, useState } from 'react'
import { detectDateFormat, makeReadable } from '../../utils/utils';
import { DateRange } from '@mui/icons-material';
import DatePicker from 'react-datepicker';
import { registerLocale } from  "react-datepicker";
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { fr } from 'date-fns/locale/fr';
import { useClickAway } from "use-click-away";
import 'react-datepicker/dist/react-datepicker.css';

import i18n from '../../i18n';
registerLocale('fr', fr);
registerLocale('en', es);

const DateInput = React.memo(({ label = '', id, value = '', defaultValue = '', onInput, onFocus, onBlur, ...props }) => {

    const [val, setVal] = useState(value);
    const ref = useRef(null);
    const clickRef = React.useRef(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [openDate, setOpenDate] = useState(false);
    const [dateFormat, setDateFormat] = useState(detectDateFormat(value));
    const lang = i18n.language;

    
    useClickAway(clickRef, () => {
        setOpenDate(false);
    });

    function handleChange(newVal) {
        setVal(newVal)
        onInput && onInput(id, newVal);
    }

    function handleFocus() {
        onInput && onInput(id, val);
        onFocus && onFocus(id, val);
        setTimeout(() => {
            ref.current?.focus();
        }, 10)
    }

    function handleBlur() {
        onBlur && onBlur('');
    }

    // Handle date selection
    const handleDateChange = (date) => {
        setSelectedDate(date);
        let newValue = date ? format(date, dateFormat) : val;
        setVal(newValue);
        onInput && onInput(id, newValue);
        setOpenDate(false)
    };

    // Handle icon click to open date picker
    const handleIconClick = () => {
        setSelectedDate(parse(val, dateFormat, new Date()))
        setOpenDate(true);
        onFocus && onFocus(id, val);
        ref.current.focus();
    };

    return (
        <div ref={clickRef} className='grid items-center grid-cols-3 input__form place-items-start'>
            {
                label && <label className='col-span-1' htmlFor={id}>{makeReadable(label)}:</label>
            }

            <DatePicker
                open={openDate}
                selected={selectedDate}
                onChange={handleDateChange}
                locale={lang}
                customInput={
                    
                    <div className='flex items-stretch w-full '>
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
                        <button className='border border-[#cccccc] border-l-0 px-1 text-slate-600 hover:bg-slate-200' title='Date Picker'
                            onClick={handleIconClick}
                        >
                            <DateRange />
                        </button>
                    </div>
                }
                popperPlacement="bottom-end"
                popperModifiers={[
                    {
                        name: 'offset',
                        options: {
                            offset: [0, 5],
                        },
                    },
                ]}
            />
        </div>
    )
}, (prevProps, nextProps) => {
    // Only re-render if `value` or other critical props change
    return prevProps.value === nextProps.value && prevProps.id === nextProps.id && prevProps.onFocus === nextProps.onFocus;
})

export default DateInput