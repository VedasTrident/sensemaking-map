import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import SensemakingMap from './components/SensemakingMap';
import { DocumentProcessor, ProcessedDocument } from './services/documentProcessor';
import { UltraSimpleAnalyzer, ExtractedNode, AnalysisResult } from './services/ultraSimpleAnalyzer';
import { ExportService } from './services/exportService';
import { Download, FileText, Map, Settings } from 'lucide-react';
import './App.css';

type AppState = 'upload' | 'processing' | 'mapping' | 'export';

function App() {
  const [appState, setAppState] = useState<AppState>('upload');
  const [processedDocuments, setProcessedDocuments] = useState<ProcessedDocument[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const documentProcessor = new DocumentProcessor();
  const contentAnalyzer = new UltraSimpleAnalyzer();
  const exportService = new ExportService();

  const handleFilesUploaded = async (files: File[]) => {
    setAppState('processing');
    setProcessingStatus('Processing uploaded files...');
    setError('');

    try {
      console.log('Processing files:', files.map(f => f.name));
      const processed = await documentProcessor.processMultipleFiles(files);
      console.log('Processed documents:', processed.length);
      
      // Merge with existing documents if any
      const allDocuments = [...processedDocuments, ...processed];
      setProcessedDocuments(allDocuments);
      setProcessingStatus('Analyzing content and extracting insights...');

      if (allDocuments.length === 0) {
        setError('No documents could be processed. This could happen if: 1) PDF files are image-based (try copy/pasting text instead), 2) Files are password-protected, 3) Files are corrupted. Please try uploading different files or use the demo to see how it works.');
        setAppState('upload');
        return;
      }

      // Check for processing errors in document content
      const hasProcessingErrors = allDocuments.some(doc => 
        doc.content.includes('[PDF file:') || 
        doc.content.includes('Could not extract') ||
        doc.content.includes('processing failed')
      );

      if (hasProcessingErrors) {
        const errorDocs = allDocuments.filter(doc => 
          doc.content.includes('[PDF file:') || 
          doc.content.includes('Could not extract')
        );
        setError(`Some files couldn't be processed: ${errorDocs.map(d => d.fileName).join(', ')}. For LinkedIn profiles, try: 1) Copy text directly from LinkedIn, 2) Save as Word/Text file, or 3) Use the demo to see expected results.`);
      }

      const analysis = await contentAnalyzer.analyzeDocuments(allDocuments);
      console.log('Analysis result:', analysis);
      
      if (analysis.nodes.length === 0) {
        setError('No career insights could be extracted from your documents. Try uploading documents with more explicit career information (CVs, job descriptions, project reports, etc.).');
        setAppState('upload');
        return;
      }
      
      setAnalysisResult(analysis);
      setAppState('mapping');
      setProcessingStatus('');
    } catch (err) {
      console.error('Processing error:', err);
      setError(`Processing failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setAppState('upload');
      setProcessingStatus('');
    }
  };

  const handleNodeUpdate = (nodeId: string, updates: Partial<ExtractedNode>) => {
    if (!analysisResult) return;
    
    const updatedNodes = analysisResult.nodes.map(node =>
      node.id === nodeId ? { ...node, ...updates } : node
    );
    
    setAnalysisResult({
      ...analysisResult,
      nodes: updatedNodes
    });
  };

  const handleExportFigmaCSV = () => {
    if (analysisResult) {
      exportService.exportFigmaCSV(analysisResult.nodes);
      exportService.downloadFigmaInstructions();
    }
  };

  const handleExportJSON = () => {
    if (analysisResult) {
      exportService.exportAnalysisJSON(analysisResult);
    }
  };

  const handleExportTimeline = () => {
    if (analysisResult) {
      exportService.exportTimelineCSV(analysisResult);
    }
  };

  const handleExportReport = () => {
    if (analysisResult) {
      exportService.exportPDFReport(analysisResult);
    }
  };

  const handleStartOver = () => {
    setAppState('upload');
    setProcessedDocuments([]);
    setAnalysisResult(null);
    setProcessingStatus('');
    setError('');
  };

  const handleDemoData = async () => {
    setAppState('processing');
    setProcessingStatus('Loading demo data...');
    setError('');

    try {
      // Create sample documents with realistic career content
      const sampleDocuments: ProcessedDocument[] = [
        {
          fileName: 'linkedin_profile.txt',
          content: `John Smith

Software Engineer at Google (2022 - Present)
• Built machine learning models for search ranking algorithms
• Developed React-based internal tools used by 1000+ employees
• Led team of 5 engineers on maps infrastructure project

Data Analyst at Microsoft (2020 - 2022)
• Created dashboards analyzing user behavior for Office 365
• Implemented data pipelines processing 10M+ daily events
• Collaborated with product teams on feature optimization

Junior Developer at Startup Inc (2018 - 2020)
• Developed mobile app with 50K+ downloads
• Built REST APIs using Node.js and PostgreSQL
• Managed deployment pipeline with Docker and AWS

Master of Computer Science, Stanford University (2016-2018)
Bachelor of Science in Mathematics, UC Berkeley (2012-2016)

SKILLS
Programming: Python, JavaScript, Java, SQL
Frameworks: React, Node.js, TensorFlow, Django
Tools: AWS, Docker, Git, Tableau`,
          metadata: {
            fileType: 'txt',
            fileSize: 5000,
            extractedDate: new Date()
          }
        },
        {
          fileName: 'personal_notes.txt',
          content: `Career Notes - March 2024

Really enjoying my role as Software Engineer at Google. The ML projects are fascinating 
and I'm learning so much about large-scale systems. 

The maps infrastructure project I'm leading has been challenging but rewarding. Managing 
a team of 5 engineers while still coding myself.

Goals for this year:
• Get promoted to Senior Software Engineer
• Complete the internal ML certification program  
• Start contributing to open source TensorFlow
• Begin mentoring junior developers

Longer term, I'd love to become a Staff Engineer and eventually transition into 
engineering management. The leadership aspects of my current role have been eye-opening.

Also considering getting involved in hiring - I want to help build diverse teams.`,
          metadata: {
            fileType: 'txt',
            fileSize: 800,
            extractedDate: new Date()
          }
        }
      ];

      setProcessedDocuments(sampleDocuments);
      setProcessingStatus('Analyzing demo content...');

      const analysis = await contentAnalyzer.analyzeDocuments(sampleDocuments);
      setAnalysisResult(analysis);
      setAppState('mapping');
      setProcessingStatus('');
    } catch (err) {
      console.error('Demo data error:', err);
      setError('Failed to load demo data. Please try uploading your own files.');
      setAppState('upload');
      setProcessingStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Map className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Sense Making Map Version 3</h1>
            </div>
            
            {/* Navigation */}
            <nav className="flex items-center space-x-6">
              <button
                onClick={() => setAppState('upload')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  appState === 'upload' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Upload</span>
              </button>
              
              <button
                onClick={() => analysisResult && setAppState('mapping')}
                disabled={!analysisResult}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  appState === 'mapping' ? 'bg-blue-100 text-blue-700' : 
                  analysisResult ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                <Map className="h-4 w-4" />
                <span>Map</span>
              </button>
              
              <button
                onClick={() => analysisResult && setAppState('export')}
                disabled={!analysisResult}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium ${
                  appState === 'export' ? 'bg-blue-100 text-blue-700' : 
                  analysisResult ? 'text-gray-500 hover:text-gray-700' : 'text-gray-300 cursor-not-allowed'
                }`}
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Upload Phase */}
        {appState === 'upload' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Create Your Career Journey Map
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                Upload your documents (CVs, reports, journal entries, etc.) and we'll automatically 
                generate a visual timeline of your career journey, projects, and aspirations.
              </p>
            </div>
            
            {/* Demo Button */}
            {processedDocuments.length === 0 && (
              <div className="text-center mb-6">
                <button
                  onClick={handleDemoData}
                  className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 font-medium"
                >
                  Try Demo with Sample Data
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  See how the app works with example career data
                </p>
              </div>
            )}
            
            <FileUpload onFilesUploaded={handleFilesUploaded} />
            
            {/* Help Section */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Tips for Best Results</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <h4 className="font-medium mb-2">📄 For LinkedIn Profiles:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Copy text directly from LinkedIn and save as .txt file</li>
                    <li>Use "Print to PDF" and select text-based output</li>
                    <li>Avoid screenshot PDFs (images can't be processed)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">📋 Other Document Types:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Word documents (.docx) work great</li>
                    <li>Plain text files (.txt) are most reliable</li>
                    <li>CV/Resume PDFs with selectable text</li>
                    <li>Journal entries and career notes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Processing Phase */}
        {appState === 'processing' && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Your Documents</h2>
            <p className="text-gray-600">{processingStatus}</p>
            <div className="mt-6 max-w-md mx-auto bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}

        {/* Mapping Phase */}
        {appState === 'mapping' && analysisResult && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Career Journey Map</h2>
                <p className="text-gray-600">
                  {analysisResult.nodes.length} insights extracted from {processedDocuments.length} documents
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setAppState('upload')}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Add More Files</span>
                </button>
                <button
                  onClick={() => setAppState('export')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={handleStartOver}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                >
                  Start Over
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border" style={{ height: '70vh' }}>
              <SensemakingMap 
                extractedNodes={analysisResult.nodes} 
                onNodeUpdate={handleNodeUpdate}
              />
            </div>
          </div>
        )}

        {/* Export Phase */}
        {appState === 'export' && analysisResult && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Export Your Map</h2>
                <p className="text-gray-600">Choose your preferred export format</p>
              </div>
              <button
                onClick={() => setAppState('mapping')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                Back to Map
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Figma CSV Export */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
                    <Settings className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Figma CSV</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Export for use with Figma's "CSV to Sticky" plugin
                  </p>
                  <button
                    onClick={handleExportFigmaCSV}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
                  >
                    Export for Figma
                  </button>
                </div>
              </div>

              {/* JSON Export */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-center">
                  <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">JSON Data</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Complete analysis data for further processing
                  </p>
                  <button
                    onClick={handleExportJSON}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                  >
                    Export JSON
                  </button>
                </div>
              </div>

              {/* Timeline CSV */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
                    <Map className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Timeline CSV</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Chronological events for timeline tools
                  </p>
                  <button
                    onClick={handleExportTimeline}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Export Timeline
                  </button>
                </div>
              </div>

              {/* Report Export */}
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="text-center">
                  <div className="bg-orange-100 rounded-full p-3 w-12 h-12 mx-auto mb-4">
                    <Download className="h-6 w-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Text Report</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Detailed analysis report
                  </p>
                  <button
                    onClick={handleExportReport}
                    className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700"
                  >
                    Export Report
                  </button>
                </div>
              </div>
            </div>

            {/* Analysis Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Analysis Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{analysisResult.nodes.length}</div>
                  <div className="text-sm text-gray-600">Total Insights</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{analysisResult.timeline.events.length}</div>
                  <div className="text-sm text-gray-600">Timeline Events</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{processedDocuments.length}</div>
                  <div className="text-sm text-gray-600">Documents Processed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {Object.keys(analysisResult.nodes.reduce((acc, node) => ({...acc, [node.type]: true}), {})).length}
                  </div>
                  <div className="text-sm text-gray-600">Node Types</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;