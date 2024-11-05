import { useEffect, useState } from "react";
import fileService from "../services/fileService";
import AllDocumentTable from "../others/tables/AllDocumentTable";
import useSocketEvent from "../../hooks/useSocketEvent";
import useDataGridSettings from "../../hooks/useDatagridSettings";

const AllDocument = () => {

  const [documents, setDocuments] = useState([]);
  const [isLoading, setLoading] = useState(true);
  const [page, setPage] = useState(1); // MUI DataGrid utilise l'index de page
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
    console.log('data:', data)
    setDocuments(prev => prev.map(doc =>
      doc._id === id ? { ...doc, ...data } : doc));
  });
  
  // on document incoming
  useSocketEvent('document-incoming', (document) => {
    // add if not on the list yet
    if (!documents.find(doc => doc._id === document._id))
      setDocuments(prev => [document, ...prev]);
  });

  useEffect(() => {
    
    setLoading(true);
    fileService.fetchDocuments(page, pageSize)
      .then(res => {
        const { data, totalRecords, totalPages, currentPage } = res;
        setDocuments(data);
        setTotalPages(totalPages);
        setTotalRecords(totalRecords);
      })
      .catch(error=>console.error("Erreur lors de la récupération des fichiers:", error))
      .finally(() => setLoading(false))

    return () =>{
    }
  }, [page, pageSize]);
  

  return (

    <div className="flex flex-col h-full w-full flex-grow">
      <AllDocumentTable
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

export default AllDocument;