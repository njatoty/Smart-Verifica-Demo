const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true,
    },
    firstname: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'agent V1', 'agent V2'],
        default: 'agent V1'
    },
    resetToken: {
        type: String,
        default: null,
    },
    resetTokenExpiration: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true, 
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});



UserSchema.virtual('displayName').get(function() {
    return this.name;
});


// UserSchema.virtual('uid').get(function() {
//     return this.createdAt ? this.createdAt.getTime() : null;
// });

module.exports = mongoose.model('User', UserSchema);
