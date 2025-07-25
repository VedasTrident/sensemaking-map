import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import SensemakingMap from './components/SensemakingMap';
import { DocumentProcessor, ProcessedDocument } from './services/documentProcessor';
import { ContentAnalyzer, ExtractedNode, AnalysisResult } from './services/contentAnalyzer';
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
  const contentAnalyzer = new ContentAnalyzer();
  const exportService = new ExportService();

  const handleFilesUploaded = async (files: File[]) => {
    setAppState('processing');
    setProcessingStatus('Processing uploaded files...');
    setError('');

    try {
      const processed = await documentProcessor.processMultipleFiles(files);
      setProcessedDocuments(processed);
      setProcessingStatus('Analyzing content and extracting insights...');

      const analysis = await contentAnalyzer.analyzeDocuments(processed);
      setAnalysisResult(analysis);
      
      setAppState('mapping');
      setProcessingStatus('');
    } catch (err) {
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Map className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Sensemaking Map</h1>
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
            <FileUpload onFilesUploaded={handleFilesUploaded} />
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