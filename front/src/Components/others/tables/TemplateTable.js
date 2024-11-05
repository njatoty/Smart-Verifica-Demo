import * as React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { frFR, enUS, nlNL } from '@mui/x-data-grid/locales';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import useDataGridSettings from '../../../hooks/useDatagridSettings';

export default function TemplateTable({ data = [], cols=[], storageKey = '', loading = false, page=0, pageSize=10, onPaginationChange, totalRecords=0  }) {

    const { t, i18n } = useTranslation();
    const [rows, setRows] = React.useState(data);
    const [columns, setColumns] = React.useState(cols);
    const [paginationModel, setPaginationModel] = React.useState({ page, pageSize }); // Initial pagination model
    
    React.useEffect(() => {
        setRows(data);
    }, [data]);
    

    const {
        columnVisibilityModel,
        setColumnVisibilityModel,
        sortModel,
        setSortModel,
        setFilterModel,
        density,
        setDensity,
    } = useDataGridSettings(`${storageKey}-datagrid-settings`, {
        pageSize: 10,
        density: 'standard',
    });

    const getLocaleText = (language) => {
        switch (language) {
            case 'fr':
                return frFR.components.MuiDataGrid.defaultProps.localeText;
            case 'en':
            default:
                return enUS.components.MuiDataGrid.defaultProps.localeText;
        }
    };

    function handlePaginationModelChange(newPaginationModel) {
        setPaginationModel(newPaginationModel)
        onPaginationChange && onPaginationChange(newPaginationModel);
    }

    return (
        <Box
            style={{
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                width: '100%',
                height: 0,
            }}
            className="custom__header"
        >
            <DataGrid
                rows={rows.map(d => ({
                    ...d,
                    id: d._id,
                    name: d.name,
                }))}
                columns={columns}
                initialState={{
                    pagination: { paginationModel }
                }}
                pagination // Enables pagination controls
                paginationMode='server'
                rowCount={totalRecords}
                pageSizeOptions={[5, 10, 25, 50, 100, { value: totalRecords, label: t('all-records') }]}
                checkboxSelection
                localeText={getLocaleText(i18n.language)}
                slots={{
                    toolbar: GridToolbar
                }}
                loading={loading}
                disableRowSelectionOnClick
                onPaginationModelChange={handlePaginationModelChange}
                sortingOrder={['asc', 'desc']}
                sortModel={sortModel}
                onSortModelChange={(model) => setSortModel(model)}
                onFilterModelChange={(model) => setFilterModel(model)}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
                density={density}
                onDensityChange={(newDensity) => setDensity(newDensity)}
                components={{
                    Toolbar: GridToolbar,
                }}
                sx={{
                    flexShrink: 0,
                    width: '100%',
                    height: '100%',
                }}
            />
        </Box>
    );
}
