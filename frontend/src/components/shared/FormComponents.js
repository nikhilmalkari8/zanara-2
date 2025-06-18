// src/components/shared/FormComponents.js
import React from 'react';

// Standardized input field with validation
export const FormInput = ({ 
  label, 
  value, 
  onChange, 
  type = 'text', 
  placeholder, 
  error, 
  required = false 
}) => {
  const styles = {
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#fff',
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: error ? '1px solid #FF5252' : '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontSize: '16px',
      outline: 'none',
    },
    error: {
      color: '#FF5252',
      fontSize: '12px',
      marginTop: '5px',
    }
  };

  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>
        {label} {required && <span style={{ color: '#FF5252' }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={styles.input}
        required={required}
      />
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
};

// Standardized select dropdown
export const FormSelect = ({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option", 
  error,
  required = false 
}) => {
  const styles = {
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#fff',
    },
    select: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: error ? '1px solid #FF5252' : '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontSize: '16px',
      outline: 'none',
    },
    error: {
      color: '#FF5252',
      fontSize: '12px',
      marginTop: '5px',
    }
  };

  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>
        {label} {required && <span style={{ color: '#FF5252' }}>*</span>}
      </label>
      <select 
        value={value} 
        onChange={onChange} 
        style={styles.select}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
};

// Standardized textarea
export const FormTextarea = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  minHeight = '100px',
  error,
  required = false 
}) => {
  const styles = {
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#fff',
    },
    textarea: {
      width: '100%',
      padding: '12px',
      borderRadius: '8px',
      border: error ? '1px solid #FF5252' : '1px solid rgba(255, 255, 255, 0.3)',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      fontSize: '16px',
      outline: 'none',
      minHeight,
      resize: 'vertical',
    },
    error: {
      color: '#FF5252',
      fontSize: '12px',
      marginTop: '5px',
    }
  };

  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>
        {label} {required && <span style={{ color: '#FF5252' }}>*</span>}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={styles.textarea}
        required={required}
      />
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
};

// Checkbox component
export const FormCheckbox = ({
  label,
  checked,
  onChange,
  error
}) => {
  const styles = {
    formGroup: {
      marginBottom: '15px',
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
    },
    checkbox: {
      marginRight: '10px',
      cursor: 'pointer',
    },
    label: {
      fontSize: '14px',
      color: '#fff',
      cursor: 'pointer',
    },
    error: {
      color: '#FF5252',
      fontSize: '12px',
      marginTop: '5px',
    }
  };

  return (
    <div style={styles.formGroup}>
      <div style={styles.checkboxContainer}>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          style={styles.checkbox}
          id={`checkbox-${label}`}
        />
        <label 
          htmlFor={`checkbox-${label}`} 
          style={styles.label}
        >
          {label}
        </label>
      </div>
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
};

// Checkbox group for multiple selections
export const FormCheckboxGroup = ({
  label,
  options,
  selectedValues,
  onChange,
  error,
  columns = 2
}) => {
  const styles = {
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#fff',
    },
    checkboxGrid: {
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '10px',
    },
    checkboxItem: {
      display: 'flex',
      alignItems: 'center',
      padding: '8px',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'background 0.2s ease',
    },
    checkboxItemSelected: {
      background: 'rgba(76, 175, 80, 0.2)',
    },
    error: {
      color: '#FF5252',
      fontSize: '12px',
      marginTop: '5px',
    }
  };

  const toggleOption = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(item => item !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>{label}</label>
      <div style={styles.checkboxGrid}>
        {options.map((option) => {
          const value = option.value || option;
          const label = option.label || option;
          const isSelected = selectedValues.includes(value);
          
          return (
            <div
              key={value}
              style={{
                ...styles.checkboxItem,
                ...(isSelected ? styles.checkboxItemSelected : {})
              }}
              onClick={() => toggleOption(value)}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}}
                style={{ marginRight: '10px' }}
              />
              <span>{label}</span>
            </div>
          );
        })}
      </div>
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
};

export default {
  FormInput,
  FormSelect,
  FormTextarea,
  FormCheckbox,
  FormCheckboxGroup
};