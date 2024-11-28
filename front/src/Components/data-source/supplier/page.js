import React, { useEffect, useState } from 'react'
import { AddSupplierForm, EditSupplierForm } from './forms'
import SupplierTable from './table-list'
import { Add } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion';
import { t } from 'i18next';
import { deleteSupplier, getSuppliers } from '../../services/datasource-service';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import useDataGridSettings from '../../../hooks/useDatagridSettings';


const transition = {
    type: "tween",
    ease: "easeInOut",
    duration: 0.5,
};

const Page = () => {

    const [openForm, setOpenForm] = useState('')
    const [isLoading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [supplierToUpdate, setSupplierToUpdate] = useState(null);
    const [supplierToDelete, setSupplierToDelete] = useState(null);
    const [open, setOpen] = useState(false);
    const [page, setPage] = useState(0); // MUI DataGrid utilise l'index de page
    
    const keyTable = 'suppliers-datagrid-settings' 
    const {
        pageSize, // Nombre d'enregistrements par page
        setPageSize
    } = useDataGridSettings(keyTable, {
        pageSize: 10,
    });

    useEffect(() => {
        setLoading(true);
        getSuppliers(page, pageSize).then(async data => {
            setSuppliers(data);
        }).finally(() => setLoading(false))
    }, [page, pageSize]);

    function handleOnSupplierAdded(supplier) {
        setSuppliers(prev => [...prev, supplier]);
        setOpenForm('');
    }

    function handleOnSupplierUpdated(supplier) {
        setSuppliers(prev => prev.map(s => s._id === supplier._id ? supplier : s));
        setOpenForm('');
    }

    function handleUpdateSupplier(supplier) {
        setOpenForm('update');
        setSupplierToUpdate(supplier)
    }

    async function handleDeleteSupplier(supplier) {
        setOpen(true);
        setSupplierToDelete(supplier);
    }


    const handleClose = () => {
        setOpen(false);
        setSupplierToDelete(null);
    }

    const handleConfirmDelete = async () => {
        const res = await deleteSupplier(supplierToDelete._id);
        const { message, error } = await res.json();
        console.log(message, error)
        if (message) {
            setSuppliers(prev => prev.filter(s => s._id !== supplierToDelete._id));
            setOpenForm('');
        } else {
            alert(error)
        }
        
        handleClose();
    };

    return (
        <div className={`flex flex-col w-full h-full flex-grow overflow-y-auto relative ${true || 'overflow-x-hidden'}`}>
            <div className="absolute inset-0 flex flex-col h-full gap-4 p-4 overflow-x-hidden">
                <div className='w-full'>
                    <div className="flex items-center justify-between">
                        <h1 className='text-sm px-2 py-1 text-gray-800'>{suppliers.length} {t('supplier')} <span className='lowercase'>{t('recorded')}.</span> </h1>
                        <button
                            className='flex items-center gap-1 text-sm px-2 py-1 bg-gray-800 text-white rounded hover:bg-gray-700 active:bg-black'
                            onClick={() => setOpenForm('add')}
                        >
                            <Add fontSize='small' />
                            {t('new-supplier')}
                        </button>
                    </div>
                </div>
                {/* List table */}
                <div className='w-full flex-grow'>
                    <SupplierTable
                        suppliers={suppliers}
                        isLoading={isLoading}
                        onUpdate={handleUpdateSupplier}
                        onDelete={handleDeleteSupplier}
                        page={page}
                        pageSize={pageSize}
                        onPaginationChange={({ page, pageSize}) => {
                            setPage(page);
                            setPageSize(pageSize);
                        }}
                    />
                </div>
            </div>

            {/* Supplier form */}
            <AnimatePresence>
                {
                    openForm &&
                    <motion.div
                        className='max-w-2xl w-full right-0 h-full shadow-2xl absolute bg-white p-4 z-[100] border'
                        transition={transition}
                        initial={{
                            opacity: 0,
                            x: '200%'
                        }}
                        animate={{
                            opacity: 1,
                            x: '0'
                        }}
                        exit={{
                            opacity: 0,
                            x: '200%'
                        }}
                    >
                        {openForm === 'add' && <AddSupplierForm onCancel={() => setOpenForm('')} onSupplierAdded={handleOnSupplierAdded} />}
                        {(openForm === 'update' && supplierToUpdate) && <EditSupplierForm supplier={supplierToUpdate} onCancel={() => setOpenForm('')} onSupplierUpdated={handleOnSupplierUpdated} />}
                    </motion.div>
                }
            </AnimatePresence>


            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{t('confirm-deletion')}</DialogTitle>
                <DialogContent>
                    <Typography>{t('delete-supplier-message').replace(':supplier:', supplierToDelete?.name)}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        {t('delete')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default Page