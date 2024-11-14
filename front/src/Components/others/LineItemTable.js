import React, { useCallback, useEffect, useState } from 'react';
import { Add, Clear, DragIndicator } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { t } from 'i18next';

const LineItemTable = ({ data = [], id, onRowsUpdate }) => {
    const [rows, setRows] = useState(data);

    const [columnVisibility, setColumnVisibility] = useState({
        productCode: true,
        description: false,
        unitPrice: true,
        quantity: true,
        amount: true,
    });

    // Update rows when column visibility changes
    useEffect(() => {
        const updatedRows = data.map((row, index) => {
            let newRow = { ...row };
            // Remove columns from the row data that are hidden
            if (!columnVisibility.productCode) {
                delete newRow.LineItemProductCode;
            }
            if (!columnVisibility.description) {
                delete newRow.LineItemDescription;
            }
            if (!columnVisibility.unitPrice) {
                delete newRow.LineItemUnitPrice;
            }
            if (!columnVisibility.quantity) {
                delete newRow.LineItemQuantity;
            }
            if (!columnVisibility.amount) {
                delete newRow.LineItemAmount;
            }
            
            newRow.id= index.toString();

            return newRow;
        });
        setRows(updatedRows);

        console.log(updatedRows)
        // onRowsUpdate && onRowsUpdate(id, updatedRows); // Update parent component
    }, [data, columnVisibility, id]);


    // Function to handle adding a new row
    const handleAddNewRow = () => {
        const newRow = {
            id: (rows.length + 1).toString(),
            LineItemProductCode: '',
            LineItemDescription: '',
            LineItemUnitPrice: '',
            LineItemQuantity: '',
            LineItemAmount: '',
        };
        const updatedRows = [...rows, newRow];
        setRows(updatedRows);
        onRowsUpdate && onRowsUpdate(id, updatedRows); // Update parent component
    };

    // Function to handle deleting a row
    const handleDeleteRow = useCallback((rowId) => {
        const updatedRows = rows.filter((r) => r.id !== rowId);
        setRows(updatedRows);
        onRowsUpdate && onRowsUpdate(id, updatedRows);
    }, [rows, onRowsUpdate, id]);

    // Function to handle updating cell data
    const handleUpdateCell = useCallback((key, value) => {
        const [, ,rowId, field] = key.split('.');
        console.log(rowId, field, value, key)
        const updatedRows = rows.map((row) => {
            if (row.id === rowId && row[field] !== value) {
                return { ...row, [field]: value };
            }
            return row;
        });

        // Check if rows have actually changed before updating state
        if (JSON.stringify(rows) !== JSON.stringify(updatedRows)) {
            setRows(updatedRows);
            onRowsUpdate && onRowsUpdate(id, updatedRows);
        }
    }, [rows, onRowsUpdate, id]);

    // Function to handle row drag and drop
    const handleDragEnd = useCallback((result) => {
        if (!result.destination) return;
        const reorderedRows = [...rows];
        const [removed] = reorderedRows.splice(result.source.index, 1);
        reorderedRows.splice(result.destination.index, 0, removed);
        setRows(reorderedRows);
        onRowsUpdate && onRowsUpdate(id, reorderedRows);
    }, [rows, onRowsUpdate, id]);

    return (
        <div className="flex flex-col gap-2 bg-slate-100">
            <label htmlFor="line-item-table" className="text-sm p-1">
                Line Items:
            </label>
            <table id="line-item-table" className="border w-full p-1">
                <thead>
                    <tr>
                        <th className="text-sm text-center font-semibold px-1 rounded hover:bg-emerald-100">
                            <button className="p-1" onClick={handleAddNewRow}>
                                <Add className="text-emerald-500" />
                            </button>
                        </th>
                        
                        {columnVisibility.productCode && (
                            <th className="text-sm text-left font-semibold px-1" title={t('product-code')}>
                                <span className="line-clamp-1">{t('product-code')}</span>
                            </th>
                        )}
                        {columnVisibility.description && (
                            <th className="text-sm text-left font-semibold px-1 min-w-[60px]" title={t('description-col')}>
                                <span className="line-clamp-1">{t('description-col')}</span>
                            </th>
                        )}
                        {columnVisibility.unitPrice && (
                            <th className="text-sm text-left font-semibold px-1" title={t('unit-price')}>
                                <span className="line-clamp-1">{t('unit-price')}</span>
                            </th>
                        )}
                        {columnVisibility.quantity && (
                            <th className="text-sm text-left font-semibold px-1 min-w-[50px]" title={t('quantity')}>
                                <span className="line-clamp-1">{t('quantity')}</span>
                            </th>
                        )}
                        {columnVisibility.amount && (
                            <th className="text-sm text-left font-semibold px-1" title={t('amount')}>
                                <span className="line-clamp-1">{t('amount')}</span>
                            </th>
                        )}
                        <th className="text-sm text-center font-semibold px-1"></th>
                    </tr>
                </thead>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="droppable-table-body">
                        {(provided) => (
                            <tbody ref={provided.innerRef} {...provided.droppableProps}>
                                {rows.map((lineItem, index) => (
                                    <Draggable key={lineItem.id} draggableId={`${lineItem.id}`} index={index}>
                                        {(provided) => (
                                            <tr
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className="bg-white hover:bg-gray-50"
                                            >
                                                <td className="text-center">
                                                    <button
                                                        className="p-1 self-center hover:bg-red-100 rounded-md"
                                                        onClick={() => handleDeleteRow(lineItem.id)}
                                                    >
                                                        <Clear className="text-rose-500" />
                                                    </button>
                                                </td>
                                                
                                                {columnVisibility.productCode && (
                                                    <td>
                                                        <LineItemCell
                                                            id={`${id}.${lineItem.id}.LineItemProductCode`}
                                                            value={lineItem.LineItemProductCode}
                                                            onUpdate={handleUpdateCell}
                                                        />
                                                    </td>
                                                )}
                                                {columnVisibility.description && (
                                                    <td>
                                                        <LineItemCell
                                                            id={`${id}.${lineItem.id}.LineItemDescription`}
                                                            value={lineItem.LineItemDescription}
                                                            onUpdate={handleUpdateCell}
                                                        />
                                                    </td>
                                                )}
                                                {columnVisibility.unitPrice && (
                                                    <td>
                                                        <LineItemCell
                                                            id={`${id}.${lineItem.id}.LineItemUnitPrice`}
                                                            value={lineItem.LineItemUnitPrice}
                                                            onUpdate={handleUpdateCell}
                                                        />
                                                    </td>
                                                )}
                                                {columnVisibility.quantity && (
                                                    <td>
                                                        <LineItemCell
                                                            id={`${id}.${lineItem.id}.LineItemQuantity`}
                                                            value={lineItem.LineItemQuantity}
                                                            onUpdate={handleUpdateCell}
                                                        />
                                                    </td>
                                                )}
                                                {columnVisibility.amount && (
                                                    <td>
                                                        <LineItemCell
                                                            id={`${id}.${lineItem.id}.LineItemAmount`}
                                                            value={lineItem.LineItemAmount}
                                                            onUpdate={handleUpdateCell}
                                                        />
                                                    </td>
                                                )}
                                                <td className="text-center">
                                                    {/* Move button */}
                                                    <button
                                                        className="p-1 cursor-grab"
                                                        {...provided.dragHandleProps}
                                                    >
                                                        <DragIndicator className="text-slate-300 hover:text-slate-400 active:text-slate-400" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </tbody>
                        )}
                    </Droppable>
                </DragDropContext>
            </table>
        </div>
    );
};

const LineItemCell = React.memo(({ value = '', className = '', id = '', onUpdate }) => {
    const [val, setVal] = useState(value);

    const handleChange = useCallback((newVal) => {
        setVal(newVal);
        onUpdate && onUpdate(id, newVal);
    }, [id, onUpdate]);

    useEffect(() => {
        setVal(value);
    }, [value]);

    return (
        <div className="p-1 w-full" title={val}>
            <input
                className={`form_controller w-full ${className}`}
                id={id}
                value={val}
                onChange={(e) => handleChange(e.target.value)}
                autoComplete='off'
            />
        </div>
    );
});

export default LineItemTable;
