import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, Close, LoopOutlined, SearchOutlined } from "@mui/icons-material";
import { t } from "i18next";

// Utility to debounce function calls
const debounce = (func, delay) => {
    let timer;
    return (...args) => {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => func(...args), delay);
    };
};

export const StandarLookup = ({ dataSource = [], value, onClose, onSelect, onSubmit }) => {
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState([]);
    const [data, setData] = useState([]);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        setData(dataSource);
    }, [dataSource]);

    // Simulate a search function
    const searchSuppliers = useCallback((searchTerm) => {
        const filteredSuppliers = data.filter((supplier) =>
            supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setResults(filteredSuppliers);
    }, [data]);

    

    // Debounced version of the search function
    const debouncedSearch = useCallback(debounce(searchSuppliers, 300), [searchSuppliers]);

    useEffect(() => {
        // setQuery(value);
        setSelected(data.find(s => s.name === value)?.id);
        debouncedSearch("");
    }, [value, debouncedSearch, data])

    const handleChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        debouncedSearch(value);
    };

    const handleSelect = (supplierId) => {
        setSelected(supplierId);
        // find suppleir
        const supplier = data.find(s => s.id === supplierId);
        if (supplier)
            onSelect && onSelect(supplier);
    };
    
    const handleSubmit = () => {
        // find suppleir
        const supplier = data.find(s => s.id === selected);
        onSubmit && onSubmit(supplier);
    };

    function highlightKey(str, key) {
        const regex = new RegExp(`(${key})`, 'i'); // Create a case-insensitive regex for the key
        const parts = str.split(regex); // Split the string at each match of the key
        
        return parts.map((part, index) =>
            // If the part matches the key, wrap it in the span
            part.toLowerCase() === key.toLowerCase() ? (
                <span key={index} className="text-blue-optimum">{part}</span>
            ) : (
                part // Otherwise, just return the plain text
            )
        );
    }

    return (
        <div className="bg-white relative w-full rounded-lg text-sm">
            <h2 className="mb-4">Supplier Lookup</h2>
            <div className="flex items-stretch border border-[#ccc] focus-within:ring-2 ring-blue-300">
                <div className="p-1 border-r">
                    <SearchOutlined fontSize="small"/>
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    placeholder="Search for a supplier"
                    className="px-2 py-1 w-full outline-none"
                />
            </div>
            
            <div
                className="bg-gray-50 border rounded min-h-[200px] max-h-[200px] overflow-y-auto mt-2 p-1"
            >
                {
                    results.length > 0 ?
                        results.map((supplier) => (
                            <div
                                key={supplier.id}
                                onClick={() => handleSelect(supplier._id)}
                                className={`p-2 cursor-pointer border-b flex justify-between ${selected === supplier.id ? 'bg-blue-100' : 'bg-white hover:bg-gray-100'}`}
                            >
                                <div>
                                    <p className="font-semibold">{highlightKey(supplier.name, query)}</p>
                                    <p className="text-xs">{supplier.address}</p>
                                </div>
                                {
                                    selected === supplier._id &&
                                    <CheckCircle color='success' />
                                }
                            </div>
                        ))
                        :
                        
                    <div
                        className="p-2 cursor-pointer"
                    >
                        No result.
                    </div>
                }
            </div>
            <div className="flex items-center gap-2 mt-2">
                {
                    selected !== null &&
                    <button className="bg-blue-500 hover:bg-blue-400 active:bg-blue-600 text-white rounded px-2 py-1 text-sm"
                        onClick={handleSubmit}
                    >
                        {t('button-done')}
                    </button>
                }
                <button className="bg-gray-500 hover:bg-gray-400 active:bg-gray-600 text-white rounded px-2 py-1 text-sm"
                    onClick={() => onClose && onClose()}
                >
                    {t('button-close')}
                </button>
            </div>
            <button hidden className="absolute top-1 right-1 text-gray-300 hover:text-gray-600 p-1"
                onClick={() => onClose && onClose()}
            >
                <Close fontSize="small" />
            </button>
        </div>
    );
};

export default StandarLookup;
