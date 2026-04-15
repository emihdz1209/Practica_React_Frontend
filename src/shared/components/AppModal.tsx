import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const AppModal = ({ open, onClose, title, children }: Props) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        className: "app-modal-paper",
        sx: {
          background: "#FFFFFF !important",
          color: "#18181B !important",
          border: "1px solid #E4E4E7 !important",
          borderRadius: "14px !important",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08) !important",
        },
      }}
    >
      <DialogTitle className="app-modal-title">
        <span>{title}</span>
        <button onClick={onClose} className="app-modal-close-btn" aria-label="Cerrar">
          <CloseIcon />
        </button>
      </DialogTitle>

      <DialogContent className="app-modal-content">
        {children}
      </DialogContent>

      <DialogActions className="app-modal-actions">
        <Button onClick={onClose} className="app-modal-cancel-btn">
          Cancelar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
