import * as React from 'react';
import { Lock } from '@mui/icons-material'
import { useTranslation } from 'react-i18next';
import CellRenderer from '../cell-render/CellRenderer';
import TemplateTable from './TemplateTable';

export default function AllDocumentTable({ data = [], loading = false, page=0, pageSize=10, onPaginationChange, totalRecords=0 }) {

    const { t } = useTranslation();
    const [rows, setRows] = React.useState([]);

    React.useEffect(() => {
        setRows(data);
    }, [data])

    
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
                <CellRenderer.RenderPDFName pdfName={row.name} />
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
        />
    );
}
