import { useEffect, useState } from "react";
import fileService from "../services/fileService";
import Validation2Table from "../others/tables/Validation2Table";
import useSocketEvent from "../../hooks/useSocketEvent";
import useDataGridSettings from "../../hooks/useDatagridSettings";

const Validation = () => {

  const [documents, setDocuments] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [page, setPage] = useState(0); // MUI DataGrid utilise l'index de page
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  
  const {
    pageSize, // Nombre d'enregistrements par page
    setPageSize,
  } = useDataGridSettings('validation2-datagrid-settings', {
    pageSize: 10,
  });

  // listen event lock and unlock
  useSocketEvent('document-lock/unlock', ({ id, ...data }) => {
    setDocuments(prev => prev.map(doc =>
      doc._id === id ? { ...doc, ...data } : doc));
  });
  
  // on document changed
  useSocketEvent('document-changed', (document) => {


    // FROM PREVALIDATION: add new document
    if (document.validation.v1 && !document.validation.v2 && !(documents.find(doc => doc._id === document._id))) {
      setDocuments(prev => [...prev, document]);
    }

    // VALIDATION TO VALIDATED: remove document 
    if (document.validation.v1 && document.validation.v2) {
      setDocuments(prev => prev.filter(doc => doc._id !== document._id));
    }
    
  });
  
  useEffect(()=>{

    setLoading(true);
    fileService.fetchV2Validations(page, pageSize)
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
        <Validation2Table
          version='v2' 
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
};

export default Validation;