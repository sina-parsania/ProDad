'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { Partner } from '@/types/user';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, partner, loading, updateUser } = useProfile();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(undefined);

  // Initialize form with user data when available
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setProfilePhoto(user.profilePhoto);
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Please fill out all required fields');
      return;
    }

    try {
      setSaving(true);
      await updateUser({
        firstName,
        lastName,
        profilePhoto,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Helper function to display partner status in a human-readable format
  const formatPartnerStatus = (status: Partner['status']): string => {
    switch (status) {
      case 'planning':
        return 'Planning & Preparation';
      case 'pregnant':
        return 'Expecting';
      case 'newborn':
        return 'Newborn Stage';
      case 'toddler':
        return 'Toddler Stage';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (!mounted) return null;

  return (
    <div className="container max-w-3xl">
      <header className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information</p>
        </motion.div>
      </header>

      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-8">
                  <div className="flex-shrink-0 flex justify-center">
                    <Skeleton className="h-32 w-32 rounded-full" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Your Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit}>
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="flex-shrink-0">
                        <FileUpload initialImage={profilePhoto} onImageChange={setProfilePhoto} />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="mt-6 flex justify-end">
                          <Button type="submit" disabled={saving}>
                            {saving ? (
                              <>
                                <svg
                                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Saving...
                              </>
                            ) : (
                              'Save Changes'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="partner-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="partner-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Partner Information</CardTitle>
                  <CardDescription>Details about your partner (read-only)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>First Name</Label>
                        <div className="border rounded-md h-10 px-3 py-2 bg-muted/50">
                          {partner?.firstName || 'Not set'}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Last Name</Label>
                        <div className="border rounded-md h-10 px-3 py-2 bg-muted/50">
                          {partner?.lastName || 'Not set'}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Current Status</Label>
                      <div className="border rounded-md h-10 px-3 py-2 bg-muted/50">
                        {partner?.status ? formatPartnerStatus(partner.status) : 'Not set'}
                      </div>
                    </div>
                    {partner?.dueDate && (
                      <div className="space-y-2">
                        <Label>Due Date</Label>
                        <div className="border rounded-md h-10 px-3 py-2 bg-muted/50">
                          {format(new Date(partner.dueDate), 'MMMM d, yyyy')}
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Last Updated</Label>
                      <div className="border rounded-md h-10 px-3 py-2 bg-muted/50">
                        {partner?.updatedAt
                          ? format(new Date(partner.updatedAt), 'MMMM d, yyyy h:mm a')
                          : 'Never'}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      <p>
                        Partner information is read-only in this profile view. For assistance with
                        updating partner details, please contact support.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
