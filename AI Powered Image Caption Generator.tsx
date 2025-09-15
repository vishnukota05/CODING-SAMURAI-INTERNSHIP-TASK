"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Image as ImageIcon, Download } from "lucide-react";

export default function ImageCaptionGenerator() {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match("image.*")) {
      setError("Please upload an image file (JPEG, PNG, etc.)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit");
      return;
    }

    setError("");
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target?.result as string);
      setCaption("");
    };
    reader.readAsDataURL(file);
  };

  const generateCaption = () => {
    if (!image) {
      setError("Please upload an image first");
      return;
    }

    setIsLoading(true);
    setError("");
    
    // Simulate AI processing delay
    setTimeout(() => {
      // In a real app, this would be the API response
      const captions = [
        "A beautiful sunset over the mountains with vibrant orange and pink hues",
        "A cute golden retriever playing in a green meadow on a sunny day",
        "A modern city skyline at night with illuminated buildings and busy streets",
        "A delicious plate of pasta with fresh basil and parmesan cheese",
        "A serene beach scene with turquoise water and white sandy shores"
      ];
      
      const randomCaption = captions[Math.floor(Math.random() * captions.length)];
      setCaption(randomCaption);
      setIsLoading(false);
    }, 1500);
  };

  const saveCaptionToFile = () => {
    if (!caption) return;
    
    const element = document.createElement("a");
    const file = new Blob([`Image: ${fileName}\n\nCaption: ${caption}`], {
      type: "text/plain"
    });
    element.href = URL.createObjectURL(file);
    element.download = `${fileName.split('.')[0]}_caption.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">AI Image Caption Generator</CardTitle>
          <CardDescription className="text-lg">
            Upload an image and let AI generate a descriptive caption
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Upload Area */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors bg-white"
            onClick={triggerFileInput}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            
            {image ? (
              <div className="flex justify-center">
                <img 
                  src={image} 
                  alt="Uploaded preview" 
                  className="max-h-64 rounded-lg object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-4">
                <Upload className="h-12 w-12 text-gray-400" />
                <div>
                  <p className="font-medium">Click to upload an image</p>
                  <p className="text-sm text-gray-500">JPEG, PNG up to 5MB</p>
                </div>
              </div>
            )}
          </div>
          
          {error && (
            <div className="text-red-500 text-center py-2">{error}</div>
          )}
          
          {/* Generate Button */}
          <div className="flex justify-center">
            <Button 
              onClick={generateCaption} 
              disabled={isLoading || !image}
              className="w-full max-w-xs"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : (
                <span className="flex items-center">
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Generate Caption
                </span>
              )}
            </Button>
          </div>
          
          {/* Caption Display */}
          {caption && (
            <Card className="bg-indigo-50 border-indigo-200">
              <CardContent className="pt-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-indigo-800">AI Generated Caption</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={saveCaptionToFile}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="mt-2 text-gray-700">{caption}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Info Section */}
          <div className="text-center text-sm text-gray-500 pt-4">
            <p>Powered by advanced computer vision and natural language processing</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}