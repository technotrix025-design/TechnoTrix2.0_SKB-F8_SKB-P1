import { Card } from './ui/card';
import { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Zap,
  Database,
  ArrowRight,
  Loader2,
  FileCheck,
  TrendingUp,
  Calendar,
  MapPin,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { toast } from 'sonner';

interface ParsedDocument {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: Date;
  status: 'processing' | 'completed' | 'error';
  extractedData: {
    documentType: string;
    vendor?: string;
    location?: string;
    period?: string;
    energyUsage?: number;
    energyUnit?: string;
    fuelConsumption?: number;
    fuelUnit?: string;
    cost?: number;
    currency?: string;
  };
  calculatedEmissions?: {
    scope: string;
    co2e: number;
    emissionFactor: string;
    apiSource: string;
  };
  processingSteps: {
    step: string;
    status: 'pending' | 'processing' | 'completed';
    duration?: number;
  }[];
}

const recentUploads: ParsedDocument[] = [
  {
    id: '1',
    fileName: 'mumbai_facility_electricity_june_2026.pdf',
    fileType: 'Electricity Bill',
    uploadedAt: new Date('2026-06-15T10:30:00'),
    status: 'completed',
    extractedData: {
      documentType: 'Electricity Invoice',
      vendor: 'Tata Power',
      location: 'Mumbai Manufacturing Plant',
      period: 'June 2026',
      energyUsage: 45800,
      energyUnit: 'kWh',
      cost: 385000,
      currency: 'INR'
    },
    calculatedEmissions: {
      scope: 'Scope 2',
      co2e: 38.64,
      emissionFactor: 'India Grid 2026 (0.84 kgCO₂e/kWh)',
      apiSource: 'Climatiq API v1.5'
    },
    processingSteps: [
      { step: 'Document Upload', status: 'completed', duration: 1.2 },
      { step: 'AI OCR & Parsing', status: 'completed', duration: 3.8 },
      { step: 'Data Extraction', status: 'completed', duration: 2.1 },
      { step: 'Carbon API Call', status: 'completed', duration: 1.5 },
      { step: 'Database Storage', status: 'completed', duration: 0.8 }
    ]
  },
  {
    id: '2',
    fileName: 'diesel_purchase_receipt_may_2026.jpg',
    fileType: 'Fuel Receipt',
    uploadedAt: new Date('2026-06-10T14:20:00'),
    status: 'completed',
    extractedData: {
      documentType: 'Fuel Purchase Receipt',
      vendor: 'Indian Oil Corporation',
      location: 'Fleet Operations - Delhi',
      period: 'May 2026',
      fuelConsumption: 2850,
      fuelUnit: 'liters',
      cost: 256500,
      currency: 'INR'
    },
    calculatedEmissions: {
      scope: 'Scope 1',
      co2e: 7.51,
      emissionFactor: 'Diesel Combustion (2.64 kgCO₂e/liter)',
      apiSource: 'EPA Emission Factors 2026'
    },
    processingSteps: [
      { step: 'Document Upload', status: 'completed', duration: 0.9 },
      { step: 'AI OCR & Parsing', status: 'completed', duration: 2.5 },
      { step: 'Data Extraction', status: 'completed', duration: 1.8 },
      { step: 'Carbon API Call', status: 'completed', duration: 1.2 },
      { step: 'Database Storage', status: 'completed', duration: 0.7 }
    ]
  },
  {
    id: '3',
    fileName: 'supplier_invoice_abc_corp.pdf',
    fileType: 'Supplier Invoice',
    uploadedAt: new Date('2026-06-05T09:15:00'),
    status: 'completed',
    extractedData: {
      documentType: 'Supplier Purchase Invoice',
      vendor: 'ABC Corporation',
      location: 'Supply Chain',
      period: 'May 2026',
      cost: 1250000,
      currency: 'INR'
    },
    calculatedEmissions: {
      scope: 'Scope 3',
      co2e: 15.75,
      emissionFactor: 'Manufacturing Materials (12.6 kgCO₂e/1000 INR)',
      apiSource: 'Climatiq Spend-Based Estimation'
    },
    processingSteps: [
      { step: 'Document Upload', status: 'completed', duration: 1.1 },
      { step: 'AI OCR & Parsing', status: 'completed', duration: 3.2 },
      { step: 'Data Extraction', status: 'completed', duration: 2.3 },
      { step: 'Carbon API Call', status: 'completed', duration: 1.8 },
      { step: 'Database Storage', status: 'completed', duration: 0.9 }
    ]
  }
];

export function DataIngestion() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<ParsedDocument[]>(recentUploads);
  const [processingFile, setProcessingFile] = useState<ParsedDocument | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    for (const file of files) {
      const newDoc: ParsedDocument = {
        id: Math.random().toString(36).substr(2, 9),
        fileName: file.name,
        fileType: file.type.includes('pdf') ? 'PDF Document' : 'Image Document',
        uploadedAt: new Date(),
        status: 'processing',
        extractedData: {
          documentType: 'Processing...'
        },
        processingSteps: [
          { step: 'Document Upload', status: 'processing' },
          { step: 'AI OCR & Parsing', status: 'pending' },
          { step: 'Data Extraction', status: 'pending' },
          { step: 'Carbon API Call', status: 'pending' },
          { step: 'Database Storage', status: 'pending' }
        ]
      };

      setProcessingFile(newDoc);
      toast.info(`Processing ${file.name}...`);

      // Simulate AI processing
      await simulateProcessing(newDoc);
    }
  };

  const simulateProcessing = async (doc: ParsedDocument) => {
    const steps = doc.processingSteps;
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      steps[i].status = 'completed';
      steps[i].duration = Math.random() * 3 + 0.5;
      
      if (i < steps.length - 1) {
        steps[i + 1].status = 'processing';
      }
      
      setProcessingFile({ ...doc, processingSteps: [...steps] });
    }

    // Add mock extracted data
    const completedDoc: ParsedDocument = {
      ...doc,
      status: 'completed',
      extractedData: {
        documentType: 'Electricity Invoice',
        vendor: 'Local Power Company',
        location: 'Facility #' + Math.floor(Math.random() * 10),
        period: 'June 2026',
        energyUsage: Math.floor(Math.random() * 50000 + 20000),
        energyUnit: 'kWh',
        cost: Math.floor(Math.random() * 400000 + 200000),
        currency: 'INR'
      },
      calculatedEmissions: {
        scope: 'Scope 2',
        co2e: Math.random() * 50 + 20,
        emissionFactor: 'India Grid 2026 (0.84 kgCO₂e/kWh)',
        apiSource: 'Climatiq API v1.5'
      }
    };

    setUploadedFiles(prev => [completedDoc, ...prev]);
    setProcessingFile(null);
    toast.success(`${doc.fileName} processed successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI-Powered Data Ingestion</h1>
        <p className="text-gray-600 mt-1">Automatically extract emissions data from documents using AI</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-purple-700">Documents Processed</p>
            <FileCheck className="size-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-900">847</p>
          <p className="text-xs text-purple-600 mt-1">This month</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-blue-700">Time Saved</p>
            <TrendingUp className="size-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">87%</p>
          <p className="text-xs text-blue-600 mt-1">vs manual entry</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-green-700">Accuracy Rate</p>
            <CheckCircle2 className="size-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">99.2%</p>
          <p className="text-xs text-green-600 mt-1">AI extraction accuracy</p>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-amber-700">Data Sources</p>
            <Database className="size-5 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-amber-900">12</p>
          <p className="text-xs text-amber-600 mt-1">Connected APIs</p>
        </Card>
      </div>

      {/* Upload Zone */}
      <Card className="p-8 border-2 border-dashed border-gray-300 hover:border-emerald-400 transition-colors">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`text-center transition-all ${isDragging ? 'scale-105' : ''}`}
        >
          <div className={`p-6 rounded-full inline-block mb-4 ${isDragging ? 'bg-emerald-100' : 'bg-gray-100'}`}>
            <Upload className={`size-12 ${isDragging ? 'text-emerald-600' : 'text-gray-400'}`} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isDragging ? 'Drop files here!' : 'Upload Documents for AI Processing'}
          </h3>
          <p className="text-gray-600 mb-6">
            Drag & drop utility bills, fuel receipts, or supplier invoices
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <label className="cursor-pointer">
              <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600">
                <Upload className="size-4" />
                Choose Files
              </Button>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileInput}
                className="hidden"
              />
            </label>
            <span className="text-sm text-gray-500">or drag and drop</span>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="outline" className="bg-white">
              <FileText className="size-3 mr-1" />
              PDF
            </Badge>
            <Badge variant="outline" className="bg-white">
              <ImageIcon className="size-3 mr-1" />
              JPG/PNG
            </Badge>
            <Badge variant="outline" className="bg-white">
              <Sparkles className="size-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
        </div>
      </Card>

      {/* Processing Animation */}
      <AnimatePresence>
        {processingFile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Loader2 className="size-6 text-purple-600 animate-spin" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-purple-900 mb-1">
                    AI Processing: {processingFile.fileName}
                  </h3>
                  <p className="text-sm text-purple-700">
                    Using GPT-4 Vision + Climatiq Carbon API
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {processingFile.processingSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      step.status === 'completed' ? 'bg-green-50 border border-green-200' :
                      step.status === 'processing' ? 'bg-blue-50 border border-blue-200' :
                      'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    {step.status === 'completed' && <CheckCircle2 className="size-5 text-green-600" />}
                    {step.status === 'processing' && <Loader2 className="size-5 text-blue-600 animate-spin" />}
                    {step.status === 'pending' && <div className="size-5 rounded-full border-2 border-gray-300" />}
                    
                    <div className="flex-1">
                      <p className="text-sm font-medium">{step.step}</p>
                      {step.duration && (
                        <p className="text-xs text-gray-600">{step.duration.toFixed(1)}s</p>
                      )}
                    </div>

                    {step.status === 'processing' && (
                      <Loader2 className="size-4 text-blue-600 animate-spin" />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How It Works */}
      <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <Sparkles className="size-8 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-emerald-900 mb-2">The Magic: How AI Automation Works</h3>
            <p className="text-sm text-emerald-700">
              Our platform eliminates manual data entry using state-of-the-art AI and carbon calculation APIs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="size-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <Upload className="size-5 text-purple-600" />
            </div>
            <p className="text-xs font-bold text-gray-900 mb-1">1. Upload</p>
            <p className="text-xs text-gray-600">PDF/Image upload</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="size-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Sparkles className="size-5 text-blue-600" />
            </div>
            <p className="text-xs font-bold text-gray-900 mb-1">2. AI OCR</p>
            <p className="text-xs text-gray-600">GPT-4 Vision extraction</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="size-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
              <Database className="size-5 text-emerald-600" />
            </div>
            <p className="text-xs font-bold text-gray-900 mb-1">3. Parse Data</p>
            <p className="text-xs text-gray-600">Extract kWh, liters, cost</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="size-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
              <Zap className="size-5 text-amber-600" />
            </div>
            <p className="text-xs font-bold text-gray-900 mb-1">4. Carbon API</p>
            <p className="text-xs text-gray-600">Climatiq calculation</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="size-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <CheckCircle2 className="size-5 text-green-600" />
            </div>
            <p className="text-xs font-bold text-gray-900 mb-1">5. Auto-Save</p>
            <p className="text-xs text-gray-600">PostgreSQL storage</p>
          </div>
        </div>
      </Card>

      {/* Recent Uploads */}
      <Card className="p-6">
        <h3 className="font-bold text-lg mb-4">Recently Processed Documents</h3>
        <div className="space-y-3">
          {uploadedFiles.map((doc, idx) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-white rounded-lg border border-gray-200">
                    <FileText className="size-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-sm">{doc.fileName}</h4>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle2 className="size-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <FileText className="size-3" />
                        {doc.extractedData.documentType}
                      </div>
                      {doc.extractedData.vendor && (
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {doc.extractedData.vendor}
                        </div>
                      )}
                      {doc.extractedData.period && (
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {doc.extractedData.period}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Zap className="size-3" />
                        {doc.processingSteps.reduce((sum, s) => sum + (s.duration || 0), 0).toFixed(1)}s
                      </div>
                    </div>

                    {/* Extracted Data */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      {doc.extractedData.energyUsage && (
                        <div>
                          <p className="text-xs text-gray-600">Energy Usage</p>
                          <p className="text-sm font-bold text-gray-900">
                            {doc.extractedData.energyUsage.toLocaleString()} {doc.extractedData.energyUnit}
                          </p>
                        </div>
                      )}
                      {doc.extractedData.fuelConsumption && (
                        <div>
                          <p className="text-xs text-gray-600">Fuel Consumption</p>
                          <p className="text-sm font-bold text-gray-900">
                            {doc.extractedData.fuelConsumption.toLocaleString()} {doc.extractedData.fuelUnit}
                          </p>
                        </div>
                      )}
                      {doc.extractedData.cost && (
                        <div>
                          <p className="text-xs text-gray-600">Cost</p>
                          <p className="text-sm font-bold text-gray-900">
                            {doc.extractedData.currency} {doc.extractedData.cost.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {doc.calculatedEmissions && (
                        <div className="md:col-span-3 pt-3 border-t">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-600">Calculated Emissions</p>
                              <p className="text-lg font-bold text-emerald-600">
                                {doc.calculatedEmissions.co2e.toFixed(2)} tCO₂e
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {doc.calculatedEmissions.scope} • {doc.calculatedEmissions.apiSource}
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700">
                              {doc.calculatedEmissions.emissionFactor}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* API Integration Info */}
      <Card className="p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="flex items-start gap-4">
          <div className="p-4 bg-white rounded-xl shadow-sm">
            <Database className="size-8 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-blue-900 mb-2">Connected Carbon Calculation APIs</h3>
            <p className="text-sm text-blue-700 mb-4">
              Real-time emission factors from trusted sources - no manual lookup required
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-xs text-gray-600">Climatiq API</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="size-2 bg-green-500 rounded-full"></div>
                  <p className="text-xs font-bold text-green-600">Connected</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-xs text-gray-600">EPA Factors</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="size-2 bg-green-500 rounded-full"></div>
                  <p className="text-xs font-bold text-green-600">Connected</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-xs text-gray-600">DEFRA Database</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="size-2 bg-green-500 rounded-full"></div>
                  <p className="text-xs font-bold text-green-600">Connected</p>
                </div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="text-xs text-gray-600">GHG Protocol</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="size-2 bg-green-500 rounded-full"></div>
                  <p className="text-xs font-bold text-green-600">Connected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
