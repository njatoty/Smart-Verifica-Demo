import React, { useEffect, useState } from 'react'
import { getSuppliers } from '../../services/datasource-service';
import TemplateTable from '../../others/tables/TemplateTable';
import { t } from 'i18next';
import { Button, Link } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import useDataGridSettings from '../../../hooks/useDatagridSettings';

const SupplierTable = ({ suppliers=[], isLoading=false, onUpdate, onDelete, onPaginationChange, totalRecords=0, page=0, pageSize=10 }) => {

    const [rows, setRows] = useState(suppliers);

    useEffect(() => {
        setRows(suppliers);
    }, [suppliers])

    
    const columns = [
        {
            field: 'name',
            headerName: t('supplier-name-col'),
            width: 200,  // Set a fixed width for the 'name' column
            flex: 1      // Allow proportional resizing based on the container width
        },
        {
            field: 'address',
            headerName: t('supplier-address-col'),
            width: 150,
            flex: 1
        },
        {
            field: 'email',
            headerName: t('supplier-email-col'),
            renderCell: ({ row }) => (
                <Link href={`mailto:${row.email}`}>{row.email}</Link>
            ),
            width: 150,
            flex: 1
        },
        {
            field: 'phone',
            headerName: t('supplier-phone-col'),
            width: 150,
            flex: 1
        },
        {
            field: 'taxId',
            headerName: t('supplier-taxId-col'),
            width: 150,
            flex: 1
        },
        {
            field: 'website',
            headerName: t('supplier-website-col'),
            renderCell: ({ row }) => (
                <Link href={row.website} target="_blank">{row.website}</Link>
            ),
            width: 150,
            flex: 1
        },
        {
            field: 'action',
            headerName: '',
            renderCell: ({ row }) => (
                <div className="flex items-center gap-2 w-full h-full">
                    <Button color='inherit' onClick={() => onUpdate && onUpdate(row)} title={t('edit-supplier')}>
                        <Edit />
                    </Button>
                    
                    <Button color='error' onClick={() => onDelete && onDelete(row)} title={t('delete-supplier')}>
                        <Delete />
                    </Button>
                </div>
            ),
            width: 80,  // Fixed width for the action column
            flex: 1
        },
    ];
    
    return (
        <div className="flex flex-col items-start h-full w-full flex-grow">
            <TemplateTable
                cols={columns}
                data={rows}
                loading={isLoading}
                pageSize={pageSize}
                storageKey='suppliers'
                page={page}
                totalRecords={totalRecords}
                onPaginationChange={onPaginationChange}
            />
        </div>
    )
}

export default SupplierTable