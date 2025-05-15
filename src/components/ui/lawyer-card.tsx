import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { X } from 'lucide-react';
import { generateDialogTitle } from '../../lib/ai';
import { Button } from './button';
import { Card } from './card';
import { Separator } from './separator';

interface Lawyer {
  id: string;
  "Law Firm": string;
  "Phone Number": string;
  email: string;
  website: string;
  city: string;
  state: string;
  county: string;
}

interface LawyerCardProps {
  lawyer: Lawyer;
}

export function LawyerCard({ lawyer }: LawyerCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('Legal Professional Details');

  useEffect(() => {
    const generateTitle = async () => {
      const title = await generateDialogTitle(`Legal professional details for ${lawyer['Law Firm']}`);
      setDialogTitle(title);
    };
    generateTitle();
  }, [lawyer['Law Firm']]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex flex-col space-y-2">
            <h3 className="font-semibold text-lg">{lawyer['Law Firm']}</h3>
            <p className="text-sm text-gray-600">{lawyer.city}, {lawyer.state}</p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">View Details</Button>
            </div>
          </div>
        </Card>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 max-h-[85vh] w-[90vw] max-w-[800px] translate-x-[-50%] translate-y-[-50%] rounded-[12px] bg-white p-6 shadow-lg">
          <Dialog.Title className="text-xl font-semibold mb-4">{dialogTitle}</Dialog.Title>
          
          <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Dialog.Close>

          <Tabs.Root defaultValue="overview" className="w-full">
            <Tabs.List className="flex space-x-4 border-b mb-4">
              <Tabs.Trigger value="overview" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-gray-900">
                Overview
              </Tabs.Trigger>
              <Tabs.Trigger value="case-results" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-gray-900">
                Case Results
              </Tabs.Trigger>
              <Tabs.Trigger value="reviews" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-gray-900">
                Reviews
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Phone:</span> {lawyer['Phone Number']}</p>
                    <p><span className="font-medium">Email:</span> {lawyer.email}</p>
                    <p><span className="font-medium">Website:</span> {lawyer.website}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Location</h4>
                  <div className="space-y-2 text-sm">
                    <p>{lawyer.city}, {lawyer.state}</p>
                    <p>{lawyer.county} County</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">About the Firm</h4>
                <p className="text-sm text-gray-600">
                  {lawyer['Law Firm']} is a respected legal practice serving clients in {lawyer.city} and surrounding areas.
                  With a commitment to excellence and client satisfaction, the firm provides comprehensive legal services
                  tailored to meet individual needs.
                </p>
              </div>
            </Tabs.Content>

            <Tabs.Content value="case-results" className="space-y-4">
              <p className="text-sm text-gray-600">Case results coming soon.</p>
            </Tabs.Content>

            <Tabs.Content value="reviews" className="space-y-4">
              <p className="text-sm text-gray-600">Reviews coming soon.</p>
            </Tabs.Content>
          </Tabs.Root>

          <div className="mt-6 flex justify-end space-x-2">
            <Dialog.Close asChild>
              <Button variant="outline">Close</Button>
            </Dialog.Close>
            <Button onClick={() => window.location.href = `tel:${lawyer['Phone Number']}`}>
              Contact Now
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}