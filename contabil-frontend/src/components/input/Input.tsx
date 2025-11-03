import React from 'react';
import type { InputProps } from '../../types/Input';

const Input: React.FC<InputProps> = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error, 
  required = false,
  disabled = false,
  className = '',
  id,
  name,
  ...rest 
}) => (
  <div className="mb-4">
    <label 
      htmlFor={id} 
      className="block text-sm font-medium text-gray-700 mb-2"
    >
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
        error ? 'border-red-500' : 'border-gray-300'
      } ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''} ${className}`}
      {...rest}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default Input;