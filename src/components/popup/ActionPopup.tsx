import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmPopupProps {
  action: "delete" | "update" | "create" | "confirm"| "cancel" ;
  message?: string | React.ReactNode;
  actionFunction: () => Promise<void> | void; // Supports async actions
  showPopup: boolean;
  setShowPopup: (showPopup: boolean) => void;
  secondAction?: (action: boolean) => void;
  secondActionText?: string;
  isSave?: (saved: boolean) => void;
}

const ActionPopup: React.FC<ConfirmPopupProps> = ({ 
  action, 
  message, 
  secondActionText, 
  secondAction, 
  actionFunction, 
  showPopup, 
  setShowPopup,
  isSave
}) => {
  // Add state to handle animation
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Add escape key listener
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showPopup) {
        handleClose();
      }
    };

    if (showPopup) {
      // Prevent scrolling when popup is open
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscKey);
      
      // Start entrance animation
      setTimeout(() => {
        setIsAnimating(true);
      }, 10); // Small delay to ensure DOM is ready
    }

    return () => {
      // Restore scrolling when popup closes
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showPopup]);

  // Close popup with animation
  const handleClose = () => {
    setIsAnimating(false);
    // Wait for animation to finish before actually closing
    setTimeout(() => {
      secondAction?.(false);
      setShowPopup(false);
    }, 300); // Match this with transition duration (300ms)
  };

  // Close popup on outside click
  const handleOverlayClick = () => {
    handleClose();
  };

  // Handle confirmation action
  const handleConfirm = async () => {
    try {
      await actionFunction(); // Supports async functions
      isSave?.(true); // Signal successful save if callback exists
    } catch (error) {
      console.error("Action failed:", error);
      isSave?.(false); // Signal failed save if callback exists
    } finally {
      handleClose();
    }
  };

  // Return null if popup shouldn't be shown
  if (!showPopup) return null;

  // Format action text for button
  const getActionText = () => {
    switch (action) {
      case "delete": return "Delete";
      case "update": return "Update";
      case "create": return "Create";
      case "confirm": return "Confirm";
      case "cancel": return "Cancel";
      default: return "Confirm";
    }
  };

  // Get button class based on action type
  const getButtonClass = () => {
    return (action === "delete"||action==="cancel") ? "btn-danger" : "btn-primary";
  };

  // Check if dark mode is enabled
  const isDarkMode = localStorage.getItem("darkMode") === "true";

  // Create portal to render at body level
  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay with transition */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out ${
          isAnimating ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleOverlayClick}
        aria-hidden="true"
      ></div>
      
      {/* Popup content with transitions */}
      <div 
        className={`relative rounded-lg shadow-xl p-6 max-w-md w-[90%] sm:w-[400px] mx-auto 
                   transition-all duration-300 ease-in-out transform ${
                     isAnimating 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-95 -translate-y-4'
                   }
                   ${isDarkMode ? "bg-darkthemeitems text-white" : "bg-white"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <h2 className="text-xl font-semibold capitalize mb-2">{action}</h2>
          {message}
          
          <div className="flex gap-3 mt-4 w-full justify-center">
            <button 
              className={`btn ${isDarkMode ? "text-white" : ""}`}
              onClick={handleClose}
            >
              {secondActionText || 'Cancel'}
            </button>
            
            <button 
              className={getButtonClass()}
              onClick={handleConfirm}
            >
              {getActionText() || 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body // Render directly to body to avoid nesting issues
  );
};

export default ActionPopup;