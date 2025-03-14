import React from "react";

/**
 * Toast component for displaying formatted API errors
 */
interface ErrorProps {
  error: {
    formattedMessage?: string;
    message?: string;
  };
}

const ErrorToast: React.FC<ErrorProps> = ({ error }) => {
  // Get the formatted message from the error object
  const message = error?.formattedMessage || error?.message || "An error occurred";
  
  // Split by newlines to handle multi-line error messages
  const messageLines = message.split('\n');
  
  return (
    <div className="flex flex-col">
      {messageLines.length === 1 ? (
        // Simple one-line error
        <div>{message}</div>
      ) : (
        // Multi-line error with field errors
        <>
          {/* First line is typically the main error */}
          <div className="font-medium mb-1">{messageLines[0]}</div>
          
          {/* Remaining lines are typically field errors */}
          <ul className="list-disc pl-4 text-sm space-y-0.5">
            {messageLines.slice(1).map((line, index) => (
              <li key={index}>{line}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default ErrorToast;