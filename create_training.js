const fs = require('fs');
const path = require('path');

// Fungsi untuk parse file SRT yang lebih robust
function parseSRT(content) {
    const subtitles = [];
    const blocks = content.split(/\n\s*\n/);
    
    for (const block of blocks) {
        const lines = block.trim().split('\n');
        if (lines.length >= 3) {
            const index = parseInt(lines[0]);
            if (isNaN(index)) continue;
            
            const timeRange = lines[1];
            if (!timeRange.includes('-->')) continue;
            
            const text = lines.slice(2).join('\n').trim();
            
            // Parse timestamp untuk perbandingan
            const [start] = timeRange.split(' --> ');
            const timeParts = start.split(':');
            if (timeParts.length === 3) {
                const [hours, minutes, secsPart] = timeParts;
                const [seconds, milliseconds] = secsPart.split(',');
                const startTime = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 1000;
                
                subtitles.push({
                    index,
                    timeRange,
                    text,
                    startTime
                });
            }
        }
    }
    
    return subtitles;
}

// Fungsi untuk mencari kecocokan berdasarkan timestamp dengan toleransi
function findMatch(chSub, idSubs, tolerance = 3) {
    let bestMatch = null;
    let minDiff = tolerance + 1;
    
    for (const idSub of idSubs) {
        const diff = Math.abs(chSub.startTime - idSub.startTime);
        if (diff <= tolerance && diff < minDiff) {
            bestMatch = idSub.text;
            minDiff = diff;
        }
    }
    
    return bestMatch;
}

// Main function
function createTrainingFile() {
    try {
        // Baca file subtitle Mandarin dan Indonesia
        const chContent = fs.readFileSync('d:/Dokumenku/Pemrograman/Node/subtitle/sl/101_ch.srt', 'utf8');
        const idContent = fs.readFileSync('d:/Dokumenku/Pemrograman/Node/subtitle/sl/101_id.srt', 'utf8');
        
        // Parse subtitle
        const chSubs = parseSRT(chContent);
        const idSubs = parseSRT(idContent);
        
        console.log(`Loaded ${chSubs.length} Chinese subtitles and ${idSubs.length} Indonesian subtitles`);
        
        // Buat file training
        let trainingContent = '';
        let matchCount = 0;
        
        for (const chSub of chSubs) {
            const match = findMatch(chSub, idSubs);
            const translation = match ? match : 'tidak ada kecocokan';
            
            if (match) matchCount++;
            
            trainingContent += `${chSub.index}\n`;
            trainingContent += `${chSub.timeRange}\n`;
            trainingContent += `${chSub.text} -> ${translation}\n\n`;
        }
        
        // Simpan file training
        const outputPath = 'd:/Dokumenku/Pemrograman/Node/subtitle/sl/101_training.srt';
        fs.writeFileSync(outputPath, trainingContent, 'utf8');
        
        console.log(`File training berhasil dibuat: ${outputPath}`);
        console.log(`Total ${chSubs.length} entri diproses`);
        console.log(`Kecocokan ditemukan: ${matchCount}`);
        console.log(`Tidak ada kecocokan: ${chSubs.length - matchCount}`);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Jalankan script
createTrainingFile();
