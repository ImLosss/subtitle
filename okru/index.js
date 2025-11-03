// okru_upload.js
import fs from 'fs';
import path from 'path';
import md5 from 'md5';
import axios from 'axios';
import FormData from 'form-data';
import 'dotenv/config';

const API_SERVER = 'https://api.ok.ru/fb.do';

const {
  OK_APP_KEY,
  OK_APP_SECRET,
  OK_ACCESS_TOKEN,
  OK_GID,
  OK_UID,
} = process.env;

function buildSig(params) {
  // Hapus access_token dari perhitungan
  const p = { ...params };
  delete p.access_token;
  // Urutkan & gabung key=value (tanpa '&')
  const joined = Object.keys(p).sort().map(k => `${k}=${p[k]}`).join('');
  // session_secret_key = MD5(access_token + application_secret), lowercase
  const sessionSecret = md5(`${OK_ACCESS_TOKEN}${OK_APP_SECRET}`).toLowerCase();
  return md5((joined + sessionSecret)).toLowerCase();
}

async function okCall(method, extraParams = {}) {
  const base = {
    method,
    application_key: OK_APP_KEY,
    format: 'json',
    access_token: OK_ACCESS_TOKEN,
    ...extraParams,
  };
  const sig = buildSig(base);
  const body = new URLSearchParams({ ...base, sig });

  const { data } = await axios.post(API_SERVER, body.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    // OK.ru kadang balas 200 meski ada error di body → kita cek manual di bawah
    validateStatus: () => true,
  });

  if (data && data.error_code) {
    const msg = `${data.error_code} ${data.error_msg || ''}`.trim();
    throw new Error(`OK.ru API error (${method}): ${msg}`);
  }
  return data;
}

async function getUploadUrl({ fileName, gid, uid }) {
  const params = {
    file_name: fileName,
  };
  if (gid) params.gid = gid;
  if (uid) params.uid = uid;

  // video.getUploadUrl
  const resp = await okCall('video.getUploadUrl', params);
  if (!resp || !resp.upload_url || !resp.vid) {
    throw new Error(`Upload URL/VID tidak ditemukan: ${JSON.stringify(resp)}`);
  }
  return { uploadUrl: resp.upload_url, vid: resp.vid };
}

async function uploadMultipart(uploadUrl, filePath) {
  const form = new FormData();
  // Field harus bernama 'data' (lihat dokumentasi)
  form.append('data', fs.createReadStream(filePath));

  const { status, data, headers } = await axios.post(uploadUrl, form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    validateStatus: () => true,
  });

  if (!(status === 200 || status === 201)) {
    throw new Error(`Gagal upload (status ${status}): ${typeof data === 'object' ? JSON.stringify(data) : data}`);
  }
  return { status, etag: headers.etag || null };
}

async function finalizeVideo(vid, { title, description, publish = true, privacy } = {}) {
  const params = { vid, publish };
  if (title) params.title = title;
  if (description) params.description = description;
  if (privacy) params.privacy = privacy; // mis. PUBLIC/PRIVATE sesuai kebutuhan

  // video.update
  await okCall('video.update', params);
}

function getEmbedUrl(vid) {
  return `https://ok.ru/videoembed/${vid}`;
}

// ---- CLI runner ----
async function main() {
  const filePath = process.argv[2];
  const title = process.argv[3] || '';
  const description = process.argv[4] || '';

  if (!filePath) {
    console.error('Usage: node okru_upload.js <path/to/video.mp4> [title] [description]');
    process.exit(1);
  }
  if (!OK_APP_KEY || !OK_APP_SECRET || !OK_ACCESS_TOKEN) {
    console.error('Pastikan OK_APP_KEY, OK_APP_SECRET, OK_ACCESS_TOKEN ada di .env');
    process.exit(1);
  }
  if (!OK_GID && !OK_UID) {
    console.error('Isi salah satu: OK_GID (upload ke grup) atau OK_UID (upload ke user) di .env');
    process.exit(1);
  }

  const fileName = path.basename(filePath);
  const fileStat = fs.statSync(filePath);
  console.log('> Meminta upload URL…');
  const { uploadUrl, vid } = await getUploadUrl({
    fileName,
    gid: OK_GID,
    uid: OK_UID,
  });
  console.log('VID:', vid);

  // PERINGATAN: multipart max 2GB. File > 2GB gunakan "renewable upload" (Content-Range).
  console.log('> Upload multipart… (pastikan ukuran <= 2GB)');
  await uploadMultipart(uploadUrl, filePath);

  console.log('> Finalize & publish…');
  await finalizeVideo(vid, { title, description, publish: true });

  const embed = getEmbedUrl(vid);
  console.log('Selesai. Embed URL:\n', embed);
}

main().catch(err => {
  console.error(err?.response?.data || err.message || err);
  process.exit(1);
});
