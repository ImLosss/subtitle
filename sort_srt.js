const fs = require('fs');

function fixSrtOrder(inputFile, outputFile) {
    // Baca file .srt dan pisahkan berdasarkan blok (dipisahkan dengan 2 newline)
    const data = fs.readFileSync(inputFile, 'utf-8').trim().split('\n\n');

    console.log(data);

    // Parsing setiap blok subtitle ke dalam objek
    const subtitles = data.map((block) => {
        const lines = block.split('\n');
        const timestamp = lines[1]; // Timestamp
        const text = lines.slice(2).join('\n'); // Teks subtitle
        return { timestamp, text };
    });

    // Urutkan subtitle berdasarkan waktu mulai pada timestamp
    subtitles.sort((a, b) => {
        const timeToMs = (timestamp) => {
            const [start] = timestamp.split(' --> '); // Ambil waktu mulai
            const [h, m, s] = start.split(/[:,]/); // Pecah menjadi jam, menit, detik
            return (parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseFloat(s)) * 1000; // Konversi ke milidetik
        };
        return timeToMs(a.timestamp) - timeToMs(b.timestamp);
    });

    // Hilangkan duplikat berdasarkan timestamp dan teks
    const uniqueSubtitles = subtitles.filter((sub, index, self) => {
        return (
            index ===
            self.findIndex(
                (t) =>
                    t.timestamp === sub.timestamp &&
                    t.text === sub.text // Periksa duplikat berdasarkan timestamp dan teks
            )
        );
    });

    // Perbarui nomor urut untuk setiap subtitle
    const fixedSubtitles = uniqueSubtitles.map((sub, index) => {
        return `${index + 1}\n${sub.timestamp}\n${sub.text}`;
    }).join('\n\n');

    // Simpan hasil ke file baru atau ganti file lama
    fs.writeFileSync(outputFile, fixedSubtitles, 'utf-8');
    console.log(`File .srt berhasil diperbaiki, disortir, dan disimpan ke ${outputFile}`);
}

// Ubah nama file sesuai dengan kebutuhan
fixSrtOrder('cut_indo.srt', 'cut_indo_sortered.srt');
