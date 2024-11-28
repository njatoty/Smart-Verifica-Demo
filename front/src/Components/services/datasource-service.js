
import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL;
// services/fileService.js

const token = () => localStorage.getItem('token');

// Service pour récupérer tous les fichiers (uniquement les PDF ou autres)
export const createSupplier = async (formData) => {
    const response = await fetch(`${API_BASE_URL}/data-source/supplier`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token()}`,
        },
        body: JSON.stringify(formData),
    });

    if (!response.ok) {
        const message = await response.json();
        throw new Error(message.error || 'Failed to add supplier');
    }

    return response;
}


// Service pour récupérer tous les fournisseur
export const getSuppliers = async (page = 0, pageSize = 100) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/data-source/supplier`, {
            params: {
                page: page + 1, // Incrementing because MUI starts at 0
                limit: pageSize
            },
            headers: {
                'Authorization': `Bearer ${token()}`,
            },
        });
        return response.data; // Return the supplier data
    } catch (error) {
        // Extract a useful error message
        const errorMessage = error.response?.data?.error || 'Failed to get suppliers';
        throw new Error(errorMessage);
    }
};


// Service pour modifier un fournisseur
export const updateSupplier = async (supplierId, formData) => {
    const response = await fetch(`${API_BASE_URL}/data-source/supplier/${supplierId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token()}`,
        },
        body: JSON.stringify(formData)
    });

    if (!response.ok) {
        const message = await response.json();
        throw new Error(message.error || 'Failed to update supplier');
    }

    return response;
}


// Service pour modifier un fournisseur
export const deleteSupplier = async (supplierId) => {
    const response = await fetch(`${API_BASE_URL}/data-source/supplier/${supplierId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token()}`,
        },
    });

    if (!response.ok) {
        const message = await response.json();
        throw new Error(message.error || 'Failed to delete supplier');
    }

    return response;
}


