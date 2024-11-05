import { memo } from 'react';
import { Modal, Box, CircularProgress, Typography } from '@mui/material';

const LoadingModal = memo(({ open, onClose, message='' }) => {
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

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="loading-modal"
            aria-describedby="loading-icon-and-text"
        >
            <Box sx={modalStyle} className="flex flex-col items-center justify-center">
                <CircularProgress color="primary" />
                <br />
                <Typography variant="subtitle2" className="mt-6">
                    {message || 'Loading, please wait...'}
                </Typography>
            </Box>
        </Modal>
    );
});

export default LoadingModal;
