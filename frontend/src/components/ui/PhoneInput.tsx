import { forwardRef } from 'react';
import Input from './Input';
import { maskPhone } from '../../lib/masks';

interface Props {
  label?: string;
  value: string;
  onChange: (masked: string) => void;
  error?: string;
  placeholder?: string;
}

const PhoneInput = forwardRef<HTMLInputElement, Props>(
  ({ label, value, onChange, error, placeholder = '(11) 99999-9999' }, ref) => {
    return (
      <Input
        ref={ref}
        label={label}
        type="tel"
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        error={error}
        onChange={e => onChange(maskPhone(e.target.value))}
        maxLength={16}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
export default PhoneInput;
