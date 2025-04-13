'use client';

import { useState, useEffect, useRef } from 'react';
import { Document } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { format } from 'date-fns';

interface DocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  onSave: (document: Partial<Document>, file?: File) => void;
  onDelete: (id: number) => void;
}

export default function DocumentDialog({
  isOpen,
  onClose,
  document,
  onSave,
  onDelete,
}: DocumentDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Document['type']>('medical');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with existing document data if editing
  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setDescription(document.description || '');
      setType(document.type);
      setPreviewUrl(document.fileData);
    } else {
      // Reset form for new document
      setTitle('');
      setDescription('');
      setType('medical');
      setFile(null);
      setPreviewUrl(null);
    }
  }, [document]);

  // Preview file when selected
  useEffect(() => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    return () => {
      reader.abort();
    };
  }, [file]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const documentData: Partial<Document> = {
      title,
      description: description || undefined,
      type,
    };

    onSave(documentData, file || undefined);
  };

  const handleDelete = () => {
    if (document?.id) {
      onDelete(document.id);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isImage =
    file?.type.startsWith('image/') ||
    (document?.fileType && document.fileType.startsWith('image/'));
  const isPdf = file?.type === 'application/pdf' || document?.fileType === 'application/pdf';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{document ? 'Edit Document' : 'Upload Document'}</CardTitle>
            <CardDescription>
              {document ? 'Update document details' : 'Upload a new document or image'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="title" className="text-sm font-medium block mb-1">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Document title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="text-sm font-medium block mb-1">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="type" className="text-sm font-medium block mb-1">
                Document Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as Document['type'])}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="medical">Medical</option>
                <option value="prescription">Prescription</option>
                <option value="insurance">Insurance</option>
                <option value="note">Note</option>
                <option value="photo">Photo</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">File</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
                required={!document}
              />
              <div
                className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={triggerFileInput}
              >
                {previewUrl ? (
                  <div className="space-y-2">
                    {isImage && (
                      <div className="aspect-[3/2] max-h-[200px] overflow-hidden rounded-md mx-auto">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="object-contain w-full h-full"
                        />
                      </div>
                    )}
                    {isPdf && (
                      <div className="flex items-center justify-center py-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-12 w-12 text-muted-foreground"
                        >
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                          <path d="M9 13l-2 2 2 2" />
                          <path d="M15 13l2 2-2 2" />
                          <path d="m12 11-1 6" />
                        </svg>
                      </div>
                    )}
                    <p className="text-sm">
                      {file ? file.name : document?.fileName} (
                      {file
                        ? formatFileSize(file.size)
                        : document?.fileSize
                          ? formatFileSize(document.fileSize)
                          : 'Unknown size'}
                      )
                    </p>
                    <p className="text-xs text-muted-foreground">Click to change file</p>
                  </div>
                ) : (
                  <div className="py-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-8 w-8 mx-auto text-muted-foreground"
                    >
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                      <path d="M12 12v6" />
                      <path d="M15 15h-6" />
                    </svg>
                    <p className="mt-2 text-sm">Click to select a file or drop it here</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports images, PDFs, Word documents and text files
                    </p>
                  </div>
                )}
              </div>
            </div>

            {document && (
              <div className="text-xs text-muted-foreground">
                <p>Uploaded on: {format(new Date(document.uploadDate), 'PPpp')}</p>
                {document.updatedAt &&
                  document.updatedAt.getTime() !== document.uploadDate.getTime() && (
                    <p>Last updated: {format(new Date(document.updatedAt), 'PPpp')}</p>
                  )}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <div className="space-x-2">
              {document?.id && (
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
            <Button type="submit">{document ? 'Update' : 'Upload'}</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
