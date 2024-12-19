const Supplier = require('../../Models/Supplier');

// Get all suppliers
const getAllSuppliers = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Par défaut, 50 enregistrements par page
    console.log(page, limit)
    try {
        const suppliers = await Supplier.find()
            .sort({ _id: 'desc'})
            .skip((page - 1) * limit) // Sauter les enregistrements précédents
            .limit(limit); // Limiter le nombre d'enregistrements
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch suppliers.' });
    }
};

// Get a single supplier by ID
const getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id);
        if (!supplier) {
            return res.status(404).json({ error: 'Supplier not found.' });
        }
        res.status(200).json(supplier);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch the supplier.' });
    }
};

// Create a new supplier
const createSupplier = async (req, res) => {
    try {
        const supplier = new Supplier(req.body);
        await supplier.save();
        res.status(201).json(supplier);
    } catch (error) {
        res.status(400).json({ error: 'Failed to create supplier.', details: error.message });
    }
};

// Update a supplier by ID
const updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { 
            new: true, 
            runValidators: true 
        });
        if (!supplier) {
            return res.status(404).json({ error: 'Supplier not found.' });
        }
        res.status(200).json(supplier);
    } catch (error) {
        res.status(400).json({ error: 'Failed to update supplier.', details: error.message });
    }
};

// Delete a supplier by ID
const deleteSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndDelete(req.params.id);
        if (!supplier) {
            return res.status(404).json({ error: 'Supplier not found.' });
        }
        res.status(200).json({ message: 'Supplier deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete supplier.' });
    }
};

module.exports = {
    getAllSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
};
