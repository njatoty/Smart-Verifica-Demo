// CellRenderer.js
import { Comment, PictureAsPdf, Circle, CheckCircle } from '@mui/icons-material';
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
    
    RenderComment: ({ comment, status='' }) => {
        return (
            <div className="flex items-center gap-2 w-full h-full" title={comment}>
                {
                    status === 'rejected' ?
                    <Circle className="text-rose-400" fontSize='small' />
                        : status === 'validated' ?
                        <CheckCircle className="text-emerald-400" fontSize='small' />
                            :
                            <Comment className="text-orange-300" fontSize='medium' />
                }
                {comment}
            </div>
        );
    },

    RenderUser: ({ user }) => {
        console.log(user.role)
        return (
            <UserCell 
                name={user.displayName} 
                email={user.email}
                role={user.role}
                avatarUrl={user.profilePicture} 
            />
        );
    },

    RenderWorkflowStatus: ({ data: { isLocked, status } }) => {
        return (
            <>
                {
                    status === 'validated' ?
                        <Chip label={t('completed-status')} color="success" variant="outlined" size='small' />
                    :
                        status === 'temporarily-rejected' ?
                            <Chip label={t('rejected')} color="error" variant="filled" size='small' />
                        :
                            isLocked ?
                                <Chip label={t('inprogress-status')} color="primary" variant="outlined" size='small' />
                            :
                                <Chip label={t('pendingassignment-status')} color="warning" variant="outlined" size='small' />
                }
            </>
        );
    },
};

export default CellRenderer;
