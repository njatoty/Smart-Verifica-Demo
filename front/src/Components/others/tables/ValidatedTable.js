import * as React from 'react';
import { Download } from '@mui/icons-material'
import { useTranslation } from 'react-i18next';
import { Button } from '@mui/material';
import fileService from '../../services/fileService';
import { GenerateXMLFromResponse } from '../../../utils/utils';
import CellRenderer from '../cell-render/CellRenderer';
import TemplateTable from './TemplateTable';

export default function ValidatedTable({ data = [], version = 'v2', loading = false, page=0, pageSize=10, onPaginationChange, totalRecords=0  }) {

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
                <CellRenderer.RenderPDFName pdfName={row.name} />
            ),
            width: 200,  // Set a fixed width for the 'name' column
            flex: 1      // Allow proportional resizing based on the container width
        },
        {
            field: 'documentid',
            headerName: t('documentid-col'),
            width: 150,
            flex: 1
        },
        {
            field: 'validatedBy.v1',
            headerName: t('validator1-col'),
            renderCell: ({row: { validatedBy} }) => (
                <>
                { validatedBy?.v1?.email ? <CellRenderer.RenderUser user={validatedBy.v1} /> : 'N/A' }
                </>
            ),
            width: 150,
            flex: 1
        },
        {
            field: 'validatedBy.v2',
            headerName: t('validator2-col'),
            renderCell: ({row: { validatedBy} }) => (
                <>
                { validatedBy?.v2?.email ? <CellRenderer.RenderUser user={validatedBy.v2} /> : 'N/A' }
                </>
            ),
            width: 150,
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
            field: 'action',
            headerName: t('download-as-xml'),
            renderCell: ({ row }) => (
                <div className="flex items-center gap-2 w-full h-full">
                    <Button onClick={() => handleDownloadXML(row)} title={t('download-as-xml')}>
                        <Download />
                    </Button>
                </div>
            ),
            width: 100,  // Fixed width for the action column
            flex: 1
        },
    ];



    // method to send request to download xml file
    async function handleDownloadXML(data) {
        const { versions } = data;
        if (versions[1]) {
            const resp = await fileService.downloadXML(versions[1].dataJson);
            if (resp.ok) {
                GenerateXMLFromResponse(resp, 'download.xml');
            }
        }
    }

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
