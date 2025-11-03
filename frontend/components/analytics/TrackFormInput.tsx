'use client';

import React, { ReactNode, useState } from 'react';
import { FormTracking } from './TrackForm';

interface TrackFormInputProps {
  children: ReactNode;
  fieldName: string;
  formTracking: FormTracking;
  required?: boolean;
}

export function TrackFormInput({ children, fieldName, formTracking, required = false }: TrackFormInputProps) {
  const [hasFocused, setHasFocused] = useState(false);

  const handleFocus = () => {
    if (!hasFocused) {
      setHasFocused(true);
      formTracking.trackFieldInteraction(fieldName, 'focus');
    }
  };

  const handleBlur = () => {
    formTracking.trackFieldInteraction(fieldName, 'blur');
  };

  const handleChange = () => {
    formTracking.trackFieldInteraction(fieldName, 'change');
  };

  // Clone children and add event handlers
  if (!React.isValidElement(children)) {
    return <>{children}</>;
  }

  const childProps: Record<string, any> = {
    onFocus: (e: React.FocusEvent) => {
      handleFocus();
      const originalOnFocus = (children as any).props?.onFocus;
      if (originalOnFocus) originalOnFocus(e);
    },
    onBlur: (e: React.FocusEvent) => {
      handleBlur();
      const originalOnBlur = (children as any).props?.onBlur;
      if (originalOnBlur) originalOnBlur(e);
    },
    onChange: (e: any) => {
      handleChange();
      const originalOnChange = (children as any).props?.onChange;
      if (originalOnChange) originalOnChange(e);
    },
  };

  return <>{React.cloneElement(children as React.ReactElement, childProps)}</>;
}
