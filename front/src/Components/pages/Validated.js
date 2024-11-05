import { useEffect, useState } from "react";
import fileService from "../services/fileService";
import ValidatedTable from "../others/tables/ValidatedTable";
import useSocketEvent from "../../hooks/useSocketEvent";
import useDataGridSettings from "../../hooks/useDatagridSettings";

const Validated = () => {

    const [documents, setDocuments] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [page, setPage] = useState(1); // MUI DataGrid utilise l'index de page
    const [totalPages, setTotalPages] = useState(0);
    const [totalRecords, setTotalRecords] = useState(0);
    
    const {
        pageSize, // Nombre d'enregistrements par page
        setPageSize,
    } = useDataGridSettings('validated-datagrid-settings', {
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
        if (document.validation.v1 && document.validation.v2 && document.status === 'validated') {
            setDocuments(prev => [...prev, document]);
        }
        
    });
        
    useEffect(()=>{

        setLoading(true);
        fileService.fetchValidatedDocuments(page, pageSize)
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
            <ValidatedTable
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

export default Validated;