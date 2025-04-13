export interface Document {
  id?: number;
  title: string;
  description?: string;
  type: 'medical' | 'prescription' | 'insurance' | 'note' | 'photo' | 'other';
  tags?: string[];
  fileName: string;
  fileSize?: number;
  fileType?: string;
  fileUrl?: string; // If stored in the cloud
  fileData: string; // Base64 encoded data
  uploadDate: Date;
  updatedAt: Date;
  synced: boolean; // Indicates if the document has been synced with the backend
  sharedWith?: string[]; // List of users the document is shared with
}
