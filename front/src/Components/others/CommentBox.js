import { memo, useState } from 'react';
import { Modal, Box, Typography, TextField, Button, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Close, Send } from '@mui/icons-material';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    borderRadius: '8px',
    boxShadow: 24,
    p: 4,
    width: '500px',
    
};

const CommentBox = memo(({ open, onClose, onSubmit, message='' }) => {

    const { t } = useTranslation();
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (comment.trim().length === 0) {
            console.log('here')
            setError(t('return-document-required-comment'))
            return;
        }

        onSubmit && onSubmit(comment);
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="loading-modal"
            aria-describedby="loading-icon-and-text"
        >
            <Box sx={modalStyle} className="flex flex-col items-center justify-center">
                
                <Typography id="modal-title" variant="h6" component="h2" gutterBottom>
                    {t('return-dialog-title')}
                </Typography>
                <form onSubmit={handleSubmit} className='w-full'>
                    <TextField
                        label="Your Comment"
                        variant="outlined"
                        multiline
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    {error && <Alert severity="error" className='mb-2'>{error}</Alert>}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button variant="contained" color="secondary" size='small' onClick={onClose} endIcon={<Close />}>
                            {t('close-btn')}
                        </Button>
                        <Button type="submit" variant="contained" color="primary" size='small' endIcon={<Send />}>
                            {t('submit-btn')}
                        </Button>
                    </Box>
                </form>
            </Box>
        </Modal>
    );
});

export default CommentBox;
