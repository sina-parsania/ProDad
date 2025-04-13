'use client';

import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Document } from '@/types/document';
import { useDocuments } from '@/hooks/useDocuments';
import { useEffect, useState } from 'react';

interface DocumentsWidgetProps {
  maxItems?: number;
  className?: string;
}

export default function DocumentsWidget({ maxItems = 6, className = '' }: DocumentsWidgetProps) {
  const { documents, loading } = useDocuments();
  const [mounted, setMounted] = useState(false);
  const [displayDocuments, setDisplayDocuments] = useState<Document[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (documents) {
      // Sort by upload date (newest first)
      const recentDocuments = [...documents]
        .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
        .slice(0, maxItems);

      setDisplayDocuments(recentDocuments);
    }
  }, [documents, maxItems]);

  const handleAddDocument = () => {
    // Navigate to the documents page
    window.location.href = '/documents?action=upload';
  };

  // Loading skeletons
  const renderLoadingState = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="flex justify-between items-center mt-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-12 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state
  const renderEmptyState = () => (
    <div className="text-center py-8 text-muted-foreground">
      <p>No documents uploaded yet</p>
      <Button variant="link" className="mt-2" onClick={handleAddDocument}>
        Upload your first document
      </Button>
    </div>
  );

  // Documents grid
  const renderDocuments = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayDocuments.map((document) => (
        <div
          key={document.id}
          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => (window.location.href = `/documents?open=${document.id}`)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              window.location.href = `/documents?open=${document.id}`;
            }
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-primary"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <h3 className="font-medium truncate max-w-[120px]">{document.title}</h3>
            </div>
            <div className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
              {document.type}
            </div>
          </div>
          <div className="mt-3 flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {format(new Date(document.uploadDate), 'MMM d, yyyy')}
            </p>
            <Link href={`/documents?open=${document.id}`}>
              <Button variant="outline" size="sm">
                View
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );

  if (!mounted) return null;

  return (
    <motion.div
      className={`col-span-full ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl">Recent Documents</CardTitle>
            <CardDescription>Important medical documents and notes</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleAddDocument}>
              Upload Document
            </Button>
            <Link href="/documents">
              <Button variant="ghost" size="sm" className="gap-1">
                <span>All Documents</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading
            ? renderLoadingState()
            : displayDocuments.length > 0
              ? renderDocuments()
              : renderEmptyState()}
        </CardContent>
      </Card>
    </motion.div>
  );
}
