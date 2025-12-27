/**
 * Tests for PrescriptionWriter component
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PrescriptionWriter from '../components/doctor/PrescriptionWriter';
import * as apiClient from '../services/apiClient';

// Mock the API client
vi.mock('../services/apiClient', () => ({
  default: {
    createPrescription: vi.fn()
  }
}));

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

describe('PrescriptionWriter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <PrescriptionWriter patientId={1} />
      </BrowserRouter>
    );
  };

  it('renders prescription writer form', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Write Prescription')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Patient Information')).toBeInTheDocument();
    expect(screen.getByText('Add Medicines')).toBeInTheDocument();
  });

  it('displays patient information', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Ramesh Kumar')).toBeInTheDocument();
    });
    
    expect(screen.getByText('45 years')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
  });

  it('allows adding medicine to list', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search medicine...')).toBeInTheDocument();
    });

    const medicineInput = screen.getByPlaceholderText('Search medicine...');
    fireEvent.change(medicineInput, { target: { value: 'Paracetamol 500mg' } });

    const dosageInput = screen.getByPlaceholderText('e.g., 1 tablet, 5ml');
    fireEvent.change(dosageInput, { target: { value: '1 tablet' } });

    const durationInput = screen.getByPlaceholderText('e.g., 5 days, 2 weeks');
    fireEvent.change(durationInput, { target: { value: '5 days' } });

    const addButton = screen.getByText('Add Medicine');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Prescribed Medicines (1)')).toBeInTheDocument();
      expect(screen.getByText('Paracetamol 500mg')).toBeInTheDocument();
    });
  });

  it('validates empty medicine fields', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Add Medicine')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Medicine');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Please fill all medicine fields')).toBeInTheDocument();
    });
  });

  it('removes medicine from list', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search medicine...')).toBeInTheDocument();
    });

    // Add a medicine first
    const medicineInput = screen.getByPlaceholderText('Search medicine...');
    fireEvent.change(medicineInput, { target: { value: 'Paracetamol 500mg' } });

    const dosageInput = screen.getByPlaceholderText('e.g., 1 tablet, 5ml');
    fireEvent.change(dosageInput, { target: { value: '1 tablet' } });

    const durationInput = screen.getByPlaceholderText('e.g., 5 days, 2 weeks');
    fireEvent.change(durationInput, { target: { value: '5 days' } });

    const addButton = screen.getByText('Add Medicine');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Prescribed Medicines (1)')).toBeInTheDocument();
    });

    // Now remove it
    const removeButtons = screen.getAllByRole('button');
    const removeButton = removeButtons.find(btn => btn.querySelector('svg')); // Find trash icon button
    if (removeButton) {
      fireEvent.click(removeButton);
    }

    await waitFor(() => {
      expect(screen.queryByText('Prescribed Medicines (1)')).not.toBeInTheDocument();
    });
  });

  it('validates prescription before saving', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText('Save Prescription')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Prescription');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText('Please add at least one medicine')).toBeInTheDocument();
    });
  });

  it('saves prescription successfully', async () => {
    const mockCreatePrescription = vi.fn().mockResolvedValue({ id: 1, status: 'success' });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (apiClient.default.createPrescription as any) = mockCreatePrescription;

    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search medicine...')).toBeInTheDocument();
    });

    // Add a medicine
    const medicineInput = screen.getByPlaceholderText('Search medicine...');
    fireEvent.change(medicineInput, { target: { value: 'Paracetamol 500mg' } });

    const dosageInput = screen.getByPlaceholderText('e.g., 1 tablet, 5ml');
    fireEvent.change(dosageInput, { target: { value: '1 tablet' } });

    const durationInput = screen.getByPlaceholderText('e.g., 5 days, 2 weeks');
    fireEvent.change(durationInput, { target: { value: '5 days' } });

    const addButton = screen.getByText('Add Medicine');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Prescribed Medicines (1)')).toBeInTheDocument();
    });

    // Save prescription
    const saveButton = screen.getByText('Save Prescription');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockCreatePrescription).toHaveBeenCalled();
      expect(screen.getByText('Prescription saved successfully!')).toBeInTheDocument();
    });
  });

  it('opens preview modal', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search medicine...')).toBeInTheDocument();
    });

    // Add a medicine first
    const medicineInput = screen.getByPlaceholderText('Search medicine...');
    fireEvent.change(medicineInput, { target: { value: 'Paracetamol 500mg' } });

    const dosageInput = screen.getByPlaceholderText('e.g., 1 tablet, 5ml');
    fireEvent.change(dosageInput, { target: { value: '1 tablet' } });

    const durationInput = screen.getByPlaceholderText('e.g., 5 days, 2 weeks');
    fireEvent.change(durationInput, { target: { value: '5 days' } });

    const addButton = screen.getByText('Add Medicine');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Prescribed Medicines (1)')).toBeInTheDocument();
    });

    // Open preview
    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(screen.getByText('Prescription Preview')).toBeInTheDocument();
      expect(screen.getByText('Arogya Swarm')).toBeInTheDocument();
    });
  });
});
