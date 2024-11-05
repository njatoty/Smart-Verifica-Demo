import React, { useEffect, useState } from 'react';
import fileService from '../services/fileService';
import PrevalidationTable from '../others/tables/PrevalidationTable';
import useSocketEvent from '../../hooks/useSocketEvent';
import useDataGridSettings from '../../hooks/useDatagridSettings';

function PreValidation() {
  
  const [documents, setDocuments] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // MUI DataGrid utilise l'index de page
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  
  const {
    pageSize, // Nombre d'enregistrements par page
    setPageSize,
  } = useDataGridSettings('prevalidation-datagrid-settings', {
    pageSize: 10,
  });
  
  // listen event
  useSocketEvent('document-lock/unlock', ({ id, ...data }) => {
    setDocuments(prev => prev.map(doc =>
      doc._id === id ? { ...doc, ...data } : doc));
  });
  
  // on document changed
  useSocketEvent('document-changed', (document) => {
    // PREVALIDATION: move document to v2 if valdation 1 value is true (validation.v1 === true)
    if (document.validation.v1 && !document.validation.v2) {
      const docs = documents.filter(doc => doc._id !== document._id)
      setDocuments(docs);
    }
  });

  // on document incoming
  useSocketEvent('document-incoming', (document) => {
    // add if not on the list yet
    if (!documents.find(doc => doc._id === document._id))
      setDocuments(prev => [document, ...prev]);
  });


  useEffect(()=>{

    setLoading(true);
    fileService.fetchPrevalidations(page, pageSize)
      .then(res => {
        const { data, totalRecords, totalPages } = res;
        setDocuments(data);
        setTotalPages(totalPages);
        setTotalRecords(totalRecords);
      })
      .catch(error=>console.error("Erreur lors de la récupération des fichiers:", error))
      .finally(() => setLoading(false));

  }, [page, pageSize]);

  return (
    <div className="flex flex-col items-start h-full w-full flex-grow">
        <PrevalidationTable
          version='v1' 
          data={documents}
          loading={isLoading}
          page={page}
          pageSize={pageSize}
          totalRecords={totalRecords}
          onPaginationChange={({ page, pageSize}) => {
            setPage(page);
            setPageSize(pageSize);
          }}
        />
    </div>
  );
}

export default PreValidation;