const Tesseract = require('tesseract.js');

const extractTextFromImage =  async (req, res) => {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
        return res.status(400).json({ error: 'Image base64 string is required.' });
    }

    try {
        // Use Tesseract.js to process the base64 image
        const result = await Tesseract.recognize(imageBase64, 'eng', {
            logger: info => console.log(info), // Optional logger for progress updates
        });

        // Send the extracted text as response
        res.json({ text: result.data.text });
    } catch (error) {
        console.error('Error during text extraction:', error);
        res.status(500).json({ error: 'Failed to extract text from image.' });
    }
}

module.exports = {
    extractTextFromImage
}