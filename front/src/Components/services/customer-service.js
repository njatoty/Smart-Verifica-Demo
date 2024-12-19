const API_BASE_URL = process.env.REACT_APP_API_URL;

const token = () => localStorage.getItem('token');

// Modifier la propriété dynamic keys dans customer
export const updateCustomerDynamicKeys = async (customerId, data, action='add') => {

    const method = action === 'remove' ? 'DELETE' : 'PUT';

    const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}/dynamic-keys`, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token()}`,
        },
        body: JSON.stringify({...data}),
    });
    

    return response.json();
}

// Method to update order of dynamic keys
export const updateCustomerDynamicKeysOrder = async (customerId, reorderedKeys) => {
    
    const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}/update-order-dynamic-keys`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token()}`,
        },
        body: JSON.stringify({...reorderedKeys})
    });

    return response.json()
}


// Method to get customer
export const getCustomerById = async (customerId='67514c02a36d01d14c04de95') => {
    
    const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token()}`,
        },
    });

    return response.json()
}

// upload json file containing keys
export const uploadJSONFileKey = async (customerId, file, clearKeys) => {
    
    const formData = new FormData();
    formData.append('jsonFile', file);
    formData.append('clearKeys', clearKeys);

    const response = await fetch(`${API_BASE_URL}/api/customers/${customerId}/upload-json-key`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token()}`,
        },
        body: formData
    });

    return response.json()
} 