import fs from "fs";
import fetch from "node-fetch";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

const PAGE_ID = "821089531095035";
const ACCESS_TOKEN = "EAAr8tZA4GbfoBP5uYI655LUFWPtVchyEG1IfZCD2ZCh6WPDtDL5ZAT8U3lqnTGlTTfZA85TBvfVYnfbPZAZBicdqnRN2rzQRvSGzlueht4H44EaUamZB17bDQbz06ZBQjIo91KwIMvJmYUyWiJTjq2cPkcZBYjZBYA0bYdvqOp0kJq6AD9zbsQXtXfMu99RAH7vjBweX3Qy";
const VIDEO_PATH = "tess.mp4";
const OUTPUT_VIDEO = "tess_reels.mp4";
const DESCRIPTION = "tess";

const GRAPH_API_VERSION = "v24.0";

// Konversi video landscape ke portrait 9:16 untuk Reels dengan background hitam
async function convertToReelsFormat() {
  console.log("🎬 Converting video from 1920x1080 to 1080x1920...");
  
  const command = `ffmpeg -i "${VIDEO_PATH}" -vf "scale=1080:-1,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -y "${OUTPUT_VIDEO}"`;
  
  try {
    await execPromise(command);
    console.log("✅ Video converted to 1080x1920 (9:16)");
    return OUTPUT_VIDEO;
  } catch (error) {
    throw new Error(`FFmpeg conversion failed: ${error.message}`);
  }
}

async function startUpload() {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PAGE_ID}/video_reels`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      upload_phase: "start",
      access_token: ACCESS_TOKEN
    })
  });
  const data = await res.json();
  if (data.error) throw new Error(`Start upload failed: ${JSON.stringify(data)}`);
  console.log("🟢 Start:", data);
  return data;
}

async function transferUpload(url, videoPath) {
  const fileBuffer = fs.readFileSync(videoPath);
  const fileSize = fileBuffer.length;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `OAuth ${ACCESS_TOKEN}`,
      "offset": "0",
      "file_size": fileSize.toString()
    },
    body: fileBuffer
  });
  
  const data = await res.json();
  if (data.error) throw new Error(`Transfer upload failed: ${JSON.stringify(data)}`);
  console.log("🟡 Transfer:", data);
  return data;
}

async function finishUpload(video_id) {
  const params = new URLSearchParams({
    access_token: ACCESS_TOKEN,
    video_id: video_id,
    upload_phase: "finish",
    video_state: "PUBLISHED",
    description: DESCRIPTION
  });

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${PAGE_ID}/video_reels?${params}`;
  const res = await fetch(url, {
    method: "POST"
  });
  const data = await res.json();
  if (data.error) throw new Error(`Finish upload failed: ${JSON.stringify(data)}`);
  console.log("🔵 Finish:", data);
  return data;
}

async function checkStatus(video_id) {
  const params = new URLSearchParams({
    fields: "status",
    access_token: ACCESS_TOKEN
  });

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${video_id}?${params}`;
  const res = await fetch(url, {
    method: "GET"
  });
  const data = await res.json();
  if (data.error) throw new Error(`Check status failed: ${JSON.stringify(data)}`);
  console.log("🔍 Status:", JSON.stringify(data, null, 2));
  return data;
}

// MAIN
async function uploadReel() {
  let convertedVideo = null;
  try {
    // 1. Konversi video ke format Reels
    convertedVideo = await convertToReelsFormat();
    
    // 2. Start upload session
    console.log("🔹 Starting upload session …");
    const startData = await startUpload();
    console.log("Video session started with ID:", startData.video_id);

    // 3. Upload video file
    console.log("🔹 Uploading video file …");
    await transferUpload(startData.upload_url, convertedVideo);
    console.log("File upload complete.");

    // 4. Finish & publish
    console.log("🔹 Finishing and publishing …");
    const result = await finishUpload(startData.video_id);
    console.log("✅ Reel published successfully!", result);
    
    // 5. Check status
    console.log("🔹 Checking video status …");
    await checkStatus(startData.video_id);
    
  } catch (err) {
    console.error("❌ Error during uploadReel:", err.message);
  } finally {
    // Cleanup: hapus file hasil konversi
    if (convertedVideo && fs.existsSync(convertedVideo)) {
      fs.unlinkSync(convertedVideo);
      console.log("🗑️ Cleaned up temporary file");
    }
  }
}

checkStatus("1208912961286325");
// uploadReel();