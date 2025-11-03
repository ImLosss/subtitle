import fs from "fs";
import axios from "axios";
import FormData from "form-data";

const APP_ID = "3092606737608186";
const PAGE_ID = "821089531095035";
const ACCESS_TOKEN = "EAAr8tZA4GbfoBPZBhStDso7ABxaUzSsoJqlDO9jrIVW9CzC9s96GDiCaJdwXCppygnahHrwTIl8IoQH6q0cZBM2dg3fFJZAexgaiiw5USR6FonRrXjuDgvPYzZAmZAsr0a7wQJaC8S7obgwc8T22NlU6fj9cMI3MA8ZAuzHyRABocJcZBzZB1XFkGbrNQG0rfZBnYiKbUgqTC8L1LCpJ3cDyZBvUNDGgJFLNZAoAkTeZByop1";
const VIDEO_PATH = "tess.mp4";
const VIDEO_TITLE = "Test Video";
const DESCRIPTION = "tess";

const GRAPH_API_VERSION = "v24.0";

// 1️⃣ Create Upload Session
async function createUploadSession() {
  const stats = fs.statSync(VIDEO_PATH);
  const fileName = VIDEO_PATH.split("\\").pop();
  const fileLength = stats.size;
  const fileType = "video/mp4";

  console.log(fileLength);

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${APP_ID}/uploads`;
  
  try {
    const response = await axios.post(url, null, {
      params: {
        file_name: fileName,
        file_length: fileLength,
        file_type: fileType,
        upload_phase: "start",
        access_token: ACCESS_TOKEN
      }
    });
    
    console.log("🟢 Upload Session Created:", response.data);
    return response.data.id;
  } catch (error) {
    throw new Error(`Create upload session failed: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
  }
}

// 2️⃣ Upload Video File
async function uploadVideoFile(uploadSessionId) {
  const fileBuffer = fs.readFileSync(VIDEO_PATH);
  
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${uploadSessionId}`;
  
  try {
    const response = await axios.post(url, fileBuffer, {
      headers: {
        "Authorization": `OAuth ${ACCESS_TOKEN}`,
        "file_offset": "0"
      }
    });
    
    console.log("🟡 Video File Uploaded");
    
    // Split handles dan ambil yang terakhir
    let videoHandle = response.data.h;
    // console.log("🟡 Video Handle:", videoHandle);
    if (typeof videoHandle === 'string' && videoHandle.includes('\n')) {
      const handles = videoHandle.split('\n').filter(h => h.trim());
      videoHandle = handles[handles.length - 1]; // Ambil handle terakhir
    }
    
    return videoHandle;
  } catch (error) {
    throw new Error(`Upload video file failed: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
  }
}

// 3️⃣ Publish Video to Page
async function publishVideo(videoHandle) {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PAGE_ID}/videos`;
  
  const formData = new FormData();
  formData.append("access_token", ACCESS_TOKEN);
  formData.append("title", VIDEO_TITLE);
  formData.append("description", DESCRIPTION);
  formData.append("fbuploader_video_file_chunk", videoHandle);
  
  try {
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    console.log("🔵 Video Published:", response.data);
    return response.data;
  } catch (error) {
    throw new Error(`Publish video failed: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
  }
}

async function checkVideoStatus(videoId) {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${videoId}`;
  
  try {
    const response = await axios.get(url, {
      params: {
        fields: "id,title,description,permalink_url,status",
        access_token: ACCESS_TOKEN
      }
    });
    
    console.log("📊 Video Status:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Check status failed:", error.response?.data || error.message);
  }
}

async function checkUploadSessionStatus(uploadSessionId) {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${uploadSessionId}`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        "Authorization": `OAuth ${ACCESS_TOKEN}`
      }
    });
    
    console.log("📋 Upload Session Status:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Check upload session failed:", error.response?.data || error.message);
    throw new Error(`Check upload session failed: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);
  }
}

async function main() {
  try {
    // 1. Create upload session
    const uploadSessionId = await createUploadSession();
    console.log("Upload Session ID:", uploadSessionId);
    
    // 2. Upload video file
    const videoHandle = await uploadVideoFile(uploadSessionId);
    console.log("Video Handle:", videoHandle);
    
    // 3. Publish video
    const result = await publishVideo(videoHandle);
    console.log("✅ Video published successfully!");
    console.log("📹 Video ID:", result.id);
    
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

// main();
// checkUploadSessionStatus("upload:MTphdHRhY2htZW50OjFhM2ZkMzYwLWNhNDctNDk1Ni05YmViLWEyMzQyYjU0ZTdjYT9maWxlX25hbWU9dGVzcy5tcDQmZmlsZV9sZW5ndGg9MTAzNDk3NDMmZmlsZV90eXBlPXZpZGVvJTJGbXA0?sig=ARbJ4ZoUGpABmdfePz4");
checkVideoStatus("1161058219298494");
// publishVideo("4:dGVzcy5tcDQ=:dmlkZW8vbXA0:ARZzZ0ORwMAdsPbpasXR2hu7kYYHPL-uO0_in5qIyrhMroaLmKlTQtvnhZVKx9xPPBFKR6MU4Vwsd58p6PVyBsQOqfW_Qpbwti_J8-w8LPJIRw:e:1762446249:3092606737608186:821089531095035:ARaB3uDCHOGoKrXrqYc")