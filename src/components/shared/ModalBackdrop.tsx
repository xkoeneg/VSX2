import { useRef } from 'react';

export const ModalBackdrop: React.FC<{
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}> = ({ onClose, children, className }) => {
  const mouseDownOnBackdropRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    mouseDownOnBackdropRef.current = e.target === e.currentTarget;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // Require BOTH the mousedown and mouseup to have landed on the backdrop
    // element itself (not a modal-body descendant) before treating this as
    // an intentional "click outside to close". This alone stops the common
    // case of starting a text-selection drag inside the modal and releasing
    // over the backdrop. As a second, independent guard, also bail out if
    // there's an active text selection at release time — covers edge cases
    // where a drag technically starts/ends on the backdrop but the user was
    // mid-selection (e.g. selecting right up to the modal's edge).
    const hasActiveSelection = (window.getSelection()?.toString().length ?? 0) > 0;
    if (mouseDownOnBackdropRef.current && e.target === e.currentTarget && !hasActiveSelection) {
      onClose();
    }
    mouseDownOnBackdropRef.current = false;
  };

  return (
    <div
      className={className}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {children}
    </div>
  );
};

// ============================================================
// STRICT NUMERIC INPUT COMPONENT
// ============================================================

