import * as React from 'react';
import { useTranslation } from 'react-i18next';
import CellRenderer from '../cell-render/CellRenderer';
import TemplateTable from './TemplateTable';

export default function RejectedTable({ data = [], version = 'v2', loading = false, page=0, pageSize=10, onPaginationChange, totalRecords=0  }) {

    const { t } = useTranslation();
    
    const [rows, setRows] = React.useState([]);

    React.useEffect(() => {
        setRows(data);
    }, [data])

    
    const columns = [
        {
            field: 'name',
            headerName: t('file-col'),
            renderCell: ({row}) => (
                <CellRenderer.RenderPDFName pdfName={row.name || row.pdfName} />
            ),
            minWidth: 200,  // Set a fixed width for the 'name' column
            flex: 1      // Allow proportional resizing based on the container width
        },
        {
            field: 'documentid',
            headerName: t('documentid-col'),
            width: 150,
            flex: 1
        },
        {
            field: 'reason', headerName: t('return-dialog-title'),
            renderCell: ({row}) => (
                <CellRenderer.RenderComment comment={row.reason} status='rejected'/>
            ),
            flex: 2
        },
    ];

    return (
        <TemplateTable
            cols={columns}
            data={rows}
            loading={loading}
            pageSize={pageSize}
            storageKey='validation2'
            page={page}
            totalRecords={totalRecords}
            onPaginationChange={onPaginationChange}
        />
    );
}
