'use client';

import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium"
            style={{ color: 'var(--cn-text-secondary)' }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`cn-focus-ring px-3 py-2 text-sm rounded-md outline-none ${className}`}
          style={{
            backgroundColor: 'var(--cn-bg-tertiary)',
            color: 'var(--cn-text-primary)',
            border: `1px solid ${error ? 'var(--cn-danger)' : 'var(--cn-border)'}`,
            borderRadius: 'var(--cn-radius-sm)',
            transition: 'border-color var(--cn-transition-fast)',
          }}
          {...props}
        />
        {error && (
          <span className="text-xs" style={{ color: 'var(--cn-danger)' }}>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
