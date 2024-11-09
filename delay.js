const fs = require('fs');

// Fungsi untuk menambahkan delay pada waktu di file SRT
function addDelayToSRT(inputSRT, outputSRT, delay) {
    const delayInSeconds = delay / 1000; // Konversi delay ke detik
    const srtContent = fs.readFileSync(inputSRT, 'utf8');
    
    const modifiedContent = srtContent.split('\n').map(line => {
        const timeMatch = line.match(/(\d{2}:\d{2}:\d{2},\d{3})/);
        if (timeMatch) {
            // Dapatkan waktu awal dan akhir
            const startTime = timeMatch[0];
            const endTime = line.split(' --> ')[1].split('\n')[0];
            
            // Tambahkan delay
            const newStartTime = addDelay(startTime, delayInSeconds);
            const newEndTime = addDelay(endTime, delayInSeconds);
            
            // Ganti waktu dengan yang baru
            return line.replace(startTime, newStartTime).replace(endTime, newEndTime);
        }
        return line; // Kembali tanpa perubahan jika tidak ada waktu
    }).join('\n');

    fs.writeFileSync(outputSRT, modifiedContent);
}

// Fungsi untuk menambahkan delay ke waktu
function addDelay(timeString, delay) {
    const parts = timeString.split(/[:,]/); // Pisahkan jam, menit, detik, milidetik
    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    const seconds = parseInt(parts[2]);
    const milliseconds = parseInt(parts[3]);

    // Tambahkan delay
    let totalMilliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds + (delay * 1000);
    
    // Hitung kembali jam, menit, detik, dan milidetik
    const newHours = Math.floor(totalMilliseconds / 3600000);
    totalMilliseconds %= 3600000;
    const newMinutes = Math.floor(totalMilliseconds / 60000);
    totalMilliseconds %= 60000;
    const newSeconds = Math.floor(totalMilliseconds / 1000);
    const newMilliseconds = totalMilliseconds % 1000;

    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}:${String(newSeconds).padStart(2, '0')},${String(newMilliseconds).padStart(3, '0')}`;
}

// Contoh penggunaan
const inputSRT = 'sub.srt'; // Nama file input
const outputSRT = 'sub_modified.srt'; // Nama file output dengan delay
const delay = 200; // Delay dalam milidetik

addDelayToSRT(inputSRT, outputSRT, delay);