const { dialog, ipcMain , shell} = require('electron');
const { exec, spawn } = require('child_process');
const extract = require('extract-zip');
const { appendFile, chmod, createWriteStream, existsSync, mkdir, readdir, unlink, writeFile } = require('fs');
const { get } = require('follow-redirects').https;

ipcMain.on('append-file', (e, ...a) => {
  appendFile(a[0], a[1], (error, stdout, stderr) => {
    e.reply('append-file', error ? error : stdout);
  });
});

ipcMain.on('dialog-open', async (e, ...a) => {
  e.reply('dialog-open', dialog.showOpenDialogSync(a[0]));
});

ipcMain.on('dialog-save', async (e, ...a) => {
  e.reply('dialog-save', dialog.showSaveDialogSync(a[0]));
});

ipcMain.on('download', (e, ...a) => {
  const f = createWriteStream(a[0]);
  get(a[1], (res) => { res.pipe(f);
    f.on('finish', () => { f.close(); e.reply('download'); });
  });
});

ipcMain.on('exec', (e, ...a) => {
  exec(a[0], a[1], (error, stdout, stderr) => {
    e.reply('exec', error ? error : stdout);
  });
});

ipcMain.on('exists', (e, ...a) => {
  e.reply('exists', existsSync(a[0]));
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

let $process;

ipcMain.on('spawn', (e, ...a) => {
  $process = spawn(a[0], { detached: process.platform != 'win32', shell: true });
  $process.stderr.on('data', (error) => { e.reply('spawn', error.toString()); });
  $process.on('close', () => { e.reply('spawn', ''); });
});

ipcMain.on('spawn-kill', (e, ...a) => {
  if (process.platform == 'win32') {
    exec(`taskkill /F /T /PID ${$process.pid}`);
  } else { process.kill(-$process.pid, 'SIGINT'); }
});

ipcMain.on('shell-open', (e, ...a) => {
  shell.showItemInFolder(a[0]);
});

ipcMain.on('unlink', (e, ...a) => {
  unlink(a[0], (error, stdout, stderr) => {
    e.reply('unlink', error ? error : stdout);
  });
});

ipcMain.on('unzip', async (e, ...a) => {
  await extract(a[0], { dir: a[1] });
  unlink(a[0], (error, stdout) => {
    readdir(a[1], (error, stdout) => {
      for (let f of stdout) {
        chmod(`${a[1]}${f}`, 0o777, () => {});
      } e.reply('unzip');
    });
  });
});

ipcMain.on('write-file', (e, ...a) => {
  writeFile(a[0], a[1], (error, stdout, stderr) => {
    e.reply('write-file', error ? error : stdout);
  });
});