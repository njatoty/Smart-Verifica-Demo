const Document = require("../Models/File")
const { Builder } = require('xml2js');
const path = require('path');
const fs = require('fs');
const xml2js = require('xml2js');
const axios = require('axios')

// method to get validation by state
exports.getValidations = async (req, res) => {
    try {

        const { state } = req.params;

        const validations = await Validation.find({
            ...(state && { num: state })
        }).populate('document');

        res.json(validations);
    } catch (err) {
        console.log(err);
        res.status(503).json([]);
    }
}

// Function to check if document is treated (v1 or v2)
exports.getValidationByDocumentId = async (req, res) => {
    try {
        const { documentId } = req.params; // document id
        const validation = await Validation.findOne({ document: documentId })
            .populate('document')
            // .populate('lockedBy')
            // .populate('validatedBy.v1')
            // .populate('validatedBy.v2')
            // .populate('returnedBy')

        res.json(validation);

    } catch (error) {
        console.error(error);
        res.json(null);
    }
}

// get validation by document id and validation (v1 or v2)
exports.getValidationByDocumentIdAndValidation = async (req, res) => {
    try {
        const { documentId, validation } = req.params; // document id
        var document = await Document.findById(documentId)
        .populate('lockedBy')
        .populate('validatedBy.v1')
        .populate('validatedBy.v2')
        .populate('returnedBy');

        
        if (document.dataXml === '{}') {
            try {
                const xmlJSON = await convertXmlToJson(document.xmlLink ?? './uploads/' + document.xmlName);
                document = await Document.findByIdAndUpdate(documentId, {
                    dataXml: JSON.stringify(xmlJSON)
                }, { new: true })
                .populate('lockedBy')
                .populate('validatedBy.v1')
                .populate('validatedBy.v2')
                .populate('returnedBy');

            } catch (error) {
                console.log(error)
                console.log('Error: cannot add json')
            }
        }

        // get pdf base64
        // const pdfBase64 = await convertPDFToBase64(document.pdfLink);

        // document.pdfLink = "data:application/pdf;base64," + pdfBase64;

        res.json(document);

    } catch (error) {
        console.error(error);
        res.json(null);
    }
}


// method to save document
exports.saveValidationDocument = async (req, res) => {
    try {

        const { documentId } = req.params; // document id
        const { json_data, versionNumber, vertices={} } = req.body;

        if (json_data) {

            const existingDocument = await Document.findOne({
                _id: documentId,
                'versions.versionNumber': versionNumber
            });

            let updatedDocument;

            if (existingDocument) {
                // Version exists, so update it
                updatedDocument = await Document.findOneAndUpdate(
                    { _id: documentId, 'versions.versionNumber': versionNumber },
                    {
                        $set: {
                            'versions.$.dataJson': json_data, 
                            lockedBy: req.user._id,
                            dataXml: JSON.stringify(json_data),
                            vertices: JSON.stringify(vertices)
                        }
                    }, // Update existing version's dataJson
                    { new: true } // Return the updated document
                );
            } else {
                // Version does not exist, so push a new version to the array
                updatedDocument = await Document.findOneAndUpdate(
                    { _id: documentId },
                    {
                        $push: {
                            versions: { versionNumber, dataJson: json_data } // Add new version
                        },
                        lockedBy: req.user._id,
                        dataXml: JSON.stringify(json_data),
                        vertices: JSON.stringify(vertices)
                    },
                    { new: true } // Return the updated document
                );
            }

            res.json({
                ok: true,
                data: updatedDocument
            });

        } else {
            res.json({
                ok: false,
                message: 'No json_data'
            });
        }
    } catch (error) {
        console.log(error)
        res.json({
            ok: false,
            message: 'Error'
        });
    }

}


// validate validation
exports.validateDocument = async (req, res) => {
    try {
        const { documentId } = req.params; // document id
        const { json_data, versionNumber, vertices={} } = req.body;

        // update document
        var validated = await Document.findOneAndUpdate(
            { _id: documentId, 'versions.versionNumber': versionNumber },
            {
                $set: {
                    'versions.$.dataJson': json_data, // Updates the matched version's dataJson
                    [`validation.${versionNumber}`]: true, // Sets the validation field for the version
                    [`validatedBy.${versionNumber}`]: req.user._id, // Sets the validation field for user
                    status: versionNumber === 'v2' ? 'validated' : 'progress',
                    dataXml: JSON.stringify(json_data),
                    vertices: JSON.stringify(vertices),
                    isLocked: false,
                    lockedBy: null
                }
            },
            { new: true } // Returns the updated document
        ).populate('lockedBy')
        .populate('validatedBy.v1')
        .populate('validatedBy.v2')
        .populate('returnedBy');

        if (!validated) {
            validated = await Document.findOneAndUpdate(
                { _id: documentId },
                {
                    $push: {
                        versions: {
                            versionNumber,
                            dataJson: json_data // Insert the new version object
                        }
                    },
                    $set: {
                        [`validation.${versionNumber}`]: true,
                        [`validatedBy.${versionNumber}`]: req.user._id, // Sets the validation field for user
                        status: versionNumber === 'v2' ? 'validated' : 'progress',
                        dataXml: JSON.stringify(json_data),
                        vertices: JSON.stringify(vertices),
                        lockedBy: null,
                        isLocked: false
                    }
                },
                { new: true, upsert: true }
            ).populate('lockedBy')
            .populate('validatedBy.v1')
            .populate('validatedBy.v2')
            .populate('returnedBy');
        }

        
        // send socket
        if (req.io) {
            req.io.emit('document-changed', {...validated._doc});
        }

        res.json({
            ok: true,
            data: validated
        });

    } catch (error) {
        console.error(error);
        res.json({
            ok: false
        });
    }
}

// method to return document
exports.returnDocument = async (req, res) => {
    try {

        const { documentId } = req.params;
        const { comment = "" } = req.body;

        const updatedDocument = await Document.findByIdAndUpdate(
            documentId,
            {
                $set: {
                    "validation.v1": false,
                    "validation.v2": false,
                    status: 'returned',
                    returnedBy: req.user._id,
                    lockedBy: null,
                    isLocked: false,
                    comment: comment,
                },
            },
            { new: true } // Returns the updated document
        ).populate('lockedBy')
        .populate('validatedBy.v1')
        .populate('validatedBy.v2')
        .populate('returnedBy');

        if (req.io) {
            req.io.emit('document-changed', updatedDocument)
        }

        res.json({
            ok: true,
            data: updatedDocument
        })
    } catch (error) {
        console.log(error)
        res.json({
            ok: false,
            data: null
        })
    }

}

// method to reject document
exports.rejectDocument = async (req, res) => {
    try {

        const { documentId } = req.params;
        const { reason = "", json_data, validation } = req.body;

        const updatedDocument = await Document.findByIdAndUpdate(
            documentId,
            {
                $set: {
                    status: validation === 'v1' ? 'temporarily-rejected' : 'rejected',
                    returnedBy: req.user._id,
                    lockedBy: null,
                    isLocked: false,
                    [`validation.${validation}`]: true,
                    [`validatedBy.${validation}`]: req.user._id,
                    temporarilyReason: validation === 'v1' ? reason : '',
                    reason: validation !== 'v1' ? reason : '',
                    ...(json_data) && { dataXml: json_data }
                },
            },
            { new: true } // Returns the updated document
        ).populate('lockedBy')
        .populate('validatedBy.v1')
        .populate('validatedBy.v2')
        .populate('returnedBy');

        if (req.io) {
            req.io.emit('document-changed', updatedDocument)
        }

        res.json({
            ok: true,
            data: updatedDocument
        })
    } catch (error) {
        console.log(error)
        res.json({
            ok: false,
            data: null
        })
    }

}
const removeKeysEndingWithId = (data) => {
    if (Array.isArray(data)) {
        // Process each item in the array
        return data.map(item => removeKeysEndingWithId(item));
    } else if (typeof data === 'object' && data !== null) {
        // Process each key-value pair in the object
        return Object.fromEntries(
            Object.entries(data)
            .filter(([key]) => !key.endsWith('Id') && key !== 'key' && key !== 'id') // Exclude keys ending with "Id", "key", and "id"
                .map(([key, value]) => [key, removeKeysEndingWithId(value)]) // Recursively process values
        );
    }
    return data; // Return primitive values as-is
};

exports.createXMLFile = async (req, res) => {
    try {
        const { json } = req.body;
        // Create a new Builder instance
        const builder = new Builder();
        // Convert JSON to XML
        const xml = builder.buildObject(removeKeysEndingWithId(json));

        // Define the file path where XML will be written
        const filePath = path.join(__dirname, 'output.xml');

        // Write the XML data to the file
        fs.writeFile(filePath, xml, (err) => {
            if (err) {
                return res.status(500).send("Error generating XML file.");
            }

            // Send the file for download
            res.download(filePath, 'data.xml', (err) => {
                if (err) {
                    return res.status(500).send("Error downloading the file.");
                }

                // Optionally, delete the file after download
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Error deleting the file after download:", err);
                });
            });
        });

    } catch (error) {
        console.log(error)
        res.send(null);
    }
}

exports.deleteDocuments = async (req, res) => {
    try {
        const { documents } = req.body;
        // find documents
        const docs = await Document.deleteMany({ _id: { $in: documents }});
        res.status(200).json({ ok: true });
    } catch (err) {
        console.log(err)
        res.status(500).json({ ok: false });
    }
}

// Function to read and convert XML to JSON using Promises
async function convertXmlToJson(fileUrl) {
    
    // Fetch the XML content from the URL
    const response = await axios.get(fileUrl, { responseType: 'text' });
    const data = response.data;

    return new Promise((resolve, reject) => {
        // Parse the XML data
        xml2js.parseString(data, { explicitArray: false }, (err, result) => {
            if (err) {
                return reject('Error parsing XML to JSON: ' + err);
            }
            // Resolve the parsed JSON result
            resolve(result);
        });
    });
}

// Function to read and convert XML to JSON using Promises
async function convertPDFToBase64(fileUrl) {
    
    // Fetch the XML content from the URL
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });

    // Convert the PDF data to Base64
    const base64String = Buffer.from(response.data, 'binary').toString('base64');

    return base64String;
}