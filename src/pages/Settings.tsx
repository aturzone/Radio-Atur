import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, 
  ArrowLeft, 
  Moon, 
  Sun, 
  BookOpen, 
  Music, 
  RefreshCw,
  Mail,
  Folder,
  PlusCircle,
  HardDrive,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';
import { ScrollArea } from '@/components/ui/scroll-area';
import GoogleSyncPanel from '../components/GoogleSyncPanel';
import BackupPanel from '../components/BackupPanel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// Color theme choice component with visual preview
const ColorThemeOption = ({ color, name, current, onClick }) => (
  <div 
    className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
      current === color 
        ? 'border-primary scale-105' 
        : 'border-transparent hover:border-primary/50'
    }`}
    onClick={() => onClick(color)}
  >
    <div className="relative w-full h-16 mb-2 rounded-md overflow-hidden">
      {/* Theme preview visualization */}
      {color === 'default' && (
        <div className="absolute inset-0 bg-gradient-to-br from-coffee-light to-coffee flex items-end">
          <div className="w-full h-1/3 bg-coffee-dark/90" />
        </div>
      )}
      {color === 'coffee' && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-800 flex items-end">
          <div className="w-full h-1/3 bg-amber-900/90" />
        </div>
      )}
      {color === 'blue' && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-600 flex items-end">
          <div className="w-full h-1/3 bg-blue-800/90" />
        </div>
      )}
      {color === 'green' && (
        <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-600 flex items-end">
          <div className="w-full h-1/3 bg-green-800/90" />
        </div>
      )}
      {color === 'purple' && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-600 flex items-end">
          <div className="w-full h-1/3 bg-purple-800/90" />
        </div>
      )}
      {color === 'orange' && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-orange-500 flex items-end">
          <div className="w-full h-1/3 bg-orange-700/90" />
        </div>
      )}
      {color === 'red' && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-100 to-red-600 flex items-end">
          <div className="w-full h-1/3 bg-red-800/90" />
        </div>
      )}
      {color === 'black' && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-end">
          <div className="w-full h-1/3 bg-black/90" />
        </div>
      )}
    </div>
    <div className="text-center text-sm font-medium">{name}</div>
  </div>
);

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [scanDirectories, setScanDirectories] = useState<string[]>(() => {
    const saved = localStorage.getItem('scanDirectories');
    return saved ? JSON.parse(saved) : ['/Music', '/Downloads'];
  });
  const [newDirectory, setNewDirectory] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [appMode, setAppMode] = useState(theme === 'dark' ? 'night' : 'day');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [interfaceColor, setInterfaceColor] = useState(() => {
    return localStorage.getItem('colorTheme') || 'default';
  });
  
  // Color theme choices
  const colorThemes = [
    { name: 'Default', value: 'default' },
    { name: 'Coffee', value: 'coffee' },
    { name: 'Ocean Blue', value: 'blue' },
    { name: 'Forest Green', value: 'green' },
    { name: 'Purple Haze', value: 'purple' },
    { name: 'Sunset Orange', value: 'orange' },
    { name: 'Cherry Red', value: 'red' },
    { name: 'Midnight Black', value: 'black' },
  ];

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme === 'night' ? 'dark' : 'light');
    setAppMode(newTheme);
    toast.success(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`);
  };

  const handleColorChange = (color: string) => {
    setInterfaceColor(color);
    // Store the selected color theme
    localStorage.setItem('colorTheme', color);
    // Apply the color theme to the app
    document.documentElement.classList.remove('theme-default', 'theme-coffee', 'theme-blue', 'theme-green', 'theme-purple', 'theme-orange', 'theme-red', 'theme-black');
    document.documentElement.classList.add(`theme-${color}`);
    toast.success(`${color.charAt(0).toUpperCase() + color.slice(1)} theme applied`);
  };

  const handleAddDirectory = () => {
    if (newDirectory && !scanDirectories.includes(newDirectory)) {
      const updatedDirs = [...scanDirectories, newDirectory];
      setScanDirectories(updatedDirs);
      localStorage.setItem('scanDirectories', JSON.stringify(updatedDirs));
      setNewDirectory('');
      toast.success(`Added new scan directory: ${newDirectory}`);
    } else if (scanDirectories.includes(newDirectory)) {
      toast.error('Directory already in list');
    }
  };

  const handleRemoveDirectory = (dir: string) => {
    const updatedDirs = scanDirectories.filter(directory => directory !== dir);
    setScanDirectories(updatedDirs);
    localStorage.setItem('scanDirectories', JSON.stringify(updatedDirs));
    toast.success(`Removed scan directory: ${dir}`);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackEmail || !feedbackMessage) {
      toast.error('Please fill in all fields');
      return;
    }
    
    toast.success('Feedback submitted! Thank you for your input.');
    // Reset form
    setFeedbackEmail('');
    setFeedbackMessage('');
  };

  const resetSettings = () => {
    setTheme('light');
    setAppMode('day');
    setScanDirectories(['/Music', '/Downloads']);
    localStorage.setItem('scanDirectories', JSON.stringify(['/Music', '/Downloads']));
    setInterfaceColor('default');
    localStorage.setItem('colorTheme', 'default');
    document.documentElement.classList.remove('theme-default', 'theme-coffee', 'theme-blue', 'theme-green', 'theme-purple', 'theme-orange', 'theme-red', 'theme-black');
    document.documentElement.classList.add('theme-default');
    setIsResetDialogOpen(false);
    toast.success('Settings have been reset to default values');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="p-4 bg-coffee dark:bg-coffee-dark shadow-sm flex items-center">
        <Button variant="ghost" onClick={() => navigate('/')} className="mr-2 text-coffee-light hover:scale-105 transition-transform">
          <ArrowLeft className="h-6 w-6" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-coffee-light text-xl font-semibold flex items-center">
          <SettingsIcon className="h-6 w-6 mr-2" />
          Settings
        </h1>
      </header>

      {/* Main content */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-3xl mx-auto space-y-6 pb-20">
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="library">Music Library</TabsTrigger>
              <TabsTrigger value="sync">Google Sync</TabsTrigger>
              <TabsTrigger value="backup">Backup</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>
            
            <TabsContent value="appearance" className="space-y-4">
              {/* Theme Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sun className="h-5 w-5 mr-2" />
                    <span>Display Mode</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant={appMode === 'day' ? 'default' : 'outline'} 
                      onClick={() => handleThemeChange('day')}
                      className="flex flex-col items-center p-6 h-auto hover:scale-105 transition-transform"
                    >
                      <Sun className="h-10 w-10 mb-2" />
                      <span>Day Mode</span>
                    </Button>
                    <Button 
                      variant={appMode === 'night' ? 'default' : 'outline'} 
                      onClick={() => handleThemeChange('night')}
                      className="flex flex-col items-center p-6 h-auto hover:scale-105 transition-transform"
                    >
                      <Moon className="h-10 w-10 mb-2" />
                      <span>Night Mode</span>
                    </Button>
                    <Button 
                      variant={appMode === 'study' ? 'default' : 'outline'} 
                      onClick={() => handleThemeChange('study')}
                      className="flex flex-col items-center p-6 h-auto hover:scale-105 transition-transform"
                    >
                      <BookOpen className="h-10 w-10 mb-2" />
                      <span>Study Mode</span>
                    </Button>
                    <Button 
                      variant={appMode === 'party' ? 'default' : 'outline'} 
                      onClick={() => handleThemeChange('party')}
                      className="flex flex-col items-center p-6 h-auto hover:scale-105 transition-transform"
                    >
                      <Music className="h-10 w-10 mb-2" />
                      <span>Party Mode</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Color Theme */}
              <Card>
                <CardHeader>
                  <CardTitle>Interface Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {colorThemes.map(color => (
                      <ColorThemeOption
                        key={color.value}
                        color={color.value}
                        name={color.name}
                        current={interfaceColor}
                        onClick={handleColorChange}
                      />
                    ))}
                  </div>
                  
                  <div className="pt-4">
                    <h3 className="text-sm font-medium mb-2">Advanced Color Options</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primary-color">Primary Color</Label>
                        <div className="flex mt-1">
                          <Input
                            id="primary-color"
                            type="color"
                            defaultValue="#8B7355" 
                            className="w-12 p-1 h-10 rounded-l-md"
                          />
                          <Input 
                            type="text"
                            defaultValue="#8B7355"
                            className="flex-1 rounded-l-none"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="accent-color">Accent Color</Label>
                        <div className="flex mt-1">
                          <Input 
                            id="accent-color"
                            type="color"
                            defaultValue="#5A4739"
                            className="w-12 p-1 h-10 rounded-l-md"
                          />
                          <Input 
                            type="text"
                            defaultValue="#5A4739"
                            className="flex-1 rounded-l-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reset Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <RefreshCw className="h-5 w-5 mr-2" />
                    <span>Reset Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">
                    Restore all settings to their default values. This will not affect your music library.
                  </p>
                  <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive">Reset All Settings</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reset All Settings?</DialogTitle>
                        <DialogDescription>
                          This will reset all your settings to their default values.
                          This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button variant="destructive" onClick={resetSettings}>
                          Reset Settings
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="library" className="space-y-4">
              {/* Music Library Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Music className="h-5 w-5 mr-2" />
                    <span>Music Library</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="text-sm font-medium">Scan Directories</h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {scanDirectories.map(dir => (
                      <div key={dir} className="flex justify-between items-center p-2 bg-muted/50 rounded-md">
                        <div className="flex items-center">
                          <Folder className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{dir}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveDirectory(dir)}
                          className="h-7 w-7 p-1 rounded-full hover:bg-destructive hover:text-destructive-foreground"
                        >
                          ✕
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 items-center">
                    <Input 
                      placeholder="Add directory path" 
                      value={newDirectory} 
                      onChange={(e) => setNewDirectory(e.target.value)} 
                      className="flex-1"
                    />
                    <Button onClick={handleAddDirectory} className="flex items-center gap-1">
                      <PlusCircle className="h-4 w-4" />
                      Add
                    </Button>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Only scan audio files</span>
                        <span className="text-sm text-gray-500">Only add music and audio files to the library</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Prevent duplicates</span>
                        <span className="text-sm text-gray-500">Skip files that already exist in your library</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Auto-scan on startup</span>
                        <span className="text-sm text-gray-500">Automatically scan directories when the app opens</span>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>File Organization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Organize by artist</span>
                        <span className="text-sm text-gray-500">Automatically create folders for artists</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Organize by album</span>
                        <span className="text-sm text-gray-500">Create subfolders for albums under artists</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">Extract metadata</span>
                        <span className="text-sm text-gray-500">Read ID3 tags from audio files</span>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sync" className="space-y-4">
              {/* Google Integration */}
              <GoogleSyncPanel />
            </TabsContent>
            
            <TabsContent value="backup" className="space-y-4">
              {/* Backup */}
              <BackupPanel />
            </TabsContent>
            
            <TabsContent value="feedback" className="space-y-4">
              {/* Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    <span>Send Feedback</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Your Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="your@email.com" 
                        value={feedbackEmail}
                        onChange={(e) => setFeedbackEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message" 
                        placeholder="Share your thoughts or suggestions..." 
                        rows={5}
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full">Send Feedback</Button>
                    <p className="text-xs text-center text-gray-500">
                      Feedback will be sent to dev@cozyaudio.cafe
                    </p>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Settings;
