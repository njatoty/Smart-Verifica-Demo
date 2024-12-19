import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { Add, Clear, DragIndicator } from "@mui/icons-material";
import { styled, Tooltip, tooltipClasses } from "@mui/material";
import { t } from "i18next";
import PropTypes from "prop-types";
import React, { useCallback, useEffect, useRef, useState } from "react";
import DateInput from "./DateInput";

export const BankStatementTableItem = ({ data = [], onRowsUpdate, id }) => {

    const [rows, setRows] = useState([]);

    useEffect(() => {
        let newRows = data.map((d, index) => ({
            ...d,
            id: index + 1
        }));
        setRows(newRows);
    }, [data]);

    // Helper to flatten and parse descriptions for display
    const formatDescriptions = (descriptions) => {
        const value = Array.isArray(descriptions) ? descriptions.map(d => d.replace(/\n/g, ' ')).join('\n') : descriptions.replace(/\n/g, ' ');
        return (
            <AutoHeightTextarea className="form_controller w-full" value={value} />
        )
    };

    function handleAddNewRow() {

    }


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
        setRows(updatedRows);
        onRowsUpdate && onRowsUpdate(id, updatedRows);
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
            <label htmlFor="line-item-table" className="text-sm p-1 flex gap-2 w-full items-center">
                <p>Transaction Items:</p>
            </label>
            <table
                className="w-full border"
            >
                <thead>
                    <tr>
                        <th className="text-sm text-center font-semibold px-1 rounded hover:bg-emerald-100">
                            <button type='button' className="p-1" onClick={handleAddNewRow}>
                                <Add className="text-emerald-500" />
                            </button>
                        </th>
                        <th className="w-[140px] text-left">Date</th>
                        <th className="min-w-40 text-left" >Description</th>
                        <th className="w-[120px] text-center">Amount</th>
                        <th className="w-[100px] text-center">Type</th>
                        <th className="text-sm text-center font-semibold px-1"></th>
                    </tr>
                </thead>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="droppable-table-body">
                        {(provided) => (
                            <tbody ref={provided.innerRef} {...provided.droppableProps}>
                                {rows.map((item, index) => (
                                    <Draggable key={index} draggableId={`${index}`} index={index}>
                                        {(provided) => (
                                            <tr
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className="bg-slate-100 hover:bg-slate-200"
                                            >
                                                <td className="text-center align-top pr-1">
                                                    <button
                                                        type="button"
                                                        className="p-1 self-center opacity-50 hover:opacity-100 hover:bg-red-100 rounded-md"
                                                        onClick={() => handleDeleteRow(item.id)}
                                                    >
                                                        <Clear className="text-rose-500" />
                                                    </button>
                                                </td>
                                                <td className="align-top pr-1">
                                                    <DateInput
                                                        className="!grid-cols-1"
                                                        value={item.TableItemTransactionWithdrawalDate ||
                                                            item.TableItemTransactionDepositDate ||
                                                            "N/A"}
                                                    />

                                                </td>
                                                <td className="align-top pr-1">
                                                    {formatDescriptions(
                                                        item.TableItemTransactionWithdrawalDescription ||
                                                        item.TableItemTransactionDepositDescription ||
                                                        "No Description"
                                                    )}
                                                </td>
                                                <td className="align-top pr-1">

                                                    <TableItemCell
                                                        onUpdate={handleUpdateCell}
                                                        value={item.TableItemTransactionWithdrawal ||
                                                            item.TableItemTransactionDeposit ||
                                                            "N/A"}
                                                        type="numeric"
                                                        id={`${id}.${item.id}.TableItemTransaction${item.TableItemTransactionWithdrawal ? "Withdrawal" : "Deposit"}`}
                                                    />

                                                </td>
                                                <td className="align-top pr-1">
                                                    <TableItemCell
                                                        onUpdate={handleUpdateCell}
                                                        value={item.TableItemTransactionWithdrawal ? "Withdrawal" : "Deposit"}
                                                        id={`${id}.${item.id}.TableItemTransaction${item.TableItemTransactionWithdrawal ? "Withdrawal" : "Deposit"}Type`}
                                                    />

                                                </td>
                                                <td className="text-center align-top pr-1">
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
                            </tbody>
                        )}
                    </Droppable>
                </DragDropContext>
            </table>
        </div>
    );
};


const TableItemCell = ({ value = '', className = '', id = '', onUpdate, onFocus, type = '' }) => {
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

    const handleFocus = () => {
        onUpdate?.(id, val);
        onFocus?.();
    }

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
                onFocus={handleFocus}
                onClick={handleFocus}
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
};

TableItemCell.prototype = {
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Allow string or number
    className: PropTypes.string, // Optional className string
    id: PropTypes.string, // Optional id string
    onUpdate: PropTypes.func, // Function to handle update
    onFocus: PropTypes.func, // Function to handle focus
    type: PropTypes.oneOf(['text', 'numeric']), // Type of cell ('input', etc.)
}

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

const AutoHeightTextarea = ({ value = '', onUpdate, className = '', ...props }) => {
    const textareaRef = useRef(null);
    const [val, setVal] = useState(value);

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

export default AutoHeightTextarea;
