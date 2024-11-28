import * as React from 'react';
import { DeleteForever, Lock } from '@mui/icons-material'
import { useTranslation } from 'react-i18next';
import CellRenderer from '../cell-render/CellRenderer';
import TemplateTable from './TemplateTable';
import { GridToolbarContainer,GridToolbarColumnsButton, GridToolbarFilterButton, GridToolbarDensitySelector, GridToolbarExport } from '@mui/x-data-grid';
import { Button, CircularProgress } from '@mui/material';
import fileService from '../../services/fileService';

export default function AllDocumentTable({ data = [], loading = false, page=0, pageSize=10, onPaginationChange, totalRecords=0 }) {

    const { t } = useTranslation();
    const [rows, setRows] = React.useState([]);
    const [isDeleting, setDeleting] = React.useState(false);
    const [selectedRows, setSelectedRows] = React.useState([]);

    React.useEffect(() => {
        setRows(data);
    }, [data]);

    async function handleDeleteSelectedRows(rowsId) {
        setDeleting(true);
        fileService.deleteSelectedDocuments(rowsId).
        then(async res => {
            const data = res.json();
            if (data.ok) {
    
            }
            const remainingRows = rows.filter(r => !rowsId.includes(r._id));
            setRows(remainingRows);
        }).finally(() => {
            setDeleting(false);
        })
    }

    const CustomGridToolbar = () => {
        return (
            <GridToolbarContainer>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
                {
                    selectedRows.length > 0 &&
                    <Button
                        startIcon={ isDeleting ? <CircularProgress color='error' size={16} /> : <DeleteForever />}
                        variant='outlined' color='error'
                        className='!ml-auto' size='small'
                        disabled={isDeleting}
                        
                        onClick={() => handleDeleteSelectedRows(selectedRows)}
                    >{t('delete-selected-document')} ({selectedRows.length})</Button>
                }
            </GridToolbarContainer>
        )
    }
    
    const columns = [
        {
            field: 'isLocked',
            headerName: '',
            renderCell: ({ row }) => (
                <div className="flex items-center gap-2 w-full h-full" title={t('document-is-locked')}>
                    {row.isLocked && <Lock className="text-orange-300" fontSize='medium' />}
                </div>
            ),
            sortable: false,
            width: 40,  // Fixed width for the status column
        },
        {
            field: 'name',
            headerName: t('file-col'),
            renderCell: ({row}) => (
                <CellRenderer.RenderPDFName pdfName={row.name || row.pdfName} />
            ),
            Width: 400,  // Set a fixed width for the 'name' column
            flex: 1      // Allow proportional resizing based on the container width
        },
        {
            field: 'documentid',
            headerName: t('documentid-col'),
            width: 60,
            flex: 1
        },
        {
            field: 'workflowStatus',
            headerName: t('workflowstatus-col'),
            renderCell: ({row}) => (
                <CellRenderer.RenderWorkflowStatus data={row} />
            ),
            flex: 1
        },
        {
            field: 'lockedBy',
            headerName: t('current-user-col'),
            renderCell: ({row: { lockedBy} }) => (
                <>
                { lockedBy?.email ? <CellRenderer.RenderUser user={lockedBy} /> : 'N/A' }
                </>
            ),
            flex: 1
        },
        {
            field: 'validatedBy.v1',
            headerName: t('validation1-col'),
            renderCell: ({row: { validatedBy} }) => (
                <>
                { validatedBy?.v1?.email ? <CellRenderer.RenderUser user={validatedBy.v1} /> : 'N/A' }
                </>
            ),
            flex: 1
        },
        {
            field: 'validatedBy.v2',
            headerName: t('validation2-col'),
            renderCell: ({row: { validatedBy} }) => (
                <>
                { validatedBy?.v2?.email ? <CellRenderer.RenderUser user={validatedBy.v2} /> : 'N/A' }
                </>
            ),
            flex: 1
        },
    ];

    return (
        <TemplateTable
            cols={columns}
            data={rows}
            loading={loading}
            pageSize={pageSize}
            storageKey='alldocuments'
            page={page}
            totalRecords={totalRecords}
            onPaginationChange={onPaginationChange}
            onRowsSelected={setSelectedRows}
            customGridToolbar={CustomGridToolbar}
        />
    );
}
