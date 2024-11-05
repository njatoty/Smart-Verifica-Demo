// CellRenderer.js
import { Comment, PictureAsPdf } from '@mui/icons-material';
import React from 'react';
import { UserCell } from '../user/UserProfile';
import { Chip } from '@mui/material';
import { t } from 'i18next';
import { useNavigate } from 'react-router-dom';

const CellRenderer = {
    RenderPDFName: ({ pdfName, version, id, isLocked, isGranted }) => {
        const navigate = useNavigate();
        const isClickable = (version && id && !isLocked) || isGranted;
        function handleHead() {
            (isClickable) && navigate(`/document/${version}/${id}`);
        }

        return (
            <div className={`flex items-center gap-2 w-full h-full ${isClickable ? 'cursor-pointer hover:text-indigo-500' : ''}`}
                title={(isClickable) ? t('click-to-open-document') : pdfName}
                onClick={handleHead}
            >
                <PictureAsPdf className="text-red-400" fontSize='medium' />
                {pdfName}
            </div>
        );
    },
    
    RenderComment: ({ comment }) => {
        return (
            <div className="flex items-center gap-2 w-full h-full" title={comment}>
                <Comment className="text-orange-300" fontSize='medium' />
                {comment}
            </div>
        );
    },

    RenderUser: ({ user }) => {
        return (
            <UserCell 
                name={user.name} 
                email={user.email}
                avatarUrl="https://via.placeholder.com/150" 
            />
        );
    },

    RenderWorkflowStatus: ({ data: { isLocked, status } }) => {
        return (
            <>
                {
                    status === 'validated' ?
                        <Chip label={t('completed-status')} color="success" variant="outlined" />
                    :
                        isLocked ?
                            <Chip label={t('inprogress-status')} color="primary" variant="outlined" />
                        :
                            <Chip label={t('pendingassignment-status')} color="warning" variant="outlined" />
                }
            </>
        );
    },
};

export default CellRenderer;
