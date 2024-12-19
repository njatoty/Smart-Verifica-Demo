const API_BASE_URL = process.env.REACT_APP_API_URL;

const token = () => localStorage.getItem('token');

// Service pour extraire les textes dans une image.
export const convertImageToText = async (imageBase64) => {
    const response = await fetch(`${API_BASE_URL}/extract-text`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token()}`,
        },
        body: JSON.stringify({imageBase64}),
    });
    

    return response.json();
}
