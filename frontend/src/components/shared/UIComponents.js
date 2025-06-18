// src/components/shared/UIComponents.js
import React from 'react';

// Loading Spinner
export const LoadingSpinner = ({ size = 40, color = '#ffffff' }) => {
  const styles = {
    spinner: {
      border: `4px solid rgba(255, 255, 255, 0.1)`,
      borderRadius: '50%',
      borderTop: `4px solid ${color}`,
      width: `${size}px`,
      height: `${size}px`,
      animation: 'spin 1s linear infinite',
    },
    container: {
      display: 'flex',
      justifyContent: 'center',
      padding: '20px',
    },
  };

  // Add keyframes for the spinning animation
  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  return (
    <div style={styles.container}>
      <style>{keyframes}</style>
      <div style={styles.spinner}></div>
    </div>
  );
};

// Loading Overlay (for full-page loading)
export const LoadingOverlay = ({ message = 'Loading...' }) => {
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      color: 'white',
    },
    message: {
      marginTop: '20px',
      fontSize: '18px',
    },
  };

  return (
    <div style={styles.overlay}>
      <LoadingSpinner size={60} />
      <div style={styles.message}>{message}</div>
    </div>
  );
};

// Notification component for success/error messages
export const Notification = ({ 
  type = 'info', // 'success', 'error', 'info', 'warning'
  message,
  onClose
}) => {
  const getBackgroundColor = () => {
    switch(type) {
      case 'success': return 'rgba(76, 175, 80, 0.2)';
      case 'error': return 'rgba(244, 67, 54, 0.2)';
      case 'warning': return 'rgba(255, 152, 0, 0.2)';
      default: return 'rgba(33, 150, 243, 0.2)';
    }
  };

  const getBorderColor = () => {
    switch(type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'warning': return '#FF9800';
      default: return '#2196F3';
    }
  };

  const getIcon = () => {
    switch(type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const styles = {
    notification: {
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'flex-start',
      background: getBackgroundColor(),
      border: `1px solid ${getBorderColor()}`,
      position: 'relative',
    },
    icon: {
      marginRight: '10px',
      fontSize: '18px',
    },
    message: {
      color: 'white',
      flex: 1,
    },
    closeButton: {
      background: 'transparent',
      border: 'none',
      color: 'white',
      fontSize: '18px',
      cursor: 'pointer',
      padding: '0 5px',
      position: 'absolute',
      top: '10px',
      right: '10px',
    },
  };

  return (
    <div style={styles.notification}>
      <div style={styles.icon}>{getIcon()}</div>
      <div style={styles.message}>{message}</div>
      {onClose && (
        <button style={styles.closeButton} onClick={onClose}>
          ×
        </button>
      )}
    </div>
  );
};

// Empty state component
export const EmptyState = ({
  icon = '📭',
  title = 'No data found',
  description = 'There are no items to display.',
  actionButton = null,
}) => {
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '12px',
      margin: '20px 0',
    },
    icon: {
      fontSize: '48px',
      marginBottom: '20px',
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '10px',
    },
    description: {
      fontSize: '16px',
      color: '#ddd',
      marginBottom: '20px',
      maxWidth: '400px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.icon}>{icon}</div>
      <h3 style={styles.title}>{title}</h3>
      <p style={styles.description}>{description}</p>
      {actionButton}
    </div>
  );
};

// Card component for consistent styling
export const Card = ({ 
  children, 
  padding = '25px', 
  marginBottom = '20px', 
  style = {} 
}) => {
  const styles = {
    card: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '15px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      padding,
      marginBottom,
      ...style,
    },
  };

  return <div style={styles.card}>{children}</div>;
};

// Button component
export const Button = ({
  children,
  onClick,
  type = 'primary', // 'primary', 'secondary', 'danger'
  size = 'medium', // 'small', 'medium', 'large'
  disabled = false,
  style = {},
}) => {
  const getBackgroundStyle = () => {
    if (disabled) return { background: '#cccccc', cursor: 'not-allowed' };
    
    switch(type) {
      case 'primary': 
        return { 
          background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
          color: 'white',
        };
      case 'secondary': 
        return { 
          background: 'rgba(255, 255, 255, 0.1)',
          color: 'white',
          border: '1px solid rgba(255, 255, 255, 0.3)',
        };
      case 'danger': 
        return { 
          background: 'linear-gradient(45deg, #F44336, #EF5350)',
          color: 'white',
        };
      default: 
        return { 
          background: 'linear-gradient(45deg, #4CAF50, #66BB6A)',
          color: 'white',
        };
    }
  };

  const getPadding = () => {
    switch(size) {
      case 'small': return '8px 16px';
      case 'large': return '16px 32px';
      default: return '12px 24px';
    }
  };

  const getFontSize = () => {
    switch(size) {
      case 'small': return '12px';
      case 'large': return '18px';
      default: return '14px';
    }
  };

  const styles = {
    button: {
      padding: getPadding(),
      borderRadius: '8px',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontWeight: 'bold',
      fontSize: getFontSize(),
      transition: 'all 0.3s ease',
      ...getBackgroundStyle(),
      ...style,
    },
  };

  return (
    <button
      style={styles.button}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default {
  LoadingSpinner,
  LoadingOverlay,
  Notification,
  EmptyState,
  Card,
  Button
};