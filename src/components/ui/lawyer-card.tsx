import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Star, Phone, Calendar, PlayCircle } from 'lucide-react';
import { Badge } from './badge';
import { Button } from './button';
import { Card } from './card';
import { Separator } from './separator';

interface LawyerCardProps {
  lawyer: {
    id: string;
    "Law Firm": string;
    state: string;
    city: string;
    county: string;
    "Phone Number": string;
    email: string;
    website: string;
  };
}

export function LawyerCard({ lawyer }: LawyerCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <Card className="p-4 space-y-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setIsOpen(true)}>
        <div className="flex justify-between items-start">
          <div>
            <Badge className="bg-green-50 text-green-700 mb-2">Available Now</Badge>
            <h3 className="text-lg font-semibold">{lawyer["Law Firm"]}</h3>
            <p className="text-sm text-gray-600">{`${lawyer.city}, ${lawyer.state}`}</p>
          </div>
          <div className="flex -space-x-2">
            <div className="w-12 h-12 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
              <span className="text-blue-600 font-semibold">JD</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 4.5].map((rating, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${rating > Math.floor(rating) ? 'text-yellow-400 fill-yellow-400 opacity-50' : 'text-yellow-400 fill-yellow-400'}`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" variant="outline">Schedule</Button>
          <Button className="flex-1">Connect Me Now</Button>
        </div>
      </Card>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[800px] translate-x-[-50%] translate-y-[-50%] bg-white rounded-xl shadow-lg z-50 overflow-hidden">
            <div className="bg-indigo-700 text-white p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge className="bg-green-500/20 text-green-100 mb-2">Available Now</Badge>
                  <h2 className="text-2xl font-semibold">{lawyer["Law Firm"]}</h2>
                  <p className="text-indigo-200">{`${lawyer.city}, ${lawyer.state}`}</p>
                </div>
                <Dialog.Close className="text-white/70 hover:text-white">
                  <VisuallyHidden.Root>Close</VisuallyHidden.Root>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </Dialog.Close>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 4.5].map((rating, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${rating > Math.floor(rating) ? 'text-yellow-400 fill-yellow-400 opacity-50' : 'text-yellow-400 fill-yellow-400'}`}
                  />
                ))}
              </div>
            </div>

            <Tabs.Root defaultValue="overview" className="outline-none">
              <Tabs.List className="flex border-b">
                <Tabs.Trigger value="overview" className="flex-1 px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent data-[state=active]:border-indigo-700 data-[state=active]:text-gray-900">
                  Overview
                </Tabs.Trigger>
                <Tabs.Trigger value="case-results" className="flex-1 px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent data-[state=active]:border-indigo-700 data-[state=active]:text-gray-900">
                  Case Results
                </Tabs.Trigger>
                <Tabs.Trigger value="reviews" className="flex-1 px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent data-[state=active]:border-indigo-700 data-[state=active]:text-gray-900">
                  Reviews
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="overview" className="p-6 outline-none">
                <div className="space-y-6">
                  <div className="aspect-video bg-gray-100 rounded-lg relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PlayCircle className="w-16 h-16 text-indigo-600 cursor-pointer hover:text-indigo-700" />
                    </div>
                  </div>
                  
                  <p className="text-gray-600">
                    At the {lawyer["Law Firm"]}, we pride ourselves on serving our clients with the utmost care and attention to detail. Whether you're facing felony charges or misdemeanor charges, we understand that a criminal conviction can have devastating long-term effects on your life.
                  </p>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Practice Areas</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                        Criminal Defense
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                        DUI Defense
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                        Domestic Violence
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                        Drug Charges
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                        Probation Violations
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full" />
                        Expungements
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1 gap-2" variant="outline">
                      <Calendar className="w-4 h-4" />
                      Schedule
                    </Button>
                    <Button className="flex-1 gap-2">
                      <Phone className="w-4 h-4" />
                      Connect Me Now
                    </Button>
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="case-results" className="p-6 outline-none">
                <p className="text-gray-600">Case results content coming soon...</p>
              </Tabs.Content>

              <Tabs.Content value="reviews" className="p-6 outline-none">
                <p className="text-gray-600">Reviews content coming soon...</p>
              </Tabs.Content>
            </Tabs.Root>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}