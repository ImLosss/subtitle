const ffmpegStatic = require('ffmpeg-static');
const { spawn } = require('child_process');

async function burnSubtitle(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    const ffmpegArgs = [
      '-y',
      '-i', inputFile,
      '-c:v', 'libx264',
      '-crf', '35',
      '-preset', 'slow',
      '-vf', '-vf', `subtitles=btth/karaoke_ext.ass,
        drawtext=text='DongWorld':font=Verdana:fontsize=30:fontcolor=white@0.5:x=15:y=15`,
      '-c:a', 'copy',  
      '-maxrate', '2M', 
      '-bufsize', '4M', 
      outputFile
    ];

    // btth : 25
    // renegade : 40

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

async function burnSubtitleGPU(inputFile, outputFile) {
  return new Promise((resolve, reject) => {
    const ffmpegArgs = [
      '-y', // Overwrite file output jika ada
      '-i', inputFile, // File input
      // '-ss', '00:05:00',
      // '-to', '00:20:01',
      '-c:v', 'h264_amf', // Gunakan GPU AMD dengan encoder h264_amf
      '-cq:v', '18', // Gunakan CRF rendah untuk kualitas tinggi (angka lebih rendah = kualitas lebih baik)
      '-rc', 'cbr', // Gunakan Variable Bitrate untuk membatasi bitrate maksimum
      '-b:v', '4M', // Bitrate target rata-rata
      '-maxrate', '4M', // Batasi bitrate maksimum hingga 4 Mbps
      '-bufsize', '8M', // Buffer size dua kali maksimum bitrate
      '-quality', 'quality', // Prioritaskan kualitas
      '-preset', 'quality', // Gunakan preset kualitas GPU
      // '-vf', `subtitles=output.srt:force_style='FontName=ArialMT,Bold=1,FontSize=16,PrimaryColour=&HFFFFFF&,Outline=0.5,MarginV=25',
      // scale=1920:-1
      '-vf', "subtitles=btth/op4.ass,drawtext=text='DongWorld':font=Verdana:fontsize=30:fontcolor=white@0.5:x=15:y=15",
      '-c:a', 'copy', 
      outputFile // File output
    ];
    // btth : 25
    // renegade : 40
    //pw : 33

    // const ffmpegArgs = [
    //   '-y', // Overwrite file output jika ada
    //   '-i', inputFile, // File input
    //   // '-ss', '01:18:40',
    //   // '-to', '00:20:01',
    //   // scale=-1:1080
    //   '-vf', "subtitles=pv.ass,drawtext=text='DongWorld':font=Verdana:fontsize=25:fontcolor=white@0.5:x=15:y=15",
    //   // '-pix_fmt', 'yuv420p',
    //   '-c:v', 'libx264',
    //   '-crf', '25',
    //   // '-b:v', '2M', // Bitrate target rata-rata
    //   '-maxrate', '5M', // Batasi bitrate maksimum hingga 4 Mbps
    //   '-bufsize', '10M', // Buffer size dua kali maksimum bitrate
    //   '-preset', 'fast',
    //   '-c:a', 'copy', 
    //   outputFile // File output
    // ];

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


async function embedSubtitle(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
      const ffmpegArgs = [
        '-y',
        '-i', inputFile,          // Input video (yang sudah ada subtitle Chinese)
        '-i', '181.ass',   // Subtitle baru (format SRT)
        '-map', '0:v',            // Ambil video dari input pertama
        '-map', '0:a',            // Ambil audio dari input pertama
        '-map', '1:s',            // Ambil subtitle dari input kedua (file SRT)
        '-c:v', 'copy',           // Copy video tanpa re-encode
        '-c:a', 'copy',           // Copy audio tanpa re-encode
        // '-c:s', 'mov_text',       // Format subtitle untuk MP4 (jika output MP4)
        '-c:s', 'ass',          // Jika output MKV/WebM dan ingin format ASS
        '-disposition:s:0', 'default',  // Set subtitle baru sebagai default
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

async function extractSrt(inputFile) {
    return new Promise((resolve, reject) => {
        const ffmpegArgs = [
            '-y',
            '-i', inputFile,
            '-map', '0:s:0',  // Pilih stream subtitle dari input
            'output.srt'      // Nama file output untuk subtitle
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
   

// // with logo
// const ffmpegArgs = [
//   '-y', // Overwrite file output jika ada
//   '-i', inputFile, // File input
//   '-i', 'logo.png', // File logo PNG
//   '-ss', '00:00:20', // Tempatkan -ss sebelum input untuk pemotongan cepat
//   '-to', '00:00:30',
//   '-filter_complex', '[1:v]scale=100:-1[logo];[0:v][logo]overlay=10:10', // Atur ukuran logo menjadi 100x100 dan tempatkan di posisi (10,10)
//   '-c:v', 'h264_amf', // Gunakan GPU AMD dengan encoder h264_amf
//   '-cq:v', '18', // Gunakan CRF rendah untuk kualitas tinggi
//   '-rc', 'cbr', // Gunakan Variable Bitrate untuk membatasi bitrate maksimum
//   '-b:v', '3M', // Bitrate target rata-rata
//   '-maxrate', '3M', // Batasi bitrate maksimum
//   '-bufsize', '6M', // Buffer size dua kali maksimum bitrate
//   '-quality', 'quality', // Prioritaskan kualitas
//   '-preset', 'quality', // Gunakan preset kualitas GPU
//   '-c:a', 'copy', // Salin audio tanpa perubahan
//   outputFile // File output
// ];

burnSubtitleGPU('BTTH_EP174.mp4', 'BTTH_EP174_INDO.mp4')