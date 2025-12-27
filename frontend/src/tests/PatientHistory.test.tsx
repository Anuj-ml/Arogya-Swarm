/**
 * Tests for PatientHistory component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PatientHistory from '../components/doctor/PatientHistory';

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ patientId: '1' })
  };
});

describe('PatientHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <PatientHistory patientId={1} />
      </BrowserRouter>
    );
  };

  it('renders patient history page', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Patient Medical History')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Complete medical records and timeline')).toBeInTheDocument();
  });

  it('displays patient information', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Ramesh Kumar')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/45 years • Male/)).toBeInTheDocument();
    expect(screen.getByText('Shirdi')).toBeInTheDocument();
  });

  it('displays patient summary stats', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Total Records')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Prescriptions')).toBeInTheDocument();
    expect(screen.getByText('Consultations')).toBeInTheDocument();
  });

  it('renders timeline events', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Acute Respiratory Infection')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Prescription for Respiratory Infection')).toBeInTheDocument();
    expect(screen.getByText('Video Consultation')).toBeInTheDocument();
  });

  it('filters events by type', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Acute Respiratory Infection')).toBeInTheDocument();
    });

    // Click on prescription filter
    const prescriptionFilter = screen.getByText('Prescriptions');
    fireEvent.click(prescriptionFilter);

    await waitFor(() => {
      expect(screen.getByText('Prescription for Respiratory Infection')).toBeInTheDocument();
      // Diagnosis events should not be visible after filtering
      expect(screen.queryByText('Routine Health Checkup')).not.toBeInTheDocument();
    });
  });

  it('searches history events', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search history...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search history...');
    fireEvent.change(searchInput, { target: { value: 'respiratory' } });

    await waitFor(() => {
      expect(screen.getByText('Acute Respiratory Infection')).toBeInTheDocument();
      // Other events should be filtered out
      expect(screen.queryByText('Nutrition Plan for Weight Management')).not.toBeInTheDocument();
    });
  });

  it('expands and collapses event details', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Acute Respiratory Infection')).toBeInTheDocument();
    });

    // Initially, detailed info should not be visible
    expect(screen.queryByText('Symptoms:')).not.toBeInTheDocument();

    // Click to expand
    const eventCard = screen.getByText('Acute Respiratory Infection');
    fireEvent.click(eventCard.closest('div')!);

    await waitFor(() => {
      expect(screen.getByText('Symptoms:')).toBeInTheDocument();
      expect(screen.getByText('Risk Score:')).toBeInTheDocument();
    });

    // Click again to collapse
    fireEvent.click(eventCard.closest('div')!);

    await waitFor(() => {
      expect(screen.queryByText('Risk Score:')).not.toBeInTheDocument();
    });
  });

  it('displays diagnosis event details when expanded', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Acute Respiratory Infection')).toBeInTheDocument();
    });

    // Expand the diagnosis event
    const eventCard = screen.getByText('Acute Respiratory Infection');
    fireEvent.click(eventCard.closest('div')!);

    await waitFor(() => {
      expect(screen.getByText('Symptoms:')).toBeInTheDocument();
      expect(screen.getByText('fever')).toBeInTheDocument();
      expect(screen.getByText('cough')).toBeInTheDocument();
      expect(screen.getByText('AI Analysis:')).toBeInTheDocument();
    });
  });

  it('displays prescription event details when expanded', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Prescription for Respiratory Infection')).toBeInTheDocument();
    });

    // Expand the prescription event
    const eventCard = screen.getByText('Prescription for Respiratory Infection');
    fireEvent.click(eventCard.closest('div')!);

    await waitFor(() => {
      expect(screen.getByText('Medicines:')).toBeInTheDocument();
      expect(screen.getByText('Azithromycin 500mg')).toBeInTheDocument();
      expect(screen.getByText('Paracetamol 650mg')).toBeInTheDocument();
    });
  });

  it('displays consultation event details when expanded', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Video Consultation')).toBeInTheDocument();
    });

    // Expand the consultation event
    const eventCard = screen.getByText('Video Consultation');
    fireEvent.click(eventCard.closest('div')!);

    await waitFor(() => {
      expect(screen.getByText('Type:')).toBeInTheDocument();
      expect(screen.getByText('Video Call')).toBeInTheDocument();
      expect(screen.getByText('Doctor:')).toBeInTheDocument();
      expect(screen.getByText('Dr. Sharma')).toBeInTheDocument();
    });
  });

  it('displays nutrition event details when expanded', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Nutrition Plan for Weight Management')).toBeInTheDocument();
    });

    // Expand the nutrition event
    const eventCard = screen.getByText('Nutrition Plan for Weight Management');
    fireEvent.click(eventCard.closest('div')!);

    await waitFor(() => {
      expect(screen.getByText('Target Calories:')).toBeInTheDocument();
      expect(screen.getByText('1800 calories/day')).toBeInTheDocument();
      expect(screen.getByText('Meal Breakdown:')).toBeInTheDocument();
    });
  });

  it('shows empty state when no events match filter', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search history...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search history...');
    fireEvent.change(searchInput, { target: { value: 'nonexistent event' } });

    await waitFor(() => {
      expect(screen.getByText('No History Found')).toBeInTheDocument();
      expect(screen.getByText('No records match your search criteria.')).toBeInTheDocument();
    });
  });

  it('has export button', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Export')).toBeInTheDocument();
    });

    const exportButton = screen.getByText('Export');
    expect(exportButton).toBeInTheDocument();
  });

  it('displays severity badges correctly', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('HIGH')).toBeInTheDocument();
    });

    // Check for different severity levels
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });
});
