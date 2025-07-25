# Sensemaking Map Webapp

A web application that automatically generates chronological "sensemaking maps" from uploaded documents, helping students and professionals visualize their career journey, projects, and aspirations.

## 🚀 Features

### Core Functionality
- **Multi-format Document Processing**: Supports PDFs, Word docs, text files, HTML, JSON, CSV, Excel, and images with OCR
- **AI-Powered Content Analysis**: Automatically extracts roles, projects, education, skills, goals, and interests
- **Interactive Visual Mapping**: Dynamic node-based visualization with drag-and-drop editing
- **Multiple Export Formats**: Figma CSV, JSON data, timeline CSV, and text reports
- **Privacy-First Design**: Client-side processing options to keep your data secure

### Document Types Supported
- **PDFs**: Reports, CVs, academic papers
- **Text Files**: Journal entries, notes
- **Word Documents**: .doc and .docx files
- **HTML Files**: Notion exports, Substack drafts
- **JSON Files**: Apple Notes exports, structured data
- **CSV/Excel Files**: Goodreads exports, data exports
- **Images**: Screenshots, scanned documents (with OCR)

### Node Types Extracted
- **Roles**: Job titles, positions, career milestones
- **Projects**: Work projects, personal initiatives, achievements
- **Education**: Degrees, courses, certifications
- **Skills**: Technologies, frameworks, competencies
- **Goals**: Future aspirations, planned objectives
- **Interests**: Hobbies, side projects, personal pursuits

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup
1. Clone or download the project files
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📖 Usage Guide

### 1. Upload Documents
- Drag and drop files or click to select
- Upload multiple documents at once
- Supported formats: PDF, DOCX, TXT, HTML, JSON, CSV, XLSX, images

### 2. Processing
- Documents are automatically processed and analyzed
- Content is extracted and parsed for relevant information
- AI analysis identifies key entities and relationships

### 3. Interactive Map
- View your generated career journey map
- Nodes are color-coded by type:
  - 🟢 **Green**: Past roles and experiences
  - 🔵 **Blue**: Projects and achievements
  - 🟣 **Purple**: Education and learning
  - 🟡 **Yellow**: Skills and technologies
  - 🌸 **Pink**: Future goals and aspirations
  - 🟠 **Orange**: Interests and hobbies

### 4. Editing
- Double-click nodes to edit labels
- Drag nodes to rearrange layout
- Use controls to zoom and pan
- View mini-map for navigation

### 5. Export Options

#### Figma Integration
1. Export CSV for Figma
2. Download the included instructions
3. Use Figma's "CSV to Sticky" plugin
4. Import your data to create professional visualizations

#### Other Formats
- **JSON**: Complete analysis data for developers
- **Timeline CSV**: Chronological events for timeline tools
- **Text Report**: Detailed analysis summary

## 🔒 Privacy Features

### Client-Side Processing
- Process documents entirely in your browser
- No data sent to external servers
- Full control over your information

### Data Retention Options
- **No Storage**: Delete immediately after processing
- **Session Only**: Clear when browser closes
- **Local Storage**: Keep until manually cleared

### Security Features
- Anonymize personal information
- Filter sensitive documents
- Privacy-first architecture

## 🏗️ Technical Architecture

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **React Flow** for interactive visualizations
- **Lucide React** for icons

### Document Processing
- **pdf-parse**: PDF text extraction
- **mammoth**: Word document processing
- **tesseract.js**: OCR for images
- **papaparse**: CSV parsing
- **xlsx**: Excel file processing

### AI Analysis
- Keyword-based entity extraction
- Pattern matching for dates and timeframes
- Relationship mapping between entities
- Confidence scoring for extracted data

## 🎯 Use Cases

### For Students
- Visualize academic and career progression
- Identify skill development patterns
- Plan future career moves
- Create portfolio presentations

### For Professionals
- Map career transitions and growth
- Identify transferable skills
- Document project history
- Prepare for interviews and reviews

### For Career Counselors
- Help clients visualize their journey
- Identify strengths and gaps
- Support career planning discussions
- Create engaging career narratives

## 🔧 Development

### Available Scripts

#### `npm start`
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

#### `npm test`
Launches the test runner in interactive watch mode

#### `npm run build`
Builds the app for production to the `build` folder

### Project Structure
```
src/
├── components/          # React components
│   ├── FileUpload.tsx  # File upload interface
│   ├── SensemakingMap.tsx  # Interactive map visualization
│   └── PrivacySettings.tsx # Privacy configuration
├── services/           # Core business logic
│   ├── documentProcessor.ts  # File processing engine
│   ├── contentAnalyzer.ts   # AI analysis engine
│   └── exportService.ts     # Export functionality
└── App.tsx            # Main application component
```

### Key Dependencies
- `react-dropzone`: File upload handling
- `@xyflow/react`: Flow-based node visualization
- `pdf-parse`: PDF text extraction
- `mammoth`: Word document processing
- `tesseract.js`: Optical character recognition

## 📝 Export Integration

### Figma Workflow
1. Export CSV from the app
2. Open Figma and install "CSV to Sticky" plugin
3. Import CSV with these mappings:
   - Text: `label` column
   - X Position: `x` column
   - Y Position: `y` column
   - Color: `color` column
   - Width: `width` column

### Data Format
The exported CSV includes:
- Node ID and label
- Position coordinates
- Node type and color
- Source document references
- Connection relationships

## 🎨 Customization

### Adding New Node Types
1. Update `contentAnalyzer.ts` with new keywords
2. Add color mapping in `SensemakingMap.tsx`
3. Update export service formatting

### Extending Document Support
1. Add new processor in `documentProcessor.ts`
2. Update file type detection
3. Add to supported formats in upload component

## 🤝 Contributing

This is a demonstration project showing how to build a document analysis and visualization webapp. Feel free to:
- Extend the AI analysis capabilities
- Add new export formats
- Improve the visualization layouts
- Enhance privacy features

## 📄 License

This project is provided as an educational example. Modify and use as needed for your own projects.

## 🆘 Troubleshooting

### Common Issues
- **Large Files**: Processing may be slow for large documents
- **OCR Accuracy**: Image text recognition depends on image quality
- **Browser Compatibility**: Modern browsers required for all features

### Performance Tips
- Process fewer files at once for better performance
- Use high-quality images for better OCR results
- Clear browser storage periodically if using local retention

---

*Built with React, TypeScript, and privacy in mind. Perfect for students, professionals, and anyone looking to visualize their career journey.*
