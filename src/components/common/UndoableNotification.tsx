type UndoableNotification = {
    message: string;
    cancelMutation?: () => void;
    closeToast?: () => void;
};

const UndoableNotification: React.FC<UndoableNotification> = ({
    closeToast,
    cancelMutation,
    message,
}) => {
    return (
        <div>
            <p>{message}</p>
            <button
                onClick={() => {
                    cancelMutation?.();
                    closeToast?.();
                }}
            >
                Undo
            </button>
        </div>
    );
};

export default UndoableNotification;