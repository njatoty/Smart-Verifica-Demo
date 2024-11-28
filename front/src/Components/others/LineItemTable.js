import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Add, Check, Clear, DragIndicator } from '@mui/icons-material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { t } from 'i18next';
import { useInView } from 'react-intersection-observer';
import { styled, Tooltip, tooltipClasses, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { formatCurrency } from '../../utils/utils';

const LineItemTable = ({ data = [], id, onRowsUpdate, onFocus, netAmount = 0, totalAmount = 0, onError, }) => {
    const [rows, setRows] = useState(data);
    const [TotalAmount, setTotalAmount] = useState(netAmount);
    const [NetAmount, setNetAmount] = useState(totalAmount);
    const { currency } = useSelector((state) => state.currency);

    const { ref, inView } = useInView({
        threshold: 0.3
    });

    // to calculate amount deviation
    const toNumber = (n = '0,0') => parseFloat(n?.replace(/\./g, '').replace(',', '.') || 0);
    const fixed = (n = 0) => n.toFixed(2);

    const [deviation, setDeviation] = useState(0);
    const [lineItemTotalAmount, setLineItemTotalAmount] = useState(0);


    useEffect(() => {

        // Only show error when table is in view and deviation has error
        const fields = ["Invoice.NetAmount", "Invoice.TotalAmount", "Invoice.TotalTaxAmount"]
            .map(id => document.getElementById(id)?.parentElement.parentElement).filter(d => d);

        if (inView && deviation !== 0) {
            fields.forEach((div, index) => {
                // Calculate the top position based on the index
                const topPosition = Array.from(fields)
                    .slice(0, index)
                    .reduce((acc, curr) => {
                        const currHeight = curr.offsetHeight + parseInt(getComputedStyle(curr).marginBottom || 0);
                        return acc + currHeight;
                    }, 0);

                // Apply the calculated top position
                div?.setAttribute(
                    "style",
                    `position: sticky;top: ${topPosition}px; z-index: ${100 + index}; ${index === 0 ? 'outline: 80px solid #f1f5f9; background: #f1f5f9' : ''}` // Adjust z-index if needed
                );
            });
        } else {
            fields.map(div => div?.removeAttribute('style'));
        }
    }, [inView, deviation])

    useEffect(() => {
        // Calculate lineItemsAmountTotal
        const total = fixed(rows.reduce((total, item) => toNumber(item.LineItemAmount) + total, 0));
        setLineItemTotalAmount(total);
        // Calculate deviation
        const deviationValue = (NetAmount - total);
        setDeviation(deviationValue);

        // set an error on net Amount
        onError?.('NetAmount', (deviationValue !== 0))

    }, [rows, NetAmount]);


    const [columnVisibility, setColumnVisibility] = useState({
        productCode: true,
        description: true,
        unitPrice: true,
        quantity: true,
        amount: true,
    });


    useEffect(() => {
        if (totalAmount)
            setTotalAmount(toNumber(totalAmount));
        if (netAmount)
            setNetAmount(toNumber(netAmount));
    }, [totalAmount, netAmount])

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

            newRow.id = index.toString();

            newRow.key = index;

            return newRow;
        });
        setRows(updatedRows);

        // onRowsUpdate && onRowsUpdate(id, updatedRows); // Update parent component
    }, [data, columnVisibility, id, currency]);


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
        const [, , rowId, field] = key.split('.');
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
        <div ref={ref} className="flex flex-col gap-2 bg-slate-100">
            <label htmlFor="line-item-table" className="text-sm p-1 flex gap-2 w-full items-center">
                <p>Line Items:</p>
                {
                    deviation !== 0 ?
                        <p className='bg-rose-200 text-black ml-auto py-1 px-2 text-sm'>
                            <span className='text-slate-800'>{t('deviation-label')}:</span> <span className='font-semibold'>
                                {formatCurrency(fixed(deviation), currency)}
                            </span>
                        </p>
                        :
                        <p className='bg-green-200 text-black ml-auto py-1 px-2 text-sm'>
                            <Check fontSize='12' />
                            <span className='ml-1 text-slate-800'>{t('correct')}</span>
                        </p>
                }
            </label>
            <table id="line-item-table" className="border w-full p-1">
                <thead>
                    <tr>
                        <th className="text-sm text-center font-semibold px-1 rounded hover:bg-emerald-100">
                            <button type='button' className="p-1" onClick={handleAddNewRow}>
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
                                    <Draggable key={index} draggableId={`${index}`} index={index}>
                                        {(provided) => (
                                            <tr
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className="bg-white hover:bg-gray-50"
                                            >
                                                <td className="text-center">
                                                    <button
                                                        type="button"
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
                                                            onFocus={() => onFocus && onFocus(lineItem.LineItemProductCodeId)}
                                                        />
                                                    </td>
                                                )}
                                                {columnVisibility.description && (
                                                    <td>
                                                        <LineItemCell
                                                            id={`${id}.${lineItem.id}.LineItemDescription`}
                                                            value={lineItem.LineItemDescription}
                                                            onUpdate={handleUpdateCell}
                                                            onFocus={() => onFocus && onFocus(lineItem.LineItemDescriptionId)}
                                                        />
                                                    </td>
                                                )}
                                                {columnVisibility.unitPrice && (
                                                    <td>
                                                        <LineItemCell
                                                            id={`${id}.${lineItem.id}.LineItemUnitPrice`}
                                                            value={lineItem.LineItemUnitPrice}
                                                            type='numeric'
                                                            onUpdate={handleUpdateCell}
                                                            onFocus={() => onFocus && onFocus(lineItem.LineItemUnitPriceId)}
                                                        />
                                                    </td>
                                                )}
                                                {columnVisibility.quantity && (
                                                    <td>
                                                        <LineItemCell
                                                            id={`${id}.${lineItem.id}.LineItemQuantity`}
                                                            value={lineItem.LineItemQuantity}
                                                            type='numeric'
                                                            onUpdate={handleUpdateCell}
                                                            onFocus={() => onFocus && onFocus(lineItem.LineItemQuantityId)}
                                                        />
                                                    </td>
                                                )}
                                                {columnVisibility.amount && (
                                                    <td>
                                                        <LineItemCell
                                                            id={`${id}.${lineItem.id}.LineItemAmount`}
                                                            value={lineItem.LineItemAmount}
                                                            type='numeric'
                                                            onUpdate={handleUpdateCell}
                                                            onFocus={() => onFocus && onFocus(lineItem.LineItemAmountId)}
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

const LineItemCell = React.memo(({ value = '', className = '', id = '', onUpdate, onFocus, type = '' }) => {
    const [val, setVal] = useState(value);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const inputRef = useRef(null);

    // Check if the input value is overflowing the input field width
    useEffect(() => {
        if (inputRef.current) {
            const { scrollWidth, clientWidth } = inputRef.current;
            setIsOverflowing(scrollWidth > clientWidth);
        }
    }, [val]); // Re-check on value change

    const handleChange = useCallback((newVal) => {
        if (type === 'numeric') {
            // Allow empty values or values with digits, commas, and dots
            const regex = /^-?(\d{1,3}(,\d{3})*|\d+)?(\.\d*)?(\,\d*)?$/;
            if (regex.test(newVal)) {
                setVal(newVal)
                onUpdate && onUpdate(id, newVal);
            }
        } else {
            setVal(newVal);
            onUpdate && onUpdate(id, newVal);
        }
    }, [id, onUpdate, type]);

    useEffect(() => {
        setVal(value);
    }, [value]);

    return (
        <HtmlTooltip className="p-1" title={
            isOverflowing ? (
                <React.Fragment>
                    <em>{t("value")}:</em> <b>{val}</b>
                </React.Fragment>
            ) : (
                ""
            )
        }>
            <input
                className={`form_controller w-full ${className}`}
                id={id}
                value={val}
                ref={inputRef}
                onChange={(e) => handleChange(e.target.value)}
                autoComplete='off'
                onFocus={onFocus}
                onClick={onFocus}
                {...(type === 'numeric') && {
                    type: 'text',
                    inputMode: 'numeric',
                    style: {
                        textAlign: 'right'
                    }
                }}
            />
        </HtmlTooltip>
    );
});

const HtmlTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} arrow disableHoverListener classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: "#203543",
        color: 'white',
        maxWidth: 220,
        fontSize: theme.typography.pxToRem(14),
        border: '1px solid #dadde9',
    },
    [`& .${tooltipClasses.arrow}`]: {
        color: "#203543",
    },
}));

export default LineItemTable;
