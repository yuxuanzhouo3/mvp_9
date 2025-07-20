const express = require('express');
const crypto = require('crypto');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024 // 100MB default
  }
});

// Generate encryption key
function generateKey() {
  return crypto.randomBytes(32).toString('hex');
}

// AES-256 Encryption
function encryptAES(data, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher('aes-256-cbc', key);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encrypted: encrypted,
    iv: iv.toString('hex')
  };
}

// AES-256 Decryption
function decryptAES(encryptedData, key, iv) {
  const decipher = crypto.createDecipher('aes-256-cbc', key);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// RSA Key Generation
function generateRSAKeys() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
  return { publicKey, privateKey };
}

// Encrypt text
router.post('/encrypt-text', [
  body('text').notEmpty().withMessage('Text is required'),
  body('algorithm').isIn(['AES-256', 'RSA']).withMessage('Invalid algorithm')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, algorithm } = req.body;
    let result;

    if (algorithm === 'AES-256') {
      const key = generateKey();
      const encrypted = encryptAES(text, key);
      result = {
        algorithm: 'AES-256',
        encrypted: encrypted.encrypted,
        iv: encrypted.iv,
        key: key,
        originalLength: text.length,
        encryptedLength: encrypted.encrypted.length
      };
    } else if (algorithm === 'RSA') {
      const keys = generateRSAKeys();
      const encrypted = crypto.publicEncrypt(
        keys.publicKey,
        Buffer.from(text, 'utf8')
      );
      result = {
        algorithm: 'RSA',
        encrypted: encrypted.toString('base64'),
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
        originalLength: text.length,
        encryptedLength: encrypted.length
      };
    }

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Encryption error:', error);
    res.status(500).json({
      success: false,
      error: 'Encryption failed',
      message: error.message
    });
  }
});

// Decrypt text
router.post('/decrypt-text', [
  body('encrypted').notEmpty().withMessage('Encrypted data is required'),
  body('algorithm').isIn(['AES-256', 'RSA']).withMessage('Invalid algorithm')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { encrypted, algorithm, key, iv, privateKey } = req.body;
    let decrypted;

    if (algorithm === 'AES-256') {
      if (!key || !iv) {
        return res.status(400).json({ error: 'Key and IV are required for AES decryption' });
      }
      decrypted = decryptAES(encrypted, key, iv);
    } else if (algorithm === 'RSA') {
      if (!privateKey) {
        return res.status(400).json({ error: 'Private key is required for RSA decryption' });
      }
      const buffer = Buffer.from(encrypted, 'base64');
      decrypted = crypto.privateDecrypt(privateKey, buffer).toString('utf8');
    }

    res.json({
      success: true,
      data: {
        decrypted: decrypted,
        algorithm: algorithm,
        length: decrypted.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Decryption error:', error);
    res.status(500).json({
      success: false,
      error: 'Decryption failed',
      message: error.message
    });
  }
});

// Encrypt file
router.post('/encrypt-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    const key = generateKey();
    const encrypted = encryptAES(fileBuffer.toString('base64'), key);

    res.json({
      success: true,
      data: {
        filename: req.file.originalname,
        encrypted: encrypted.encrypted,
        iv: encrypted.iv,
        key: key,
        originalSize: fileBuffer.length,
        encryptedSize: encrypted.encrypted.length,
        algorithm: 'AES-256'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('File encryption error:', error);
    res.status(500).json({
      success: false,
      error: 'File encryption failed',
      message: error.message
    });
  }
});

// Generate RSA key pair
router.post('/generate-rsa-keys', async (req, res) => {
  try {
    const keys = generateRSAKeys();
    
    res.json({
      success: true,
      data: {
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
        algorithm: 'RSA-2048',
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('RSA key generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Key generation failed',
      message: error.message
    });
  }
});

// Get encryption algorithms
router.get('/algorithms', (req, res) => {
  res.json({
    success: true,
    algorithms: [
      {
        name: 'AES-256',
        type: 'Symmetric',
        keySize: '256 bits',
        description: 'Advanced Encryption Standard with 256-bit key'
      },
      {
        name: 'RSA',
        type: 'Asymmetric',
        keySize: '2048 bits',
        description: 'Rivest-Shamir-Adleman public key cryptography'
      }
    ]
  });
});

module.exports = router; 