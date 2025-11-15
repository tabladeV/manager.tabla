import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface CancelReasonType {
  id: number;
  name: string;
}
interface ConfirmPopupProps {
  action: "delete" | "update" | "create" | "confirm"| "cancel" ;
  message?: string | React.ReactNode;
  actionFunction: () => Promise<void> | void; // Supports async actions
  showPopup: boolean;
  setShowPopup: (showPopup: boolean) => void;
  secondAction?: (action: boolean) => void;
  secondActionText?: string;
  isSave?: (saved: boolean) => void;
  cancelReason?: CancelReasonType[];
  reasonSelected?: (reasonId: CancelReasonType | undefined) => void;
  otherReasonSelected?: (otherReason: string) => void;
}

const ActionPopup: React.FC<ConfirmPopupProps> = ({ 
  action, 
  message, 
  secondActionText, 
  secondAction, 
  actionFunction, 
  showPopup, 
  setShowPopup,
  isSave,
  cancelReason,
  reasonSelected,
  otherReasonSelected
}) => {
  // Add state to handle animation
  const [isAnimating, setIsAnimating] = useState(false);
  const [reasonId, setReasonId] = useState<number | null>(null);
  const [otherReasonText, setOtherReasonText] = useState<string>("");

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

  // Send other reason text to parent whenever it changes
  useEffect(() => {
    if (reasonId === 0 && otherReasonText.trim() !== "") {
      otherReasonSelected?.(otherReasonText);
    }
  }, [otherReasonText, reasonId, otherReasonSelected]);

  // Close popup with animation
  const handleClose = () => {
    setIsAnimating(false);
    // Wait for animation to finish before actually closing
    setTimeout(() => {
      secondAction?.(false);
      setShowPopup(false);
      // Reset states when closing
      setReasonId(null);
      setOtherReasonText("");
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

  // Handle reason selection
  const handleReasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    setReasonId(id);
    
    if (id === 0) {
      // If "Other Reason" is selected, clear the selected reason
      reasonSelected?.(undefined);
      // If there's already text in the other reason field, send it to parent
      if (otherReasonText.trim() !== "") {
        otherReasonSelected?.(otherReasonText);
      }
    } else if (cancelReason) {
      // If it's a regular reason, send it to parent
      const selectedReason = cancelReason.find(reason => reason.id === id);
      if (selectedReason) {
        reasonSelected?.(selectedReason);
        // Clear any previously set other reason
        otherReasonSelected?.("");
      }
    }
  };

  // Handle other reason text input
  const handleOtherReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setOtherReasonText(text);
    // Send to parent immediately if not empty
    if (text.trim() !== "") {
      otherReasonSelected?.(text);
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
    if (action === "delete") return 'btn-danger';
    if (action === "cancel") {
      if (reasonId === null) return 'btn-disabled';
      if (reasonId === 0 && otherReasonText.trim() === "") return 'btn-disabled';
      return 'btn-danger';
    }
    return 'btn-primary';
  };

  // Check if button should be disabled
  const isButtonDisabled = () => {
    if (action !== "cancel") return false;
    if (reasonId === null) return true;
    if (reasonId === 0 && otherReasonText.trim() === "") return true;
    return false;
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
          {
            cancelReason && cancelReason.length > 0 && (
              <div className="mt-4 w-full">
                <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select a reason:
                </label>
                <select 
                  id="cancelReason" 
                  className="inputs mt-2 w-full dark:bg-darkthemeitems dark:text-white bg-white text-gray-900"
                  onChange={handleReasonChange}
                  defaultValue=""
                >
                  <option value="" disabled>Select a reason</option>
                  {cancelReason.map((reason) => (
                    <option key={reason.id} value={reason.id}>
                      {reason.name}
                    </option>
                  ))}
                  <option value={0}>Other Reason</option>
                </select>
                {(reasonId === 0) && (
                  <input
                    type="text"
                    className='inputs mt-2 w-full dark:bg-darkthemeitems dark:text-white bg-white text-gray-900'
                    placeholder="Please specify"
                    value={otherReasonText}
                    onChange={handleOtherReasonChange}
                    // Auto-focus the input when "Other Reason" is selected
                    autoFocus
                  />
                )}
              </div>
            )
          }
          
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
              disabled={isButtonDisabled()}
            >
              {getActionText()}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body // Render directly to body to avoid nesting issues
  );
};

export default ActionPopup;