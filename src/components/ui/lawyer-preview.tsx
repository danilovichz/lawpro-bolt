import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { Star, X } from 'lucide-react';
import { Button } from './button';
import { Avatar } from './avatar';
import { Badge } from './badge';

interface LawyerPreviewProps {
  lawyer: {
    id: string;
    'Law Firm': string;
    'Phone Number': string;
    email: string;
    website: string;
    state: string;
    city: string;
    county: string;
  };
}

export const LawyerPreview: React.FC<LawyerPreviewProps> = ({ lawyer }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dialogTitle = 'Lawyer Profile';

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <div className="bg-white rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12">
              <img src="/frame-2147227290.svg" alt="Lawyer" className="p-2" />
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="success" className="text-xs">Available Now</Badge>
              </div>
              <h3 className="font-semibold text-lg mb-1">{lawyer['Law Firm']}</h3>
              <p className="text-sm text-gray-600">{lawyer.city}, {lawyer.state}</p>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <Button variant="default" size="sm">View Profile</Button>
          </div>
        </div>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[800px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-6 shadow-lg overflow-y-auto">
          <Dialog.Title className="sr-only">{dialogTitle}</Dialog.Title>
          <Dialog.Close className="absolute right-4 top-4">
            <X className="h-4 w-4" />
          </Dialog.Close>

          <div className="flex items-start gap-6 mb-6">
            <Avatar className="w-16 h-16">
              <img src="/frame-2147227290.svg" alt="Lawyer" className="p-3" />
            </Avatar>
            <div>
              <Badge variant="success" className="mb-2">Available Now</Badge>
              <h2 className="text-2xl font-semibold mb-2">{lawyer['Law Firm']}</h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{lawyer.city}, {lawyer.state}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Tabs.Root defaultValue="overview" className="w-full">
            <Tabs.List className="flex gap-4 border-b mb-6">
              <Tabs.Trigger value="overview" className="pb-2 text-gray-600 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600">
                Overview
              </Tabs.Trigger>
              <Tabs.Trigger value="case-results" className="pb-2 text-gray-600 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600">
                Case Results
              </Tabs.Trigger>
              <Tabs.Trigger value="reviews" className="pb-2 text-gray-600 border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600">
                Reviews
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content value="overview" className="focus:outline-none">
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-6">
                  At {lawyer['Law Firm']}, we pride ourselves on serving our clients with the utmost care and attention to detail. Whether you're facing felony charges or misdemeanor charges, we understand that a criminal conviction can have devastating long-term effects on your life.
                </p>

                <h3 className="text-lg font-semibold mb-4">Practice Areas</h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                    <span>Criminal Defense</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                    <span>DUI Defense</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                    <span>Domestic Violence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                    <span>Drug Charges</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button className="flex-1">Schedule Consultation</Button>
                  <Button variant="outline" className="flex-1">Contact Now</Button>
                </div>
              </div>
            </Tabs.Content>

            <Tabs.Content value="case-results" className="focus:outline-none">
              <p className="text-gray-600">Case results coming soon...</p>
            </Tabs.Content>

            <Tabs.Content value="reviews" className="focus:outline-none">
              <p className="text-gray-600">Reviews coming soon...</p>
            </Tabs.Content>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};