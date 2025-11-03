const ffmpegStatic = require('ffmpeg-static');
const { spawn } = require('child_process');

async function cutFast(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
      const ffmpegArgs = [
        '-y',
        '-i', inputFile,
        '-ss', '00:01:00', 
        '-to', '00:06:01',
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
    // const ffmpegArgs = [
    //   '-y', 
    //   '-i', inputFile, 
    //   // '-ss', '00:02:17', 
    //   '-to', '00:20:08',
    //   '-vf', 'scale=1920:-2', 
    //   // '-pix_fmt', 'yuv420p',
    //   // '-r', '25', 
    //   '-c:v', 'h264_amf', 
    //   '-cq:v', '18', 
    //   '-rc', 'cbr', 
    //   '-b:v', '6M',
    //   '-maxrate', '6M',
    //   '-bufsize', '12M',
    //   '-quality', 'quality',
    //   '-preset', 'quality', 
    //   '-c:a', 'aac',
    //   outputFile
    // ];

    const ffmpegArgs = [
      '-y', // Overwrite file output jika ada
      '-i', inputFile, // File input
      // '-ss', '00:02:45', 
      '-to', '00:18:43',
      '-vf', "scale=1920:-1",
      // '-pix_fmt', 'yuv420p',
      '-c:v', 'libx264',
      '-crf', '20',
      // '-b:v', '2M', // Bitrate target rata-rata
      '-maxrate', '7M', // Batasi bitrate maksimum hingga 5 Mbps
      '-bufsize', '14M', // Buffer size dua kali maksimum bitrate
      '-preset', 'fast',
      '-c:a', 'copy', 
      outputFile // File output
    ];
  
    // Jalankan ffmpeg dengan argumen yang telah ditentukan
    const ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

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

async function extractSubtitle(inputFile, subtitleStreamIndex, outputFile, forceSrt = false) {
  return new Promise((resolve, reject) => {
    const mapSpecifier = `0:s:${subtitleStreamIndex}`;
    const args = [
      '-y',
      '-i', inputFile,
      '-map', mapSpecifier
    ];
    if (forceSrt) {
      args.push('-c:s', 'srt');
    } else {
      args.push('-c:s', 'copy');
    }
    args.push(outputFile);
    const proc = spawn(ffmpegStatic, args);
    proc.stderr.on('data', d => console.log(`Process: ${d}`));
    proc.on('close', code => {
      if (code === 0) resolve(`Subtitle diekstrak ke ${outputFile}`);
      else reject(new Error(`ffmpeg exit code ${code}`));
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

cut('tess.mp4', 'output.mp4');
// extractSubtitle('06V2_4K.mp4', 0, 'TOMB_EP6_INDO.srt', true);