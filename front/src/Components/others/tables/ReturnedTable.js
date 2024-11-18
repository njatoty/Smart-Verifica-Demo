import * as React from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { frFR, enUS, nlNL } from '@mui/x-data-grid/locales';
import { useNavigate } from 'react-router-dom';
import { Lock } from '@mui/icons-material'
import { useTranslation } from 'react-i18next';
import useDataGridSettings from '../../../hooks/useDatagridSettings';
import CellRenderer from '../cell-render/CellRenderer';
import { Box } from '@mui/material';
import useUser from '../../../hooks/useLocalStorage';



const paginationModel = { page: 0, pageSize: 20 };

export default function ReturnedTable({ data = [], version = 'v1', loading = false }) {

    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { user } = useUser();
    
    const [rows, setRows] = React.useState([]);

    React.useEffect(() => {
        setRows(data);
    }, [data])

    const {
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
    } = useDataGridSettings('returnedvalidations-datagrid-settings', {
        pageSize: 10,
        density: 'standard',
    });
    

        
    const columns = [
        {
            field: 'Status',
            headerName: '',
            renderCell: ({row}) => (
                <div className="flex items-center gap-2 w-full h-full" title={t('document-is-locked')}>
                    {row.isLocked && <Lock className={row.lockedBy?._id === user._id ? 'text-emerald-300' : 'text-orange-300'} fontSize='medium' />}
                </div>
            ),
            sortable: false,
            width: 40,
            flex: 0
        },
        {
            field: 'name', headerName: t('file-col'),
            renderCell: ({row}) => (
                <CellRenderer.RenderPDFName
                    pdfName={row.name || row.pdfName}
                    version={version}
                    id={row._id}
                    isLocked={row.isLocked}
                    isGranted={row.lockedBy?._id === user._id}
                />
            ),
            flex: 1
        },
        { field: 'documentid', headerName: t('documentid-col'), flex: 1 },
        {
            field: 'validator1',
            headerName: t('validator1-col'),
            renderCell: ({row: { validatedBy} }) => (
                <>
                { validatedBy?.v1?.email ? <CellRenderer.RenderUser user={validatedBy.v1} /> : 'N/A' }
                </>
            ),
            minWidth: 150,
            flex: 1
        },
        {
            field: 'workflowStatus',
            headerName: t('workflowstatus-col'),
            renderCell: ({row}) => (
                <CellRenderer.RenderWorkflowStatus data={row} />
            ),
            minWidth: 150,
            flex: 1
        },
        {
            field: 'curentuser',
            headerName: t('current-user-col'),
            renderCell: ({row: { lockedBy} }) => (
                <>
                { lockedBy?.email ? <CellRenderer.RenderUser user={lockedBy} /> : 'N/A' }
                </>
            ),
            minWidth: 150,
            flex: 1
        },
        {
            field: 'comment', headerName: t('comments-col'),
            renderCell: ({row}) => (
                <CellRenderer.RenderComment comment={row.comment} />
            ),
            flex: 2
        },
    ];


    const getLocaleText = (language) => {
        switch (language) {
            case 'fr':
                return frFR.components.MuiDataGrid.defaultProps.localeText;
            case 'en':
            default:
                return enUS.components.MuiDataGrid.defaultProps.localeText;
        }
    };

    const handleOpenDocument = ({row}) => {
        if (!row.isLocked)
            navigate(`/document/${version}/${row._id}`);
    }

    return (
        <Box
            style={{
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
                width: '100%'
            }}
            className="custom__header"
        >
            <DataGrid
                rows={rows.map(d => ({
                    ...d,
                    id: d._id,
                    documentid: parseInt(d._id),
                    name: d.name,
                }))}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10]}
                checkboxSelection
                localeText={getLocaleText(i18n.language)}
                slots={{
                    toolbar: GridToolbar
                }}
                loading={loading}
                autoHeight
                disableRowSelectionOnClick
                onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
                rowsPerPageOptions={[5, 10, 25]}
                sortingOrder={['asc', 'desc']}
                sortModel={sortModel}
                onSortModelChange={(model) => setSortModel(model)}
                // filterModel={filterModel}
                onFilterModelChange={(model) => setFilterModel(model)}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
                density={density}
                onDensityChange={(newDensity) => setDensity(newDensity)}
                components={{
                    Toolbar: GridToolbar,
                }}
            />
        </Box>
    );
}
