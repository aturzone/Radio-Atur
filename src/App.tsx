import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Radio from "./pages/Radio";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import MusicLibrary from "./pages/MusicLibrary";
import { PlaylistProvider } from "./contexts/PlaylistContext";
import { GoogleIntegrationProvider } from "./contexts/GoogleIntegrationContext";
import { setupScrollableContainers, observeContentChanges } from "./utils/scrollFix";

// Create query client for data fetching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000, // 1 minute
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  // Listen for color theme changes
  useEffect(() => {
    // Check for saved color theme
    const savedColorTheme = localStorage.getItem('colorTheme') || 'default';
    document.documentElement.classList.add(`theme-${savedColorTheme}`);
  
    return () => {
      document.documentElement.classList.remove('theme-default', 'theme-coffee', 'theme-blue', 
        'theme-green', 'theme-purple', 'theme-orange', 'theme-red', 'theme-black');
    };
  }, []);
  
  // Set up scrollable containers for playlists and menus
  useEffect(() => {
    // Initialize scrollable containers
    setupScrollableContainers();
    
    // Observe content changes to reapply scrolling
    observeContentChanges();
    
    // Make sure all menus have proper scrolling
    const applyScrollToMenus = () => {
      const menuContainers = document.querySelectorAll('.menu-container, .playlist-container, .drawer-container');
      menuContainers.forEach(container => {
        if (container instanceof HTMLElement) {
          container.style.overflowY = 'auto';
          container.style.maxHeight = '80vh';
        }
      });
    };
    
    // Initial application
    applyScrollToMenus();
    
    // Schedule periodic checks for dynamically added menus
    const interval = setInterval(applyScrollToMenus, 2000);
    
    // Cleanup observer on unmount
    return () => {
      clearInterval(interval);
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <PlaylistProvider>
          <GoogleIntegrationProvider>
            <Toaster />
            <Sonner position="top-center" />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/radio" element={<Radio />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/music-library" element={<MusicLibrary />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </GoogleIntegrationProvider>
        </PlaylistProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
