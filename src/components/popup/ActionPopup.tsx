
interface ConfirmPopupProps {
  action: "delete" | "update" | "create"| "confirm";
  message?: string;
  actionFunction: () => Promise<void> | void; // Supports async actions
  showPopup: boolean;
  setShowPopup: (showPopup: boolean) => void;
  secondAction?: (action: boolean) => void;
  secondActionText?: string;
  isSave?: (saved:boolean) => void;
}

const ActionPopup = ({ action, message, secondActionText, secondAction, actionFunction, showPopup, setShowPopup }: ConfirmPopupProps) => {
  // Close popup on outside click
  const handleOverlayClick = () => setShowPopup(false);

  // Handle confirmation action
  const handleConfirm = async () => {
    await actionFunction(); // Supports async functions
    setShowPopup(false);
  };

  return showPopup ? (
    <div className="popup-container">
      <div className="overlay" onClick={handleOverlayClick}></div>
      <div className={`popup flex flex-col items-center text-center p-2 ${localStorage.getItem("darkMode") === "true" ? "bg-darkthemeitems" : "bg-white"}`}>
        <h2>{action}</h2>
        <p>{message}</p>
        <div className="flex gap-3 mt-4">
          <button className={`btn ${localStorage.getItem("darkMode") === "true" ? "text-white " : ""}`} onClick={() => {secondAction?.(false); setShowPopup(false)}}>
            {(secondActionText )|| 'Cancel'}
          </button>
          <button className={action === "delete" ? "btn-danger" : "btn-primary"} onClick={handleConfirm}>
            {action || "Create"}
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default ActionPopup;
