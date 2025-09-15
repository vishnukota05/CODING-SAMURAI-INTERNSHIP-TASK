"use client";

import { useState, useRef, ChangeEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Upload, Download, Play } from "lucide-react";

interface StockDataPoint {
  date: string;
  price: number;
}

interface PredictionPoint extends StockDataPoint {
  predicted?: number;
}

export default function StockPredictor() {
  const [stockData, setStockData] = useState<StockDataPoint[]>([]);
  const [predictions, setPredictions] = useState<PredictionPoint[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const lines = content.split('\n').slice(1); // Skip header
        const data: StockDataPoint[] = [];
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          const [date, price] = line.split(',');
          if (date && price) {
            data.push({
              date: date.trim(),
              price: parseFloat(price.trim())
            });
          }
        }
        
        // Sort by date
        data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setStockData(data);
        setPredictions([]);
      } catch (error) {
        console.error("Error parsing CSV:", error);
        alert("Error parsing CSV file. Please check the format.");
      } finally {
        setIsProcessing(false);
      }
    };
    
    reader.readAsText(file);
  };

  const generatePredictions = () => {
    if (stockData.length < 2) {
      alert("Need at least 2 data points for prediction");
      return;
    }

    setIsProcessing(true);
    
    // Simple linear regression implementation
    const n = stockData.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    
    // Convert dates to numeric values for regression
    const numericDates = stockData.map((_, i) => i);
    const prices = stockData.map(d => d.price);
    
    for (let i = 0; i < n; i++) {
      const x = numericDates[i];
      const y = prices[i];
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Generate predictions for next 10 days
    const extendedData: PredictionPoint[] = [...stockData];
    for (let i = 1; i <= 10; i++) {
      const nextIndex = n - 1 + i;
      const predictedPrice = slope * nextIndex + intercept;
      const date = new Date(stockData[stockData.length - 1].date);
      date.setDate(date.getDate() + i);
      
      extendedData.push({
        date: date.toISOString().split('T')[0],
        price: predictedPrice,
        predicted: predictedPrice
      });
    }
    
    setPredictions(extendedData);
    setIsProcessing(false);
  };

  const downloadSampleData = () => {
    const csvContent = "date,price\n2023-01-01,150.25\n2023-01-02,152.10\n2023-01-03,149.75\n2023-01-04,153.40\n2023-01-05,155.20\n2023-01-06,154.80\n2023-01-07,156.90\n2023-01-08,158.30\n2023-01-09,157.60\n2023-01-10,159.20";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-stock-data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const chartData = predictions.length > 0 ? predictions : stockData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">AI Stock Price Predictor</h1>
          <p className="text-gray-600">Upload historical data and generate price predictions</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Data Input Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Data Input</CardTitle>
              <CardDescription>Upload your stock price data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="stock-data">Upload CSV File</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="stock-data"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="flex-1"
                    disabled={isProcessing}
                  />
                  <Button 
                    onClick={() => fileInputRef.current?.click()} 
                    disabled={isProcessing}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Browse
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  CSV format: date,price (e.g., 2023-01-01,150.25)
                </p>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={downloadSampleData} 
                  variant="outline" 
                  className="flex items-center gap-2"
                  disabled={isProcessing}
                >
                  <Download className="w-4 h-4" />
                  Download Sample Data
                </Button>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={generatePredictions} 
                  disabled={stockData.length === 0 || isProcessing}
                  className="w-full flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  {isProcessing ? "Processing..." : "Generate Predictions"}
                </Button>
              </div>

              {stockData.length > 0 && (
                <div className="pt-4">
                  <h3 className="font-medium text-gray-700 mb-2">Data Preview</h3>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-1">Date</th>
                          <th className="text-right py-1">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stockData.slice(0, 5).map((data, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="py-1">{data.date}</td>
                            <td className="text-right py-1">${data.price.toFixed(2)}</td>
                          </tr>
                        ))}
                        {stockData.length > 5 && (
                          <tr>
                            <td colSpan={2} className="text-center py-2 text-gray-500">
                              ... and {stockData.length - 5} more rows
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visualization Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Stock Price Visualization</CardTitle>
              <CardDescription>
                {predictions.length > 0 
                  ? "Historical data and AI predictions" 
                  : "Upload data to visualize stock prices"}
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth()+1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="price"
                      name="Historical Price"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      activeDot={{ r: 6 }}
                    />
                    {predictions.length > 0 && (
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        name="Predicted Price"
                        stroke="#10b981"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 2 }}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mb-4" />
                  <p>No data to display</p>
                  <p className="text-sm mt-1">Upload a CSV file to visualize stock data</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <Card className="mt-6 shadow-lg">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-700 mb-2">1. Upload Data</h3>
                <p className="text-sm text-gray-600">
                  Upload a CSV file with historical stock prices. The file should have two columns: date and price.
                </p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg">
                <h3 className="font-semibold text-indigo-700 mb-2">2. Generate Predictions</h3>
                <p className="text-sm text-gray-600">
                  Our AI model uses linear regression to analyze trends and predict future stock prices.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">3. Visualize Results</h3>
                <p className="text-sm text-gray-600">
                  View historical data and predictions on an interactive chart to make informed decisions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}