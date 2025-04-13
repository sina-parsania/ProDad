'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addDocument, updateDocument, deleteDocument } from '@/lib/db/db';
import { Document } from '@/types/document';

export function useDocuments() {
  const documents = useLiveQuery(() => db.documents.toArray());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (documents !== undefined) {
      setLoading(false);
    }
  }, [documents]);

  const createDocument = useCallback(
    async (
      newDocument: Omit<Document, 'id' | 'synced' | 'uploadDate' | 'updatedAt'>,
      file: File,
    ) => {
      try {
        return new Promise<number>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = async (event) => {
            try {
              const now = new Date();
              const fileData = event.target?.result as string;

              const document: Omit<Document, 'id'> = {
                ...newDocument,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                fileData,
                uploadDate: now,
                updatedAt: now,
                synced: false,
              };

              const id = await addDocument(document);
              resolve(id);
            } catch (err) {
              reject(err);
            }
          };

          reader.onerror = () => {
            reject(new Error('Error reading file'));
          };

          reader.readAsDataURL(file);
        });
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [],
  );

  const updateDocumentItem = useCallback(
    async (
      id: number,
      changes: Partial<Omit<Document, 'id' | 'synced' | 'uploadDate' | 'updatedAt'>>,
      file?: File,
    ) => {
      try {
        if (file) {
          return new Promise<number>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (event) => {
              try {
                const fileData = event.target?.result as string;

                const result = await updateDocument(id, {
                  ...changes,
                  fileName: file.name,
                  fileSize: file.size,
                  fileType: file.type,
                  fileData,
                  synced: false,
                  updatedAt: new Date(),
                });

                resolve(result);
              } catch (err) {
                reject(err);
              }
            };

            reader.onerror = () => {
              reject(new Error('Error reading file'));
            };

            reader.readAsDataURL(file);
          });
        } else {
          const result = await updateDocument(id, {
            ...changes,
            synced: false,
            updatedAt: new Date(),
          });

          return result;
        }
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [],
  );

  const removeDocument = useCallback(async (id: number) => {
    try {
      await deleteDocument(id);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  // Filter documents by type
  const getDocumentsByType = useCallback(
    (type: Document['type']) => {
      if (!documents) return [];
      return documents.filter((doc) => doc.type === type);
    },
    [documents],
  );

  // Search documents by title or description
  const searchDocuments = useCallback(
    (query: string) => {
      if (!documents || !query) return documents || [];

      const searchTerm = query.toLowerCase().trim();

      return documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchTerm) ||
          (doc.description && doc.description.toLowerCase().includes(searchTerm)),
      );
    },
    [documents],
  );

  // Download a document
  const downloadDocument = useCallback(
    (id: number): Promise<void> => {
      return new Promise((resolve, reject) => {
        // Make sure we're on the client before accessing document or window
        if (typeof window === 'undefined') {
          reject(new Error('Cannot download on server side'));
          return;
        }

        if (!documents) {
          reject(new Error('Documents not loaded'));
          return;
        }

        const doc = documents.find((d) => d.id === id);
        if (!doc) {
          reject(new Error('Document not found'));
          return;
        }

        try {
          // Create a link element to download the file
          const link = doc.fileData;
          const a = window.document.createElement('a');
          a.href = link;
          a.download = doc.fileName;
          window.document.body.appendChild(a);
          a.click();
          window.document.body.removeChild(a);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    },
    [documents],
  );

  return {
    documents: documents || [],
    loading,
    error,
    createDocument,
    updateDocument: updateDocumentItem,
    removeDocument,
    getDocumentsByType,
    searchDocuments,
    downloadDocument,
  };
}
