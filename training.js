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
function findMatchWithIndex(chSub, idSubs, tolerance = 0.5) {
    let bestMatch = null;
    let bestIndex = -1;
    let minDiff = tolerance + 1;
    
    for (let i = 0; i < idSubs.length; i++) {
        const idSub = idSubs[i];
        const diff = Math.abs(chSub.startTime - idSub.startTime);
        if (diff <= tolerance && diff < minDiff) {
            bestMatch = idSub.text;
            bestIndex = i;
            minDiff = diff;
        }
    }
    
    return { match: bestMatch, index: bestIndex };
}

// Main function
function createTrainingFile() {
    try {
        // Baca file subtitle Mandarin dan Indonesia
        const chContent = fs.readFileSync('d:/Dokumenku/Pemrograman/Node/subtitle/immortality/CN/E25.cn.srt', 'utf8');
        const idContent = fs.readFileSync('d:/Dokumenku/Pemrograman/Node/subtitle/immortality/ID/E25.id.srt', 'utf8');
        const outputPath = 'd:/Dokumenku/Pemrograman/Node/subtitle/immortality/training/EP25_training.srt';
        
        // Parse subtitle
        const chSubs = parseSRT(chContent);
        const idSubs = parseSRT(idContent);
        
        console.log(`Loaded ${chSubs.length} Chinese subtitles and ${idSubs.length} Indonesian subtitles`);
        
        // Buat file training
        let trainingContent = '';
        let matchCount = 0;
        let usedIdIndices = new Set(); // Track subtitle Indonesia yang sudah digunakan
        let unmatchedChinese = []; // Track subtitle Mandarin yang tidak cocok
        let unmatchedIndonesian = []; // Track subtitle Indonesia yang tidak cocok
        let doubleList = [];
        let double;
        
        // Proses subtitle Mandarin dan cari pasangan Indonesia
        for (const chSub of chSubs) {
            const matchResult = findMatchWithIndex(chSub, idSubs);
            const translation = matchResult.match ? matchResult.match : 'tidak ada kecocokan';
            
            if (matchResult.match) {
                matchCount++;
                usedIdIndices.add(matchResult.index); // Tandai sebagai terpakai
            } else {
                // Simpan detail subtitle Mandarin yang tidak cocok
                unmatchedChinese.push({
                    index: chSub.index,
                    timeRange: chSub.timeRange,
                    text: chSub.text
                });
            }

            if(double === translation) doubleList.push({index: chSub.index, time: chSub.timeRange.trim(), text: translation});
            double = translation;
            
            trainingContent += `${chSub.index}\n`;
            trainingContent += `${chSub.timeRange}\n`;
            trainingContent += `${chSub.text} -> ${translation}\n\n`;
        }
        
        // Tambahkan subtitle Indonesia yang tidak memiliki pasangan Mandarin
        let orphanIdCount = 0;
        for (let i = 0; i < idSubs.length; i++) {
            if (!usedIdIndices.has(i)) {
                orphanIdCount++;
                // Simpan detail subtitle Indonesia yang tidak cocok
                unmatchedIndonesian.push({
                    index: idSubs[i].index,
                    timeRange: idSubs[i].timeRange,
                    text: idSubs[i].text
                });
                
                trainingContent += `${idSubs[i].index}\n`;
                trainingContent += `${idSubs[i].timeRange}\n`;
                trainingContent += `tidak ada kecocokan -> ${idSubs[i].text}\n\n`;
            }
        }

        console.log(unmatchedIndonesian);
        fs.writeFileSync(outputPath, trainingContent, 'utf8');
        
        console.log(`File training berhasil dibuat: ${outputPath}`);
        console.log(`Total ${chSubs.length} entri Mandarin diproses`);
        console.log(`Total ${idSubs.length} entri Indonesia diproses`);
        console.log(`Kecocokan ditemukan: ${matchCount}`);
        console.log(`Mandarin tanpa pasangan: ${chSubs.length - matchCount}`);
        console.log(`Indonesia tanpa pasangan: ${orphanIdCount}`);
        
        // Tampilkan detail subtitle yang tidak cocok
        if (unmatchedChinese.length > 0) {
            console.log('\n=== SUBTITLE MANDARIN TANPA PASANGAN ===');
            unmatchedChinese.forEach(sub => {
                console.log(`Line ${sub.index} (${sub.timeRange.trim()}): ${sub.text}`);
            });
        }
        
        if (unmatchedIndonesian.length > 0) {
            console.log('\n=== SUBTITLE INDONESIA TANPA PASANGAN ===');
            unmatchedIndonesian.forEach(sub => {
                console.log(`Line ${sub.index} (${sub.timeRange.trim()}): ${sub.text}`);
            });
        }

        if (doubleList.length > 0) {
            console.log('\n=== SUBTITLE MANDARIN DENGAN KECOCOKAN GANDA ===');
            doubleList.forEach(sub => {
                console.log(`Line ${sub.index} (${sub.time}): ${sub.text}`);
            });
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Jalankan script
createTrainingFile();
