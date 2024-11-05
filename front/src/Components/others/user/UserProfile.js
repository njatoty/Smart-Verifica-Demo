import React, { useState } from 'react';
import { Box, Avatar, Typography, Paper, Dialog, DialogContent, Popover, Link } from '@mui/material';
import { styled } from '@mui/system';
import { AccountCircle, } from '@mui/icons-material';

const ProfileBox = styled(Paper)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
    width: '200px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
        backgroundColor: theme.palette.action.hover, // Slight color change on hover
    },
}));

const UserProfileDialog = ({ name, email, avatarUrl, open, handleClose }) => {
    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth sx={{ position: 'fixed' }}>
            <DialogContent>
                <Box display="flex" alignItems="center">
                    <Avatar src={avatarUrl} alt={name} sx={{ width: 100, height: 100 }} />
                    <Box ml={2}>
                        <Typography variant="h5">{name}</Typography>
                        <Typography variant="body1">{email}</Typography>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

const UserProfilePopover = ({ name, email, avatarUrl, mousePosition, open, handleClose }) => {
    const id = open ? 'user-profile-popover' : undefined;

    return (
        <Popover
            id={id}
            open={open}
            // anchorEl={anchorEl}
            onClose={handleClose}
            anchorReference="anchorPosition"
            anchorPosition={
                mousePosition ? { top: mousePosition.mouseY, left: mousePosition.mouseX } : undefined
            }
            transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
        >
            <Box display="flex" alignItems="center" p={2}>
                <Avatar src={avatarUrl} alt={name} sx={{ width: 70, height: 70 }} />
                <Box ml={2}>
                    <Typography variant="h6">{name}</Typography>
                    <Link variant="body2" href={`mailto:${email}`}>{email}</Link>
                </Box>
            </Box>
        </Popover>
    );
};


export const UserProfile = ({ name, email, avatarUrl }) => {

    return (
        <Box display="flex" alignItems="center">
            <Avatar src={avatarUrl} alt={name} sx={{ width: 40, height: 40 }} />
            <Box ml={2}>
                <Typography variant="subtitle1">{name}</Typography>
                <Typography variant="caption">{email}</Typography>
            </Box>
        </Box>
    );
};

export const UserCell = ({ name, email, avatarUrl }) => {

    const [mousePosition, setMousePosition] = useState(null);
    const [open, setOpen] = useState(false);

    const handleMouseEnter = (event) => {
        setMousePosition({
            mouseX: event.clientX,
            mouseY: event.clientY,
        });

        setOpen(true);
    };

    const handleMouseLeave = () => {
        setOpen(false);
    };

    return (
        <>
            {/* Username cell that triggers the dialog on hover */}
            <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                sx={{ cursor: 'pointer' }}
                className='underline capitalize flex items-center gap-2'
            >
                <AccountCircle className='text-blue-500' />
                {name}

                {/* Dialog with user profile details */}
                <UserProfilePopover
                    name={name}
                    email={email}
                    avatarUrl={avatarUrl}
                    open={open}
                    handleClose={handleMouseLeave}
                    mousePosition={mousePosition}
                />
            </div>
        </>
    );
};

export default UserProfileDialog;
