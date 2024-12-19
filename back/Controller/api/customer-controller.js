const fs = require('fs');
const Customer = require('../../Models/Customer'); // Adjust path as needed

/**
 * Create a new customer
 */
exports.createCustomer = async (req, res) => {
    try {
        const { name, email, address, dynamicKey } = req.body;
        const customer = new Customer({ name, email, address, dynamicKey });
        await customer.save();
        res.status(201).json(customer);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Customer with this name already exists.' });
        }
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get all customers
 */
exports.getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find();
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get a single customer by ID
 */
exports.getCustomerById = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found.' });
        }
        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update a customer by ID
 */
exports.updateCustomer = async (req, res) => {
    try {
        const { name, email, address, dynamicKey } = req.body;
        const customer = await Customer.findByIdAndUpdate(
            req.params.id,
            { name, email, address, dynamicKey },
            { new: true, runValidators: true }
        );
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found.' });
        }
        res.status(200).json(customer);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Customer with this name already exists.' });
        }
        res.status(500).json({ error: error.message });
    }
};

/**
 * Delete a customer by ID
 */
exports.deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findByIdAndDelete(req.params.id);
        if (!customer) {
            return res.status(404).json({ error: 'Customer not found.' });
        }
        res.status(200).json({ message: 'Customer deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


/**
 * Updates dynamic keys for a customer
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateDynamicKeys = async (req, res) => {
    const { id: customerId } = req.params;
    const { name, value, action, newName, description } = req.body; // Action can be 'add', 'update', or 'remove'

    if (!name || !action) {
        return res.status(400).json({ message: "Key and action are required." });
    }

    try {
        // Find the customer by ID
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        // Perform the requested action
        switch (action) {
            case 'add':
                // Check if the key already exists
                if (customer.dynamicKeys.some(dk => dk.name === name)) {
                    return res.status(400).json({ message: "Key already exists." });
                }

                customer.dynamicKeys.push({ name, value: value || [], order: customer.dynamicKeys.length, description });
                break;

            case 'update':
                // Find the dynamic key and update its value
                const dynamicKey = customer.dynamicKeys.find(dk => dk.name === name);
                if (!dynamicKey) {
                    return res.status(404).json({ message: "Key not found." });
                }
                dynamicKey.name = newName;
                // dynamicKey.value = value || [];
                break;

            case 'remove':
                // Filter out the key to be removed
                customer.dynamicKeys = customer.dynamicKeys.filter(dk => dk.name !== name);
                break;

            default:
                return res.status(400).json({ message: "Invalid action." });
        }

        // Save the updated customer document
        await customer.save();
        
        res.status(200).json({ message: "Dynamic keys updated successfully.", customer });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};

// Method to update dynamicKeys keys order
exports.updateDynamicKeysOrder = async (req, res) => {
    const { id: customerId } = req.params;
    const { dynamicKeys } = req.body; // Array of keys with their new order

    try {
        const customer = await Customer.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found.' });
        }

        dynamicKeys.forEach(({ name, order }) => {
            const keyToUpdate = customer.dynamicKeys.find(dk => dk.name === name);
            if (keyToUpdate) keyToUpdate.order = order;
        });

        await customer.save();
        res.status(200).json({ message: 'Order updated successfully.', customer });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.', error: error.message });
    }
};

// Method to read uploaded json containing keys
exports.uploadJSONFileKey = async (req, res) => {

    const { id: customerId } = req.params;
    const filePath = req.file.path;

    // Read the uploaded file
    fs.readFile(filePath, 'utf8', async (err, data) => {
        if (err) {
            return res.status(500).send({ error: 'Failed to read file' });
        }

        try {
            const jsonContent = JSON.parse(data);
            console.log('Uploaded JSON:', jsonContent);

            const customer = await Customer.findById(customerId);

            if (Array.isArray(jsonContent)) {
                let withOrders = jsonContent.map((item, index) => ({...item, order: index }));
                // clear keys
                if (req.body.clearKeys) {
                    customer.dynamicKeys = withOrders;
                } else {
                    // loop through
                    let length = customer.dynamicKeys.length;
                    // change order
                    let keys = withOrders.map((item, index) => ({...item, order: index + length + 1 }));
                    customer.dynamicKeys = [...customer.dynamicKeys, ...keys];
                }
                console.log(customer.dynamicKeys)
                customer.save();
            }


            // Clean up the uploaded file
            fs.unlinkSync(filePath);
            
            res.send({ message: 'JSON received successfully', data: customer.dynamicKeys });
        } catch (parseError) {
            res.status(400).send({ error: 'Invalid JSON format' });
        }
    });
}