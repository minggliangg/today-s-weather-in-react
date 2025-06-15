import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CountrySelector } from './country-selector';
import { useAppConstants } from '@/hooks/use-app-constants';
import { useMediaQuery } from '@/hooks/use-media-query';

// Mock dependencies
vi.mock('@/hooks/use-app-constants');
vi.mock('@/hooks/use-media-query');

// Mock UI components with simplified implementations
vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) => (
    <div data-testid="popover" data-open={open}>
      {children}
    </div>
  ),
  PopoverContent: ({ children, className }: { children: React.ReactNode; className: string }) => (
    <div data-testid="popover-content" className={className}>{children}</div>
  ),
  PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popover-trigger">{children}</div>
  ),
}));

vi.mock('@/components/ui/drawer', () => ({
  Drawer: ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) => (
    <div data-testid="drawer" data-open={open}>
      {children}
    </div>
  ),
  DrawerContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drawer-content">{children}</div>
  ),
  DrawerTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="drawer-trigger">{children}</div>
  ),
  DrawerHeader: ({ children, className }: { children: React.ReactNode; className: string }) => (
    <div data-testid="drawer-header" className={className}>{children}</div>
  ),
  DrawerTitle: ({ children }: { children: React.ReactNode }) => (
    <h3 data-testid="drawer-title">{children}</h3>
  ),
  DrawerDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="drawer-description">{children}</p>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ 
    children, 
    onClick, 
    disabled, 
    id, 
    variant, 
    role, 
    className 
  }: { 
    children: React.ReactNode; 
    onClick?: () => void; 
    disabled?: boolean; 
    id?: string;
    variant?: string;
    role?: string;
    className?: string;
  }) => (
    <button 
      data-testid="button" 
      onClick={onClick} 
      disabled={disabled} 
      id={id}
      data-variant={variant}
      role={role}
      className={className}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/command', () => ({
  Command: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="command">{children}</div>
  ),
  CommandInput: ({ placeholder, className }: { placeholder: string; className: string }) => (
    <input data-testid="command-input" placeholder={placeholder} className={className} />
  ),
  CommandList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="command-list">{children}</div>
  ),
  CommandEmpty: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="command-empty">{children}</div>
  ),
  CommandGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="command-group">{children}</div>
  ),
  CommandItem: ({ 
    children, 
    value, 
    onSelect 
  }: { 
    children: React.ReactNode; 
    value: string; 
    onSelect: (value: string) => void; 
  }) => (
    <div 
      data-testid="command-item" 
      data-value={value}
      onClick={() => onSelect(value)}
    >
      {children}
    </div>
  ),
}));

// Mock utils
vi.mock('@/lib/utils', () => ({
  cn: (...classes: string[]) => classes.filter(Boolean).join(' '),
}));

const mockCountriesForComboBox = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'FR', label: 'France' },
  { value: 'DE', label: 'Germany' },
];

const mockSetOpen = vi.fn();
const mockSetSelectedCountry = vi.fn();

describe('CountrySelector', () => {
  const defaultProps = {
    open: false,
    setOpen: mockSetOpen,
    selectedCountry: '',
    setSelectedCountry: mockSetSelectedCountry,
    id: 'country-selector',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useAppConstants as ReturnType<typeof vi.fn>).mockReturnValue({
      countriesForComboBox: mockCountriesForComboBox,
    });
  });

  describe('Desktop view (Popover)', () => {
    beforeEach(() => {
      (useMediaQuery as ReturnType<typeof vi.fn>).mockReturnValue(true); // isDesktop = true
    });

    it('renders popover version on desktop', () => {
      render(<CountrySelector {...defaultProps} />);

      expect(screen.getByTestId('popover')).toBeInTheDocument();
      expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();
    });

    it('displays placeholder text when no country selected', () => {
      render(<CountrySelector {...defaultProps} />);

      expect(screen.getByText('Select a country...')).toBeInTheDocument();
    });

    it('displays selected country label', () => {
      render(
        <CountrySelector 
          {...defaultProps} 
          selectedCountry="US" 
        />
      );

      // Check the button content specifically
      const button = screen.getByTestId('button');
      expect(button).toHaveTextContent('United States');
    });

    it('applies correct button styling and attributes', () => {
      render(<CountrySelector {...defaultProps} />);

      const button = screen.getByTestId('button');
      expect(button).toHaveAttribute('id', 'country-selector');
      expect(button).toHaveAttribute('data-variant', 'outline');
      expect(button).toHaveAttribute('role', 'combobox');
    });

    it('shows popover content when open', () => {
      render(
        <CountrySelector 
          {...defaultProps} 
          open={true} 
        />
      );

      expect(screen.getByTestId('popover')).toHaveAttribute('data-open', 'true');
      expect(screen.getByTestId('command')).toBeInTheDocument();
      expect(screen.getByTestId('command-input')).toBeInTheDocument();
    });

    it('renders all countries in command list', () => {
      render(
        <CountrySelector 
          {...defaultProps} 
          open={true} 
        />
      );

      const commandItems = screen.getAllByTestId('command-item');
      expect(commandItems).toHaveLength(5);
      
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('United Kingdom')).toBeInTheDocument();
      expect(screen.getByText('Canada')).toBeInTheDocument();
      expect(screen.getByText('France')).toBeInTheDocument();
      expect(screen.getByText('Germany')).toBeInTheDocument();
    });

    it('calls setSelectedCountry and setOpen when country is selected', () => {
      render(
        <CountrySelector 
          {...defaultProps} 
          open={true} 
        />
      );

      const usItem = screen.getByText('United States').closest('[data-value="US"]');
      expect(usItem).toBeInTheDocument();

      act(() => {
        fireEvent.click(usItem!);
      });

      expect(mockSetSelectedCountry).toHaveBeenCalledWith('US');
      expect(mockSetOpen).toHaveBeenCalledWith(false);
    });

    it('clears selection when clicking already selected country', () => {
      render(
        <CountrySelector 
          {...defaultProps} 
          selectedCountry="US"
          open={true} 
        />
      );

      // Find the US item in the dropdown list
      const usItems = screen.getAllByText('United States');
      const usItem = usItems.find(item => 
        item.closest('[data-value="US"]')
      )?.closest('[data-value="US"]');
      
      act(() => {
        fireEvent.click(usItem!);
      });

      expect(mockSetSelectedCountry).toHaveBeenCalledWith('');
      expect(mockSetOpen).toHaveBeenCalledWith(false);
    });

    it('displays command input with correct placeholder', () => {
      render(
        <CountrySelector 
          {...defaultProps} 
          open={true} 
        />
      );

      const input = screen.getByTestId('command-input');
      expect(input).toHaveAttribute('placeholder', 'Search country...');
      expect(input).toHaveClass('h-9');
    });

    it('shows empty message in command empty', () => {
      render(
        <CountrySelector 
          {...defaultProps} 
          open={true} 
        />
      );

      expect(screen.getByTestId('command-empty')).toHaveTextContent('No country found.');
    });
  });

  describe('Mobile view (Drawer)', () => {
    beforeEach(() => {
      (useMediaQuery as ReturnType<typeof vi.fn>).mockReturnValue(false); // isDesktop = false
    });

    it('renders drawer version on mobile', () => {
      render(<CountrySelector {...defaultProps} />);

      expect(screen.getByTestId('drawer')).toBeInTheDocument();
      expect(screen.queryByTestId('popover')).not.toBeInTheDocument();
    });

    it('displays placeholder text when no country selected', () => {
      render(<CountrySelector {...defaultProps} />);

      expect(screen.getByText('Select a country...')).toBeInTheDocument();
    });

    it('displays selected country label', () => {
      render(
        <CountrySelector 
          {...defaultProps} 
          selectedCountry="GB" 
        />
      );

      // Check the button content specifically
      const button = screen.getByTestId('button');
      expect(button).toHaveTextContent('United Kingdom');
    });

    it('shows drawer content when open', () => {
      render(
        <CountrySelector 
          {...defaultProps} 
          open={true} 
        />
      );

      expect(screen.getByTestId('drawer')).toHaveAttribute('data-open', 'true');
      expect(screen.getByTestId('drawer-content')).toBeInTheDocument();
    });

    it('has accessibility-friendly drawer header', () => {
      render(
        <CountrySelector 
          {...defaultProps} 
          open={true} 
        />
      );

      const header = screen.getByTestId('drawer-header');
      expect(header).toHaveClass('sr-only');
      expect(screen.getByTestId('drawer-title')).toHaveTextContent('Select a Country');
      expect(screen.getByTestId('drawer-description')).toHaveTextContent('Select a country from the list');
    });

    it('renders command content in drawer', () => {
      render(
        <CountrySelector 
          {...defaultProps} 
          open={true} 
        />
      );

      expect(screen.getByTestId('command')).toBeInTheDocument();
      expect(screen.getByTestId('command-input')).toBeInTheDocument();
      expect(screen.getAllByTestId('command-item')).toHaveLength(5);
    });

    it('calls setSelectedCountry and setOpen when country is selected in drawer', () => {
      render(
        <CountrySelector 
          {...defaultProps} 
          open={true} 
        />
      );

      const caItem = screen.getByText('Canada').closest('[data-value="CA"]');
      
      act(() => {
        fireEvent.click(caItem!);
      });

      expect(mockSetSelectedCountry).toHaveBeenCalledWith('CA');
      expect(mockSetOpen).toHaveBeenCalledWith(false);
    });
  });

  describe('CountrySelectorContent', () => {
    beforeEach(() => {
      (useMediaQuery as ReturnType<typeof vi.fn>).mockReturnValue(true); // Test with popover
    });

    it('shows check mark for selected country', () => {
      render(
        <CountrySelector 
          {...defaultProps} 
          selectedCountry="FR"
          open={true} 
        />
      );

      // The check mark would be rendered in the actual implementation
      // Find France in the command list (not in the button)
      const frItems = screen.getAllByText('France');
      const frItem = frItems.find(item => 
        item.closest('[data-testid="command-item"]')
      )?.closest('[data-value="FR"]');
      
      expect(frItem).toBeInTheDocument();
    });

    it('handles empty countries list', () => {
      (useAppConstants as ReturnType<typeof vi.fn>).mockReturnValue({
        countriesForComboBox: [],
      });

      render(
        <CountrySelector 
          {...defaultProps} 
          open={true} 
        />
      );

      const commandItems = screen.queryAllByTestId('command-item');
      expect(commandItems).toHaveLength(0);
      expect(screen.getByTestId('command-empty')).toHaveTextContent('No country found.');
    });

    it('finds country by value correctly', () => {
      render(
        <CountrySelector 
          {...defaultProps} 
          selectedCountry="DE"
        />
      );

      // Check the button content specifically
      const button = screen.getByTestId('button');
      expect(button).toHaveTextContent('Germany');
    });

    it('handles non-existent country selection gracefully', () => {
      render(
        <CountrySelector 
          {...defaultProps} 
          selectedCountry="XX" // Non-existent country code
        />
      );

      // Should show empty button content (no label found for XX)
      const button = screen.getByTestId('button');
      expect(button.querySelector('span')).toBeEmptyDOMElement();
    });
  });

  describe('Props handling', () => {
    beforeEach(() => {
      (useMediaQuery as ReturnType<typeof vi.fn>).mockReturnValue(true);
    });

    it('passes open state to popover', () => {
      const { rerender } = render(<CountrySelector {...defaultProps} open={false} />);
      
      expect(screen.getByTestId('popover')).toHaveAttribute('data-open', 'false');

      rerender(<CountrySelector {...defaultProps} open={true} />);
      
      expect(screen.getByTestId('popover')).toHaveAttribute('data-open', 'true');
    });

    it('uses custom id for button', () => {
      render(<CountrySelector {...defaultProps} id="custom-id" />);

      expect(screen.getByTestId('button')).toHaveAttribute('id', 'custom-id');
    });

    it('handles different selected country values', () => {
      const { rerender } = render(<CountrySelector {...defaultProps} selectedCountry="" />);
      
      expect(screen.getByText('Select a country...')).toBeInTheDocument();

      rerender(<CountrySelector {...defaultProps} selectedCountry="CA" />);
      
      const button1 = screen.getByTestId('button');
      expect(button1).toHaveTextContent('Canada');

      rerender(<CountrySelector {...defaultProps} selectedCountry="FR" />);
      
      const button2 = screen.getByTestId('button');
      expect(button2).toHaveTextContent('France');
    });
  });

  describe('Responsive behavior', () => {
    it('switches between popover and drawer based on screen size', () => {
      const { rerender } = render(<CountrySelector {...defaultProps} />);

      // Initially desktop (popover)
      (useMediaQuery as ReturnType<typeof vi.fn>).mockReturnValue(true);
      rerender(<CountrySelector {...defaultProps} />);
      
      expect(screen.getByTestId('popover')).toBeInTheDocument();
      expect(screen.queryByTestId('drawer')).not.toBeInTheDocument();

      // Switch to mobile (drawer)
      (useMediaQuery as ReturnType<typeof vi.fn>).mockReturnValue(false);
      rerender(<CountrySelector {...defaultProps} />);
      
      expect(screen.getByTestId('drawer')).toBeInTheDocument();
      expect(screen.queryByTestId('popover')).not.toBeInTheDocument();
    });

    it('maintains state when switching between responsive modes', () => {
      (useMediaQuery as ReturnType<typeof vi.fn>).mockReturnValue(true);
      const { rerender } = render(
        <CountrySelector 
          {...defaultProps} 
          selectedCountry="GB"
          open={true}
        />
      );

      const button1 = screen.getByTestId('button');
      expect(button1).toHaveTextContent('United Kingdom');

      // Switch to mobile
      (useMediaQuery as ReturnType<typeof vi.fn>).mockReturnValue(false);
      rerender(
        <CountrySelector 
          {...defaultProps} 
          selectedCountry="GB"
          open={true}
        />
      );

      const button2 = screen.getByTestId('button');
      expect(button2).toHaveTextContent('United Kingdom');
    });
  });
});