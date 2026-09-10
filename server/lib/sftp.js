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

async function uploadImage(buffer, filename) {
  const sftp = new SftpClient();
  try {
    await sftp.connect(connectConfig());
    await sftp.put(buffer, `${REMOTE_DIR}/${filename}`);
  } finally {
    await sftp.end();
  }
}

async function downloadImage(filename) {
  const sftp = new SftpClient();
  try {
    await sftp.connect(connectConfig());
    return await sftp.get(`${REMOTE_DIR}/${filename}`);
  } finally {
    await sftp.end();
  }
}

module.exports = { uploadImage, downloadImage };
