export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  profilePhoto?: string; // Base64 encoded image data
  updatedAt: Date;
}

export interface Partner {
  id?: number;
  firstName: string;
  lastName: string;
  status: 'planning' | 'pregnant' | 'newborn' | 'toddler' | 'other';
  dueDate?: Date; // Relevant if status is 'pregnant'
  updatedAt: Date;
}
