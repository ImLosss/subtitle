const fs = require('fs');
const path = require('path');

/**
 * Membersihkan file SRT dengan menghapus karakter dari typo map dan menghapus line kosong
 * @param {string} srtFilePath - Path ke file SRT
 * @param {string} typoMapPath - Path ke file typo map JSON
 * @param {string} outputPath - Path untuk output file yang sudah dibersihkan (optional)
 * @returns {string} - Konten SRT yang sudah dibersihkan
 */
function cleanSRT(srtFilePath, typoMapPath, outputPath = null) {
    try {
        // Baca file SRT
        const srtContent = fs.readFileSync(srtFilePath, 'utf8');
        
        // Baca typo map
        const typoMap = JSON.parse(fs.readFileSync(typoMapPath, 'utf8'));
        
        // Bersihkan konten SRT
        const cleanedContent = processSRTContent(srtContent, typoMap);
        
        // Simpan ke file output jika path disediakan
        if (outputPath) {
            fs.writeFileSync(outputPath, cleanedContent, 'utf8');
            console.log(`File SRT yang sudah dibersihkan disimpan di: ${outputPath}`);
        }
        
        return cleanedContent;
    } catch (error) {
        console.error('Error membersihkan SRT:', error.message);
        throw error;
    }
}

/**
 * Memproses konten SRT dengan menerapkan typo map dan menghapus line kosong
 * @param {string} content - Konten SRT asli
 * @param {object} typoMap - Object mapping untuk mengganti/menghapus text
 * @returns {string} - Konten SRT yang sudah dibersihkan
 */
function processSRTContent(content, typoMap) {
    let cleanedContent = content;
    
    // Terapkan typo map untuk mengganti/menghapus karakter
    Object.keys(typoMap).forEach(typo => {
        const replacement = typoMap[typo];
        const regex = new RegExp(escapeRegExp(typo), 'gi');
        cleanedContent = cleanedContent.replace(regex, replacement);
    });
    
    // Split menjadi blocks (berdasarkan double newline)
    const blocks = cleanedContent.split(/\n\s*\n/);
    
    // Filter dan bersihkan setiap block
    const cleanedBlocks = blocks
        .map(block => {
            const lines = block.trim().split('\n');
            
            // Skip jika block kosong
            if (lines.length === 0) return null;
            
            // Untuk SRT, format umum:
            // Line 1: Nomor sequence
            // Line 2: Timestamp
            // Line 3+: Subtitle text
            
            if (lines.length < 3) return null;
            
            const sequenceNumber = lines[0].trim();
            const timestamp = lines[1].trim();
            const subtitleLines = lines.slice(2);
            
            // Bersihkan subtitle lines dari whitespace dan line kosong
            const cleanedSubtitleLines = subtitleLines
                .map(line => line.trim())
                .filter(line => line.length > 0);
            
            // Jika tidak ada subtitle text yang tersisa, skip block ini
            if (cleanedSubtitleLines.length === 0) return null;
            
            // Gabungkan kembali block
            return [sequenceNumber, timestamp, ...cleanedSubtitleLines].join('\n');
        })
        .filter(block => block !== null);
    
    // Gabungkan semua blocks yang valid
    return cleanedBlocks.join('\n\n') + '\n';
}

/**
 * Escape karakter special untuk regex
 * @param {string} string - String yang akan di-escape
 * @returns {string} - String yang sudah di-escape
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Fungsi helper untuk membersihkan semua file SRT dalam folder
 * @param {string} folderPath - Path ke folder yang berisi file SRT
 * @param {string} typoMapPath - Path ke file typo map JSON
 * @param {string} outputFolder - Folder untuk menyimpan file yang sudah dibersihkan
 */
function cleanAllSRTInFolder(folderPath, typoMapPath, outputFolder) {
    try {
        const files = fs.readdirSync(folderPath);
        const srtFiles = files.filter(file => path.extname(file).toLowerCase() === '.srt');
        
        if (!fs.existsSync(outputFolder)) {
            fs.mkdirSync(outputFolder, { recursive: true });
        }
        
        srtFiles.forEach(file => {
            const inputPath = path.join(folderPath, file);
            const outputPath = path.join(outputFolder, `cleaned_${file}`);
            
            console.log(`Membersihkan: ${file}`);
            cleanSRT(inputPath, typoMapPath, outputPath);
        });
        
        console.log(`Selesai membersihkan ${srtFiles.length} file SRT`);
    } catch (error) {
        console.error('Error membersihkan folder SRT:', error.message);
        throw error;
    }
}

// Membersihkan satu file SRT
const inputFile = 'RI_EP111d.srt';
const typoMapFile = 'd:/Dokumenku/Pemrograman/Node/subtitle/vse/resources/backend/configs/typoMap.json';
const outputFile = 'cleaned_subtitle.srt';

const cleanedContent = cleanSRT(inputFile, typoMapFile, outputFile);
console.log('SRT berhasil dibersihkan!');

module.exports = {
    cleanSRT,
    processSRTContent,
    cleanAllSRTInFolder
};