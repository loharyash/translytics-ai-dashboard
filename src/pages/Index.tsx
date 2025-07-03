import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, Plus, Download, FileText, MessageCircle, BarChart3, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface TextSegment {
  id: string;
  source: string;
  target: string;
  score?: number;
  status?: string;
  comments?: string;
  corrected?: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [segments, setSegments] = useState<TextSegment[]>([
    { id: '1', source: '', target: '' },
    { id: '2', source: '', target: '' },
    { id: '3', source: '', target: '' }
  ]);
  const [sourceLanguage, setSourceLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [selectedModel, setSelectedModel] = useState('GPT-4o');
  const [temperature, setTemperature] = useState([0.3]);
  const [prompt, setPrompt] = useState('Evaluate the translation quality based on accuracy, fluency, and cultural appropriateness. Provide a score from 1-100 and brief comments.');
  const [guidelines, setGuidelines] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResults, setEvaluationResults] = useState<TextSegment[]>([]);

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Russian',
    'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi', 'Dutch', 'Swedish'
  ];

  const models = ['GPT-4o', 'GPT-4', 'Claude-3.5-Sonnet', 'Claude-3-Opus', 'Gemini-Pro'];

  const addSegment = () => {
    const newSegment: TextSegment = {
      id: Date.now().toString(),
      source: '',
      target: ''
    };
    setSegments([...segments, newSegment]);
  };

  const updateSegment = (id: string, field: 'source' | 'target', value: string) => {
    setSegments(segments.map(seg => 
      seg.id === id ? { ...seg, [field]: value } : seg
    ));
  };

  const getCharacterCount = (text: string) => text.length;

  const getTotalStats = () => {
    const sourceChars = segments.reduce((total, seg) => total + getCharacterCount(seg.source), 0);
    const targetChars = segments.reduce((total, seg) => total + getCharacterCount(seg.target), 0);
    return {
      sourceChars,
      targetChars,
      totalChars: sourceChars + targetChars,
      segments: segments.length
    };
  };

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

  const simulateEvaluation = async () => {
    setIsEvaluating(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const results = segments.map(segment => ({
      ...segment,
      score: Math.floor(Math.random() * 100) + 1,
      status: 'Evaluated',
      comments: 'Good translation with minor grammatical improvements needed.',
      corrected: segment.target + ' [corrected version]'
    }));
    
    setEvaluationResults(results);
    setIsEvaluating(false);
    toast({
      title: "Evaluation Complete",
      description: `Successfully evaluated ${segments.length} translation segments.`
    });
  };

  const exportResults = () => {
    toast({
      title: "Export Started",
      description: "Your evaluation results are being prepared for download."
    });
  };

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Evaluate and fix ✔️ the quality of translations using top-tier LLMs
          </h1>
          <p className="text-gray-600 mb-4">
            Professional AI-powered translation quality assessment with detailed scoring and corrections
          </p>
          
          {/* Quick Access to New Evaluator */}
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/evaluator')}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Quick CSV Evaluator
            </Button>
            <Button 
              onClick={() => navigate('/results')}
              variant="outline"
              size="sm"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Sample Results
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Language Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Language Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="source-lang">Source Language</Label>
                    <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="target-lang">Target Language</Label>
                    <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target language" />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map(lang => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Text Input Segments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Translation Segments</CardTitle>
                <Button onClick={addSegment} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Segment
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {segments.map((segment, index) => (
                  <div key={segment.id} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Segment {index + 1}</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Source Text</Label>
                        <Textarea
                          placeholder="Enter source text..."
                          value={segment.source}
                          onChange={(e) => updateSegment(segment.id, 'source', e.target.value)}
                          className="min-h-[100px]"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {getCharacterCount(segment.source)} characters
                        </p>
                      </div>
                      <div>
                        <Label>Target Text</Label>
                        <Textarea
                          placeholder="Enter translated text..."
                          value={segment.target}
                          onChange={(e) => updateSegment(segment.id, 'target', e.target.value)}
                          className="min-h-[100px]"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {getCharacterCount(segment.target)} characters
                        </p>
                      </div>
                    </div>
                    {index < segments.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>File Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Drag and drop your CSV file here
                  </p>
                  <p className="text-gray-500 mb-4">or</p>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Browse Files
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {evaluationResults.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Evaluation Results</CardTitle>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => navigate('/results')} 
                      variant="outline" 
                      size="sm"
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Detailed Analysis
                    </Button>
                    <Button onClick={exportResults} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="results">
                    <TabsList>
                      <TabsTrigger value="results">Results</TabsTrigger>
                      <TabsTrigger value="summary">Summary</TabsTrigger>
                    </TabsList>
                    <TabsContent value="results" className="mt-4">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-200">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-200 px-4 py-2 text-left">#</th>
                              <th className="border border-gray-200 px-4 py-2 text-left">Source</th>
                              <th className="border border-gray-200 px-4 py-2 text-left">Target</th>
                              <th className="border border-gray-200 px-4 py-2 text-left">Score</th>
                              <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
                              <th className="border border-gray-200 px-4 py-2 text-left">Comments</th>
                            </tr>
                          </thead>
                          <tbody>
                            {evaluationResults.map((result, index) => (
                              <tr key={result.id}>
                                <td className="border border-gray-200 px-4 py-2">{index + 1}</td>
                                <td className="border border-gray-200 px-4 py-2 max-w-xs truncate">
                                  {result.source}
                                </td>
                                <td className="border border-gray-200 px-4 py-2 max-w-xs truncate">
                                  {result.target}
                                </td>
                                <td className="border border-gray-200 px-4 py-2">
                                  <div className="flex items-center space-x-2">
                                    <Badge className={`${getScoreColor(result.score!)} text-white`}>
                                      {result.score}
                                    </Badge>
                                    <span className="text-sm text-gray-600">
                                      {getScoreLabel(result.score!)}
                                    </span>
                                  </div>
                                </td>
                                <td className="border border-gray-200 px-4 py-2">{result.status}</td>
                                <td className="border border-gray-200 px-4 py-2 max-w-xs truncate">
                                  {result.comments}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                    <TabsContent value="summary" className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {evaluationResults.filter(r => r.score! >= 91).length}
                            </div>
                            <div className="text-sm text-gray-600">Publish-Ready</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {evaluationResults.filter(r => r.score! >= 70 && r.score! < 91).length}
                            </div>
                            <div className="text-sm text-gray-600">Acceptable</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {evaluationResults.filter(r => r.score! >= 50 && r.score! < 70).length}
                            </div>
                            <div className="text-sm text-gray-600">Fair</div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl font-bold text-red-600">
                              {evaluationResults.filter(r => r.score! < 50).length}
                            </div>
                            <div className="text-sm text-gray-600">Unusable</div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Model Configuration */}
            <Card>
              <CardHeader>
                <CardTitle>AI Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Model Selection</Label>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map(model => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Evaluation Prompt</Label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <Label>Guidelines (Optional)</Label>
                  <Textarea
                    placeholder="Enter evaluation guidelines..."
                    value={guidelines}
                    onChange={(e) => setGuidelines(e.target.value)}
                    className="min-h-[80px] max-h-[120px] overflow-y-auto"
                  />
                </div>

                <div>
                  <Label>Temperature: {temperature[0]}</Label>
                  <Slider
                    value={temperature}
                    onValueChange={setTemperature}
                    max={1}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Source Characters:</span>
                  <span className="font-medium">{stats.sourceChars.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target Characters:</span>
                  <span className="font-medium">{stats.targetChars.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Characters:</span>
                  <span className="font-medium">{stats.totalChars.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Segments:</span>
                  <span className="font-medium">{stats.segments}</span>
                </div>
              </CardContent>
            </Card>

            {/* CTA Button */}
            <Button 
              onClick={simulateEvaluation}
              disabled={isEvaluating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
              size="lg"
            >
              {isEvaluating ? 'Evaluating...' : 'Evaluate Translation Quality'}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">How Scoring Works</h3>
              <p className="text-sm text-gray-600">
                Our AI models evaluate translations based on accuracy, fluency, cultural appropriateness, 
                and contextual relevance to provide scores from 1-100.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Supported LLMs</h3>
              <p className="text-sm text-gray-600">
                OpenAI (GPT-4, GPT-4o), Anthropic (Claude-3.5-Sonnet, Claude-3-Opus), 
                and Google (Gemini-Pro) models available.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">CSV Format</h3>
              <p className="text-sm text-gray-600">
                Upload CSV files with columns: source_text, target_text, source_language, 
                target_language (optional headers).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Button */}
      <Button
        className="fixed bottom-6 right-6 rounded-full w-12 h-12 shadow-lg bg-blue-600 hover:bg-blue-700"
        size="sm"
      >
        <MessageCircle className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default Index;
