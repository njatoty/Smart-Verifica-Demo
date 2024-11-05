import React, {useEffect, useState} from "react";
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { useTranslation } from 'react-i18next';
import {Alert, Snackbar, Box, Button, Link, Dialog, DialogActions, DialogContent, DialogTitle, TextField, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

// import { Box, Button, Link } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UserServices from "../../services/serviceUser";

const paginationModel = { page: 0, pageSize: 40 };

const defaultSnackAlert = {
    open: false,
    type: 'success',
    message: ''
  };
  
export default function AllUsers({ data = [], loading = false, onUpdate, onDelete }) {
    const { t } = useTranslation();
    const [rows, setRows] = React.useState(data.map(d => ({ ...d, id: d._id })));
    const [open, setOpen] = useState(false); // État pour le modal
    const [snackAlert, setSnackAlert] = useState(defaultSnackAlert);
    const [currentUser, setCurrentUser] = useState(
        { 
            id: '',
            name: '',
            firstname: '',
            email: '',
            role: ''
        }); // Utilisateur actuellement en cours d'édition

    const handleClickOpen = (user) =>{
        setCurrentUser(user)
        setOpen(true)
    }

    const handleClose = () =>{
        setOpen(false)
        setCurrentUser({
            id: '',
            name: '',
            firstname: '',
            email: '',
            role: ''
        });
    }

    function closeSnackAlert() {
        setSnackAlert(defaultSnackAlert)
      }
    const handleSaveUpdate = async () => {
        // event.stopPropagation(); 
        // if (onUpdate) {
        //     onUpdate(currentUser);
        // } 
        const result = await onUpdate(currentUser)
        
        if (result.ok) {
          setSnackAlert({
            open: true,
            type: 'success',
            message: t('data-update')
          });
          setRows(data.map(d => ({ ...d, id: d._id }))); // Mettre à jour les lignes avec les nouvelles données

        } else {
            // Gestion des erreurs si le résultat n'est pas conforme
            setSnackAlert({
                open: true,
                type: 'error',
                message: t('error-updating-data')
            });
        }
        handleClose()
    };

    const handleChange=(event) => {
        const {name, value} = event.target
        setCurrentUser({...currentUser, [name]: value})
    }

    const handleDelete = async (id) => {
        // event.stopPropagation(); 
        const result = await onDelete(id)
        
        if (result.ok) {
          setSnackAlert({
            open: true,
            type: 'success',
            message: t('data-delete')
          });

        } else {
            // Gestion des erreurs si le résultat n'est pas conforme
            setSnackAlert({
                open: true,
                type: 'error',
                message: t('error-delete-data')
            });
        }
    };

    const roleOptions = [
        {value: 'admin', label: t('Admin')},
        {value: 'validation 1', label: "Validation 1"},
        {value: 'validation 2', label: "Validation 2"}
    ]
    const columns = [
        {
            field: 'image',
            headerName: '',
            sortable: false,
            renderCell: () => <AccountCircle color='primary' />
        },
        { field: 'name', headerName: t('nom'), flex: 1, minWidth: 150 },
        { field: 'firstname', headerName: t('prenom'), flex: 1, minWidth: 150 },
        {
            field: 'role',
            headerName: t('role'),
            flex: 1,
            minWidth: 150,
            renderCell: ({ row }) => <span className='capitalize'>{row.role}</span>
        },
        {
            field: 'email',
            headerName: t('email'),
            flex: 1,
            minWidth: 150,
            renderCell: ({ row }) => <Link href={`mailto:${row.email}`}>{row.email}</Link>
        },
        {
            field: 'actions',
            headerName: t('actions'),
            sortable: false,
            minWidth: 150,
            renderCell: ({ row }) => (
                <Box display="flex" gap={1} alignItems="center" justifyContent="center">
                    <Button variant="contained" color="primary" size="small" 
                        onClick={() => {  // Empêche la sélection de la ligne
                            handleClickOpen(row); 
                        }}>
                        <EditIcon fontSize="small" />
                    </Button>
                    <Button variant="outlined" color="error" size="small" 
                        onClick={() => 
                         handleDelete( row.id)}>
                        <DeleteIcon fontSize="small" />
                    </Button>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <Paper sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                <DataGrid
                    rows={data.map(d => ({ ...d, id: d._id }))}
                    columns={columns}
                    initialState={{ pagination: { paginationModel } }}
                    pageSizeOptions={[5, 10]}
                    disableRowSelectionOnClick
                    checkboxSelection
                    sx={{ border: 0, fontSize: '0.85rem' }}
                    rowHeight={38}
                    loading={loading}
                />
            </Paper>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle >{t('modifier_utilisateur')}</DialogTitle>
                <DialogContent>
                    {currentUser && (
                        <>
                        <TextField autoFocus margin='dense' name='name' label={t('nom')}
                        type='text' fullWidth value={currentUser.name} onChange={handleChange}/>

                        <TextField margin='dense' name='firstname' label={t('prenom')}
                        type='text' fullWidth value={currentUser.firstname} onChange={handleChange}/>

                        <TextField margin='dense' name='email' label={t('email')} 
                        type='email' fullWidth value={currentUser.email} onChange={handleChange}/>

                        <FormControl fullWidth margin='dense'>
                            <Select name='role' value={currentUser.role} onChange={handleChange}>
                                {roleOptions.map((option)=>(
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        </>
                    )}
                </DialogContent>
                <DialogActions >
                    <Button onClick={handleClose} color='primary'>{t('annuler')}</Button>
                    <Button onClick={handleSaveUpdate} color='primary'>{t('sauvegarder')}</Button>
                </DialogActions>
            </Dialog>
            
            <Snackbar open={snackAlert.open} autoHideDuration={6000}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            onClose={closeSnackAlert}
            >
            <Alert
                onClose={closeSnackAlert}
                severity={snackAlert.type}
                variant="filled"
                sx={{ width: '100%', padding: '0.2rem 0.6rem' }}
            >
                {snackAlert.message}
            </Alert>
            </Snackbar>
        </Box>
    );
}
