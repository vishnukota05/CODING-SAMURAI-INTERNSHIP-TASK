"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Loader2 } from "lucide-react";

// Define types for our data
type DataType = "news" | "weather" | "products";

interface ScrapedData {
  id: string;
  [key: string]: string | number;
}

export default function WebScraperApp() {
  // State management
  const [url, setUrl] = useState("");
  const [dataType, setDataType] = useState<DataType | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [scrapedData, setScrapedData] = useState<ScrapedData[]>([]);
  const [isDownloadDisabled, setIsDownloadDisabled] = useState(true);

  // Validate URL format
  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Handle scraping simulation
  const handleScrape = async () => {
    // Reset previous state
    setError("");
    setScrapedData([]);

    // Validation
    if (!url) {
      setError("Please enter a URL");
      return;
    }

    if (!isValidUrl(url)) {
      setError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    if (!dataType) {
      setError("Please select a data type");
      return;
    }

    setIsLoading(true);
    setIsDownloadDisabled(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate mock data based on selected type
      let mockData: ScrapedData[] = [];
      
      switch (dataType) {
        case "news":
          mockData = [
            { id: "1", title: "Breaking News", date: "2023-05-15", source: "News Network" },
            { id: "2", title: "Tech Update", date: "2023-05-14", source: "Tech Daily" },
            { id: "3", title: "Sports Highlights", date: "2023-05-13", source: "Sports Central" },
          ];
          break;
        case "weather":
          mockData = [
            { id: "1", city: "New York", temperature: "22°C", condition: "Sunny" },
            { id: "2", city: "London", temperature: "18°C", condition: "Cloudy" },
            { id: "3", city: "Tokyo", temperature: "25°C", condition: "Rainy" },
          ];
          break;
        case "products":
          mockData = [
            { id: "1", name: "Laptop", price: "$999", rating: "4.5" },
            { id: "2", name: "Smartphone", price: "$699", rating: "4.2" },
            { id: "3", name: "Headphones", price: "$199", rating: "4.7" },
          ];
          break;
      }

      setScrapedData(mockData);
      setIsDownloadDisabled(false);
    } catch (err) {
      setError("Failed to scrape data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate CSV from data
  const downloadCSV = () => {
    if (scrapedData.length === 0) return;

    // Create CSV header
    const headers = Object.keys(scrapedData[0]).filter(key => key !== 'id');
    let csvContent = headers.join(',') + '\n';

    // Add data rows
    scrapedData.forEach(row => {
      const values = headers.map(header => 
        `"${String(row[header]).replace(/"/g, '""')}"`
      );
      csvContent += values.join(',') + '\n';
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `scraped-data-${dataType}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset download button when data changes
  useEffect(() => {
    setIsDownloadDisabled(scrapedData.length === 0);
  }, [scrapedData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Web Data Scraper
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Extract structured data from any website
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Scrape Website Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Data Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="data-type">Data Type</Label>
              <Select 
                value={dataType} 
                onValueChange={(value) => setDataType(value as DataType)}
                disabled={isLoading}
              >
                <SelectTrigger id="data-type">
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="news">News Articles</SelectItem>
                  <SelectItem value="weather">Weather Information</SelectItem>
                  <SelectItem value="products">Product Listings</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm py-2">{error}</div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                onClick={handleScrape} 
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  "Scrape Data"
                )}
              </Button>
              
              <Button 
                onClick={downloadCSV}
                disabled={isDownloadDisabled}
                variant="outline"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </div>

            {/* Results Section */}
            {scrapedData.length > 0 && (
              <div className="pt-6">
                <h3 className="text-lg font-medium mb-4">Scraped Data</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(scrapedData[0])
                          .filter(key => key !== 'id')
                          .map((header) => (
                            <TableHead key={header} className="font-medium">
                              {header.charAt(0).toUpperCase() + header.slice(1)}
                            </TableHead>
                          ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scrapedData.map((row) => (
                        <TableRow key={row.id}>
                          {Object.entries(row)
                            .filter(([key]) => key !== 'id')
                            .map(([key, value]) => (
                              <TableCell key={key}>{String(value)}</TableCell>
                            ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* No Data State */}
            {scrapedData.length === 0 && !isLoading && !error && (
              <div className="text-center py-8 text-gray-500">
                <p>Enter a URL and select a data type to scrape information</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="font-semibold text-lg mb-2">How It Works</h3>
            <p className="text-gray-600">
              Enter a website URL, select the type of data you want to extract, 
              and click "Scrape Data" to get structured information.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="font-semibold text-lg mb-2">Supported Formats</h3>
            <p className="text-gray-600">
              Extract news articles, weather data, product listings, 
              and more from any public website.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="font-semibold text-lg mb-2">Export Options</h3>
            <p className="text-gray-600">
              Download your scraped data as CSV files for easy 
              integration with spreadsheets and databases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}