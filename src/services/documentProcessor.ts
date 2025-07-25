import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import Tesseract from 'tesseract.js';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ProcessedDocument {
  fileName: string;
  content: string;
  metadata: {
    fileType: string;
    fileSize: number;
    createdDate?: Date;
    extractedDate: Date;
  };
}

export class DocumentProcessor {
  async processFile(file: File): Promise<ProcessedDocument> {
    const fileType = this.getFileType(file);
    let content = '';

    try {
      switch (fileType) {
        case 'pdf':
          content = await this.processPDF(file);
          break;
        case 'docx':
        case 'doc':
          content = await this.processWord(file);
          break;
        case 'txt':
        case 'html':
          content = await this.processText(file);
          break;
        case 'json':
          content = await this.processJSON(file);
          break;
        case 'csv':
          content = await this.processCSV(file);
          break;
        case 'xlsx':
        case 'xls':
          content = await this.processExcel(file);
          break;
        case 'image':
          content = await this.processImage(file);
          break;
        default:
          throw new Error(`Unsupported file type: ${fileType}`);
      }

      return {
        fileName: file.name,
        content,
        metadata: {
          fileType,
          fileSize: file.size,
          createdDate: file.lastModified ? new Date(file.lastModified) : undefined,
          extractedDate: new Date()
        }
      };
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      throw error;
    }
  }

  private getFileType(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(extension)) {
      return 'image';
    }
    
    return extension;
  }

  private async processPDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        text += pageText + '\n';
      }
      
      return text;
    } catch (error) {
      console.error('PDF processing failed:', error);
      return `[PDF file: ${file.name} - Could not extract text]`;
    }
  }

  private async processWord(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }

  private async processText(file: File): Promise<string> {
    return await file.text();
  }

  private async processJSON(file: File): Promise<string> {
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      
      // Handle Apple Notes export format
      if (json.notes && Array.isArray(json.notes)) {
        return json.notes
          .map((note: any) => `${note.title || 'Untitled'}: ${note.content || ''}`)
          .join('\n\n');
      }
      
      // Generic JSON to text conversion
      return JSON.stringify(json, null, 2);
    } catch (error) {
      return text; // Return raw text if JSON parsing fails
    }
  }

  private async processCSV(file: File): Promise<string> {
    const text = await file.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        complete: (results) => {
          // Convert CSV data to readable text
          const content = results.data
            .map((row: any) => {
              return Object.entries(row)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
            })
            .join('\n');
          resolve(content);
        },
        error: (error: any) => reject(error)
      });
    });
  }

  private async processExcel(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    let content = '';
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      
      content += `Sheet: ${sheetName}\n`;
      content += (jsonData as any[][])
        .map((row: any[]) => row.join('\t'))
        .join('\n');
      content += '\n\n';
    });
    
    return content;
  }

  private async processImage(file: File): Promise<string> {
    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: m => console.log(m)
      });
      return text;
    } catch (error) {
      console.error('OCR processing failed:', error);
      return `[Image file: ${file.name} - OCR processing failed]`;
    }
  }

  async processMultipleFiles(files: File[]): Promise<ProcessedDocument[]> {
    const results = await Promise.allSettled(
      files.map(file => this.processFile(file))
    );

    return results
      .filter((result): result is PromiseFulfilledResult<ProcessedDocument> => 
        result.status === 'fulfilled'
      )
      .map(result => result.value);
  }
}