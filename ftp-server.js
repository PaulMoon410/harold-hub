// FTP Server for Harold Hub
// Provides file storage and access for Harold to manage

const ftp = require('basic-ftp');
const path = require('path');
const fs = require('fs');

class HaroldFTPServer {
  constructor(config = {}) {
    this.host = config.host || process.env.FTP_HOST || 'localhost';
    this.port = config.port || process.env.FTP_PORT || 21;
    this.user = config.user || process.env.FTP_USER || 'harold';
    this.password = config.password || process.env.FTP_PASSWORD || 'harold123';
    this.remotePath = config.remotePath || process.env.FTP_PATH || '/harold';
    this.client = new ftp.Client();
    this.client.ftp.verbose = process.env.FTP_VERBOSE === 'true';
  }

  async connect() {
    try {
      await this.client.connect(this.host, this.port);
      await this.client.login(this.user, this.password);
      
      // Ensure working directory exists
      try {
        await this.client.cd(this.remotePath);
      } catch {
        await this.client.mkdir(this.remotePath);
        await this.client.cd(this.remotePath);
      }
      
      console.log('FTP connected successfully');
      return true;
    } catch (error) {
      console.error('FTP connection error:', error.message);
      return false;
    }
  }

  async disconnect() {
    this.client.close();
  }

  async listFiles() {
    try {
      const list = await this.client.list();
      return list.map(file => ({
        name: file.name,
        size: file.size,
        type: file.isDirectory() ? 'directory' : 'file',
        modifiedAt: file.modifiedAt,
      }));
    } catch (error) {
      console.error('FTP list error:', error.message);
      return [];
    }
  }

  async uploadFile(localPath, remoteFileName = null) {
    try {
      const fileName = remoteFileName || path.basename(localPath);
      await this.client.uploadFrom(localPath, fileName);
      return { success: true, fileName };
    } catch (error) {
      console.error('FTP upload error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async downloadFile(remoteFileName, localPath) {
    try {
      await this.client.downloadTo(localPath, remoteFileName);
      return { success: true, localPath };
    } catch (error) {
      console.error('FTP download error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async deleteFile(remoteFileName) {
    try {
      await this.client.remove(remoteFileName);
      return { success: true };
    } catch (error) {
      console.error('FTP delete error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async createDirectory(dirName) {
    try {
      await this.client.mkdir(dirName);
      return { success: true };
    } catch (error) {
      console.error('FTP mkdir error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async searchFiles(pattern) {
    const files = await this.listFiles();
    return files.filter(file => 
      file.name.toLowerCase().includes(pattern.toLowerCase())
    );
  }
}

// Express integration for Base44 backend
const express = require('express');
const router = express.Router();

const ftpServer = new HaroldFTPServer();

// Initialize FTP connection on startup
ftpServer.connect().then(connected => {
  if (connected) {
    console.log('FTP server ready for Harold');
  }
});

// API endpoints for file operations
router.post('/upload', async (req, res) => {
  try {
    const { filePath, fileData, fileName } = req.body;
    
    // Write file data to temp location
    const tempPath = `/tmp/${fileName}`;
    fs.writeFileSync(tempPath, Buffer.from(fileData, 'base64'));
    
    const result = await ftpServer.uploadFile(tempPath, fileName);
    fs.unlinkSync(tempPath);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/files', async (req, res) => {
  try {
    const files = await ftpServer.listFiles();
    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { pattern } = req.query;
    const files = await ftpServer.searchFiles(pattern);
    res.json({ success: true, files });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/file/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const result = await ftpServer.deleteFile(fileName);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = { router, ftpServer };