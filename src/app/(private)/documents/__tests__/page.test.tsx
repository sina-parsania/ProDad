import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DocumentsPage from '../page';
import { useDocuments } from '@/hooks/useDocuments';
import { Document } from '@/types/document';
import { useRouter, useSearchParams } from 'next/navigation';

// Mock the useDocuments hook
jest.mock('@/hooks/useDocuments');

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock the sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
}));

// Mock DocumentDialog component
jest.mock('@/components/documents/DocumentDialog', () => {
  return function MockDocumentDialog({ isOpen, onClose, document, onSave, onDelete }: any) {
    if (!isOpen) return null;

    const handleSave = () => {
      onSave({
        title: 'Updated Document',
        type: 'medical',
        description: 'Updated description',
      });
    };

    const handleDelete = () => {
      if (document?.id) {
        onDelete(document.id);
      }
    };

    return (
      <div role="dialog" data-testid="document-dialog">
        <h2>{document ? 'Edit Document' : 'New Document'}</h2>
        {document && <p>Editing: {document.title}</p>}
        <button onClick={handleSave} data-testid="save-document-btn">
          Save
        </button>
        {document && (
          <button onClick={handleDelete} data-testid="delete-document-btn">
            Delete
          </button>
        )}
        <button onClick={onClose}>Cancel</button>
      </div>
    );
  };
});

describe('Documents Page', () => {
  const mockDocuments: Document[] = [
    {
      id: 1,
      title: 'Medical Report',
      type: 'medical',
      fileName: 'report.pdf',
      fileData: 'base64data',
      fileType: 'application/pdf',
      uploadDate: new Date('2023-05-15'),
      updatedAt: new Date('2023-05-15'),
      synced: false,
      description: 'Annual medical report',
    },
    {
      id: 2,
      title: 'Vaccination Record',
      type: 'medical',
      fileName: 'vaccines.jpg',
      fileData: 'base64image',
      fileType: 'image/jpeg',
      uploadDate: new Date('2023-06-10'),
      updatedAt: new Date('2023-06-10'),
      synced: false,
    },
  ];

  const mockCreateDocument = jest.fn().mockResolvedValue(3);
  const mockUpdateDocument = jest.fn().mockResolvedValue(true);
  const mockRemoveDocument = jest.fn().mockResolvedValue(true);
  const mockDownloadDocument = jest.fn().mockResolvedValue(true);
  const mockSearchDocuments = jest.fn().mockImplementation((query) => {
    return mockDocuments.filter(
      (doc) =>
        doc.title.toLowerCase().includes(query.toLowerCase()) ||
        (doc.description?.toLowerCase() || '').includes(query.toLowerCase()),
    );
  });

  const mockRouterPush = jest.fn();
  const mockRouterReplace = jest.fn();
  const mockGetParam = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useDocuments as jest.Mock).mockReturnValue({
      documents: mockDocuments,
      loading: false,
      createDocument: mockCreateDocument,
      updateDocument: mockUpdateDocument,
      removeDocument: mockRemoveDocument,
      downloadDocument: mockDownloadDocument,
      searchDocuments: mockSearchDocuments,
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
      replace: mockRouterReplace,
    });

    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockGetParam,
    });

    // Default is no query parameters
    mockGetParam.mockReturnValue(null);
  });

  it('renders the documents list', async () => {
    render(<DocumentsPage />);

    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(
      screen.getByText('Store and manage important medical documents, prescriptions, and notes'),
    ).toBeInTheDocument();

    // Check that all documents are rendered
    await waitFor(() => {
      expect(screen.getByText('Medical Report')).toBeInTheDocument();
      expect(screen.getByText('Vaccination Record')).toBeInTheDocument();
    });
  });

  it('shows loading state while documents are loading', () => {
    (useDocuments as jest.Mock).mockReturnValue({
      documents: [],
      loading: true,
      createDocument: mockCreateDocument,
      updateDocument: mockUpdateDocument,
      removeDocument: mockRemoveDocument,
      downloadDocument: mockDownloadDocument,
      searchDocuments: mockSearchDocuments,
    });

    render(<DocumentsPage />);

    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
    expect(screen.queryByText('Medical Report')).not.toBeInTheDocument();
  });

  it('shows empty state when no documents exist', () => {
    (useDocuments as jest.Mock).mockReturnValue({
      documents: [],
      loading: false,
      createDocument: mockCreateDocument,
      updateDocument: mockUpdateDocument,
      removeDocument: mockRemoveDocument,
      downloadDocument: mockDownloadDocument,
      searchDocuments: mockSearchDocuments,
    });

    render(<DocumentsPage />);

    expect(screen.getByText('No documents uploaded yet')).toBeInTheDocument();
    expect(screen.getByText('Upload your first document')).toBeInTheDocument();
  });

  it('opens document dialog when clicking on a document', async () => {
    render(<DocumentsPage />);

    // Click on the first document
    await waitFor(() => {
      fireEvent.click(screen.getByText('Medical Report'));
    });

    // Check that the dialog opens with the correct document
    expect(screen.getByTestId('document-dialog')).toBeInTheDocument();
    expect(screen.getByText('Editing: Medical Report')).toBeInTheDocument();
  });

  it('opens empty document dialog when clicking Upload button', async () => {
    render(<DocumentsPage />);

    // Click the Upload button
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    // Check that the dialog opens with no document
    expect(screen.getByTestId('document-dialog')).toBeInTheDocument();
    expect(screen.getByText('New Document')).toBeInTheDocument();
    expect(screen.queryByText(/Editing:/)).not.toBeInTheDocument();
  });

  it('updates document when saving in the dialog', async () => {
    render(<DocumentsPage />);

    // Open edit dialog for the first document
    await waitFor(() => {
      fireEvent.click(screen.getByText('Medical Report'));
    });

    // Save the document with updated data
    fireEvent.click(screen.getByTestId('save-document-btn'));

    // Check that updateDocument was called with correct data
    expect(mockUpdateDocument).toHaveBeenCalledWith(
      1,
      {
        title: 'Updated Document',
        type: 'medical',
        description: 'Updated description',
      },
      undefined,
    );
  });

  it('deletes document when clicking delete in the dialog', async () => {
    render(<DocumentsPage />);

    // Open edit dialog for the first document
    await waitFor(() => {
      fireEvent.click(screen.getByText('Medical Report'));
    });

    // Delete the document
    fireEvent.click(screen.getByTestId('delete-document-btn'));

    // Check that removeDocument was called with correct ID
    expect(mockRemoveDocument).toHaveBeenCalledWith(1);
  });

  it('filters documents when searching', async () => {
    render(<DocumentsPage />);

    // Enter search query
    const searchInput = screen.getByPlaceholderText('Search documents...');
    await userEvent.type(searchInput, 'Vaccination');

    // Check that only matching document is shown
    await waitFor(() => {
      expect(screen.queryByText('Medical Report')).not.toBeInTheDocument();
      expect(screen.getByText('Vaccination Record')).toBeInTheDocument();
    });
  });

  it('opens document from query parameter', async () => {
    // Set up mock to return a document ID
    mockGetParam.mockReturnValue('1');

    render(<DocumentsPage />);

    // Check that the dialog opens with the correct document
    await waitFor(() => {
      expect(screen.getByTestId('document-dialog')).toBeInTheDocument();
      expect(screen.getByText('Editing: Medical Report')).toBeInTheDocument();
    });

    // Should clear the query parameter
    expect(mockRouterReplace).toHaveBeenCalledWith('/documents');
  });

  it('downloads document when clicking download button', async () => {
    render(<DocumentsPage />);

    // Find all download buttons and click the first one
    const downloadButtons = await screen.findAllByRole('button', { name: 'Download' });
    fireEvent.click(downloadButtons[0]);

    // Click event should be stopped from propagating (not open dialog)
    expect(screen.queryByTestId('document-dialog')).not.toBeInTheDocument();

    // Check that downloadDocument was called with correct ID
    expect(mockDownloadDocument).toHaveBeenCalledWith(1);
  });

  it('filters documents by type when clicking filter buttons', async () => {
    render(<DocumentsPage />);

    // Initially all documents are shown
    await waitFor(() => {
      expect(screen.getByText('Medical Report')).toBeInTheDocument();
      expect(screen.getByText('Vaccination Record')).toBeInTheDocument();
    });

    // Click on prescription filter button
    fireEvent.click(screen.getByRole('button', { name: 'Prescription' }));

    // Should set filter to 'prescription' and show no documents
    expect(screen.getByText('No prescription documents found')).toBeInTheDocument();

    // Click on medical filter button
    fireEvent.click(screen.getByRole('button', { name: 'Medical' }));

    // Both documents should be shown again (both are medical)
    await waitFor(() => {
      expect(screen.getByText('Medical Report')).toBeInTheDocument();
      expect(screen.getByText('Vaccination Record')).toBeInTheDocument();
    });
  });
});
