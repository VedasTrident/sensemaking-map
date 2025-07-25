import { ExtractedNode, AnalysisResult } from './contentAnalyzer';

export interface FigmaCSVRow {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  color: string;
  width: number;
  height: number;
  source_doc: string;
  connections: string;
}

export class ExportService {
  private nodeColors = {
    role: '#90EE90',      // Light green for past roles
    project: '#87CEEB',   // Sky blue for projects
    education: '#DDA0DD', // Plum for education
    skill: '#F0E68C',     // Khaki for skills
    goal: '#FFB6C1',      // Light pink for future goals
    interest: '#FFA07A'   // Light salmon for interests
  };

  exportToFigmaCSV(nodes: ExtractedNode[]): string {
    const csvRows: FigmaCSVRow[] = nodes.map(node => ({
      id: node.id,
      label: node.label,
      type: node.type,
      x: node.position.x,
      y: node.position.y,
      color: this.nodeColors[node.type] || '#CCCCCC',
      width: this.calculateNodeWidth(node.label),
      height: 60,
      source_doc: node.sourceDocuments.join('; '),
      connections: node.connections.join('; ')
    }));

    // Convert to CSV format
    const headers = ['id', 'label', 'type', 'x', 'y', 'color', 'width', 'height', 'source_doc', 'connections'];
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => [
        this.escapeCsvValue(row.id),
        this.escapeCsvValue(row.label),
        this.escapeCsvValue(row.type),
        row.x.toString(),
        row.y.toString(),
        this.escapeCsvValue(row.color),
        row.width.toString(),
        row.height.toString(),
        this.escapeCsvValue(row.source_doc),
        this.escapeCsvValue(row.connections)
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  exportToJSON(analysisResult: AnalysisResult): string {
    return JSON.stringify(analysisResult, null, 2);
  }

  exportToTimelineCSV(analysisResult: AnalysisResult): string {
    const headers = ['date', 'node_id', 'node_label', 'node_type', 'description'];
    const csvContent = [
      headers.join(','),
      ...analysisResult.timeline.events.map(event => {
        const node = analysisResult.nodes.find(n => n.id === event.nodeId);
        return [
          this.escapeCsvValue(event.date),
          this.escapeCsvValue(event.nodeId),
          this.escapeCsvValue(node?.label || ''),
          this.escapeCsvValue(node?.type || ''),
          this.escapeCsvValue(event.description)
        ].join(',');
      })
    ].join('\n');

    return csvContent;
  }

  downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  exportFigmaCSV(nodes: ExtractedNode[], filename: string = 'sensemaking-map-figma.csv') {
    const csvContent = this.exportToFigmaCSV(nodes);
    this.downloadFile(csvContent, filename, 'text/csv');
  }

  exportAnalysisJSON(analysisResult: AnalysisResult, filename: string = 'sensemaking-analysis.json') {
    const jsonContent = this.exportToJSON(analysisResult);
    this.downloadFile(jsonContent, filename, 'application/json');
  }

  exportTimelineCSV(analysisResult: AnalysisResult, filename: string = 'career-timeline.csv') {
    const csvContent = this.exportToTimelineCSV(analysisResult);
    this.downloadFile(csvContent, filename, 'text/csv');
  }

  generateFigmaInstructions(): string {
    return `# How to Use This CSV in Figma

## Step 1: Install the Plugin
1. Open Figma
2. Go to Plugins → Browse plugins in Community
3. Search for "CSV to Sticky" or "Table to Sticky Notes"
4. Install the plugin

## Step 2: Import Your Data
1. Create a new Figma file or open an existing one
2. Run the "CSV to Sticky" plugin (Plugins → CSV to Sticky)
3. Upload the exported CSV file
4. Configure the mapping:
   - Text content: "label" column
   - X position: "x" column  
   - Y position: "y" column
   - Color: "color" column
   - Width: "width" column
   - Height: "height" column

## Step 3: Customize Your Map
1. The sticky notes will be created with your career journey data
2. Use Figma's tools to:
   - Adjust colors and styling
   - Add arrows and connections
   - Group related items
   - Add background elements
   - Create a legend

## Pro Tips:
- Use the "connections" column data to manually draw arrows between related nodes
- The "type" column helps you identify which nodes to group together
- The "source_doc" column shows which documents each insight came from
- Green notes typically represent past experiences
- Blue notes represent projects and achievements
- Pink notes represent future goals and aspirations

Your sensemaking map is now ready for further customization in Figma!
`;
  }

  downloadFigmaInstructions() {
    const instructions = this.generateFigmaInstructions();
    this.downloadFile(instructions, 'figma-import-instructions.md', 'text/markdown');
  }

  private calculateNodeWidth(label: string): number {
    // Estimate width based on text length
    const baseWidth = 120;
    const charWidth = 8;
    return Math.max(baseWidth, Math.min(300, label.length * charWidth + 20));
  }

  private escapeCsvValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  // Additional export formats
  exportToPDF(analysisResult: AnalysisResult): string {
    // This would require a PDF library like jsPDF
    // For now, return a formatted text report
    const report = `
# Career Journey Analysis Report
Generated on: ${new Date().toLocaleDateString()}

## Summary
- Total nodes extracted: ${analysisResult.nodes.length}
- Timeline span: ${analysisResult.timeline.startDate} to ${analysisResult.timeline.endDate}
- Total events: ${analysisResult.timeline.events.length}

## Node Breakdown
${Object.entries(
  analysisResult.nodes.reduce((acc, node) => {
    acc[node.type] = (acc[node.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)
).map(([type, count]) => `- ${type}: ${count} items`).join('\n')}

## Timeline Events
${analysisResult.timeline.events.map((event, index) => 
  `${index + 1}. ${event.date}: ${event.description}`
).join('\n')}

## Detailed Nodes
${analysisResult.nodes.map((node, index) => `
### ${index + 1}. ${node.label} (${node.type})
- Source documents: ${node.sourceDocuments.join(', ')}
- Timeframe: ${node.timeframe?.start || 'Unknown'} to ${node.timeframe?.end || 'Present'}
- Connections: ${node.connections.length} related items
- Extracted text: "${node.metadata.extractedText || 'N/A'}"
`).join('\n')}
`;

    return report;
  }

  exportPDFReport(analysisResult: AnalysisResult, filename: string = 'career-journey-report.txt') {
    const report = this.exportToPDF(analysisResult);
    this.downloadFile(report, filename, 'text/plain');
  }
}