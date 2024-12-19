import React, { useMemo, useRef, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { updateCustomerDynamicKeysOrder } from '../../services/customer-service';
import { Delete, DragIndicator, Edit, MoreVert } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useClickAway } from 'use-click-away';

export const DynamicKeysList = ({ customerId, dynamicKeys = [], setDynamicKeys, onUpdate, currentItem=null, setMessage, onDelete }) => {

    const cItem = useMemo(() => currentItem, [currentItem]);

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const reorderedKeys = Array.from(dynamicKeys);
        const [movedItem] = reorderedKeys.splice(result.source.index, 1);
        reorderedKeys.splice(result.destination.index, 0, movedItem);

        // Update order locally
        setDynamicKeys?.(reorderedKeys);

        // Send updated order to backend
        try {
            const order = reorderedKeys.map((item, index) => ({
                name: item.name,
                order: index,
            }));

            await updateCustomerDynamicKeysOrder(customerId, {
                dynamicKeys: order
            });

            setMessage?.('Order updated successfully.');
        } catch (error) {
            setMessage?.('Failed to update order.');
        }

        setTimeout(() => {
            setMessage('');
        }, 5000);
    };

    return (
        <div className='flex flex-col gap-2 h-full w-full'>
            <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="dynamicKeysList">
                    {(provided) => (
                        <ul
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={{ listStyleType: 'none', padding: 0 }}
                            className='flex flex-col gap-2'
                        >
                            {dynamicKeys.map((item, index) => (
                                <Draggable key={item.name} draggableId={item.name} index={index}>
                                    {(provided) => (
                                        <li
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                                ...provided.draggableProps.style,
                                                ...(cItem?.name === item.name) && { display: 'none'}
                                            }}
                                            className='w-full flex gap-1 items-center p-2 border border-gray-200 bg-gray-100 rounded-sm hover:bg-indigo-100 text-gray-800'
                                        >
                                            <ItemDisplay item={item} onUpdate={onUpdate} onDelete={onDelete}/>
                                        </li>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </ul>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
};


const ItemDisplay = ({ item, onUpdate, onDelete }) => {

    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useClickAway(ref, () => {
        setOpen(false);
    });
    
    return (
        <div className='w-full flex items-center gap-2 overflow-hidden' ref={ref}>
            <DragIndicator className='text-slate-300 hover:text-slate-600' fontSize='small'/>
            <div className='w-full'>
                <p className='w-full'>{item.name}</p>
                { item.description && <p className='w-full text-xs text-slate-600 line-clamp-2'>{item.description}</p> }
            </div>
            <AnimatePresence>
                <div className='ml-auto flex items-center justify-end gap-1'>
                    {
                        open &&
                        <motion.div className='flex items-center gap-2'
                            initial={{ opacity: 0, x: '100%'}}
                            animate={{ opacity: 1, x: '0%'}}
                            exit={{ opacity: 0, x: '100%'}}
                        >
                            <IconButton type='button' size='small' className='ml-auto' onClick={() => onUpdate?.(item)}>
                                <Edit fontSize='small'/>
                            </IconButton>
                            <IconButton type='button' size='small' className='ml-auto' onClick={() => onDelete?.(item)}>
                                <Delete fontSize='small'/>
                            </IconButton>
                        </motion.div>
                    }
                    <IconButton type='button' size='small' className='ml-auto' onClick={() => setOpen(!open)}>
                        <MoreVert fontSize='small'/>
                    </IconButton>
                </div>
            </AnimatePresence>
        </div>
    )
}

export default DynamicKeysList;
