import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useNavigate } from 'react-router-dom';
import { Lock, Check } from '@mui/icons-material'
const columns = [
    {
        field: 'status',
        headerName: '',
        renderCell: ({row}) => (
            <div className="flex items-center gap-2 w-full h-full">
                { row.isLocked && <Lock className="text-orange-300" fontSize='medium' />}
                { row.status === 'validated' && <Check className="text-emerald-300" fontSize='medium' />}
            </div>
        )
    },
    { field: 'name', headerName: 'Fichier' },
    { field: 'company', headerName: 'Company' },
    { field: 'id', headerName: 'Id' },
    { field: 'workflowStatus', headerName: 'Workflow status' },
    { field: 'currentUsers', headerName: 'Current users' },
    // { field: 'documentId', headerName: 'Document ID' },
    { field: 'companyVAT', headerName: 'Company VAT' },
    { field: 'invoiceType', headerName: 'Invoice type' },
    { field: 'supplier', headerName: 'Supplier' },
    { field: 'supplierName', headerName: 'Supplier name' },
    // { field: 'invoiceNumber', headerName: 'Invoice number' },
    {
        field: 'invoiceDate',
        headerName: 'Invoice date',
        // type: 'date',
        width: 100,
    },
    {
        field: 'dueDate',
        headerName: 'Due date',
        // type: 'date',
        width: 100,
    },
    { field: 'currency', headerName: 'Currency' },
    {
        field: 'netAmount',
        headerName: 'Net amount',
        type: 'number',
        width: 100,
    },
    {
        field: 'totalAmount',
        headerName: 'Total amount',
        type: 'number',
        width: 130,
    },
];


const paginationModel = { page: 0, pageSize: 20 };

export default function DocumentsTable({ data = [], version = 'v1' }) {


    const mappedData = React.useMemo(() => {
        const _ = data.map(d => ({
            // ...(d.versions.v1 ? d.versions.v1.Invoice : JSON.parse(d.dataXml).Invoice),
            name: d.name,
            isLocked: d.isLocked,
            status: d.status,
            id: parseInt(d._id),
            _id: d._id
        }))
        console.log(_)
        return _
    }, [data])


    const navigate = useNavigate();

    const handleOpenDocument = ({row}) => {
        if (!row.isLocked)
            navigate(`/document/${version}/${row._id}`);
    }

    return (
        <Paper sx={{ width: '100%', height: '100%', overflowX: 'auto', maxWidth: '100%' }} className="custom__header">
            <DataGrid
                rows={data.map(d => ({...d, id: d._id}))}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10]}
                checkboxSelection
                sx={{ border: 0, width: '100%', fontSize: '0.85rem' }}
                onRowDoubleClick={handleOpenDocument}
                rowHeight={38}
            />
        </Paper>
    );
}
