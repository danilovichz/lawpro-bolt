import React from 'react';
import { Card } from "./card";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "./button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Separator } from "./separator";
import { generateDialogTitle } from "../../../lib/ai";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

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

export const LawyerCard = ({ lawyer }: LawyerCardProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState("");

  React.useEffect(() => {
    if (isOpen) {
      generateDialogTitle(`Law firm details for ${lawyer["Law Firm"]}`)
        .then(title => setDialogTitle(title))
        .catch(() => setDialogTitle("Law Firm Details"));
    }
  }, [isOpen, lawyer]);

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{lawyer["Law Firm"]}</h3>
          <p className="text-sm text-gray-500">{lawyer.city}, {lawyer.state}</p>
        </div>
        <Button
          variant="outline"
          className="text-sm"
          onClick={() => setIsOpen(true)}
        >
          View Details
        </Button>
      </div>

      <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg sm:max-w-[600px] w-full">
            <DialogPrimitive.Title className="text-xl font-semibold mb-4">
              {dialogTitle}
            </DialogPrimitive.Title>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-8">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold mb-4">{lawyer["Law Firm"]}</h4>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <p className="text-sm text-gray-900">{lawyer.city}, {lawyer.state}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">County</p>
                        <p className="text-sm text-gray-900">{lawyer.county}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone</p>
                        <p className="text-sm text-gray-900">{lawyer["Phone Number"]}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-sm text-gray-900">{lawyer.email}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-lg font-semibold mb-4">Practice Areas</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <img src="/group-1.svg" alt="" className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Family Law</p>
                          <p className="text-xs text-gray-500">10+ years</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <img src="/group-1.svg" alt="" className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Criminal Defense</p>
                          <p className="text-xs text-gray-500">8+ years</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <img src="/group-1.svg" alt="" className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Personal Injury</p>
                          <p className="text-xs text-gray-500">12+ years</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                          <img src="/group-1.svg" alt="" className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Estate Planning</p>
                          <p className="text-xs text-gray-500">5+ years</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-lg font-semibold mb-4">Education</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Harvard Law School</p>
                        <p className="text-sm text-gray-500">Juris Doctor (J.D.), Law</p>
                        <p className="text-sm text-gray-500">2005 - 2008</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Yale University</p>
                        <p className="text-sm text-gray-500">Bachelor of Arts (B.A.), Political Science</p>
                        <p className="text-sm text-gray-500">2001 - 2005</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-lg font-semibold mb-4">Languages</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">English</p>
                        <p className="text-sm text-gray-500">Native or Bilingual</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Spanish</p>
                        <p className="text-sm text-gray-500">Professional Working</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="experience">
                <p className="text-gray-500">Experience information coming soon.</p>
              </TabsContent>
              <TabsContent value="reviews">
                <p className="text-gray-500">Reviews coming soon.</p>
              </TabsContent>
            </Tabs>
            <div className="mt-8 flex justify-end gap-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Close
              </Button>
              <Button onClick={() => window.location.href = `mailto:${lawyer.email}`}>
                Contact Lawyer
              </Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </Card>
  );
};