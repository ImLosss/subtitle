const fs = require('fs');

function fixSrtOrder(inputFile, outputFile) {
    // Baca file .srt dan pisahkan baris-barisnya
    const data = fs.readFileSync(inputFile, 'utf-8').trim().split('\n\n');
  
    // Parsing setiap blok subtitle ke dalam objek
    const subtitles = data.map((block) => {
        const lines = block.split('\n');
        const number = parseInt(lines[0], 10);
        const timestamp = lines[1];
        const text = lines.slice(2).join('\n');
        return { number, timestamp, text };
    });
  
    // Urutkan subtitle berdasarkan timestamp
    subtitles.sort((a, b) => {
        const timeToMs = (timestamp) => {
            const [start, end] = timestamp.split(' --> ');
            return new Date('1970-01-01T' + start.replace(',', '.') + 'Z').getTime();
        };
        return timeToMs(a.timestamp) - timeToMs(b.timestamp);
    });
  
    // Perbarui nomor urut untuk setiap subtitle
    const fixedSubtitles = subtitles.map((sub, index) => {
        return `${index + 1}\n${sub.timestamp}\n${sub.text}`;
    }).join('\n\n');
  
    // Simpan hasil ke file baru atau ganti file lama
    fs.writeFileSync(outputFile, fixedSubtitles, 'utf-8');
    console.log(`File .srt berhasil diperbaiki dan disimpan ke ${outputFile}`);
}

fixSrtOrder('btth_indo.srt', 'btth_indo_sortered.srt');