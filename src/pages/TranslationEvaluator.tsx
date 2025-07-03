
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, FileText, Download, Info, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface TranslationRow {
  id: string;
  index: number;
  english: string;
  target: string;
  targetLanguage: string;
  status: 'Processed' | 'Processing' | 'Error';
  score: number;
  comments: string;
  corrected?: string;
}

const TranslationEvaluator = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<TranslationRow[]>([
    {
      id: '1',
      index: 1,
      english: 'this is my test message.',
      target: 'यह मेरा परीक्षण संदेश है।',
      targetLanguage: 'Hindi',
      status: 'Processed',
      score: 95,
      comments: 'The translation is accurate and maintains the original meaning. The style and tone are appropriate for the context. There are no critical, major, or minor errors. A preferential suggestion is made for stylistic improvement.',
      corrected: 'यह मेरा टेस्ट संदेश है।'
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterScore, setFilterScore] = useState('All Scores');
  const [searchTerm, setSearchTerm] = useState('');

  // Auto-detect language function
  const detectLanguage = async (text: string): Promise<string> => {
    // Simulate language detection - in real implementation, you'd use a language detection API
    const hindiPattern = /[\u0900-\u097F]/;
    const arabicPattern = /[\u0600-\u06FF]/;
    const chinesePattern = /[\u4e00-\u9fff]/;
    const japanesePattern = /[\u3040-\u309f\u30a0-\u30ff]/;
    const koreanPattern = /[\uac00-\ud7af]/;
    const russianPattern = /[\u0400-\u04FF]/;

    if (hindiPattern.test(text)) return 'Hindi';
    if (arabicPattern.test(text)) return 'Arabic';
    if (chinesePattern.test(text)) return 'Chinese';
    if (japanesePattern.test(text)) return 'Japanese';
    if (koreanPattern.test(text)) return 'Korean';
    if (russianPattern.test(text)) return 'Russian';
    
    // Default fallback - could integrate with Google Translate API or similar
    return 'Auto-detected';
  };

  // File upload handler
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      // Expected headers: english, target (or similar variations)
      const englishIndex = headers.findIndex(h => 
        h.toLowerCase().includes('english') || 
        h.toLowerCase().includes('source') ||
        h.toLowerCase() === 'en'
      );
      const targetIndex = headers.findIndex(h => 
        h.toLowerCase().includes('target') || 
        h.toLowerCase().includes('translation') ||
        h.toLowerCase().includes('hindi') ||
        h.toLowerCase().includes('spanish')
      );

      if (englishIndex === -1 || targetIndex === -1) {
        throw new Error('CSV must contain English and target language columns');
      }

      const newRows: TranslationRow[] = [];
      
      for (let i = 1; i < lines.length && i <= 100; i++) { // Limit to 100 rows for demo
        const cells = lines[i].split(',').map(c => c.trim().replace(/"/g, ''));
        if (cells.length < 2 || !cells[englishIndex] || !cells[targetIndex]) continue;

        const targetText = cells[targetIndex];
        const detectedLanguage = await detectLanguage(targetText);
        
        newRows.push({
          id: `uploaded-${i}`,
          index: i,
          english: cells[englishIndex],
          target: targetText,
          targetLanguage: detectedLanguage,
          status: 'Processing',
          score: 0,
          comments: 'Processing...'
        });
      }

      setRows(newRows);
      
      // Simulate processing each row
      for (let i = 0; i < newRows.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        
        const score = Math.floor(Math.random() * 40) + 60; // Random score 60-100
        const updatedRow = {
          ...newRows[i],
          status: 'Processed' as const,
          score,
          comments: score >= 90 ? 'Excellent translation with high accuracy.' :
                   score >= 70 ? 'Good translation with minor improvements needed.' :
                   'Translation needs significant improvements.',
          corrected: score < 90 ? `${newRows[i].target} [suggested correction]` : undefined
        };

        setRows(prevRows => 
          prevRows.map(row => row.id === newRows[i].id ? updatedRow : row)
        );
      }

      toast({
        title: "File Processed Successfully",
        description: `Processed ${newRows.length} translation pairs.`
      });

    } catch (error) {
      toast({
        title: "File Processing Error",
        description: error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // PDF export function
  const exportToPDF = useCallback(async () => {
    try {
      // In a real implementation, you'd use a library like jsPDF or Puppeteer
      const csvContent = [
        ['#', 'English', 'Target', 'Language', 'Status', 'Score', 'Comments', 'Corrected'].join(','),
        ...rows.map(row => [
          row.index,
          `"${row.english}"`,
          `"${row.target}"`,
          row.targetLanguage,
          row.status,
          row.score,
          `"${row.comments}"`,
          `"${row.corrected || ''}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'translation-evaluation-results.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Translation results exported to CSV file."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export results",
        variant: "destructive"
      });
    }
  }, [rows]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const overallScore = rows.length > 0 ? 
    Math.round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length) : 0;

  const scoreCounts = {
    publishReady: rows.filter(r => r.score >= 90).length,
    acceptable: rows.filter(r => r.score >= 70 && r.score < 90).length,
    fair: rows.filter(r => r.score >= 50 && r.score < 70).length,
    unusable: rows.filter(r => r.score < 50).length,
    error: rows.filter(r => r.status === 'Error').length
  };

  const filteredRows = rows.filter(row => {
    const matchesSearch = row.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         row.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         row.comments.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterScore === 'All Scores' || 
                         (filterScore === 'Publish-Ready' && row.score >= 90) ||
                         (filterScore === 'Acceptable' && row.score >= 70 && row.score < 90) ||
                         (filterScore === 'Fair' && row.score >= 50 && row.score < 70) ||
                         (filterScore === 'Unusable' && row.score < 50);
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Translation Quality Evaluator</h1>
            <Button variant="outline" onClick={() => navigate('/')}>
              ← Back to Dashboard
            </Button>
          </div>
          
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Even sophisticated LLMs can make mistakes. Use the results carefully.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload CSV File</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-600 mb-2">
                    Drag and drop your CSV file here
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Expected format: columns for English text and target language translations
                  </p>
                  <div className="flex items-center justify-center">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="csvUpload"
                      disabled={isProcessing}
                    />
                    <label htmlFor="csvUpload">
                      <Button variant="outline" disabled={isProcessing} asChild>
                        <span>
                          <FileText className="w-4 h-4 mr-2" />
                          {isProcessing ? 'Processing...' : 'Browse CSV Files'}
                        </span>
                      </Button>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Table */}
            {rows.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <CardTitle>Translation Results</CardTitle>
                    <Button onClick={exportToPDF} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export PDF/CSV
                    </Button>
                  </div>
                  
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <Input
                      placeholder="Search translations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="flex-1"
                    />
                    <Select value={filterScore} onValueChange={setFilterScore}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Scores">All Scores</SelectItem>
                        <SelectItem value="Publish-Ready">Publish-Ready (90+)</SelectItem>
                        <SelectItem value="Acceptable">Acceptable (70-89)</SelectItem>
                        <SelectItem value="Fair">Fair (50-69)</SelectItem>
                        <SelectItem value="Unusable">Unusable (&lt;50)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">#</TableHead>
                          <TableHead>English</TableHead>
                          <TableHead>Target Language</TableHead>
                          <TableHead className="w-20">Status</TableHead>
                          <TableHead className="w-20">Score</TableHead>
                          <TableHead>Comments</TableHead>
                          <TableHead>Corrected</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRows.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="font-medium">{row.index}</TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate">{row.english}</div>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate">{row.target}</div>
                              <div className="text-xs text-gray-500 mt-1">{row.targetLanguage}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                row.status === 'Processed' ? 'default' : 
                                row.status === 'Processing' ? 'secondary' : 'destructive'
                              }>
                                {row.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {row.status === 'Processed' ? (
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${getScoreColor(row.score)}`}></div>
                                  <span className="font-medium">{row.score}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="text-sm truncate">{row.comments}</div>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              {row.corrected ? (
                                <div className="text-sm text-green-700 truncate">{row.corrected}</div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar - Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold mb-2">{overallScore}/100</div>
                  <div className="text-sm text-gray-600 mb-4">
                    {overallScore >= 90 ? 'Ready for use with minimal or no edits.' :
                     overallScore >= 70 ? 'Good quality with minor edits needed.' :
                     'Needs significant improvements.'}
                  </div>
                  <Progress value={overallScore} className="h-2" />
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Segments Breakdown</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Publish-Ready</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">({scoreCounts.publishReady} / {rows.length})</span>
                        <span className="text-sm font-medium">
                          {rows.length > 0 ? Math.round((scoreCounts.publishReady / rows.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${rows.length > 0 ? (scoreCounts.publishReady / rows.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Acceptable</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">({scoreCounts.acceptable} / {rows.length})</span>
                        <span className="text-sm font-medium">
                          {rows.length > 0 ? Math.round((scoreCounts.acceptable / rows.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${rows.length > 0 ? (scoreCounts.acceptable / rows.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fair</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">({scoreCounts.fair} / {rows.length})</span>
                        <span className="text-sm font-medium">
                          {rows.length > 0 ? Math.round((scoreCounts.fair / rows.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${rows.length > 0 ? (scoreCounts.fair / rows.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Unusable</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">({scoreCounts.unusable} / {rows.length})</span>
                        <span className="text-sm font-medium">
                          {rows.length > 0 ? Math.round((scoreCounts.unusable / rows.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${rows.length > 0 ? (scoreCounts.unusable / rows.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Won't process / Error</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">({scoreCounts.error} / {rows.length})</span>
                        <span className="text-sm font-medium">
                          {rows.length > 0 ? Math.round((scoreCounts.error / rows.length) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gray-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${rows.length > 0 ? (scoreCounts.error / rows.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Model used:</span>
                    <span className="font-medium">GPT-4o</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prompt used:</span>
                    <span className="font-medium">Standard</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guidelines:</span>
                    <span className="font-medium">-</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslationEvaluator;
