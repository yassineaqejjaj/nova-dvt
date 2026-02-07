import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoadingFallback } from '../LoadingFallback';

describe('LoadingFallback', () => {
  it('renders default loading message', () => {
    render(<LoadingFallback />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders custom loading message', () => {
    render(<LoadingFallback message="Loading dashboard..." />);
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });
});
