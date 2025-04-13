'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDocuments } from '@/hooks/useDocuments';
import { Document } from '@/types/document';
import { format } from 'date-fns';
import { toast } from 'sonner';
import DocumentDialog from '@/components/documents/DocumentDialog';

export default function DocumentsPage() {
  const {
    documents,
    loading,
    createDocument,
    updateDocument,
    removeDocument,
    downloadDocument,
    searchDocuments,
  } = useDocuments();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<Document['type'] | 'all'>('all');
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check for the 'open' query parameter when the component mounts or documents change
  useEffect(() => {
    if (mounted && documents.length > 0) {
      const openDocId = searchParams.get('open');
      if (openDocId) {
        const docToOpen = documents.find((doc) => doc.id === parseInt(openDocId, 10));
        if (docToOpen) {
          setSelectedDocument(docToOpen);
          setIsDialogOpen(true);
          // Clear the query parameter to avoid reopening on refresh
          router.replace('/documents');
        }
      }
    }
  }, [mounted, documents, searchParams, router]);

  const filteredDocuments = searchQuery
    ? searchDocuments(searchQuery)
    : activeFilter !== 'all'
      ? documents.filter((doc) => doc.type === activeFilter)
      : documents;

  const handleAddDocument = () => {
    setSelectedDocument(null);
    setIsDialogOpen(true);
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsDialogOpen(true);
  };

  const handleSaveDocument = async (documentData: Partial<Document>, file?: File) => {
    try {
      if (selectedDocument?.id) {
        await updateDocument(selectedDocument.id, documentData, file);
        toast.success('Document updated successfully');
      } else if (file) {
        // Ensure required properties are present for new document creation
        const newDocumentData = {
          title: documentData.title || 'Untitled Document',
          type: documentData.type || 'other',
          fileName: '',
          fileData: '',
          ...documentData,
        };

        await createDocument(newDocumentData, file);
        toast.success('Document uploaded successfully');
      } else {
        toast.error('No file selected');
        return;
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error('Failed to save document');
    }
  };

  const handleDeleteDocument = async (id: number) => {
    try {
      await removeDocument(id);
      toast.success('Document deleted');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleDownload = async (id: number) => {
    try {
      await downloadDocument(id);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  if (!mounted) return null;

  return (
    <div className="container max-w-7xl">
      <header className="mb-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground mt-1">
            Store and manage important medical documents, prescriptions, and notes
          </p>
        </motion.div>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="w-full md:w-auto">
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-[300px]"
          />
        </div>

        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('all')}
          >
            All
          </Button>
          <Button
            variant={activeFilter === 'medical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('medical')}
          >
            Medical
          </Button>
          <Button
            variant={activeFilter === 'prescription' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('prescription')}
          >
            Prescription
          </Button>
          <Button
            variant={activeFilter === 'insurance' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('insurance')}
          >
            Insurance
          </Button>
          <Button
            variant={activeFilter === 'note' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('note')}
          >
            Notes
          </Button>
          <Button
            variant={activeFilter === 'photo' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('photo')}
          >
            Photos
          </Button>
          <Button onClick={handleAddDocument} size="sm" className="md:ml-2">
            Upload
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            {searchQuery ? (
              <p className="text-muted-foreground">No documents found matching "{searchQuery}"</p>
            ) : activeFilter !== 'all' ? (
              <p className="text-muted-foreground">No {activeFilter} documents found</p>
            ) : (
              <>
                <p className="text-muted-foreground">No documents uploaded yet</p>
                <Button variant="link" onClick={handleAddDocument} className="mt-2">
                  Upload your first document
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((document) => (
            <motion.div
              key={document.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card
                className="h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewDocument(document)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{document.title}</CardTitle>
                      <CardDescription>
                        {format(new Date(document.uploadDate), 'PPP')}
                      </CardDescription>
                    </div>
                    <div className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                      {document.type}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  {document.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {document.description.length > 100
                        ? `${document.description.substring(0, 100)}...`
                        : document.description}
                    </p>
                  )}

                  <div className="mt-auto">
                    <DocumentPreview document={document} />

                    <div className="flex justify-between items-center mt-4">
                      <div className="text-xs text-muted-foreground">
                        {document.fileName.length > 25
                          ? `${document.fileName.substring(0, 25)}...`
                          : document.fileName}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(document.id!);
                        }}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {isDialogOpen && (
        <DocumentDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          document={selectedDocument}
          onSave={handleSaveDocument}
          onDelete={handleDeleteDocument}
        />
      )}
    </div>
  );
}

function DocumentPreview({ document }: { document: Document }) {
  const isImage = document.fileType?.startsWith('image/');
  const isPdf = document.fileType === 'application/pdf';

  if (isImage) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-md border bg-muted">
        <img src={document.fileData} alt={document.title} className="object-cover w-full h-full" />
      </div>
    );
  }

  return (
    <div className="aspect-[4/3] rounded-md border bg-muted/50 flex items-center justify-center">
      <div className="text-center">
        {isPdf ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-12 h-12 mx-auto text-muted-foreground"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <path d="M9 13l-2 2 2 2" />
            <path d="M15 13l2 2-2 2" />
            <path d="m12 11-1 6" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-12 h-12 mx-auto text-muted-foreground"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          {document.fileType?.split('/')[1]?.toUpperCase() || 'FILE'}
        </p>
      </div>
    </div>
  );
}
