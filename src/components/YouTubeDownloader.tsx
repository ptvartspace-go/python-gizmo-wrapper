import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  PlayCircle,
  List,
  Settings,
  Info
} from 'lucide-react';

type DownloadStatus = 'idle' | 'analyzing' | 'downloading' | 'success' | 'error';
type ContentType = 'video' | 'playlist';
type QualityOption = 'best' | 'good' | 'standard';

interface VideoInfo {
  title: string;
  uploader: string;
  duration: number;
  thumbnail?: string;
  isAgeRestricted: boolean;
  isPlaylist: boolean;
  playlistCount?: number;
}

interface DownloadOptions {
  quality: QualityOption;
  downloadPath: string;
  playlistChoice: 'single' | 'playlist' | 'cancel';
}

const YouTubeDownloader = () => {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<DownloadStatus>('idle');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [options, setOptions] = useState<DownloadOptions>({
    quality: 'good',
    downloadPath: './downloads',
    playlistChoice: 'single'
  });
  const [progress, setProgress] = useState(0);
  const [currentMethod, setCurrentMethod] = useState<string>('');
  const [showPlaylistDialog, setShowPlaylistDialog] = useState(false);
  const [error, setError] = useState<string>('');

  const { toast } = useToast();

  // Simulate video info extraction
  const analyzeUrl = async (inputUrl: string) => {
    if (!inputUrl.includes('youtube.com') && !inputUrl.includes('youtu.be')) {
      throw new Error('Please enter a valid YouTube URL');
    }

    setStatus('analyzing');
    setProgress(0);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Detect if it's a playlist
    const isPlaylist = inputUrl.includes('list=');
    
    // Mock video info
    const mockInfo: VideoInfo = {
      title: isPlaylist ? 'Sample Playlist Video' : 'Sample YouTube Video',
      uploader: 'Sample Channel',
      duration: 240, // 4 minutes
      isAgeRestricted: Math.random() > 0.7, // 30% chance of age restriction
      isPlaylist,
      playlistCount: isPlaylist ? Math.floor(Math.random() * 50) + 5 : undefined
    };

    setVideoInfo(mockInfo);

    if (isPlaylist) {
      setShowPlaylistDialog(true);
    }

    return mockInfo;
  };

  // Simulate download process
  const simulateDownload = async () => {
    const methods = [
      'Embed bypass method',
      'Android client method', 
      'Web embedded client method',
      'Alternative client method',
      'Cookie authentication method'
    ];

    setStatus('downloading');
    setProgress(0);

    for (let i = 0; i < methods.length; i++) {
      setCurrentMethod(methods[i]);
      
      // Simulate method attempt
      for (let j = 0; j <= 100; j += 10) {
        setProgress((i * 100 + j) / methods.length);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Higher chance of success with later methods if age-restricted
      const successChance = videoInfo?.isAgeRestricted 
        ? (i + 1) / methods.length * 0.8  // Harder for age-restricted
        : 0.9; // Easy for normal videos

      if (Math.random() < successChance) {
        setStatus('success');
        setProgress(100);
        toast({
          title: "Download Complete!",
          description: `Successfully downloaded: ${videoInfo?.title}`,
        });
        return;
      }
    }

    // All methods failed
    setStatus('error');
    setError('All download methods failed. This age-restricted video cannot be downloaded automatically.');
  };

  const handleDownload = async () => {
    try {
      setError('');
      
      if (!url) {
        toast({
          title: "Error",
          description: "Please enter a YouTube URL",
          variant: "destructive"
        });
        return;
      }

      await analyzeUrl(url);
      
      if (!showPlaylistDialog) {
        await simulateDownload();
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: "destructive"
      });
    }
  };

  const handlePlaylistChoice = async (choice: 'single' | 'playlist' | 'cancel') => {
    setOptions(prev => ({ ...prev, playlistChoice: choice }));
    setShowPlaylistDialog(false);

    if (choice === 'cancel') {
      setStatus('idle');
      setVideoInfo(null);
      return;
    }

    if (choice === 'playlist' && videoInfo?.playlistCount && videoInfo.playlistCount > 20) {
      const confirm = window.confirm(
        `This playlist has ${videoInfo.playlistCount} videos! This could take a very long time. Continue?`
      );
      if (!confirm) {
        setStatus('idle');
        setVideoInfo(null);
        return;
      }
    }

    await simulateDownload();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const reset = () => {
    setStatus('idle');
    setVideoInfo(null);
    setProgress(0);
    setCurrentMethod('');
    setError('');
    setShowPlaylistDialog(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
            YouTube Video Downloader
          </h1>
          <p className="text-muted-foreground text-lg">
            Download YouTube videos with multiple bypass methods for age-restricted content
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-[var(--shadow-card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Download Video
            </CardTitle>
            <CardDescription>
              Enter a YouTube URL to download the video at the highest available quality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="url">YouTube URL</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={status === 'analyzing' || status === 'downloading'}
                />
                <Button 
                  onClick={handleDownload}
                  disabled={status === 'analyzing' || status === 'downloading'}
                  className="px-6"
                >
                  {status === 'analyzing' ? 'Analyzing...' : status === 'downloading' ? 'Downloading...' : 'Download'}
                </Button>
              </div>
            </div>

            {/* Download Options */}
            {status === 'idle' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>Quality Options</Label>
                  <RadioGroup
                    value={options.quality}
                    onValueChange={(value: QualityOption) => 
                      setOptions(prev => ({ ...prev, quality: value }))
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="best" id="best" />
                      <Label htmlFor="best">Best Quality (Largest files)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="good" id="good" />
                      <Label htmlFor="good">Good Quality (720p, Balanced)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="standard" />
                      <Label htmlFor="standard">Standard Quality (480p, Fastest)</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="path">Download Folder</Label>
                  <Input
                    id="path"
                    value={options.downloadPath}
                    onChange={(e) => setOptions(prev => ({ ...prev, downloadPath: e.target.value }))}
                    placeholder="./downloads"
                  />
                </div>
              </div>
            )}

            {/* Video Info Display */}
            {videoInfo && !showPlaylistDialog && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <PlayCircle className="h-5 w-5 text-primary" />
                          {videoInfo.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {videoInfo.uploader}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDuration(videoInfo.duration)}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {videoInfo.isAgeRestricted && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Age Restricted
                          </Badge>
                        )}
                        {videoInfo.isPlaylist && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <List className="h-3 w-3" />
                            Playlist ({videoInfo.playlistCount} videos)
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Playlist Dialog */}
            {showPlaylistDialog && videoInfo && (
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <List className="h-5 w-5" />
                    Playlist Detected
                  </CardTitle>
                  <CardDescription>
                    This URL contains a playlist with {videoInfo.playlistCount} videos. What would you like to download?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => handlePlaylistChoice('single')}
                      className="flex-1"
                    >
                      Just this video
                    </Button>
                    <Button 
                      onClick={() => handlePlaylistChoice('playlist')}
                      className="flex-1"
                    >
                      Entire playlist ({videoInfo.playlistCount} videos)
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => handlePlaylistChoice('cancel')}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Progress Display */}
            {(status === 'analyzing' || status === 'downloading') && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {status === 'analyzing' ? 'Analyzing video...' : 'Downloading...'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress value={progress} className="w-full" />
                    {currentMethod && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Settings className="h-4 w-4 animate-spin" />
                        Trying: {currentMethod}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Success State */}
            {status === 'success' && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Download completed successfully! Video saved to: {options.downloadPath}
                </AlertDescription>
              </Alert>
            )}

            {/* Error State */}
            {status === 'error' && error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Reset Button */}
            {(status === 'success' || status === 'error') && (
              <div className="flex justify-center">
                <Button onClick={reset} variant="outline">
                  Download Another Video
                </Button>
              </div>
            )}

            <Separator />

            {/* Info Section */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-500" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>This interface replicates your Python YouTube downloader with multiple bypass methods:</p>
                <ul className="space-y-1 ml-4">
                  <li>• <strong>Method 1:</strong> Embed bypass for basic age restrictions</li>
                  <li>• <strong>Method 2:</strong> Alternative YouTube clients (Android, Web Creator)</li>
                  <li>• <strong>Method 3:</strong> Cookie authentication for signed-in access</li>
                  <li>• <strong>Method 4:</strong> Direct URL manipulation as fallback</li>
                </ul>
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Note:</strong> This is a UI demonstration. To make it functional, you'll need to integrate 
                    your Python backend as an API service that this interface can call.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default YouTubeDownloader;