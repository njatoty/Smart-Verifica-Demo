import React, { useEffect, useMemo, useRef, useState } from "react";
import { updateCustomerDynamicKeys, uploadJSONFileKey } from "../../services/customer-service";
import { Button, CircularProgress, Checkbox } from "@mui/material";
import { HighlightOff, HighlightOffOutlined, SaveOutlined } from '@mui/icons-material'
import { t } from "i18next";

export const DynamicKeysAddForm = ({ customerId = '67514c02a36d01d14c04de95', onSuccess, formAction='add', currentItem=null, onCancel }) => {
    const [key, setKey] = useState('');
    const [value, setValue] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(true);
    const [jsonFile, setJSONFile] = useState(null);
    const [clearKeys, setClearKeys] = useState(false);
    const fileRef = useRef(null);


    const cItem = useMemo(() => currentItem, [currentItem]);

    const action = useMemo(() => formAction, [formAction]);

    useEffect(() => {
        setKey(currentItem?.name || '');
        setDescription(currentItem?.description || '');
    }, [currentItem]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await updateCustomerDynamicKeys(customerId, {
                name: action === 'add' ? key : cItem.key,
                ...(action === 'update') && { newKey: key },
                description: description.trim(),
                value: value.split(','), // Split value into an array
                action
            }, action);

            setMessage(response.message);
            if (response.customer) onSuccess?.(response.customer.dynamicKeys);    
            setKey('');
            setValue('');
        } catch (error) {
            console.log(error)
            setMessage(error.response?.data?.message || 'An error occurred');
        }

        setTimeout(() => {
            setMessage('')
        }, 5000);
    };


    function handleFileChange(event) {
        if (event.target.files[0]) {
            setJSONFile(event.target.files[0]);
        }
    }

    function handleCancelUpload() {
        fileRef.current.value = null;
        setJSONFile(null);
    }

    async function handleUploadFile() {
        const res = await uploadJSONFileKey(customerId, jsonFile);
        onSuccess?.(res.data);
    }

    return (
        <div className="w-full">
            <form onSubmit={handleSubmit}>
            
                <div className="w-full">       
                    <div className="input__form">
                        <label htmlFor="key">Key<span className="text-rose-600">*</span>:</label>
                        <input
                            className="form_controller text-base"
                            type="text"
                            id="key"
                            value={key}
                            onChange={(e) => setKey(e.target.value.toLowerCase())}
                            required
                        />
                    </div>
                    <div className="input__form">
                        <label htmlFor="description">Description:</label>
                        <textarea
                            className="form_controller text-base"
                            type="text"
                            id="description"
                            value={description}
                            rows={2}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input__form hidden">
                        <label htmlFor="value">Value (comma-separated):</label>
                        <input
                            className="form_controller text-base"
                            type="text"
                            id="value"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            disabled={action === 'remove'}
                        />
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                        <button
                            disabled={isLoading}
                            type="submit"
                            className="disabled:opacity-80 flex items-center gap-1 bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 transition text-sm" 
                        >
                            {isLoading && <CircularProgress color='' size="20px" />}
                            { action === "add" ? t('submit') : t('update')}
                        </button>
                        {
                            action === 'update' &&
                            <button
                                type="button"
                                className="bg-gray-300 text-black py-2 px-4 rounded-md shadow hover:bg-gray-400 transition text-sm" 
                                onClick={() => onCancel?.()}
                            >
                                {t('cancel')}
                            </button>
                        }
                    </div>

                    <hr className="w-full my-4" />
                    
                    <div className="w-full">
                        <div className="input__form">
                            <label htmlFor="file">Upload json: </label>
                            <input
                                ref={fileRef}
                                type="file"
                                id="file"
                                className="form_controller w-full"
                                accept="application/json"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="w-full flex items-center justify-end gap-2">
                            {
                                jsonFile &&
                                <>
                                    <label className="text-sm mr-auto">
                                        <Checkbox
                                            color="primary"
                                            checked={clearKeys}
                                            onChange={(e) => setClearKeys(e.target.checked)}
                                        />
                                        Clear existing variables
                                    </label>
                                    <Button size="small" variant="outlined" startIcon={<SaveOutlined />}
                                        onClick={handleUploadFile}
                                        disabled={uploading}
                                    >
                                        { uploading ? t('saving') : t('save-file')}
                                    </Button>
                                    <Button
                                        size="small" variant="outlined" color="warning" startIcon={<HighlightOffOutlined />}
                                        onClick={handleCancelUpload}
                                    >
                                        {t('cancel')}
                                    </Button>
                                </>
                            }
                        </div>
                    </div>
                </div>
            </form>
            {message && <p className="my-3 p-2 bg-orange-100 text-orange-600 rounded-sm text-sm">{message}</p>}
        </div>
    );
};

