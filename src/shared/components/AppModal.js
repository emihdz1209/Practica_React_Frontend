import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export default function AppModal({ open, onClose, title, children }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ className: 'app-modal-paper' }}
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
        <Button onClick={onClose} className="app-modal-cancel-btn">Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
}
