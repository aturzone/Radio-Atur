
/**
 * Utility functions to fix scrolling issues in the application
 */

// Apply scrolling to specific container elements
export const setupScrollableContainers = () => {
  // Find potential containers that need scrolling behavior
  const containers = document.querySelectorAll('.playlist-container, .menu-container, .drawer-content');
  
  containers.forEach(container => {
    if (container instanceof HTMLElement) {
      // Ensure container has proper height constraints
      if (!container.style.maxHeight) {
        container.style.maxHeight = '80vh';
      }
      
      // Add overflow handling
      container.style.overflowY = 'auto';
      container.style.overflowX = 'hidden';
      
      // Add styling for better UX
      container.style.scrollbarWidth = 'thin';
      container.style.scrollbarColor = 'var(--coffee) var(--background)';
      
      // Add webkit scrollbar styling
      const style = document.createElement('style');
      style.textContent = `
        .playlist-container::-webkit-scrollbar,
        .menu-container::-webkit-scrollbar,
        .drawer-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .playlist-container::-webkit-scrollbar-thumb,
        .menu-container::-webkit-scrollbar-thumb,
        .drawer-content::-webkit-scrollbar-thumb {
          background-color: var(--coffee);
          border-radius: 3px;
        }
        
        .playlist-container::-webkit-scrollbar-track,
        .menu-container::-webkit-scrollbar-track,
        .drawer-content::-webkit-scrollbar-track {
          background-color: var(--background);
        }
      `;
      
      document.head.appendChild(style);
    }
  });
};

// Create a mutation observer to detect when new elements are added
export const observeContentChanges = () => {
  // Create observer instance
  const observer = new MutationObserver((mutations) => {
    let shouldRecheckContainers = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Check if any added nodes are potential containers or contain potential containers
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            if (
              node.classList.contains('playlist-container') ||
              node.classList.contains('menu-container') ||
              node.classList.contains('drawer-content') ||
              node.querySelector('.playlist-container, .menu-container, .drawer-content')
            ) {
              shouldRecheckContainers = true;
            }
          }
        });
      }
    });
    
    if (shouldRecheckContainers) {
      setupScrollableContainers();
    }
  });
  
  // Start observing the document body for DOM changes
  observer.observe(document.body, { 
    childList: true, 
    subtree: true 
  });
  
  return observer;
};

// Add touch scrolling support for mobile devices
export const enhanceMobileScrolling = () => {
  // Add touch event listeners to make scrolling more responsive on touch devices
  const addTouchScrolling = (container: HTMLElement) => {
    let startY: number | null = null;
    let startScrollTop: number | null = null;
    
    container.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
      startScrollTop = container.scrollTop;
    }, { passive: true });
    
    container.addEventListener('touchmove', (e) => {
      if (startY === null || startScrollTop === null) return;
      
      const deltaY = startY - e.touches[0].clientY;
      container.scrollTop = startScrollTop + deltaY;
    }, { passive: true });
  };
  
  // Find and enhance all scrollable containers
  const containers = document.querySelectorAll('.playlist-container, .menu-container, .drawer-content');
  containers.forEach(container => {
    if (container instanceof HTMLElement) {
      addTouchScrolling(container);
    }
  });
};

// Initialize all scroll fixes
export const initializeScrollFixes = () => {
  setupScrollableContainers();
  const observer = observeContentChanges();
  enhanceMobileScrolling();
  
  // Return cleanup function
  return () => {
    observer.disconnect();
  };
};
