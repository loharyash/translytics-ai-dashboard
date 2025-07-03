
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ArrowDown, Search, Download, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AnalysisSegment {
  id: string;
  index: number;
  sourceText: string;
  targetText: string;
  correctedText?: string;
  score: number;
  status: 'Processed' | 'Failed' | 'Error';
  comments: string;
  highlights?: {
    source?: Array<{ start: number; end: number; type: 'error' | 'good' }>;
    target?: Array<{ start: number; end: number; type: 'error' | 'good' }>;
  };
}

// Mock data for demonstration
const mockSegments: AnalysisSegment[] = [
  {
    id: '1',
    index: 1,
    sourceText: 'The weather is beautiful today and I want to go for a walk in the park.',
    targetText: 'El tiempo está hermoso hoy y quiero ir a caminar al parque.',
    correctedText: 'El clima está hermoso hoy y quiero ir a caminar por el parque.',
    score: 85,
    status: 'Processed',
    comments: 'Good translation but "tiempo" should be "clima" for weather, and "al parque" should be "por el parque".',
    highlights: {
      target: [
        { start: 3, end: 9, type: 'error' },
        { start: 55, end: 64, type: 'error' }
      ]
    }
  },
  {
    id: '2',
    index: 2,
    sourceText: 'Please send me the report by end of day.',
    targetText: 'Por favor envíeme el informe antes del final del día.',
    score: 95,
    status: 'Processed',
    comments: 'Excellent translation with proper formal tone and accurate terminology.',
  },
  {
    id: '3',
    index: 3,
    sourceText: 'The meeting has been postponed until further notice.',
    targetText: 'La reunión ha sido pospuesta hasta nuevo aviso.',
    score: 92,
    status: 'Processed',
    comments: 'Very good translation with correct formal business language.',
  },
  {
    id: '4',
    index: 4,
    sourceText: 'Can you help me with this technical issue?',
    targetText: 'Puedes ayudarme con este problema técnico?',
    correctedText: '¿Puedes ayudarme con este problema técnico?',
    score: 78,
    status: 'Processed',
    comments: 'Missing question mark at the beginning. Otherwise accurate translation.',
  },
  {
    id: '5',
    index: 5,
    sourceText: 'The system crashed unexpectedly.',
    targetText: 'El sistema se estrelló inesperadamente.',
    correctedText: 'El sistema falló inesperadamente.',
    score: 65,
    status: 'Processed',
    comments: 'Literal translation issue: "crashed" should be "falló" not "se estrelló" in technical context.',
  }
];

const ResultsAnalysis = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const getScoreColor = (score: number) => {
    if (score >= 91) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 91) return 'Publish-Ready';
    if (score >= 70) return 'Acceptable';
    if (score >= 50) return 'Fair';
    return 'Unusable';
  };

  const getScoreCategory = (score: number) => {
    if (score >= 91) return 'Publish-Ready';
    if (score >= 70) return 'Acceptable';
    if (score >= 50) return 'Fair';
    return 'Unusable';
  };

  const filteredSegments = useMemo(() => {
    return mockSegments.filter(segment => {
      const matchesSearch = 
        segment.sourceText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        segment.targetText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        segment.comments.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'All' || getScoreCategory(segment.score) === filterCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, filterCategory]);

  const scoreCategoryCounts = useMemo(() => {
    const counts = {
      'Publish-Ready': 0,
      'Acceptable': 0,
      'Fair': 0,
      'Unusable': 0,
      'Error': 0
    };

    mockSegments.forEach(segment => {
      if (segment.status === 'Error' || segment.status === 'Failed') {
        counts['Error']++;
      } else {
        counts[getScoreCategory(segment.score)]++;
      }
    });

    return counts;
  }, []);

  const averageScore = useMemo(() => {
    const processedSegments = mockSegments.filter(s => s.status === 'Processed');
    if (processedSegments.length === 0) return 0;
    return Math.round(processedSegments.reduce((sum, s) => sum + s.score, 0) / processedSegments.length);
  }, []);

  const highlightText = (text: string, highlights?: Array<{ start: number; end: number; type: 'error' | 'good' }>) => {
    if (!highlights || highlights.length === 0) return text;

    let result = [];
    let lastIndex = 0;

    highlights.forEach((highlight, i) => {
      // Add text before highlight
      if (highlight.start > lastIndex) {
        result.push(text.slice(lastIndex, highlight.start));
      }
      
      // Add highlighted text
      const highlightedText = text.slice(highlight.start, highlight.end);
      result.push(
        <span 
          key={i}
          className={`${highlight.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} px-1 rounded`}
        >
          {highlightedText}
        </span>
      );
      
      lastIndex = highlight.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }

    return result;
  };

  const exportCSV = () => {
    toast({
      title: "Export Started",
      description: "Your detailed analysis results are being prepared for download."
    });
  };

  const copyAllCorrected = () => {
    const correctedTexts = mockSegments
      .filter(s => s.correctedText)
      .map(s => s.correctedText)
      .join('\n');
    
    navigator.clipboard.writeText(correctedTexts);
    toast({
      title: "Copied to Clipboard",
      description: "All corrected translations have been copied."
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Translation Analysis Results
              </h1>
              <p className="text-gray-600">
                Detailed evaluation and correction suggestions for your translations
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="hover:bg-gray-50"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Results Table */}
          <div className="lg:col-span-3">
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle>Translation Segments Analysis</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={copyAllCorrected} variant="outline" size="sm">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Corrected
                    </Button>
                    <Button onClick={exportCSV} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </div>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search translations, comments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      <SelectItem value="Publish-Ready">Publish-Ready</SelectItem>
                      <SelectItem value="Acceptable">Acceptable</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Unusable">Unusable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Source Text</TableHead>
                      <TableHead>Target Text</TableHead>
                      <TableHead className="w-24">Status</TableHead>
                      <TableHead className="w-20">Score</TableHead>
                      <TableHead>Comments</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSegments.map((segment) => (
                      <React.Fragment key={segment.id}>
                        <TableRow 
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setExpandedRow(expandedRow === segment.id ? null : segment.id)}
                        >
                          <TableCell className="font-medium">{segment.index}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate">
                              {highlightText(segment.sourceText, segment.highlights?.source)}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate">
                              {highlightText(segment.targetText, segment.highlights?.target)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={segment.status === 'Processed' ? 'default' : 'destructive'}>
                              {segment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <HoverCard>
                              <HoverCardTrigger>
                                <Badge className={`${getScoreColor(segment.score)} text-white hover:opacity-80`}>
                                  {segment.score}
                                </Badge>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-48">
                                <div className="text-sm">
                                  <div className="font-semibold">{getScoreLabel(segment.score)}</div>
                                  <div className="text-gray-600 mt-1">Score: {segment.score}/100</div>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate text-sm text-gray-600">
                              {segment.comments}
                            </div>
                          </TableCell>
                          <TableCell>
                            <ArrowDown className={`w-4 h-4 text-gray-400 transition-transform ${
                              expandedRow === segment.id ? 'rotate-180' : ''
                            }`} />
                          </TableCell>
                        </TableRow>
                        
                        {expandedRow === segment.id && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-gray-50">
                              <div className="p-4 space-y-4">
                                {/* Full texts */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Source Text</h4>
                                    <div className="text-sm bg-white p-3 rounded border">
                                      {highlightText(segment.sourceText, segment.highlights?.source)}
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-700 mb-2">Target Text</h4>
                                    <div className="text-sm bg-white p-3 rounded border">
                                      {highlightText(segment.targetText, segment.highlights?.target)}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Corrected version if available */}
                                {segment.correctedText && (
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center">
                                      <CheckCircle2 className="w-4 h-4 text-green-600 mr-1" />
                                      Suggested Correction
                                    </h4>
                                    <div className="text-sm bg-green-50 p-3 rounded border border-green-200">
                                      {segment.correctedText}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Full comments */}
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-700 mb-2">AI Analysis</h4>
                                  <div className="text-sm bg-blue-50 p-3 rounded border border-blue-200">
                                    {segment.comments}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar Summary */}
          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Overall Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-green-600 mb-2">{averageScore}/100</div>
                  <div className="text-sm text-gray-600">{getScoreLabel(averageScore)}</div>
                </div>
                <Progress value={averageScore} className="h-3" />
              </CardContent>
            </Card>

            {/* Score Breakdown */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(scoreCategoryCounts).map(([category, count]) => {
                  const total = mockSegments.length;
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  const color = category === 'Publish-Ready' ? 'bg-green-500' :
                               category === 'Acceptable' ? 'bg-blue-500' :
                               category === 'Fair' ? 'bg-orange-500' :
                               category === 'Error' ? 'bg-gray-500' : 'bg-red-500';
                  
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{category}</span>
                        <span className="font-medium">{count} segments</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${color} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Configuration Summary */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Model Used:</span>
                  <div className="font-medium">GPT-4o</div>
                </div>
                <div>
                  <span className="text-gray-600">Source Language:</span>
                  <div className="font-medium">English</div>
                </div>
                <div>
                  <span className="text-gray-600">Target Language:</span>
                  <div className="font-medium">Spanish</div>
                </div>
                <div>
                  <span className="text-gray-600">Total Segments:</span>
                  <div className="font-medium">{mockSegments.length}</div>
                </div>
                <div>
                  <span className="text-gray-600">Processed:</span>
                  <div className="font-medium">{mockSegments.filter(s => s.status === 'Processed').length}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsAnalysis;
