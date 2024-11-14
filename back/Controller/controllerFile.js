
const File = require('../Models/File')
const xml2js = require('xml2js');
const fs = require('fs')
const ExcelJS = require('exceljs');

const uploadFile = async (req, res) => {
    if (!req.files) {
        return res.status(400).json({ message: 'Aucun fichier téléchargé' });
    }
    try {
        // Enregistrer chaque fichier dans la base de données
        const filePromises = req.files.filter(f => f.originalname.endsWith('.pdf')).map(file => {
            const newFile = new File({
                name: file.originalname,
                uploadAt: new Date(),
            });
            return newFile.save();
        });

        // Attendre que tous les fichiers soient enregistrés
        const savedFiles = await Promise.all(filePromises);

        res.status(200).json({
            message: 'Fichiers téléchargés et enregistrés avec succès',
            files: savedFiles,
        });
    } catch (error) {
        console.error('Erreur lors de l\'enregistrement des fichiers:', error);
        res.status(500).json({ message: 'Erreur du serveur' });
    }

}

// Function to read and convert XML to JSON using Promises
function convertXmlToJson(filePath) {
    return new Promise((resolve, reject) => {
        // Read the XML file
        fs.readFile(filePath, 'utf8', (err, data) => {

            if (err) {
                return reject('Error reading XML file: ' + err);
            }

            // Parse the XML data
            xml2js.parseString(data, { explicitArray: false }, (err, result) => {
                if (err) {
                    return reject('Error parsing XML to JSON: ' + err);
                }
                // Resolve the parsed JSON result
                resolve(result);
            });
        });
    });
}

const getFileById = async (req, res) => {
    try {
        const id = req.params.id
        const file = await File.findById(id);

        const xmlJSON = await convertXmlToJson(file.xmlLink ?? './uploads/' + file.xmlName);
        res.status(200).json({ ...file._doc, xmlJSON });
    } catch (error) {
        console.error("Erreur lors de la récupération des fichiers:", error);
        res.status(500).json({ message: 'Erreur lors de la récupération des fichiers' })
    }
}

const getFiles = async (req, res) => {
    try {
        const files = await File.find()
        .populate('lockedBy')
        .populate('validatedBy.v1')
        .populate('validatedBy.v2')
        .populate('returnedBy')
        .sort({ _id: -1 });
        //test socket

        res.status(200).json(files)
    } catch (error) {
        console.error("Erreur lors de la récupération des fichiers:", error);
        res.status(500).json({ message: 'Erreur lors de la récupération des fichiers' })
    }
}

const unlock_file = async (req, res) => {
    try {
        const id = req.params.id;
        const file = await File.findByIdAndUpdate(id, {
            isLocked: false,
            lockedBy: null
        }, { new: true })
        .populate('lockedBy')
        .populate('validatedBy.v1')
        .populate('validatedBy.v2')
        .populate('returnedBy');

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        if (!req.io) {
            return res.status(500).send('Socket.io instance is not available');
        }

        // Émettre un événement via Socket.io pour notifier que le fichier est déverrouillé
        req.io.emit('document-lock/unlock', { id, ...file._doc });

        console.log(file)

        res.status(200).json({ message: 'File unlocked successfully', file });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du fichier:", error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du fichier' });
    }
};

const lock_file = async (req, res) => {
    try {
        const id = req.params.id;
        const file = await File.findByIdAndUpdate(id, {
            isLocked: true,
            lockedBy: req.user._id
        }, { new: true })
        .populate('lockedBy')
        .populate('validatedBy.v1')
        .populate('validatedBy.v2')
        .populate('returnedBy');

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        if (!req.io) {
            return res.status(500).send('Socket.io instance is not available');
        }

        console.log('called lock file')

        // Émettre un événement via Socket.io pour notifier que le fichier est déverrouillé
        req.io.emit('document-lock/unlock', { id, ...file._doc });

        res.status(200).json({ message: 'File unlocked successfully', file });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du fichier:", error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du fichier' });
    }
};

// Helper function for fetching validation documents with pagination
const fetchValidationDocuments = async (filters, page = 1, limit = 50) => {
    const skip = (page - 1) * limit;
    const records = await File.find(filters)
        .populate('lockedBy')
        .populate('validatedBy.v1')
        .populate('validatedBy.v2')
        .populate('returnedBy')
        .skip(skip)
        .limit(limit)
        .sort({ _id: -1 });

    const totalRecords = await File.countDocuments(filters);
    const totalPages = Math.ceil(totalRecords / limit);

    return { data: records, totalRecords, totalPages, currentPage: page };
};

// Method to get prevalidation document: (V1)
const getPrevalidations = async (req, res) => {
    
    const { page = 1, limit = 50 } = req.query;
    
    try {
        const filters = {
            'validation.v1': false, 
            'validation.v2': false, 
            status: { $in: ['progress'] },
        };

        const result = await fetchValidationDocuments(filters, parseInt(page), parseInt(limit));
        res.status(200).json(result);

    } catch (error) {
        console.error("Erreur lors de la récupération des fichiers:", error);
        res.status(500).json({ message: 'Erreur lors de la récupération des fichiers prevalidation' })
    }
}

// Method to get prevalidation document: (V1)
const getV2Validations = async (req, res) => {
    
    const { page = 1, limit = 50 } = req.query;

    try {
        
        const filters = {
            'validation.v2': false,
            'validation.v1': true,
            status: { $nin: ['rejected']}
        };

        const result = await fetchValidationDocuments(filters, parseInt(page), parseInt(limit));
        res.status(200).json(result);

    } catch (error) {
        console.error("Erreur lors de la récupération des fichiers:", error);
        res.status(500).json({ message: 'Erreur lors de la récupération des fichiers v2' })
    }
}

// get returned validations
const getReturnedValidations = async (req, res) => {
    
    const { page = 1, limit = 50 } = req.query;

    try {
        
        const filters = {
            'validation.v2': false,
            'validation.v1': false,
            status: 'returned'
        };
        
        const result = await fetchValidationDocuments(filters, parseInt(page), parseInt(limit));
        res.status(200).json(result);

    } catch (error) {
        console.error("Erreur lors de la récupération des fichiers:", error);
        res.status(500).json({ message: 'Erreur lors de la récupération des fichiers v2' })
    }
}

// get rejected validations
const getRejectedValidations = async (req, res) => {
    
    const { page = 1, limit = 50 } = req.query;

    try {
        
        const filters = {
            status: 'rejected'
        };
        
        const result = await fetchValidationDocuments(filters, parseInt(page), parseInt(limit));
        res.status(200).json(result);

    } catch (error) {
        console.error("Erreur lors de la récupération des fichiers:", error);
        res.status(500).json({ message: 'Erreur lors de la récupération des fichiers v2' })
    }
}

// get validated validations
const getValidatedValidations = async (req, res) => {
    
    const { page = 1, limit = 50 } = req.query;

    try {
        
        const filters = {
            'validation.v2': true,
            'validation.v1': true,
            status: 'validated'
        };

        const result = await fetchValidationDocuments(filters, parseInt(page), parseInt(limit));
        res.status(200).json(result);

    } catch (error) {
        console.error("Erreur lors de la récupération des fichiers:", error);
        res.status(500).json({ message: 'Erreur lors de la récupération des fichiers v2' })
    }
}

const generateExcel = async (req, res) => {
    
    // Créer un nouveau classeur
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Feuille1');

    // Définir les en-têtes des colonnes
    worksheet.columns = [
        { header: 'Id', 
            key: 'id', 
            width: 15, height : 17},
        { header: 'Nom', key: 'nom', width: 60 , height : 17, style: { font: { bold: true,}, alignment: { horizontal: 'center' } } },
        { header: 'Status', key: 'status', width: 30, height : 17, style: {  alignment: { horizontal: 'center' } } },
        { header: 'V1', key: 'v1', width: 30, height : 17 },
        { header: 'V2', key: 'v2', width: 30, height : 17 },
    ];

    var allFile = await File.find()
            .populate('validatedBy.v1', 'name firstname') // Peupler avec les champs `name` et `email` de l'utilisateur v1
            .populate('validatedBy.v2', 'name firstname')
    
    for (let i = 0; i < allFile.length; i++) {
        const element = allFile[i];

        var v1 = (element.v1?.name ?? "") + " " + (element.v1?.firstname ?? "");
        var v2 = (element.v2?.name ?? "") + " " + (element.v2?.firstname ?? "");
        

        console.log("allFile", v1, v2);
        worksheet.addRow({id: parseInt(element._id), nom: element.name, status: element.status, });
        
    }
    // { bold: true, italic: true, color: { argb: 'FFFFA500' } }; // Cellule 'Nom' de la 2ème ligne
    // worksheet.getCell('A2').alignment = { horizontal: 'left' }; // Alignement de la cellule
    
    // Styliser la première ligne (les en-têtes)
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 16, color: { argb: 'FF0A1F28' } }; // Police en gras et jaune
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1DD1FD' }, // Fond bleu
    };

    headerRow.alignment = { horizontal: 'center' }; // Alignement centré
    headerRow.height = 20; // Hauteur de la ligne
    // Configurer l'en-tête de la réponse pour télécharger le fichier
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=fichier_excel.xlsx');

    // Écrire le fichier dans un flux (stream) directement pour éviter de l'enregistrer sur le disque
    await workbook.xlsx.write(res);
    res.end();

    console.log('Fichier Excel généré et prêt à être téléchargé !');
}


const getDocumentCounts = async (req, res) => {
    try {
        
        const results = await File.aggregate([
            {
                $facet: {
                    prevalidationCount: [
                        { 
                            $match: { 
                                "validation.v1": false,
                                "validation.v2": false,
                                status: 'progress',
                            }
                        },
                        { $count: "count" }
                    ],
                    returnedCount: [
                        { 
                            $match: { 
                                status: 'returned'
                            }
                        },
                        { $count: "count" }
                    ],
                    validationV2Count: [
                        { 
                            $match: { 
                                "validation.v1": true,
                                "validation.v2": false,
                                status: {
                                    $in: ['progress', 'temporarily-rejected']
                                },
                            }
                        },
                        { $count: "count" }
                    ],
                    validatedCount: [
                        { 
                            $match: { 
                                "validation.v1": true,
                                "validation.v2": true,
                                status: 'validated',
                            }
                        },
                        { $count: "count" }
                    ],
                    
                    rejectedCount: [
                        { 
                            $match: {
                                status: 'rejected',
                            }
                        },
                        { $count: "count" }
                    ]
                }
            }
        ]);
        res.json(results[0]);
    } catch (error) {
        console.log(error);
        res.json(null)
    }

}

const insertDocumentFromAI = async (req, res) => {

    try {
        
        const { files } = req.body;

        if (!files.length)
            return res.status(200).json({
                message: 'The array of files is empty.'
            }); 

        for (let i = 0; i < files.length; i++) {
            const { pdfName, xmlName, pdfLink, xmlLink, verticesLink } = files[i];
            // insert file
            const createdDocument = await File.create({
                pdfName: pdfName,
                xmlName: xmlName,
                xmlLink,
                pdfLink,
                verticesLink
            });
            
            // get document with populated fields
            const newDocument = await File.findById(createdDocument._id)
                .populate('lockedBy')
                .populate('validatedBy.v1')
                .populate('validatedBy.v2')
                .populate('returnedBy');
    
            
            if (req.io) req.io.emit('document-incoming', newDocument);
            
        }
        
        res.status(200).json({
            message: 'Files uploaded successfully!',
            files
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Failed to uploade files.'
        });
    }

}

const uploadDocuments = async (req, res) => {
    console.log('uploading document...')
    try {
        const { pdfFile, xmlFile } = req.files;
        if (pdfFile && xmlFile) {

            console.log({
                pdf: pdfFile[0].filename,
                xml: xmlFile[0].filename,})

            // insert file
            const createdDocument = await File.create({
                name: pdfFile[0].filename,
                xml: xmlFile[0].filename,
            });

            // get document with populated fields
            const newDocument = await File.findById(createdDocument._id)
                .populate('lockedBy')
                .populate('validatedBy.v1')
                .populate('validatedBy.v2')
                .populate('returnedBy');

            // send socket
            if (req.io) req.io.emit('document-incoming', newDocument);

            res.status(200).json({
                message: 'Files uploaded successfully!',
                files: {
                    pdf: pdfFile[0].path,
                    xml: xmlFile[0].path,
                },
            });
        } else {
            res.status(400).json({ message: 'Please upload both PDF and XML files.' });
        }
    } catch(error) {
        res.status(500).json({
            message: 'Failed to uploade files.'
        })
    }
}

const fetchLimitedDocuments = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Par défaut, 50 enregistrements par page

    try {
        const records = await File.find()
            .skip((page - 1) * limit) // Sauter les enregistrements précédents
            .limit(limit) // Limiter le nombre d'enregistrements
            .populate('lockedBy')
            .populate('validatedBy.v1')
            .populate('validatedBy.v2')
            .populate('returnedBy')
            .sort({ _id: -1 });

        const totalRecords = await File.countDocuments(); // Total des enregistrements
        const totalPages = Math.ceil(totalRecords / limit);

        res.json({
            data: records,
            totalRecords,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Erreur lors de la récupération des enregistrements" });
    }
}

const checkAvailableDocument = async (req, res) => {
    try {

        // get available document, which is non locked for targeted validation number
        const { validation } = req.params;
        var doc = null;

        if (validation === 'v1') {
            doc = await File.findOne({
                isLocked: false,
                "validation.v1": false,
                "validation.v2": false,
                status: 'progress',
            });
        } else if (validation === 'v2') {
            doc = await File.findOne({
                isLocked: false,
                "validation.v1": true,
                "validation.v2": false,
                status: 'progress',
            });
        }

        res.send(doc);

    } catch(error) {
        res.send(null);
    }
}

module.exports = {uploadFile, getFileById, getFiles, unlock_file, lock_file, getPrevalidations,
    uploadDocuments,
    getV2Validations, getReturnedValidations, getValidatedValidations , generateExcel, getDocumentCounts,
    fetchLimitedDocuments,
    checkAvailableDocument,
    insertDocumentFromAI,
    getRejectedValidations
}
