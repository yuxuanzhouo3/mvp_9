const express = require('express');
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

// In-memory storage for transfer sessions (in production, use Redis or database)
const transferSessions = new Map();

// Generate transfer session ID
function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Create transfer session
router.post('/create-session', [
  body('filename').notEmpty().withMessage('Filename is required'),
  body('fileSize').isInt({ min: 1 }).withMessage('File size must be positive'),
  body('chunkSize').optional().isInt({ min: 1024, max: 1048576 }).withMessage('Chunk size must be between 1KB and 1MB')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { filename, fileSize, chunkSize = 1024 * 1024 } = req.body; // Default 1MB chunks
    const sessionId = generateSessionId();
    
    const session = {
      id: sessionId,
      filename: filename,
      fileSize: fileSize,
      chunkSize: chunkSize,
      chunks: [],
      uploadedChunks: new Set(),
      totalChunks: Math.ceil(fileSize / chunkSize),
      status: 'created',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    transferSessions.set(sessionId, session);

    res.json({
      success: true,
      data: {
        sessionId: sessionId,
        filename: filename,
        fileSize: fileSize,
        chunkSize: chunkSize,
        totalChunks: session.totalChunks,
        uploadUrl: `/api/transfer/upload-chunk/${sessionId}`,
        statusUrl: `/api/transfer/session/${sessionId}`,
        resumeUrl: `/api/transfer/resume/${sessionId}`
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create transfer session',
      message: error.message
    });
  }
});

// Upload chunk
router.post('/upload-chunk/:sessionId', upload.single('chunk'), async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { chunkIndex } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No chunk uploaded' });
    }

    const session = transferSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Transfer session not found' });
    }

    if (session.status === 'completed') {
      return res.status(400).json({ error: 'Transfer already completed' });
    }

    const chunkIndexNum = parseInt(chunkIndex);
    if (chunkIndexNum < 0 || chunkIndexNum >= session.totalChunks) {
      return res.status(400).json({ error: 'Invalid chunk index' });
    }

    // Store chunk
    session.chunks[chunkIndexNum] = req.file.buffer;
    session.uploadedChunks.add(chunkIndexNum);
    session.lastActivity = new Date().toISOString();

    // Check if all chunks are uploaded
    if (session.uploadedChunks.size === session.totalChunks) {
      session.status = 'completed';
      
      // Combine chunks
      const combinedBuffer = Buffer.concat(session.chunks);
      
      res.json({
        success: true,
        data: {
          sessionId: sessionId,
          status: 'completed',
          uploadedChunks: session.uploadedChunks.size,
          totalChunks: session.totalChunks,
          fileSize: combinedBuffer.length,
          downloadUrl: `/api/transfer/download/${sessionId}`
        },
        message: 'File transfer completed successfully'
      });
    } else {
      res.json({
        success: true,
        data: {
          sessionId: sessionId,
          status: 'in_progress',
          uploadedChunks: session.uploadedChunks.size,
          totalChunks: session.totalChunks,
          progress: ((session.uploadedChunks.size / session.totalChunks) * 100).toFixed(2)
        }
      });
    }
  } catch (error) {
    console.error('Chunk upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload chunk',
      message: error.message
    });
  }
});

// Get session status
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = transferSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Transfer session not found' });
    }

    const progress = session.status === 'completed' ? 100 : 
      ((session.uploadedChunks.size / session.totalChunks) * 100).toFixed(2);

    res.json({
      success: true,
      data: {
        sessionId: sessionId,
        filename: session.filename,
        status: session.status,
        progress: progress,
        uploadedChunks: session.uploadedChunks.size,
        totalChunks: session.totalChunks,
        fileSize: session.fileSize,
        chunkSize: session.chunkSize,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        downloadUrl: session.status === 'completed' ? `/api/transfer/download/${sessionId}` : null
      }
    });
  } catch (error) {
    console.error('Session status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session status',
      message: error.message
    });
  }
});

// Download completed file
router.get('/download/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = transferSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Transfer session not found' });
    }

    if (session.status !== 'completed') {
      return res.status(400).json({ error: 'File transfer not completed' });
    }

    // Combine chunks
    const combinedBuffer = Buffer.concat(session.chunks);
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${session.filename}"`);
    res.setHeader('Content-Length', combinedBuffer.length);
    res.send(combinedBuffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download file',
      message: error.message
    });
  }
});

// Resume transfer
router.post('/resume/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = transferSessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Transfer session not found' });
    }

    if (session.status === 'completed') {
      return res.status(400).json({ error: 'Transfer already completed' });
    }

    // Get missing chunks
    const missingChunks = [];
    for (let i = 0; i < session.totalChunks; i++) {
      if (!session.uploadedChunks.has(i)) {
        missingChunks.push(i);
      }
    }

    res.json({
      success: true,
      data: {
        sessionId: sessionId,
        status: 'resumed',
        uploadedChunks: session.uploadedChunks.size,
        totalChunks: session.totalChunks,
        missingChunks: missingChunks,
        progress: ((session.uploadedChunks.size / session.totalChunks) * 100).toFixed(2),
        uploadUrl: `/api/transfer/upload-chunk/${sessionId}`
      },
      message: 'Transfer resumed successfully'
    });
  } catch (error) {
    console.error('Resume error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resume transfer',
      message: error.message
    });
  }
});

// Fast file upload (single request)
router.post('/upload-fast', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    const filename = req.file.originalname;
    const sessionId = generateSessionId();

    // Store file directly
    const session = {
      id: sessionId,
      filename: filename,
      fileSize: fileBuffer.length,
      chunks: [fileBuffer],
      uploadedChunks: new Set([0]),
      totalChunks: 1,
      status: 'completed',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    transferSessions.set(sessionId, session);

    res.json({
      success: true,
      data: {
        sessionId: sessionId,
        filename: filename,
        fileSize: fileBuffer.length,
        status: 'completed',
        downloadUrl: `/api/transfer/download/${sessionId}`,
        shareUrl: `/api/transfer/share/${sessionId}`
      },
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Fast upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file',
      message: error.message
    });
  }
});

// Get transfer statistics
router.get('/stats', (req, res) => {
  const activeSessions = Array.from(transferSessions.values()).filter(s => s.status !== 'completed');
  const completedSessions = Array.from(transferSessions.values()).filter(s => s.status === 'completed');
  
  const totalDataTransferred = completedSessions.reduce((sum, session) => sum + session.fileSize, 0);
  
  res.json({
    success: true,
    stats: {
      activeSessions: activeSessions.length,
      completedSessions: completedSessions.length,
      totalSessions: transferSessions.size,
      totalDataTransferred: totalDataTransferred,
      averageFileSize: completedSessions.length > 0 ? 
        (totalDataTransferred / completedSessions.length).toFixed(2) : 0
    }
  });
});

// Clean up old sessions (would be a cron job in production)
router.post('/cleanup', async (req, res) => {
  try {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    let cleanedCount = 0;
    for (const [sessionId, session] of transferSessions.entries()) {
      const sessionAge = now - new Date(session.createdAt);
      if (sessionAge > maxAge) {
        transferSessions.delete(sessionId);
        cleanedCount++;
      }
    }

    res.json({
      success: true,
      data: {
        cleanedSessions: cleanedCount,
        remainingSessions: transferSessions.size
      },
      message: `Cleaned up ${cleanedCount} old sessions`
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup sessions',
      message: error.message
    });
  }
});

module.exports = router; 