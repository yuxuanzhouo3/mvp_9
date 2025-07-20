const express = require('express');
const zlib = require('zlib');
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

// Compression algorithms
const compressionAlgorithms = {
  gzip: {
    compress: (data) => zlib.gzipSync(data),
    decompress: (data) => zlib.gunzipSync(data),
    name: 'GZIP',
    description: 'Standard gzip compression'
  },
  deflate: {
    compress: (data) => zlib.deflateSync(data),
    decompress: (data) => zlib.inflateSync(data),
    name: 'DEFLATE',
    description: 'DEFLATE compression algorithm'
  },
  brotli: {
    compress: (data) => zlib.brotliCompressSync(data),
    decompress: (data) => zlib.brotliDecompressSync(data),
    name: 'BROTLI',
    description: 'Brotli compression algorithm'
  }
};

// Intelligent compression based on file type
function getOptimalAlgorithm(filename) {
  const ext = filename.toLowerCase().split('.').pop();
  
  // Text-based files compress well with gzip
  if (['txt', 'json', 'xml', 'html', 'css', 'js', 'md', 'log'].includes(ext)) {
    return 'gzip';
  }
  
  // Already compressed files
  if (['jpg', 'jpeg', 'png', 'gif', 'mp3', 'mp4', 'zip', 'rar', '7z'].includes(ext)) {
    return 'deflate'; // Minimal compression for already compressed files
  }
  
  // Default to brotli for best compression ratio
  return 'brotli';
}

// Compress text
router.post('/compress-text', [
  body('text').notEmpty().withMessage('Text is required'),
  body('algorithm').optional().isIn(['gzip', 'deflate', 'brotli']).withMessage('Invalid algorithm')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { text, algorithm = 'gzip' } = req.body;
    const textBuffer = Buffer.from(text, 'utf8');
    
    const algo = compressionAlgorithms[algorithm];
    const compressed = algo.compress(textBuffer);
    
    const compressionRatio = ((textBuffer.length - compressed.length) / textBuffer.length * 100).toFixed(2);
    
    res.json({
      success: true,
      data: {
        original: text,
        compressed: compressed.toString('base64'),
        algorithm: algo.name,
        originalSize: textBuffer.length,
        compressedSize: compressed.length,
        compressionRatio: `${compressionRatio}%`,
        savings: textBuffer.length - compressed.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Text compression error:', error);
    res.status(500).json({
      success: false,
      error: 'Compression failed',
      message: error.message
    });
  }
});

// Decompress text
router.post('/decompress-text', [
  body('compressed').notEmpty().withMessage('Compressed data is required'),
  body('algorithm').isIn(['gzip', 'deflate', 'brotli']).withMessage('Invalid algorithm')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { compressed, algorithm } = req.body;
    const compressedBuffer = Buffer.from(compressed, 'base64');
    
    const algo = compressionAlgorithms[algorithm];
    const decompressed = algo.decompress(compressedBuffer);
    
    res.json({
      success: true,
      data: {
        decompressed: decompressed.toString('utf8'),
        algorithm: algo.name,
        compressedSize: compressedBuffer.length,
        decompressedSize: decompressed.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Text decompression error:', error);
    res.status(500).json({
      success: false,
      error: 'Decompression failed',
      message: error.message
    });
  }
});

// Compress file
router.post('/compress-file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { algorithm } = req.query;
    const fileBuffer = req.file.buffer;
    const filename = req.file.originalname;
    
    // Use optimal algorithm if not specified
    const algoName = algorithm || getOptimalAlgorithm(filename);
    const algo = compressionAlgorithms[algoName];
    
    const compressed = algo.compress(fileBuffer);
    const compressionRatio = ((fileBuffer.length - compressed.length) / fileBuffer.length * 100).toFixed(2);
    
    res.json({
      success: true,
      data: {
        filename: filename,
        compressed: compressed.toString('base64'),
        algorithm: algo.name,
        originalSize: fileBuffer.length,
        compressedSize: compressed.length,
        compressionRatio: `${compressionRatio}%`,
        savings: fileBuffer.length - compressed.length,
        optimalAlgorithm: algorithm ? false : true
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('File compression error:', error);
    res.status(500).json({
      success: false,
      error: 'File compression failed',
      message: error.message
    });
  }
});

// Batch compress files
router.post('/compress-batch', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const { algorithm } = req.query;
    const results = [];

    for (const file of req.files) {
      const fileBuffer = file.buffer;
      const filename = file.originalname;
      
      const algoName = algorithm || getOptimalAlgorithm(filename);
      const algo = compressionAlgorithms[algoName];
      
      const compressed = algo.compress(fileBuffer);
      const compressionRatio = ((fileBuffer.length - compressed.length) / fileBuffer.length * 100).toFixed(2);
      
      results.push({
        filename: filename,
        compressed: compressed.toString('base64'),
        algorithm: algo.name,
        originalSize: fileBuffer.length,
        compressedSize: compressed.length,
        compressionRatio: `${compressionRatio}%`,
        savings: fileBuffer.length - compressed.length
      });
    }

    const totalOriginalSize = results.reduce((sum, file) => sum + file.originalSize, 0);
    const totalCompressedSize = results.reduce((sum, file) => sum + file.compressedSize, 0);
    const totalCompressionRatio = ((totalOriginalSize - totalCompressedSize) / totalOriginalSize * 100).toFixed(2);

    res.json({
      success: true,
      data: {
        files: results,
        summary: {
          totalFiles: results.length,
          totalOriginalSize: totalOriginalSize,
          totalCompressedSize: totalCompressedSize,
          totalCompressionRatio: `${totalCompressionRatio}%`,
          totalSavings: totalOriginalSize - totalCompressedSize
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Batch compression error:', error);
    res.status(500).json({
      success: false,
      error: 'Batch compression failed',
      message: error.message
    });
  }
});

// Get compression algorithms
router.get('/algorithms', (req, res) => {
  const algorithms = Object.entries(compressionAlgorithms).map(([key, algo]) => ({
    id: key,
    name: algo.name,
    description: algo.description,
    type: 'Lossless'
  }));

  res.json({
    success: true,
    algorithms: algorithms,
    intelligentCompression: {
      enabled: true,
      description: 'Automatically selects optimal algorithm based on file type'
    }
  });
});

// Get compression statistics
router.get('/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      totalCompressions: 0, // Would be tracked in a real application
      averageCompressionRatio: '65%',
      mostUsedAlgorithm: 'gzip',
      totalDataProcessed: '0 MB',
      totalSpaceSaved: '0 MB'
    }
  });
});

module.exports = router; 