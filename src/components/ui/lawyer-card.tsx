import { Card } from "./card";
import { Button } from "./button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { CalendarIcon, MessageSquareIcon, StarIcon } from "lucide-react";

interface LawyerCardProps {
  lawyer: {
    id: string;
    "Law Firm": string;
    state: string;
    county: string;
    city: string;
    "Phone Number": string;
    email: string;
    website: string;
  };
}

export function LawyerCard({ lawyer }: LawyerCardProps) {
  return (
    <Card className="w-full overflow-hidden bg-white rounded-2xl">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="bg-[#F4F1FF] -mx-4 -mt-4 p-4 mb-4">
          <div className="text-[#6246EA] text-sm font-medium">Recommeded Attorney for DUI Cases in Hamilton Country</div>
        </div>

        {/* Status and Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-600 text-sm">Available Now</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#6246EA"/>
                <path d="M12.0002 14.5C6.99016 14.5 2.91016 17.86 2.91016 22C2.91016 22.28 3.13016 22.5 3.41016 22.5H20.5902C20.8702 22.5 21.0902 22.28 21.0902 22C21.0902 17.86 17.0102 14.5 12.0002 14.5Z" fill="#6246EA"/>
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-semibold">Top Rated Criminal Lawyer in Hamilton County</h2>
              <div className="text-[#6246EA] font-medium">{lawyer["Law Firm"]}</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 py-6">
            <CalendarIcon className="w-5 h-5 mr-2" />
            Schedule
          </Button>
          <Button className="flex-1 py-6 bg-[#6246EA] hover:bg-[#5039e5]">
            <MessageSquareIcon className="w-5 h-5 mr-2" />
            Connect Me Now
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="case-results">Case Results</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="space-y-6">
              {/* Rating and Badges */}
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {[1, 2, 3, 4].map((i) => (
                    <StarIcon key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  <StarIcon className="w-5 h-5 fill-yellow-400 text-yellow-400 fill-[50%]" />
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-[#FFF8E6] text-[#B98900] rounded-full text-xs">⭐ LawPro Verified</span>
                  <span className="px-2 py-1 bg-[#F4F1FF] text-[#6246EA] rounded-full text-xs">💬 Free Consultant</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed">
                At the Wieczorek Law Firm, we pride ourselves on serving our clients with the utmost care and attention to detail. Whether you're facing felony charges or misdemeanor charges, we understand that a criminal conviction can have devastating long-term effects on your life.
              </p>

              {/* Video Preview */}
              <div className="relative aspect-video bg-gray-100 rounded-lg">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-gray-800 border-b-8 border-b-transparent ml-1"></div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500">Meet Attorney Wieczorek and learn about his approach to criminal defense cases.</p>

              {/* Practice Areas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#6246EA] rounded-full"></div>
                  <span className="text-sm">Criminal Defense</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#6246EA] rounded-full"></div>
                  <span className="text-sm">DUI Defense</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#6246EA] rounded-full"></div>
                  <span className="text-sm">Domestic Violence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#6246EA] rounded-full"></div>
                  <span className="text-sm">Drug Charges</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#6246EA] rounded-full"></div>
                  <span className="text-sm">Probation Violations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#6246EA] rounded-full"></div>
                  <span className="text-sm">Expungements</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="case-results" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">DUI Defense</h3>
                  <span className="px-2 py-1 bg-[#FFF8E6] text-[#B98900] rounded-full text-xs">Charges Reduced</span>
                </div>
                <p className="text-sm text-gray-600">Client facing felony DUI charges had case reduced to misdemeanor with minimal penalties.</p>
              </div>

              <div className="p-4 bg-white rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">Drug Possession</h3>
                  <span className="px-2 py-1 bg-[#FFF8E6] text-[#B98900] rounded-full text-xs">Charges Dismissed</span>
                </div>
                <p className="text-sm text-gray-600">Successfully argued illegal search and seizure, resulting in complete dismissal of all charges.</p>
              </div>

              <div className="p-4 bg-white rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">Domestic Violence</h3>
                  <span className="px-2 py-1 bg-[#FFF8E6] text-[#B98900] rounded-full text-xs">Not Guilty Verdict</span>
                </div>
                <p className="text-sm text-gray-600">Jury trial resulting in full acquittal after presenting evidence of false accusations.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4">
            <div className="text-center text-gray-500 py-8">
              Reviews coming soon
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}