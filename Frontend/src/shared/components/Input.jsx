import React from 'react';

export function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  error = '',
  helperText = '',
  disabled = false,
  className = '',
  icon: Icon,
  ...props
}) {
  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <span style={{ position: 'absolute', left: '0.875rem', color: 'var(--text-light)', pointerEvents: 'none', display: 'flex' }}>
            <Icon size={16} />
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`form-control ${error ? 'border-danger' : ''}`}
          style={Icon ? { paddingLeft: '2.5rem' } : {}}
          {...props}
        />
      </div>
      {error && <span className="form-helper" style={{ color: 'var(--status-danger-text)' }}>{error}</span>}
      {!error && helperText && <span className="form-helper">{helperText}</span>}
    </div>
  );
}

export function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Seleccione una opción...',
  required = false,
  error = '',
  helperText = '',
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <div className={`form-group ${className}`.trim()}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`form-control ${error ? 'border-danger' : ''}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>
      {error && <span className="form-helper" style={{ color: 'var(--status-danger-text)' }}>{error}</span>}
      {!error && helperText && <span className="form-helper">{helperText}</span>}
    </div>
  );
}
