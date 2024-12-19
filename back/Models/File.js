const mongoose = require("mongoose")

const versionSchema = new mongoose.Schema({
    versionNumber: {
        type: String,
        required: true, // e.g., 'v1', 'v2'
    },
    dataJson: {
        type: Object,
        required: true,
    }
}, { _id: false }); // Prevent creating an _id for this sub-document

const fileSchema = new mongoose.Schema({
    isLocked: {
        type: Boolean,
        default: false
    },
    pdfName: {
        type: String, // pdf link
        default: ''
    },
    pdfLink: {
        type: String, // pdf link
        default: ''
    },
    xmlName: {
        type: String, // xml link
        default: ''
    },
    xmlLink: {
        type: String, // xml link
        default: ''
    },
    dataXml: {
        type: String, // or Buffer if you expect binary data,
        default: '{}'
    },
    verticesLink: {
        type: String, // or Buffer if you expect binary data,
        default: '{}'
    },
    vertices: {
        type: String, // or Buffer if you expect binary data,
        default: '{}'
    },
    uploadAt: {
        type: Date,
        default: Date.now
    },
    versions: [versionSchema], // Array of version documents
    validation: {
        v1: {
            type: Boolean,
            default: false,
        },
        v2: {
            type: Boolean,
            default: false,
        }
    },
    status: {
        type: String,
        enum: ['progress', 'returned', 'validated', 'temporarily-rejected', 'rejected'],
        default: 'progress'
    },
    // Additional field for user
    validatedBy: {
        v1: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        },
        v2: {
            type: mongoose.Types.ObjectId,
            ref: 'User'
        }
    },
    lockedBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    returnedBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    comment: {
        type: String,
        default: ''
    },
    temporarilyReason: { // need to be filled in during rejection
        type: String,
        default: ''
    },
    reason: { // need to be filled in during rejection
        type: String,
        default: ''
    },
    createdBy: { // need to be filled in import IA
        type: String,
        default: ''
    },
    type: { // need to be filled in import IA
        type: String,
        default: 'Invoice'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Pre-save hook to update xml field before saving
fileSchema.pre('save', function (next) {
    if (this.name) {
        // Replace the file extension with .xml
        this.xml = this.name.replace(/\.[^/.]+$/, ".xml");
    }
    next();
});

fileSchema.virtual('workflowStatus').get(function() {
    if (this.status === 'validated') {
        return 'Worked on';
    }
    if (this.isLocked) return 'In progress';
    return 'Pending Assignement';
    
});

fileSchema.virtual('documentid').get(function() {
    return this.createdAt ? this.createdAt.getTime() : null;
});

/* virtual field to avoid code errors in frontend */
fileSchema.virtual('name').get(function() {
    return this.pdfName;
});

fileSchema.virtual('xml').get(function() {
    return this.xmlName;
});

module.exports = mongoose.model('demoFile', fileSchema)