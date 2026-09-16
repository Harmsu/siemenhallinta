const SftpClient = require('ssh2-sftp-client');

const REMOTE_DIR = process.env.SFTP_REMOTE_DIR || '/uploads';

function connectConfig() {
  return {
    host: process.env.SFTP_HOST,
    port: Number(process.env.SFTP_PORT) || 22,
    username: process.env.SFTP_USERNAME,
    // .env tallentaa moniriviset avaimet yhdelle riville kirjaimellisilla \n-merkeillä
    privateKey: (process.env.SFTP_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };
}

function remotePath(filename, subdir) {
  return subdir ? `${REMOTE_DIR}/${subdir}/${filename}` : `${REMOTE_DIR}/${filename}`;
}

async function ensureDir(sftp, subdir) {
  if (!subdir) return;
  const dir = `${REMOTE_DIR}/${subdir}`;
  const exists = await sftp.exists(dir);
  if (!exists) await sftp.mkdir(dir, true);
}

async function uploadImage(buffer, filename, subdir) {
  const sftp = new SftpClient();
  try {
    await sftp.connect(connectConfig());
    await ensureDir(sftp, subdir);
    await sftp.put(buffer, remotePath(filename, subdir));
  } finally {
    await sftp.end();
  }
}

async function downloadImage(filename, subdir) {
  const sftp = new SftpClient();
  try {
    await sftp.connect(connectConfig());
    return await sftp.get(remotePath(filename, subdir));
  } finally {
    await sftp.end();
  }
}

async function deleteImage(filename, subdir) {
  const sftp = new SftpClient();
  try {
    await sftp.connect(connectConfig());
    await sftp.delete(remotePath(filename, subdir));
  } finally {
    await sftp.end();
  }
}

module.exports = { uploadImage, downloadImage, deleteImage };
