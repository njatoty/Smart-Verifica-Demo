const mongoose = require("mongoose")
const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    iban: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    taxId: {
        type: String,
        default: ''
    },
    website: {
        type: String,
        default: ''
    },
    customer: {
        type: mongoose.Types.ObjectId,
        ref: 'customer'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

module.exports = mongoose.model('supplier', supplierSchema)