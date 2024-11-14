const express = require("express")
const multer = require("multer")
const router = express.Router()
const {uploadFile, getFiles, getFileById, unlock_file, lock_file, getPrevalidations, getV2Validations, 
  getReturnedValidations, getValidatedValidations, generateExcel, uploadDocuments,
  getDocumentCounts,
  getRejectedValidations,
  fetchLimitedDocuments,
  checkAvailableDocument,
  insertDocumentFromAI} = require("../Controller/controllerFile")
const {getValidationByDocumentId, saveValidationDocument, getValidations, validateDocument, getValidationByDocumentIdAndValidation, createXMLFile, returnDocument, rejectDocument} = require("../Controller/controllerValidation")
const {login, signup, forgotPassword, resetPassword} = require("../Controller/controllerAuthentification")
const {allUser, updateUser, deleteUser} = require("../Controller/ControllerUser")

// Configurer l'emplacement de stockage et les fichiers acceptés
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /pdf|xml|png|jpg|jpeg|/i;
  const mimetype = filetypes.test(file.mimetype);
  // const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype ) {
    return cb(null, true);
  } else {
    cb('Erreur : Seuls les fichiers PDF et XML sont acceptés');
  }
};

// Initialiser multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});
// const upload = multer({ 
//   storage: storage,
// });
  


// Route POST pour l'upload des fichiers
// router.route('/upload').post(upload.single("file"), uploadFile);
router.route('/upload').post(upload.array('files', 10), uploadFile);
router.route('/upload-documents').post(upload.fields([{ name: 'pdfFile' }, { name: 'xmlFile' }]), uploadDocuments);
router.route('/insert-documents').post(insertDocumentFromAI);

router.get("/files", getFiles)
router.get("/documents", fetchLimitedDocuments)
router.get("/prevalidations", getPrevalidations)
router.get("/v2-validations", getV2Validations)
router.get("/returned-validations", getReturnedValidations)
router.get("/rejected-validations", getRejectedValidations)
router.get("/validated-validations", getValidatedValidations)
router.get("/document/:id", getFileById)
router.post("/unlockFile/:id", unlock_file)
router.post("/lockFile/:id", lock_file)
router.post("/next-doc/:validation", checkAvailableDocument)

// Validation routes
router.route('/validation/:documentId').get(getValidationByDocumentId)
      .post(saveValidationDocument) // create or update document
      .put(validateDocument); // update document
router.route('/validation/:documentId/:validation').get(getValidationByDocumentIdAndValidation)
router.route('/get-validations/:state?').get(getValidations)
router.route('/get-xml').post(createXMLFile)
router.route('/return-document/:documentId').post(returnDocument)
router.route('/reject-document/:documentId').post(rejectDocument)
router.route('/login').post(login)
router.route('/registerUser').post(signup)
router.route('/forgot-password').post(forgotPassword)
router.route('/reset-password/:token').post(resetPassword)
router.route('/deleteUser/:id').post(deleteUser)

router.route('/allUsers').get(allUser)
router.route('/updateUser').post(updateUser)

///:validation
router.route('/generateFile').get(generateExcel)

router.route('/document-counts').get(getDocumentCounts)

module.exports = router