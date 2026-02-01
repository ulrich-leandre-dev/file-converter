const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const { PDFDocument } = require('pdf-lib');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');

class FileConverter {
  
  // Conversion d'images
  async convertImage(inputPath, outputPath, targetFormat) {
    const validFormats = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff'];
    
    if (!validFormats.includes(targetFormat.toLowerCase())) {
      throw new Error(`Format non supporté: ${targetFormat}`);
    }

    await sharp(inputPath)
      .toFormat(targetFormat)
      .toFile(outputPath);
  }

  // Conversion audio/vidéo avec ffmpeg
  async convertMedia(inputPath, outputPath, targetFormat) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat(targetFormat)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  // Conversion de documents
  async convertDocument(inputPath, outputPath, targetFormat) {
    const ext = path.extname(inputPath).toLowerCase();
    
    // DOCX vers TXT
    if (ext === '.docx' && targetFormat === 'txt') {
      const result = await mammoth.extractRawText({ path: inputPath });
      await fs.writeFile(outputPath, result.value);
      return;
    }

    // TXT vers PDF basique
    if (ext === '.txt' && targetFormat === 'pdf') {
      const content = await fs.readFile(inputPath, 'utf-8');
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { height } = page.getSize();
      
      page.drawText(content.substring(0, 2000), {
        x: 50,
        y: height - 50,
        size: 12,
      });
      
      const pdfBytes = await pdfDoc.save();
      await fs.writeFile(outputPath, pdfBytes);
      return;
    }

    throw new Error('Conversion de documents non supportée pour ce type');
  }

  // Router principal
  async convert(inputPath, outputPath, targetFormat) {
    const ext = path.extname(inputPath).toLowerCase().substring(1);
    const target = targetFormat.toLowerCase();

    // Déterminer le type de conversion
    const imageFormats = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff'];
    const audioFormats = ['mp3', 'wav', 'ogg', 'flac', 'm4a'];
    const videoFormats = ['mp4', 'avi', 'mkv', 'mov', 'webm'];
    const docFormats = ['pdf', 'docx', 'txt', 'html'];

    if (imageFormats.includes(ext) && imageFormats.includes(target)) {
      await this.convertImage(inputPath, outputPath, target);
    } 
    else if ((audioFormats.includes(ext) && audioFormats.includes(target)) ||
             (videoFormats.includes(ext) && videoFormats.includes(target))) {
      await this.convertMedia(inputPath, outputPath, target);
    }
    else if (docFormats.includes(ext) && docFormats.includes(target)) {
      await this.convertDocument(inputPath, outputPath, target);
    }
    else {
      throw new Error(`Conversion ${ext} → ${target} non supportée`);
    }
  }
}

module.exports = new FileConverter();
