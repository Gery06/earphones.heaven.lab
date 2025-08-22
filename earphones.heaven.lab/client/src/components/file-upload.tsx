import { useCallback, useRef } from 'react';
import { Upload, Folder, X, RefreshCw, FileAudio } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AudioFile } from '@/hooks/use-audio';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  currentFile?: AudioFile | null;
  onRemoveFile?: () => void;
}

export default function FileUpload({ onFileSelect, isLoading = false, currentFile, onRemoveFile }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((file: File) => {
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/m4a', 'audio/mp4'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!validTypes.some(type => file.type.startsWith(type.split('/')[0]))) {
      alert('Please select a valid audio file (MP3, WAV, FLAC, M4A)');
      return;
    }

    if (file.size > maxSize) {
      alert('File size must be less than 100MB');
      return;
    }

    onFileSelect(file);
  }, [onFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="mb-8">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileInputChange}
        className="hidden"
        data-testid="file-input"
      />
      
      {currentFile ? (
        // File uploaded state
        <Card className="border border-accent-blue bg-card">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-lg bg-accent-blue/10 flex items-center justify-center">
                  <FileAudio className="w-6 h-6 text-accent-blue" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground" data-testid="text-current-filename">
                    {currentFile.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentFile.format?.toUpperCase()} • {formatFileSize(currentFile.file.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-accent-blue hover:bg-accent-blue/80 text-black font-medium"
                  size="sm"
                  data-testid="button-replace-file"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Replace
                </Button>
                <Button
                  onClick={onRemoveFile}
                  className="bg-accent-blue hover:bg-accent-blue/80 text-black font-medium"
                  size="sm"
                  data-testid="button-remove-file"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Format:</span>
                <span className="ml-2 text-foreground" data-testid="text-file-format">
                  {currentFile.format?.toUpperCase() || '-'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Sample Rate:</span>
                <span className="ml-2 text-foreground" data-testid="text-file-sample-rate">
                  {currentFile.sampleRate ? `${currentFile.sampleRate} Hz` : '-'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Bitrate:</span>
                <span className="ml-2 text-foreground" data-testid="text-file-bitrate">
                  {currentFile.bitrate || '-'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Size:</span>
                <span className="ml-2 text-foreground" data-testid="text-file-size">
                  {formatFileSize(currentFile.file.size)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Upload area state
        <Card 
          className="border-2 border-dashed border-gray-700 bg-card hover:border-accent-blue transition-all cursor-pointer glow-effect p-12 text-center"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleClick}
          data-testid="file-upload-area"
        >
          <div className="mb-6">
            <Upload className="w-16 h-16 text-accent-blue mb-4 mx-auto" />
            <h3 className="text-2xl font-semibold mb-2 text-foreground">
              {isLoading ? 'Processing...' : 'Upload Your Audio File'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag & drop your audio file here or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supports MP3, WAV, FLAC, M4A • Max file size: 100MB
            </p>
          </div>
          
          <Button 
            className="bg-accent-blue hover:bg-accent-blue/80 text-black font-medium"
            disabled={isLoading}
            data-testid="button-choose-file"
          >
            <Folder className="w-4 h-4 mr-2" />
            {isLoading ? 'Processing...' : 'Choose File'}
          </Button>
        </Card>
      )}
    </div>
  );
}
