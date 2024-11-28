import React, { useEffect, useState } from 'react';
import { createSupplier, updateSupplier } from '../../services/datasource-service';
import { t } from 'i18next';
import { CircularProgress } from '@mui/material';

export const AddSupplierForm = ({ onSupplierAdded, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        iban: '',
        phone: '',
        taxId: '',
        website: '',
    });

    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await createSupplier(formData);

            const newSupplier = await response.json();
            if (onSupplierAdded) {
                onSupplierAdded(newSupplier);
            }

            setFormData({
                name: '',
                email: '',
                address: '',
                iban: '',
                phone: '',
                taxId: '',
                website: '',
            });
            
            // alert('Supplier added successfully!');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold">{t('add-supplier')}</h2>
            <div className='border-b border-gray-200 my-4'/>
            {error && <p className="text-red-500 w-full p-2 bg-red-100 rounded text-sm mb-2">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className='grid grid-cols-2 gap-2'>
                    <div className="data-source_form-group">
                        <label htmlFor="name" className="data-source_label">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="data-source_input"
                            required
                        />
                    </div>
                    <div className="data-source_form-group">
                        <label htmlFor="email" className="data-source_label">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="data-source_input"
                        />
                    </div>
                    <div className="data-source_form-group">
                        <label htmlFor="address" className="data-source_label">Address</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="data-source_input"
                        />
                    </div>
                    <div className="data-source_form-group">
                        <label htmlFor="iban" className="data-source_label">IBAN</label>
                        <input
                            type="text"
                            id="iban"
                            name="iban"
                            value={formData.iban}
                            onChange={handleChange}
                            className="data-source_input"
                        />
                    </div>
                    <div className="data-source_form-group">
                        <label htmlFor="phone" className="data-source_label">Phone</label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="data-source_input"
                        />
                    </div>
                    <div className="data-source_form-group">
                        <label htmlFor="taxId" className="data-source_label">Tax ID</label>
                        <input
                            type="text"
                            id="taxId"
                            name="taxId"
                            value={formData.taxId}
                            onChange={handleChange}
                            className="data-source_input"
                        />
                    </div>
                    <div className="data-source_form-group">
                        <label htmlFor="website" className="data-source_label">Website</label>
                        <input
                            type="text"
                            id="website"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="data-source_input"
                        />
                    </div>
                </div>
                <div className='border-b border-gray-200 my-4'/>
                <div className='flex items-center gap-4'>
                    <button
                        disabled={isLoading}
                        type="submit"
                        className="disabled:opacity-80 flex items-center gap-1 bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 transition text-sm" 
                    >
                        
                        {isLoading && <CircularProgress color='' size="20px" />}
                        {t('add-supplier')}
                    </button>
                    <button
                        type="button"
                        className="bg-gray-300 text-black py-2 px-4 rounded-md shadow hover:bg-gray-400 transition text-sm" 
                        onClick={() => onCancel && onCancel()}
                    >
                        {t('cancel')}
                    </button>
                </div>
            </form>
        </div>
    );
};


export const EditSupplierForm = ({ supplier, onSupplierUpdated, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        address: '',
        iban: '',
        phone: '',
        taxId: '',
        website: '',
    });

    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        setFormData(supplier)
    }, [supplier]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const response = await updateSupplier(supplier?._id, formData);

            const newSupplier = await response.json();
            if (onSupplierUpdated) {
                onSupplierUpdated(newSupplier);
            }

            setFormData({
                name: '',
                email: '',
                address: '',
                iban: '',
                phone: '',
                taxId: '',
                website: '',
            });
            // alert('Supplier added successfully!');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold">{t('add-supplier')}</h2>
            <div className='border-b border-gray-200 my-4'/>
            {error && <p className="text-red-500 w-full p-2 bg-red-100 rounded text-sm mb-2">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className='grid grid-cols-2 gap-2'>
                    <div className="data-source_form-group">
                        <label htmlFor="name" className="data-source_label">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="data-source_input"
                            required
                        />
                    </div>
                    <div className="data-source_form-group">
                        <label htmlFor="email" className="data-source_label">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="data-source_input"
                        />
                    </div>
                    <div className="data-source_form-group">
                        <label htmlFor="address" className="data-source_label">Address</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="data-source_input"
                        />
                    </div>
                    <div className="data-source_form-group">
                        <label htmlFor="iban" className="data-source_label">IBAN</label>
                        <input
                            type="text"
                            id="iban"
                            name="iban"
                            value={formData.iban}
                            onChange={handleChange}
                            className="data-source_input"
                        />
                    </div>
                    <div className="data-source_form-group">
                        <label htmlFor="phone" className="data-source_label">Phone</label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="data-source_input"
                        />
                    </div>
                    <div className="data-source_form-group">
                        <label htmlFor="taxId" className="data-source_label">Tax ID</label>
                        <input
                            type="text"
                            id="taxId"
                            name="taxId"
                            value={formData.taxId}
                            onChange={handleChange}
                            className="data-source_input"
                        />
                    </div>
                    <div className="data-source_form-group">
                        <label htmlFor="website" className="data-source_label">Website</label>
                        <input
                            type="text"
                            id="website"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            className="data-source_input"
                        />
                    </div>
                </div>
                <div className='border-b border-gray-200 my-4'/>
                <div className='flex items-center gap-4'>
                    <button
                        disabled={isLoading}
                        type="submit"
                        className="disabled:opacity-80 flex items-center gap-1 bg-blue-500 text-white py-2 px-4 rounded-md shadow hover:bg-blue-600 transition text-sm" 
                    >
                        
                        {isLoading && <CircularProgress color='' size="20px" />}
                        {t('add-supplier')}
                    </button>
                    <button
                        type="button"
                        className="bg-gray-300 text-black py-2 px-4 rounded-md shadow hover:bg-gray-400 transition text-sm" 
                        onClick={() => onCancel && onCancel()}
                    >
                        {t('cancel')}
                    </button>
                </div>
            </form>
        </div>
    );
};

