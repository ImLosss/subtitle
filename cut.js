const ffmpegStatic = require('ffmpeg-static');
const { spawn } = require('child_process');

async function cutFast(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
      const ffmpegArgs = [
        '-y',
        '-i', inputFile,
        '-ss', '00:02:24',
        '-to', '00:19:18',
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
      '-y', // Overwrite file output jika ada
      '-i', inputFile, // File input
      // '-ss', '00:02:15', // Tempatkan -ss sebelum input untuk pemotongan cepat
      // '-to', '00:18:15',
      // '-vf', 'scale=1920:-1', // Atur lebar menjadi 1920, tinggi mengikuti rasio aspek
      '-r', '25', // Atur FPS menjadi 25
      '-c:v', 'h264_amf', // Gunakan GPU AMD dengan encoder h264_amf
      '-cq:v', '18', // Gunakan CRF rendah untuk kualitas tinggi (angka lebih rendah = kualitas lebih baik)
      '-rc', 'cbr', // Gunakan Variable Bitrate untuk membatasi bitrate maksimum
      '-b:v', '3M', // Bitrate target rata-rata
      '-maxrate', '3M', // Batasi bitrate maksimum hingga 5 Mbps
      '-bufsize', '6M', // Buffer size dua kali maksimum bitrate
      '-quality', 'quality',
      '-preset', 'quality', // Gunakan preset kualitas GPU
      '-c:a', 'aac',
      outputFile // File output
  ];
  
  // immortaldoctor: 1.40

  
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
//  const ffmpegArgs = [
//       '-y',
//       '-i', inputFile,
//       // '-ss', '00:03:09',             // Tempatkan -ss sebelum input untuk pemotongan cepat
//       // '-to', '00:18:10',             // Tentukan waktu akhir
//       '-c:v', 'libx264',             // Menggunakan encoder h.264
//       '-crf', '22',                  // Atur CRF untuk menjaga kualitas (20-23 ideal untuk kualitas tinggi)
//       '-preset', 'slow',             // 'slow' atau 'veryslow' untuk kompresi yang lebih baik
//       '-c:a', 'aac',                 // Re-encode audio
//       '-b:a', '128k',                // Turunkan bitrate audio ke 128k untuk ukuran lebih kecil
//       '-maxrate', '3M',              // Batasi bitrate video maksimum
//       '-bufsize', '4M',              // Buffer size untuk kontrol bitrate
//       outputFile
//     ];

cut('PW_EP200_1080P.ts', 'PW_EP200_1080P.mp4');