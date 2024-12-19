import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { DragIndicator } from '@mui/icons-material';
import { useClickAway } from 'use-click-away';
import { convertToPascalCase, labelToCapitalized, makeReadable, updateArray } from '../../utils/utils';
import { Skeleton } from '@mui/material';


const defaultDynamicKeys = [
    {
        key: "Description",
        value: []
    },
    {
        key: "Rollup",
        value: []
    },
    {
        key: "Number",
        value: []
    },
    {
        key: "Korting",
        value: []
    }
];

const defaultTextFragments = [
    "Item 1 (paragraph)",
    "Item 2 text",
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    "Lorem 2 ipsum dolor sit amet, consectetur adipiscing elit.",
    "Vivamus lacinia odio vitae vestibulum vestibulum.",
    "Lorem 3 ipsum dolor sit amet, consectetur adipiscing elit.",
    "Cras pulvinar, mi at dictum blandit, turpis nunc consequat massa, ut aliquam purus odio non sem.",
    "Lorem 5 ipsum dolor sit amet, consectetur adipiscing elit.",
];


export const DraggableList = ({ textFragments=defaultTextFragments, dynamicKeys=defaultDynamicKeys, onClick, onUpdate, values }) => {

    const [items, setItems] = useState([]);
    const [activeItem, setActiveItem] = useState(null);
    const itemValues = useMemo(() => values, [values]);

    const [droppableItems, setDroppableItems] = useState(dynamicKeys);

    useEffect(() => {
        if (Array.isArray(dynamicKeys)) {
            const combined = updateArray(itemValues, dynamicKeys);
            console.log('combined', combined)
            setDroppableItems(combined.map(
                e => (e.value.filter(v => v).length > 0) ? e : ({...e, value: []}))
                .sort((a, b) => a.order - b.order)
            );
        } else {
            console.log("not an array")
        }

    }, [dynamicKeys, itemValues]);
    
    useEffect(() => {
        if (Array.isArray(textFragments))
            setItems(textFragments);
    }, [textFragments]);

    const onDragEnd = (result) => {
        const { source, destination } = result;

        // If dropped outside a valid destination
        if (!destination) return;

        const sourceKey = source.droppableId;
        const destinationKey = destination.droppableId;

        if (sourceKey !== destinationKey) {
            if (sourceKey === 'item') {
                // Moving item from the list to a field
                const [movedItem] = items.splice(source.index, 1);
                setItems([...items]);
                const updated = droppableItems.map(field => {
                    if (field.name === destinationKey) {
                        const updatedValue = Array.from(field.value);
                        updatedValue.splice(destination.index, 0, movedItem);
                        return { ...field, value: updatedValue };
                    }
                    return field;
                });
                setDroppableItems(updated);
                // update item
                onUpdate?.(updated);

            } else if (destinationKey === 'item') {
                // Moving item from a field back to the list
                const field = droppableItems.find(field => field.name === sourceKey);
                const [movedItem] = field.value.splice(source.index, 1);
                setDroppableItems([...droppableItems]);

                const updatedItems = Array.from(items);
                updatedItems.splice(destination.index, 0, movedItem);
                setItems(updatedItems);
            } else {
                // Moving items between fields
                const sourceField = droppableItems.find(field => field.name === sourceKey);
                const [movedItem] = sourceField.value.splice(source.index, 1);
                const updated = droppableItems.map(field => {
                    if (field.name === destinationKey) {
                        const updatedValue = Array.from(field.value);
                        updatedValue.splice(destination.index, 0, movedItem);
                        return { ...field, value: updatedValue };
                    }
                    return field;
                });
                setDroppableItems(updated);
                // update item
                onUpdate?.(updated);
            }
        } else {
            // Reordering within the same droppable area
            if (sourceKey === 'item') {
                const updatedItems = Array.from(items);
                const [removed] = updatedItems.splice(source.index, 1);
                updatedItems.splice(destination.index, 0, removed);
                setItems(updatedItems);
            } else {
                const updated = droppableItems.map(field => {
                    if (field.name === sourceKey) {
                        const updatedValue = Array.from(field.value);
                        const [removed] = updatedValue.splice(source.index, 1);
                        updatedValue.splice(destination.index, 0, removed);
                        return { ...field, value: updatedValue };
                    }
                    return field;
                })
                setDroppableItems(updated);
                // update item
                onUpdate?.(updated);
            }
        }
    };

    function handleChangeItemValue(index, key, value) {
        const updated = droppableItems.map(item => {
            if (item.name === key) {
                item.value[index].value = value;
            }
            return item
        })
        setDroppableItems(updated);
        onUpdate?.(updated);
    }   

    return (
        <div className='h-full bg-gray-100'>
            <DragDropContext onDragEnd={onDragEnd}>
                <div className='flex items-stretch flex-grow h-full w-full'>
                    {/* List of items */}
                    <div className='h-full flex flex-col flex-grow'>
                        <h1 className='p-1 px-3 text-gray-500 font-semibold bg-white border text-sm'>Data for Field Mapping</h1>
                        <div className='flex flex-grow h-full flex-col p-2 flex-1 w-full relative overflow-y-auto custom__scroll bg-gray-100 border-r'>
                            <div className="w-full h-full absolute inset-0 p-2">
                                <Droppable droppableId='item'>
                                    {
                                        (provided, sp) => (
                                            <div
                                                {...provided.droppableProps}
                                                ref={provided.innerRef}
                                                className={`border ${sp.isDraggingOver ? 'border-dashed border-indigo-200' : 'border-transparent'}`}
                                            >
                                                {
                                                    items.map((item, index) => (
                                                        <Draggable
                                                            key={index}
                                                            draggableId={index.toString()}
                                                            index={index}
                                                        >
                                                            {
                                                                (provided, snapshot) => (
                                                                    <p
                                                                        onClick={() => {
                                                                            onClick?.(item);
                                                                            setActiveItem(item);
                                                                        }}
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        className={`
                                                                            flex items-start gap-1 p-2 text-sm text-slate-900 whitespace-break-spaces
                                                                            ${(snapshot.isDragging) ? 'bg-indigo-50 !h-auto' : ''}
                                                                            my-1 border-2 border-indigo-100
                                                                            ${(activeItem?.id === item.id) ? 'bg-blue-50 border-slate-400' : 'hover:bg-indigo-50 hover:border-indigo-200 bg-white'}
                                                                            `.replace(/\n/g, '')
                                                                        }
                                                                    >
                                                                        <DragIndicator className='text-slate-300' />
                                                                        <span className={`${(snapshot.isDragging) ? 'line-clamp-3' : ''}`}>{item.value}</span>
                                                                    </p>
                                                                )
                                                            }
                                                        </Draggable>
                                                    ))
                                                }

                                                {/* Drag placeholder */}
                                                {provided.placeholder}
                                                
                                                <div className="h-1" />
                                            </div>
                                        )
                                    }
                                </Droppable>
                            </div>
                        </div>
                    </div>

                    {/* Create droppable items */}
                    <div className='h-full flex flex-col flex-grow'>
                        <h1 className='p-1 px-3 text-gray-500 font-semibold bg-white border border-x-0 text-sm'>Data Entry Fields</h1>
                        <div className='flex flex-col flex-1 gap-1 h-full p-2 w-full overflow-x-hidden overflow-y-auto custom__scroll relative'>
                            <div className='absolute inset-0 w-full h-full p-2'>
                                {
                                    droppableItems.length > 0 ?
                                        droppableItems.map((item, index) => (
                                            <ValueItem
                                                key={index}
                                                item={item}
                                                onChange={handleChangeItemValue}
                                                onClick={(val) => {
                                                    onClick?.(val);
                                                    setActiveItem(val);
                                                }}
                                                active={activeItem}
                                            />
                                        ))
                                    :
                                    <div className='flex flex-col gap-2'>
                                        <Skeleton className='w-full' height={80} sx={{ transform: 'none'}} />
                                        <Skeleton className='w-full' height={80} sx={{ transform: 'none'}} />
                                        <Skeleton className='w-full' height={80} sx={{ transform: 'none'}} />
                                        <Skeleton className='w-full' height={80} sx={{ transform: 'none'}} />
                                        <Skeleton className='w-full' height={80} sx={{ transform: 'none'}} />
                                        <Skeleton className='w-full' height={80} sx={{ transform: 'none'}} />
                                        <Skeleton className='w-full' height={80} sx={{ transform: 'none'}} />
                                    </div>
                                }
                                <div className="h-1" />
                            </div>
                        </div>
                    </div>

                </div>
            </DragDropContext>
        </div>
    );
};


const ValueItem = ({ item, onChange, onClick, active }) => {

    const [editing, setEditing] = useState(false);
    const divRef = useRef(null);

    useClickAway(divRef, () => setEditing(false));

    return (
        <Droppable droppableId={item.name}>
            {
                (provided, snapshot) => (
                    <fieldset
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`w-full overflow-hidden flex flex-col gap-2 border ${snapshot.isDraggingOver ? 'border-indigo-300' : 'border-gray-200'} p-2 bg-white`}
                    >
                        <legend style={{ textTransform: 'none' }} className={`font-semibold text-sm ${snapshot.isDraggingOver ? 'text-indigo-500' : 'text-gray-800'}`}>
                            {makeReadable(convertToPascalCase(item.name))}:
                        </legend>
                        <div ref={divRef} className='w-full empty:min-h-[50px] border border-dashed border-gray-200 p-[2px]' onDoubleClick={() => setEditing(true)}>
                            {
                                    
                                item.value.map((val, idx) => !editing ? (
                                    <Draggable
                                        key={`${item.name}-${idx}`}
                                        draggableId={`${item.name}-${idx}`}
                                        index={idx}
                                    >
                                        {(provided, snapshot) => (
                                            <p
                                                onClick={() => onClick?.(val)}
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`${active?.id === val.id ? 'bg-blue-50 border-slate-400' : 'bg-gray-50 hover:border-indigo-100 hover:bg-indigo-50'} flex items-start gap-1 p-2 m-0 text-sm text-slate-900 whitespace-break-spaces ${snapshot.isDragging ? 'bg-indigo-50 border-indigo-100 line-clamp-3' : ''} border-2 border-transparent`}
                                            >{val.value}</p>
                                        )}
                                    </Draggable>
                                ) : (
                                    <AutoHeightTextarea
                                        autoFocus
                                        key={idx}
                                        value={val.value}
                                        className='form_controller w-full'
                                        onUpdate={(value) => onChange?.(idx, item.name, value)}
                                    />
                                ))
                            }
                            {/* Drag placeholder */}
                            {provided.placeholder}
                        </div>
                    </fieldset>
                )
            }
        </Droppable>
    )
}
const AutoHeightTextarea = ({ value = '', onUpdate, className = '', ...props }) => {
    const textareaRef = useRef(null);
    const [val, setVal] = useState(value);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height to recalculate
            textarea.style.height = `${textarea.scrollHeight}px`; // Set to content height
        }
    }, [value, textareaRef]);

    const handleInputChange = (event) => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto'; // Reset height to recalculate
            textarea.style.height = `${textarea.scrollHeight}px`; // Set to content height
            setVal(event.target.value);
            if (onUpdate) {
                onUpdate(event.target.value);
            }
        }
    };

    return (
        <textarea
            ref={textareaRef}
            value={val}
            onChange={handleInputChange}
            className={`resize-none overflow-hidden ${className}`}
            style={{ height: 'auto' }}
            {...props}
        />
    );
};

export default DraggableList;
