import { memo, useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import { t } from 'i18next';
import ComboBox from './ComboBox';

const RejectModal = memo(({ open, onClose, onSubmit }) => {

    const [reason, setReason] = useState('');

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'auto',
        bgcolor: 'background.paper',
        borderRadius: '8px',
        boxShadow: 24,
        p: 4,
    };

    const invoiceErrors = [
        { label: "Document contains multiple invoices", value: "Document contains multiple invoices" },
        { label: "Duplicate invoice", value: "Duplicate invoice" },
        { label: "IBAN doesn't correspond with invoice", value: "IBAN doesn't correspond with invoice" },
        { label: "Invoice date unknown or not in range", value: "Invoice date unknown or not in range" },
        { label: "Invoice is unreadable", value: "Invoice is unreadable" },
        { label: "Invoice number unknown", value: "Invoice number unknown" },
        { label: "Not an invoice", value: "Not an invoice" },
        { label: "Supplier not in list", value: "Supplier not in list" },
        { label: "VAT amounts not recognized or incorrect", value: "VAT amounts not recognized or incorrect" },
        { label: "Not able to select company", value: "Not able to select company" },
        { label: "Ballast - Order", value: "Ballast - Order" },
        { label: "Ballast - Reminder", value: "Ballast - Reminder" },
        { label: "File too big for delivery", value: "File too big for delivery" },
        { label: "VAT number doesn't correspond with invoice", value: "VAT number doesn't correspond with invoice" },
        { label: "Document contains multiple invoices", value: "Document contains multiple invoices" }
    ];

    function handleSubmit(e) {
        e.preventDefault();

        if (reason) {
            onSubmit && onSubmit(reason);
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="loading-modal"
            aria-describedby="loading-icon-and-text"
        >
            <Box sx={modalStyle} className="flex flex-col min-w-[500px]">
                <form onSubmit={handleSubmit}>
                    {/* <CircularProgress color="primary" /> */}
                    <Typography variant="h6" className="mt-6 text-rose-500">
                        {t('reject-document')}?
                    </Typography>
                    <p className="text-slate-700 my-4">
                        {t('reject-message')}
                    </p>
                    <div className="reject__form-group flex justify-between items-center w-full">
                        <ComboBox
                            value=""
                            label={t('reject-reason')}
                            required
                            options={invoiceErrors}
                            position="top"
                            onInput={(id, newVal) => setReason(newVal)}
                        />
                    </div>
                    <div className="flex items-center mt-6 gap-4 justify-center">
                        <Button type="button" variant='outlined' color='inherit' size='small' onClick={onClose}>
                            {t('close-btn')}
                        </Button>
                        <Button type="submit" variant='contained' color='error' size='small'>
                            {t('submit-btn')}
                        </Button>
                    </div>
                </form>
            </Box>
        </Modal>
    );
});

export default RejectModal;
