const ffmpegStatic = require('ffmpeg-static');
const { spawn } = require('child_process');

async function burnSubtitle(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
      const ffmpegArgs = [
        '-y',
        '-i', inputFile,
        '-c:v', 'libx264',
        '-crf', '23',
        '-preset', 'slow',
        '-vf', `subtitles=btth_indo_sortered.srt:force_style='FontName=Verdana,FontSize=18,PrimaryColour=&HFFFFFF&,Outline=0.5,MarginV=25', \
        drawtext=text='DongWorld':font=Verdana:fontsize=30:fontcolor=white@0.5:x=15:y=15`,
        '-c:a', 'copy',  
        '-maxrate', '2M', 
        '-bufsize', '3M', 
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

async function embedSubtitle(inputFile, outputFile) {
    return new Promise((resolve, reject) => {
      const ffmpegArgs = [
        '-y',
        '-i', inputFile,
        '-i', 'btth_indo.srt',            // Tambahkan subtitle sebagai input kedua
        '-c:v', 'copy',                  // Copy video tanpa re-encoding
        '-c:a', 'copy',                  // Copy audio tanpa re-encoding
        '-c:s', 'mov_text',              // Encode subtitle sebagai stream terpisah
        '-metadata:s:s:0', 'language=eng', // Set bahasa subtitle
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

burnSubtitle('cut.mp4', 'btth_indo.mp4')