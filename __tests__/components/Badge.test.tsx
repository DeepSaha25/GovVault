import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';
import { describe, it, expect } from 'vitest';

describe('Badge Component', () => {
  it('renders the correct label for active status', () => {
    render(<Badge status="active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders the correct label for passed status', () => {
    render(<Badge status="passed" />);
    expect(screen.getByText('Passed & Timelocked')).toBeInTheDocument();
  });

  it('renders the correct label for executed status', () => {
    render(<Badge status="executed" />);
    expect(screen.getByText('Executed')).toBeInTheDocument();
  });
});
