
  // fileService.js

import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_API_URL;
// services/fileService.js

const token = () => localStorage.getItem('token');

// Service pour récupérer tous les fichiers (uniquement les PDF ou autres)
const fetchFiles = async () => {
  try {

    const response = await fetch(`${API_BASE_URL}/files`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token()}`,
      },
      
    });

    if (!response.ok) {
      throw new Error(`Erreur lors de la récupération des fichiers: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data; // Cela retourne la liste des fichiers
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error);
    throw error;
  }
}

const fetchPrevalidations = async (page=1, pageSize=50) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/prevalidations`, {
      params: { page: page + 1, limit: pageSize }, // Incrémentation car MUI commence à 0
      headers: {
        'Authorization': `Bearer ${token()}`,
      },
    });
    return response.data;
    
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error);
    throw error;
  }
}

// method to get v2 validations
const fetchV2Validations = async (page=1, pageSize=50) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v2-validations`, {
      params: { page: page + 1, limit: pageSize }, // Incrémentation car MUI commence à 0
      headers: {
        'Authorization': `Bearer ${token()}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error);
    throw error;
  }
}

// method to get v2 validations
const fetchReturnedValidations = async (page=1, pageSize=50) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/returned-validations`, {
      params: { page: page + 1, limit: pageSize }, // Incrémentation car MUI commence à 0
      headers: {
        'Authorization': `Bearer ${token()}`,
      },
    });

    return response.data;
    
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error);
    throw error;
  }
}

// method to fetch rejected documents
const fetchRejectedValidations = async (page=1, pageSize=50) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/rejected-validations`, {
      params: { page: page + 1, limit: pageSize }, // Incrémentation car MUI commence à 0
      headers: {
        'Authorization': `Bearer ${token()}`,
      },
    });

    return response.data;
    
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error);
    throw error;
  }
}


// Method to fetch Validated document
const fetchValidatedDocuments = async (page=1, pageSize=50) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/validated-validations`, {
      params: { page: page + 1, limit: pageSize }, // Incrémentation car MUI commence à 0
      headers: {
        'Authorization': `Bearer ${token()}`,
      },
    });

    return response.data;
    
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers:', error);
    throw error;
  }
}

const uploadFiles = async (files) => {
  const formData = new FormData();  
  files.forEach((file) => {
    formData.append('files', file);
  });

  try {
    const response = await axios.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token()}`,
      },
    });
    return response.data.files; // Retourner les fichiers reçus du serveur
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    throw error;
  }
};



// Method to send validation
const saveValidation = async  (documentId, data) => {
  const response = await fetch(`${API_BASE_URL}/validation/${documentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token()}`,
    },
    body: JSON.stringify({
      documentId,
      ...data
    })
  });
  return response.json();
}

// Method to send validation
const validateDocument = async  (documentId, data) => {
  const response = await fetch(`${API_BASE_URL}/validation/${documentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token()}`,
    },
    body: JSON.stringify({
      documentId,
      ...data
    })
  });
  return response.json();
}

const getDocumentValidation = async (documentId, validation) => {
  const response = await fetch(`${API_BASE_URL}/validation/${documentId}${validation ? '/' + validation : ''}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token()}`,
    },
  });
  return response.json();
}

const downloadXML = async (json) => {
  const response = await fetch(`${API_BASE_URL}/get-xml`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token()}`,
    },
    body: JSON.stringify({json})
  });
  return response;
}

const returnDocument = async (documentId, data) => {
  const response = await fetch(`${API_BASE_URL}/return-document/${documentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token()}`,
    },
    body: JSON.stringify({documentId, ...data})
  });
  return response;
}


const rejectDocument = async (documentId, data) => {
  const response = await fetch(`${API_BASE_URL}/reject-document/${documentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token()}`,
    },
    body: JSON.stringify({documentId, ...data})
  });
  return response.json();
}


const unlockFile = async (id) => {
  return fetch(`${API_BASE_URL}/unlockFile/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token()}`,
    },
  });
}
const lockFile = async (id) => {
  return fetch(`${API_BASE_URL}/lockFile/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token()}`,
    },
  });
}

const fetchDocumentCounts = async () => {
  const res = await fetch(`${API_BASE_URL}/document-counts`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token()}`,
    },
  });
  return res.json()
}


const fetchDocuments = async (page, pageSize) => {
  try {
      const response = await axios.get(`${API_BASE_URL}/documents`, {
          params: { page: page + 1, limit: pageSize }, // Incrémentation car MUI commence à 0
          headers: {
            'Authorization': `Bearer ${token()}`,
          },
      });
      return response.data;
  } catch (error) {
      console.error("Erreur lors de la récupération des enregistrements :", error);
  }
};

const goToNextDocument = async (validation = 'v1') => {
  const response = await axios.post(`${API_BASE_URL}/next-doc/${validation}`, {}, {
    headers: {
      'Authorization': `Bearer ${token()}`,
    },
  });

  return response.data;
}


async function fetchVerticesJson(jsonUrl) {
  try {
    const response = await axios.get(jsonUrl);
    const data = response.data;
    return data;
  } catch (error) {
    console.error('Error fetching JSON:', error.message);
    return null;
  }
}


const deleteSelectedDocuments = async (documentsIds) => {
  const response = await fetch(`${API_BASE_URL}/delete-documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token()}`,
    },
    body: JSON.stringify({documents: documentsIds})
  });
  return response;
}

// Export des fonctions du service
const fileService = {
  fetchFiles,
  fetchDocumentCounts,
  uploadFiles,
  saveValidation,
  getDocumentValidation,
  validateDocument,
  downloadXML,
  unlockFile,
  lockFile,
  fetchPrevalidations,
  fetchV2Validations,
  fetchReturnedValidations,
  fetchValidatedDocuments,
  returnDocument,
  rejectDocument,
  fetchDocuments,
  goToNextDocument,
  fetchRejectedValidations,
  fetchVerticesJson,
  deleteSelectedDocuments,
  API_BASE_URL
};


export default fileService;
