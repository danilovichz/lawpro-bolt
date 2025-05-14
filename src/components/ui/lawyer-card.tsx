import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { Card } from './card';
import { Button } from './button';
import { Avatar } from './avatar';
import { Badge } from './badge';
import { CalendarIcon, MapPinIcon, PhoneIcon, StarIcon } from 'lucide-react';

interface LawyerCardProps {
  lawyer: {
    id: string;
    state: string;
    city: string;
    county: string;
    "Law Firm": string;
    "Phone Number": string;
    email: string;
    website: string;
  };
}

export function LawyerCard({ lawyer }: LawyerCardProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <img src="https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg" 
                 alt={lawyer["Law Firm"]} 
                 className="object-cover" />
          </Avatar>
          <div>
            <Badge className="bg-[#ECFDF3] text-[#027A48] mb-2">Available Now</Badge>
            <h3 className="text-xl font-semibold">Top Rated Criminal Lawyer in {lawyer.county}</h3>
            <div className="flex items-center gap-2 text-[#667085]">
              <span className="font-medium">{lawyer["Law Firm"]}</span>
              <Badge variant="outline" className="bg-white">
                <StarIcon className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                4.8
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 gap-2" onClick={() => setIsOpen(true)}>
            <CalendarIcon className="w-4 h-4" />
            Schedule
          </Button>
          <Button className="flex-1 gap-2">
            <PhoneIcon className="w-4 h-4" />
            Connect Me Now
          </Button>
        </div>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-2xl bg-white rounded-xl p-6 z-50">
            <Dialog.Title className="text-2xl font-semibold mb-6">
              Lawyer Details
            </Dialog.Title>

            <Tabs.Root defaultValue="overview" className="space-y-6">
              <Tabs.List className="flex gap-4 border-b">
                <Tabs.Trigger value="overview" className="pb-2 border-b-2 border-transparent data-[state=active]:border-blue-600">
                  Overview
                </Tabs.Trigger>
                <Tabs.Trigger value="case-results" className="pb-2 border-b-2 border-transparent data-[state=active]:border-blue-600">
                  Case Results
                </Tabs.Trigger>
                <Tabs.Trigger value="reviews" className="pb-2 border-b-2 border-transparent data-[state=active]:border-blue-600">
                  Reviews
                </Tabs.Trigger>
              </Tabs.List>

              <Tabs.Content value="overview" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Contact Information</h4>
                      <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="w-4 h-4" />
                          <a href={`tel:${lawyer["Phone Number"]}`} className="hover:underline">
                            {lawyer["Phone Number"]}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{lawyer.city}, {lawyer.state}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Areas of Practice</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">Criminal Defense</Badge>
                        <Badge variant="outline">DUI Defense</Badge>
                        <Badge variant="outline">Drug Crimes</Badge>
                        <Badge variant="outline">Domestic Violence</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Experience</h4>
                      <p className="text-sm text-gray-600">
                        20+ years of experience in criminal defense, specializing in DUI cases and drug-related offenses.
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Education</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>J.D., Harvard Law School</li>
                        <li>B.A., Yale University</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Languages</h4>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">English</Badge>
                        <Badge variant="outline">Spanish</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="case-results" className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">DUI Defense</h4>
                      <Badge className="bg-[#FDF4EA] text-[#B93815]">Charges Reduced</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Client facing felony DUI charges had case reduced to misdemeanor with minimal penalties.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Drug Possession</h4>
                      <Badge className="bg-[#ECFDF3] text-[#027A48]">Charges Dismissed</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Successfully argued illegal search and seizure, resulting in complete dismissal of all charges.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">Domestic Violence</h4>
                      <Badge className="bg-[#F9F5FF] text-[#6941C6]">Not Guilty Verdict</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Jury trial resulting in full acquittal after presenting evidence of false accusations.
                    </p>
                  </div>
                </div>
              </Tabs.Content>

              <Tabs.Content value="reviews" className="space-y-6">
                <div className="text-center text-gray-500">
                  Reviews coming soon
                </div>
              </Tabs.Content>
            </Tabs.Root>

            <Dialog.Close asChild>
              <Button variant="outline" className="mt-6">
                Close
              </Button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Card>
  );
}