import { useState, useEffect } from 'react';

// Custom hook to manage DataGrid settings with localStorage
const useDataGridSettings = (storageKey, defaultSettings = {}) => {
    
    const storedData = localStorage.getItem(storageKey); // get stored data
    const storedSettings = storedData ? JSON.parse(storedData) : defaultSettings;

    const [columnVisibilityModel, setColumnVisibilityModel] = useState(storedSettings.columnVisibilityModel || {});
    const [sortModel, setSortModel] = useState(storedSettings.sortModel || []);
    const [filterModel, setFilterModel] = useState(storedSettings.filterModel || {});
    const [pageSize, setPageSize] = useState(storedSettings.pageSize || 10);
    const [density, setDensity] = useState(storedSettings.density || 'standard');

    // Load saved settings from localStorage when the component mounts
    useEffect(() => {
        const savedSettings = JSON.parse(localStorage.getItem(storageKey));
        
        if (savedSettings) {
            setColumnVisibilityModel(savedSettings.columnVisibilityModel || {});
            setSortModel(savedSettings.sortModel || []);
            setFilterModel(savedSettings.filterModel || {});
            setPageSize(savedSettings.pageSize || 5);
            setDensity(savedSettings.density);
        }
    }, [storageKey]);

    // Save settings to localStorage whenever any setting changes
    useEffect(() => {
        const settings = {
            columnVisibilityModel,
            sortModel,
            filterModel,
            pageSize,
            density,
        };
        localStorage.setItem(storageKey, JSON.stringify(settings));
    }, [columnVisibilityModel, sortModel, filterModel, pageSize, density, storageKey]);

    return {
        columnVisibilityModel,
        setColumnVisibilityModel,
        sortModel,
        setSortModel,
        filterModel,
        setFilterModel,
        pageSize,
        setPageSize,
        density,
        setDensity,
    };
};

export default useDataGridSettings;
