import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card } from "./card";
import { CalendarIcon, PhoneIcon, StarIcon } from "lucide-react";

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
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <div className="p-4 space-y-4">
            <div className="bg-purple-50 text-purple-700 text-sm py-1 px-3 rounded-full w-fit">
              Available Now
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="5" />
                  <path d="M20 21a8 8 0 1 0-16 0" />
                </svg>
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg">Top Rated Criminal Lawyer in {lawyer.county}</h3>
                <p className="text-gray-600 font-medium">{lawyer["Law Firm"]}</p>
                
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 4.5].map((rating, i) => (
                      <StarIcon
                        key={i}
                        className={`w-4 h-4 ${
                          rating <= 4 ? "text-yellow-400 fill-current" : "text-yellow-400 fill-current opacity-50"
                        }`}
                      />
                    ))}
                  </div>
                  <Badge variant="outline" className="ml-2">
                    See More
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl w-full md:h-[85vh] bg-white rounded-t-2xl md:rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col">
          <div className="p-4 md:p-6 flex-1 overflow-y-auto">
            <Dialog.Close className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </Dialog.Close>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="bg-purple-50 text-purple-700 text-sm py-1 px-3 rounded-full w-fit">
                  Available Now
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="8" r="5" />
                      <path d="M20 21a8 8 0 1 0-16 0" />
                    </svg>
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-semibold">Top Rated Criminal Lawyer in {lawyer.county}</h2>
                    <p className="text-gray-600 text-lg">{lawyer["Law Firm"]}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1 gap-2">
                  <CalendarIcon className="w-5 h-5" />
                  Schedule
                </Button>
                <Button className="flex-1 gap-2" variant="outline">
                  <PhoneIcon className="w-5 h-5" />
                  Call Now
                </Button>
              </div>

              <Tabs.Root defaultValue="overview" className="w-full">
                <Tabs.List className="flex gap-1 border-b">
                  <Tabs.Trigger value="overview" className="px-4 py-2 text-gray-600 data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black">
                    Overview
                  </Tabs.Trigger>
                  <Tabs.Trigger value="case-results" className="px-4 py-2 text-gray-600 data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black">
                    Case Results
                  </Tabs.Trigger>
                  <Tabs.Trigger value="reviews" className="px-4 py-2 text-gray-600 data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black">
                    Reviews
                  </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content value="overview" className="py-4">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex">
                        {[1, 2, 3, 4, 4.5].map((rating, i) => (
                          <StarIcon
                            key={i}
                            className={`w-5 h-5 ${
                              rating <= 4 ? "text-yellow-400 fill-current" : "text-yellow-400 fill-current opacity-50"
                            }`}
                          />
                        ))}
                      </div>
                      <Badge variant="outline">LawPro Verified</Badge>
                      <Badge variant="secondary">Free Consultant</Badge>
                    </div>

                    <p className="text-gray-600">
                      At the {lawyer["Law Firm"]}, we pride ourselves on serving our clients with
                      the utmost care and attention to detail. Whether you're facing felony
                      charges or misdemeanor charges, we understand that a criminal
                      conviction can have devastating long-term effects on your life.
                    </p>

                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M10 8l6 4-6 4V8z" />
                      </svg>
                    </div>

                    <p className="text-sm text-gray-500">
                      Meet Attorney {lawyer["Law Firm"].split(" ")[0]} and learn about their approach to criminal
                      defense cases.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-purple-600">
                        <div>• Criminal Defense</div>
                        <div>• Domestic Violence</div>
                        <div>• Probation Violations</div>
                      </div>
                      <div className="text-purple-600">
                        <div>• DUI Defense</div>
                        <div>• Drug Charges</div>
                        <div>• Expungements</div>
                      </div>
                    </div>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="case-results" className="py-4">
                  <div className="space-y-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg">DUI Defense</h3>
                        <Badge>Charges Reduced</Badge>
                      </div>
                      <p className="mt-2 text-gray-600">
                        Client facing felony DUI charges had case reduced to misdemeanor with minimal penalties.
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg">Drug Possession</h3>
                        <Badge>Charges Dismissed</Badge>
                      </div>
                      <p className="mt-2 text-gray-600">
                        Successfully argued illegal search and seizure, resulting in complete dismissal of all charges.
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg">Domestic Violence</h3>
                        <Badge>Not Guilty Verdict</Badge>
                      </div>
                      <p className="mt-2 text-gray-600">
                        Jury trial resulting in full acquittal after presenting evidence of false accusations.
                      </p>
                    </div>
                  </div>
                </Tabs.Content>

                <Tabs.Content value="reviews" className="py-4">
                  <div className="text-center text-gray-500 py-8">
                    Reviews coming soon
                  </div>
                </Tabs.Content>
              </Tabs.Root>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}