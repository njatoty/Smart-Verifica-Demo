import React, { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons'
import fileService from '../services/fileService';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

function useFileUpload() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const navigate = useNavigate(); 

  useEffect(()=>{
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
      navigate('/')
    }
  }, [])

  useEffect(()=>{
    fileService.fetchFiles()
      .then(data => setUploadedFiles(data) )
      .catch(error=>console.error("Erreur lors de la récupération des fichiers:", error))

  }, [])

  

  const handleDrop = useCallback(async (acceptedFiles) => {
    try {

      const pdfFiles = acceptedFiles.filter(file=>file.type === "application/pdf")

      if (pdfFiles.length > 0) {
        const files = await fileService.uploadFiles(acceptedFiles);
        console.log("file===", files);
        
        setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
    }
  }, []);

  return { uploadedFiles, handleDrop };
}

const Home = () => {
  const {t} = useTranslation()
  const { uploadedFiles, handleDrop } = useFileUpload(); // Utilisation du hook pour gérer l'upload

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/xml': ['.xml'],
    },
  });
  
  return (
    <div className="flex flex-col items-center">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-gray-400 h-64 w-full flex justify-center items-center text-center"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>{t("deposez-les-fichiers")}</p>
        ) : (
          <p>{t('glissez-et-deposez')}</p>
        )}
      </div>

      {/* Afficher les fichiers téléchargés dans un tableau */}
      {uploadedFiles.length > 0 && (
        <div>
        <table className='min-w-full border-collapse border border-gray-400'>
          <thead>
            <tr>
              <th className='border border-gray-300 px-4 py-2'></th>
              <th className='border border-gray-300 px-4 py-2'  >{t('nom-fichier')}</th>
            </tr>
          </thead>
            <tbody>
              {uploadedFiles.length === 0 ? (
                <tr>
                  <td className='border border-gray-300 px-4 py-2 text-center' colSpan="1">
                    {t('aucun-fichier')}
                  </td>
                </tr>
              ):(
              uploadedFiles.map((file, index) => (
                <tr key={index}>
                  <td className='border border-gray-300 px-4 py-2'>
                    <FontAwesomeIcon icon={faCheckSquare} />
                  </td>
                  <td className='border border-gray-300 px-4 py-2'>{file.name}</td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Home;
// const FileUploader = () => {
//   const [uploadedFiles, setUploadedFiles] = useState([]);

//   // const onDrop = useCallback((acceptedFiles) => {
//   //   const formData = new FormData();
//   //   acceptedFiles.forEach((file) => {
//   //     formData.append('files', file);
//   //   });

//   //   // Envoyer les fichiers au backend
//   //   axios.post('/upload', formData, {
//   //     headers: {
//   //       'Content-Type': 'multipart/form-data',
//   //     },
//   //   })
//   //   .then(response => {
//   //     // Mettre à jour les fichiers téléchargés après la réponse du serveur
//   //     setUploadedFiles((prevFiles) => [...prevFiles, ...response.data.files]);
//   //   })
//   //   .catch(error => {
//   //     console.error('Erreur lors du téléchargement:', error);
//   //   });
//   // }, []);

//   const { getRootProps, getInputProps } = useDropzone({
//     onDrop,
//     accept: {
//       'application/pdf': ['.pdf'],
//       'application/xml': ['.xml'],
//     },
//   });

//   return (
//     <div>
//       <div {...getRootProps({ className: 'dropzone' })}>
//         <input {...getInputProps()} />
//         <p>Glissez et déposez des fichiers PDF ou XML ici, ou cliquez pour sélectionner des fichiers</p>
//       </div>

//       {/* Afficher les fichiers téléchargés dans un tableau */}
//       {uploadedFiles.length > 0 && (
//         <div>
//           <h3>Fichiers téléchargés</h3>
//           <table border="1">
//             <thead>
//               <tr>
//                 <th>Nom du fichier</th>
//                 <th>Type</th>
//                 <th>Taille</th>
//               </tr>
//             </thead>
//             <tbody>
//               {uploadedFiles.map((file, index) => (
//                 <tr key={index}>
//                   <td>{file.originalname}</td>
//                   <td>{file.mimetype}</td>
//                   <td>{(file.size / 1024).toFixed(2)} KB</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FileUploader;
