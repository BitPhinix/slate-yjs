import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';
import React from 'react';

type SpinnerProps = {
  className?: string;
};

export function Spinner({ className }: SpinnerProps) {
  return (
    <FontAwesomeIcon
      icon={faCircleNotch}
      className={clsx('animate-spin', className)}
    />
  );
}
