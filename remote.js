const { dialog, ipcMain } = require('electron');
const { exec } = require('child_process');
const { mkdir, readdir, unlink, writeFile } = require('fs');

ipcMain.on('dialog-open', async (e, ...a) => {
  e.reply('dialog-open', dialog.showOpenDialogSync(a[0]));
});

ipcMain.on('dialog-save', async (e, ...a) => {
  e.reply('dialog-save', dialog.showSaveDialogSync(a[0]));
});

ipcMain.on('exec', (e, ...a) => {
  exec(a[0], a[1], (error, stdout, stderr) => {
    e.reply('exec', error ? error : stdout);
  });
});

ipcMain.on('mkdir', (e, ...a) => {
  mkdir(a[0], { recursive: true }, (error, stdout, stderr) => {
    e.reply('mkdir', error ? error : stdout);
  });
});

ipcMain.on('read-dir', (e, ...a) => {
  readdir(a[0], (error, stdout, stderr) => {
    e.reply('read-dir', error ? error : stdout);
  });
});

ipcMain.on('unlink', (e, ...a) => {
  unlink(a[0], (error, stdout, stderr) => {
    e.reply('unlink', error ? error : stdout);
  });
});

ipcMain.on('write-file', (e, ...a) => {
  writeFile(a[0], a[1], (error, stdout, stderr) => {
    e.reply('write-file', error ? error : stdout);
  });
});