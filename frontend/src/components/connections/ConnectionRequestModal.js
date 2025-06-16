import React, { useState } from 'react';

const ConnectionRequestModal = ({ isOpen, onClose, profile, onSendRequest }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSendRequest(message);
    setMessage('');
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modal: {
      background: 'white',
      borderRadius: '8px',
      padding: '20px',
      width: '90%',
      maxWidth: '500px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      margin: 0
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      padding: '0',
      color: '#666'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    label: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '5px'
    },
    textarea: {
      width: '100%',
      minHeight: '100px',
      padding: '10px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      resize: 'vertical'
    },
    buttonGroup: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      marginTop: '20px'
    },
    cancelButton: {
      padding: '8px 16px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      background: 'white',
      cursor: 'pointer'
    },
    sendButton: {
      padding: '8px 16px',
      borderRadius: '4px',
      border: 'none',
      background: '#007bff',
      color: 'white',
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Connect with {profile.fullName}</h2>
          <button style={styles.closeButton} onClick={onClose}>&times;</button>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          <div>
            <label style={styles.label}>
              Add a note (optional)
            </label>
            <textarea
              style={styles.textarea}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`I'd like to connect with you on Zanara...`}
              maxLength={500}
            />
          </div>

          <div style={styles.buttonGroup}>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={styles.sendButton}
            >
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectionRequestModal; 