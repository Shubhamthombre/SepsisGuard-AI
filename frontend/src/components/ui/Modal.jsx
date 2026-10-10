import { motion, AnimatePresence } from 'framer-motion';
import ReactDOM from 'react-dom';

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(3, 7, 18, 0.85)',
          backdropFilter: 'blur(12px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          boxSizing: 'border-box'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 'min(900px, calc(100vw - 32px))',
            maxHeight: 'calc(100vh - 32px)',
            height: 'min(850px, calc(100vh - 32px))',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'rgba(10, 20, 45, 0.96)',
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            borderRadius: '20px',
            boxShadow: '0 30px 70px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(6, 182, 212, 0.2)',
            color: '#f8fafc',
            boxSizing: 'border-box'
          }}
        >
          <div className="modal-header" style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 32px 16px 32px', borderBottom: '1px solid rgba(148, 163, 184, 0.2)' }}>
            <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', color: '#f8fafc' }}>{title}</h2>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#f8fafc', cursor: 'pointer', fontSize: '1rem', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
          </div>
          
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0 32px 24px 32px' }}>
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
