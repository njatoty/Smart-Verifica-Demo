import { useEffect, useState } from "react";
import fileService from "../services/fileService";
import ReturnedTable from "../others/tables/ReturnedTable";
import useSocketEvent from "../../hooks/useSocketEvent";

const Retourne = () => {

  const [documents, setDocuments] = useState([]);
  const [isLoading, setLoading] = useState(true);

  
  // listen event lock and unlock
  useSocketEvent('document-lock/unlock', ({ id, ...data }) => {
    setDocuments(prev => prev.map(doc =>
      doc._id === id ? { ...doc, ...data } : doc));
  });
  
  // on document changed
  useSocketEvent('document-changed', (document) => {

    // RETURNED FROM VALIDATION2: add new document
    if (document.status === "returned" && !document.validation.v1 && !document.validation.v2) {
      setDocuments(prev => [...prev, document]);
    }

    // VALIDATION SUBMITED FROM RETURNED: remove document 
    if (document.status !== "returned" && document.validation.v1) {
      setDocuments(prev => prev.filter(doc => doc._id !== document._id));
    }
    
  });

  useEffect(() => {
    
    setLoading(true);
    fileService.fetchReturnedValidations()
      .then(data => {
        setDocuments(data);
      } )
      .catch(error=>console.error("Erreur lors de la récupération des fichiers:", error))
      .finally(() => setLoading(false))

  }, []);
  

  return (

    <div className="flex flex-col items-start h-full w-full flex-grow">
      <div className='w-full overflow-x-auto h-full'>
        <ReturnedTable data={documents} version='v1' loading={isLoading}/>
      </div>
    </div>
  );
};

export default Retourne;