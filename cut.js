const ffmpegStatic = require('ffmpeg-static');
const { spawn } = require('child_process');

async function cutFast(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
      const ffmpegArgs = [
        '-y',
        '-i', inputFile,
        '-ss', '00:03:09',
        '-to', '00:19:20',
        '-c', 'copy',
        outputFile
      ];
  
      // Jalankan ffmpeg dengan argumen yang telah ditentukan
      const ffmpegProcess = spawn(ffmpegStatic, ffmpegArgs);
  
      ffmpegProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });
  
      ffmpegProcess.stderr.on('data', (data) => {
        console.log(`Process: ${data}`);
      });

      ffmpegProcess.stderr.on('error', (err) => {
        console.log(err)
      });
  
      ffmpegProcess.on('close', (code) => {
        if (code === 0) {
          resolve('Konversi MP4A ke MP3 selesai.');
        } else {
          reject(new Error(`Proses ffmpeg berakhir dengan kode error ${code}`));
        }
      });
    });
}

async function cut(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    const ffmpegArgs = [
      '-y',
      '-i', inputFile,
      '-ss', '00:03:09',             // Tempatkan -ss sebelum input untuk pemotongan cepat
      '-to', '00:18:10',             // Tentukan waktu akhir
      '-c:v', 'libx264',             // Menggunakan encoder h.264
      '-crf', '22',                  // Atur CRF untuk menjaga kualitas (20-23 ideal untuk kualitas tinggi)
      '-preset', 'slow',             // 'slow' atau 'veryslow' untuk kompresi yang lebih baik
      '-c:a', 'aac',                 // Re-encode audio
      '-b:a', '128k',                // Turunkan bitrate audio ke 128k untuk ukuran lebih kecil
      '-maxrate', '3M',              // Batasi bitrate video maksimum
      '-bufsize', '4M',              // Buffer size untuk kontrol bitrate
      outputFile
    ];

    // Jalankan ffmpeg dengan argumen yang telah ditentukan
    const ffmpegProcess = spawn(ffmpegStatic, ffmpegArgs);

    ffmpegProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    ffmpegProcess.stderr.on('data', (data) => {
      console.log(`Process: ${data}`);
    });

    ffmpegProcess.stderr.on('error', (err) => {
      console.log(err)
    });

    ffmpegProcess.on('close', (code) => {
      if (code === 0) {
        resolve('Konversi MP4A ke MP3 selesai.');
      } else {
        reject(new Error(`Proses ffmpeg berakhir dengan kode error ${code}`));
      }
    });
  });
}

cut('input.ts', 'cut2.mp4');