
import axios from 'axios';
import { ref, get, set, push, query, orderByChild, startAt, limitToFirst, equalTo, child, update } from 'firebase/database'
import { getDownloadURL } from 'firebase/storage'
import { database } from './firebaseConfig';
const API_BASE_URL = process.env.REACT_APP_API_URL;

const token = () => localStorage.getItem('token');
async function createFile(name, dataXml = "{}", versions = [], status = "progress", validatedBy = {}, lockedBy = null, returnedBy = null, comment = "", reason = "") {
    try {
        // Auto-generate XML file name from the provided name
        const xml = name.replace(/\.[^/.]+$/, ".xml");

        // Create a new file reference
        const newFileRef = push(ref(database, 'documents'));

        // Set the file data
        await set(newFileRef, {
            name: name,
            isLocked: false,
            xml: xml,
            dataXml: dataXml,
            uploadAt: new Date().toISOString(), // Use ISO string for upload date
            versions: versions.reduce((acc, version) => {
                // Assuming version is an object with 'versionNumber' and 'dataJson'
                acc[push(ref(database, 'documents/' + newFileRef.key + '/versions')).key] = version;
                return acc;
            }, {}),
            validation: {
                v1: false,
                v2: false,
            },
            status: status,
            validatedBy: validatedBy,
            lockedBy: lockedBy,
            returnedBy: returnedBy,
            comment: comment,
            reason: reason,
            createdAt: new Date().toISOString() // Use ISO string for created date
        });

        console.log("File created with ID:", newFileRef.key);
    } catch (error) {
        console.error("Error creating file:", error);
    }
}
// for (let index = 4; index < 15; index++) {

//     createFile(`my_file${index}.pdf`, "{}", [
//         { versionNumber: "v1", dataJson: {} },
//         { versionNumber: "v2", dataJson: {} }
//     ]);    
// }

const PopulateUserData = async (documents) => {

    const usersRef = ref(database, 'users');

    return Promise.all(
        Object.entries(documents).map(async ([documentId, documentData]) => {
            var lockedBy = null;
            var validatedBy = {
                v1: null,
                v2: null
            }

            if (documentData.lockedBy) {
                const userRef = child(usersRef, documentData.lockedBy);
                const userSnapshot = await get(userRef);
                lockedBy = userSnapshot.exists() ? { ...userSnapshot.val(), uid: documentData.lockedBy } : null;
            }

            ['v1', 'v2'].map(async (v) => {
                if (documentData.validatedBy && documentData.validatedBy[v]) {
                    const userRef = child(usersRef, documentData.validatedBy[v]);
                    const userSnapshot = await get(userRef);
                    validatedBy[v] = userSnapshot.exists() ? { ...userSnapshot.val(), uid: documentData.validatedBy[v] } : null;
                }
            });
            
            return {
                ...documentData,
                id: documentId,
                lockedBy,
                validatedBy
            }
        })
    )
}

const fetchPrevalidations = async (page = 1, pageSize = 50) => {
    
    const dataRef = ref(database, 'documents'); // Reference to the 'documents' path
    // Create a query for fetching documents
    const documentsQuery = query(
        dataRef,
        orderByChild('validation/v1'), // Filter by 'validation/v1'
        equalTo(false), // Only include documents where 'validation/v1' is false
        // startAt(page), // Starting point for pagination
        limitToFirst(pageSize * (page + 1)) // Limit to page size
    );

    // Function to get document count
    const getCount = async () => {
        const snapshot = await get(query(
            dataRef,
            orderByChild('validation/v1'), // Filter by 'validation/v1'
            equalTo(false), // Only include documents where 'validation/v1' is false
        ));
        
        return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    };

    try {
        // Execute both queries concurrently
        const [documentsSnapshot, totalRecords] = await Promise.all([
            get(documentsQuery),
            getCount()
        ]);
        const documents = documentsSnapshot.exists() ? documentsSnapshot.val() : {};

        const documentsWithPopulatedChild = await PopulateUserData(documents);

        // Process documents
        const paginatedDocuments = _array(documentsWithPopulatedChild).slice(page * pageSize, (page + 1) * pageSize);

        return { data: paginatedDocuments, totalRecords }; // Return both documents and count
    } catch (error) {
        console.error('Error fetching documents and count:', error);
        throw error; // Re-throw the error for handling in the calling function
    }
}

// method to get v2 validations
const fetchV2Validations = async (page = 1, pageSize = 50) => {
    const dataRef = ref(database, 'documents'); // Reference to the 'documents' path
    // Create a query for fetching documents
    const documentsQuery = query(
        dataRef,
        orderByChild('validation/v1'), // Filter by 'validation/v1'
        equalTo(true), // Only include documents where 'validation/v1' is false
        // startAt(page), // Starting point for pagination
        limitToFirst(pageSize * (page + 1)) // Limit to page size
    );

    // Function to get document count
    const getCount = async () => {
        const snapshot = await get(query(
            dataRef,
            orderByChild('validation/v1'), // Filter by 'validation/v1'
            equalTo(true), // Only include documents where 'validation/v1' is false
        ));

        return snapshot.exists() ?
            Object.entries(snapshot.val()).filter(([key, value]) => value.status !== 'validated').length
            : 0;
    };

    try {
        // Execute both queries concurrently
        const [documentsSnapshot, totalRecords] = await Promise.all([
            get(documentsQuery),
            getCount()
        ]);

        // Process documents
        const documents = documentsSnapshot.exists() ? documentsSnapshot.val() : [];

        const filteredDocuments = Object.keys(documents).reduce((result, key) => {
            const post = documents[key];
            if (post.status !== "validated") {
                result[key] = post; // Keep the object structure
            }
            return result;
        }, {});
        
        const documentsWithPopulatedChild = await PopulateUserData(filteredDocuments);

        const paginatedDocuments = _array(documentsWithPopulatedChild).slice(page * pageSize, (page + 1) * pageSize);

        return { data: paginatedDocuments, totalRecords }; // Return both documents and count
    } catch (error) {
        console.error('Error fetching documents and count:', error);
        throw error; // Re-throw the error for handling in the calling function
    }
}

// Method to fetch Validated document
const fetchValidatedDocuments = async (page = 1, pageSize = 50) => {
    
    const dataRef = ref(database, 'documents'); // Reference to the 'documents' path
    // Create a query for fetching documents
    const documentsQuery = query(
        dataRef,
        orderByChild('status'), // Filter by 'status'
        equalTo('validated'), // Only include documents where 'status' is 'validated'
        // startAt(page), // Starting point for pagination
        limitToFirst(pageSize * (page + 1)) // Limit to page size
    );

    // Function to get document count
    const getCount = async () => {
        const snapshot = await get(query(
            dataRef,
            orderByChild('status'), // Filter by 'status'
            equalTo('validated'), // Only include documents where 'status' is 'validated'
        ));
        
        return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    };

    try {
        // Execute both queries concurrently
        const [documentsSnapshot, totalRecords] = await Promise.all([
            get(documentsQuery),
            getCount()
        ]);

        // Process documents
        const documents = documentsSnapshot.exists() ? documentsSnapshot.val() : [];

        const paginatedDocuments = _array(documents).slice(page * pageSize, (page + 1) * pageSize);

        return { data: paginatedDocuments, totalRecords }; // Return both documents and count
    } catch (error) {
        console.error('Error fetching documents and count:', error);
        throw error; // Re-throw the error for handling in the calling function
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
const saveValidation = async (documentId, data) => {

    const documentRef = ref(database, `documents/${documentId}`);

    // update document by adding saved json

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
const validateDocument = async (documentId, data) => {
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

const getDocumentValidation = async (documentId) => {
    const documentRef = ref(database, `documents/${documentId}`);

    const snapshot = await get(documentRef);

    return snapshot.exists() ? snapshot.val() : null

}

const downloadXML = async (json) => {
    const response = await fetch(`${API_BASE_URL}/get-xml`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token()}`,
        },
        body: JSON.stringify({ json })
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
        body: JSON.stringify({ documentId, ...data })
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
        body: JSON.stringify({ documentId, ...data })
    });
    return response.json();
}


const unlockFile = async (documentId) => {
    
    const documentRef = ref(database, `documents/${documentId}`);
    
    try {
        await update(documentRef, { isLocked: false, lockedBy: '' });
        console.log(`Document ${documentId} has been unlocked`);
    } catch (error) {
        console.error("Error updating status:", error);
    }

}
const lockFile = async (documentId, userId) => {
    const documentRef = ref(database, `documents/${documentId}`);
    
    try {
        await update(documentRef, { isLocked: true, lockedBy: userId });
        console.log(`Document ${documentId} has locked by ${userId}`);
    } catch (error) {
        console.error("Error updating status:", error);
    }
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

    const dataRef = ref(database, 'documents'); // Reference to the 'documents' path
    const countRef = ref(database, 'documents'); // Reference to count documents

    // Calculate the starting point for pagination
    const startingPoint = page; // Starting point for pagination

    // Create a query for paginated documents
    const documentsQuery = query(
        dataRef,
        orderByChild('createdAt'), // Replace with the field you want to order by
        startAt(startingPoint),
        limitToFirst(pageSize)
    );

    // Function to get document count
    const getCount = async () => {
        const snapshot = await get(countRef);
        return snapshot.exists() ? Object.keys(snapshot.val()).length : 0;
    };

    try {
        // Execute both queries concurrently
        const [documentsSnapshot, totalRecords] = await Promise.all([
            get(documentsQuery),
            getCount()
        ]);

        // Process documents
        const documents = documentsSnapshot.exists() ? documentsSnapshot.val() : null;

        return { data: _array(documents).reverse(), totalRecords }; // Return both documents and count
    } catch (error) {
        console.error('Error fetching documents and count:', error);
        throw error; // Re-throw the error for handling in the calling function
    }
};

// Transform the object into an array
const _array = (data) => Object.entries(data).map(([key, value]) => ({
    uid: key, // Add the key as uid
    id: key, // Add the key as uid
    ...value, // Spread the rest of the object properties
}));


// Export des fonctions du service
const fileService = {
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
    fetchValidatedDocuments,
    returnDocument,
    rejectDocument,
    fetchDocuments,
    API_BASE_URL
};


export default fileService;
