// Import Node and Electron elements.
const { ipcMain } = require('electron');
const { appendFile, chmod, createReadStream, createWriteStream, existsSync, mkdir, readdir, rm, unlink, writeFile } = require('fs');

// Manage dialogs display.
const { dialog } = require('electron');
ipcMain.handle('dialog-open', (e, ...a) => {
  return dialog.showOpenDialogSync(a[0]);
});
ipcMain.handle('dialog-save', (e, ...a) => {
  return new Promise(async (resolve) => {
    resolve((await dialog.showSaveDialog(a[0])).filePath);
  });
});

// Create directory recursively.
ipcMain.handle('dir-create', (e, ...a) => {
  return new Promise((resolve) => {
    mkdir(a[0], { recursive: true }, (error, stdout) => {
      resolve(error ? error : stdout);
    });
  });
});

// Display file in explorer.
const { shell } = require('electron');
ipcMain.handle('dir-open', (e, ...a) => {
  shell.showItemInFolder(a[0]);
});

// Read directory contents/files.
ipcMain.handle('dir-read', (e, ...a) => {
  return new Promise((resolve) => {
    readdir(a[0], (error, stdout) => {
      resolve(error ? error : stdout);
    });
  });
});

// Delete directory.
ipcMain.handle('dir-delete', (e, ...a) => {
  return new Promise((resolve) => {
    rm(a[0], { force: true, recursive: true }, (error, stdout) => {
      resolve(error ? error : stdout);
    });
  });
});

// Append data to text file.
ipcMain.handle('file-append', (e, ...a) => {
  return new Promise((resolve) => {
    appendFile(a[0], a[1], () => { resolve(); });
  });
});

// Create/write data to file.
ipcMain.handle('file-create', (e, ...a) => {
  return new Promise((resolve) => {
    writeFile(a[0], a[1], (error, stdout) => {
      resolve(error ? error : stdout);
    });
  });
});

// Delete file.
ipcMain.handle('file-delete', (e, ...a) => {
  return new Promise((resolve) => {
    unlink(a[0], (error, stdout) => {
      resolve(error ? error : stdout);
    });
  });
});

// Download file.
const { https } = require('follow-redirects');
ipcMain.handle('file-download', (e, ...a) => {
  return new Promise((resolve) => {
    const fileStream = createWriteStream(a[0]);
    https.get(a[1], (res) => { res.pipe(fileStream);
      fileStream.on('finish', () => { fileStream.close(); resolve(); });
    });
  });
});

// Check if a file exists.
ipcMain.handle('file-exists', (e, ...a) => {
  return existsSync(a[0]);
});

// Calculate file hash.
const { createHash } = require('crypto');
ipcMain.handle('file-hash', (e, ...a) => {
  return new Promise((resolve) => {
    const fileStream = createReadStream(a[0]);
    const fileHash = createHash('sha256', { encoding: 'hex' });
    fileHash.on('finish', () => { fileStream.close(); resolve(fileHash.read().toUpperCase()); });
    fileStream.pipe(fileHash);
  });
});

// Unpack/extract compressed file.
const extract = require('extract-zip');
ipcMain.handle('file-unpack', (e, ...a) => {
  return new Promise(async (resolve) => {
    await extract(a[0], { dir: a[1] });
    unlink(a[0], (error, stdout) => {
      readdir(a[1], (error, stdout) => {
        for (let file of stdout) {
          chmod(`${a[1]}${file}`, 0o777, () => {});
        } resolve();
      });
    });
  });
});

// Execute/create process.
const { exec } = require('child_process');
ipcMain.handle('process-exec', (e, ...a) => {
  return new Promise((resolve) => {
    exec(a[0], a[1], (error, stdout) => {
      resolve(error ? error : stdout);
    });
  });
});

// Spawn/kill processes.
const { spawn } = require('child_process');
let spawnProcess;
ipcMain.handle('process-spawn', (e, ...a) => {
  return new Promise((resolve) => {
    spawnProcess = spawn(a[0], { detached: process.platform != 'win32', shell: true });
    spawnProcess.stderr.on('data', (error) => { resolve(error.toString()); });
    spawnProcess.on('close', () => { resolve(''); });
  });
});
ipcMain.handle('process-kill', (e, ...a) => {
  return new Promise((resolve) => {
    if (process.platform == 'win32') {
      const process$ = exec(`taskkill /F /T /PID ${spawnProcess.pid}`);
      process$.on('close', () => { resolve(); });
    } else {
      process.kill(-spawnProcess.pid, 'SIGINT');
      setInterval(() => {
        try { process.kill(-spawnProcess.pid, 0); } catch { resolve(); }
      }, 200);
    }
  });
});