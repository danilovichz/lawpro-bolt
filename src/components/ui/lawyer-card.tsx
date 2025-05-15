import { Badge } from "./badge";
import { Button } from "./button";
import { Card } from "./card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Star, CheckCircle, PlayCircle } from "lucide-react";

interface LawyerCardProps {
  lawyer: {
    id: string;
    "Law Firm": string;
    "Phone Number"?: string;
    email?: string;
    website?: string;
  };
}

export function LawyerCard({ lawyer }: LawyerCardProps) {
  return (
    <Card className="w-full overflow-hidden">
      <div className="p-1">
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 20C24.1421 20 27.5 16.6421 27.5 12.5C27.5 8.35786 24.1421 5 20 5C15.8579 5 12.5 8.35786 12.5 12.5C12.5 16.6421 15.8579 20 20 20Z" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5 35C5 28.3726 11.7157 23 20 23C28.2843 23 35 28.3726 35 35" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <Badge className="bg-green-50 text-green-700 mb-2">Available Now</Badge>
                  <h3 className="text-lg font-semibold text-gray-900">Top Rated Criminal Lawyer in Hamilton County</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    {lawyer["Law Firm"]}
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="outline" className="flex-1 bg-white">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mr-2">
                <path d="M15.8333 3.33337H4.16667C3.24619 3.33337 2.5 4.07957 2.5 5.00004V15C2.5 15.9205 3.24619 16.6667 4.16667 16.6667H15.8333C16.7538 16.6667 17.5 15.9205 17.5 15V5.00004C17.5 4.07957 16.7538 3.33337 15.8333 3.33337Z" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.3333 2.5V4.16667" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.66669 2.5V4.16667" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.5 7.5H17.5" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Schedule
            </Button>
            <Button className="flex-1">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mr-2">
                <path d="M18.3333 14.1V16.6C18.3343 16.8321 18.2867 17.0618 18.1937 17.2744C18.1008 17.487 17.9644 17.678 17.7934 17.8349C17.6224 17.9918 17.4205 18.1112 17.2006 18.1856C16.9808 18.26 16.7478 18.2876 16.5167 18.2667C13.9523 17.988 11.4892 17.1118 9.32498 15.7083C7.31151 14.4289 5.60443 12.7218 4.32498 10.7083C2.91663 8.53426 2.04019 6.05908 1.76665 3.48334C1.74583 3.25288 1.77321 3.02055 1.84707 2.80127C1.92092 2.58199 2.03963 2.38049 2.19562 2.2097C2.35162 2.03892 2.54149 1.90235 2.75314 1.80905C2.9648 1.71576 3.1936 1.66758 3.42498 1.66667H5.92498C6.32941 1.66267 6.72148 1.80588 7.02812 2.06959C7.33476 2.3333 7.53505 2.69952 7.59165 3.10001C7.69717 3.90007 7.89286 4.68562 8.17498 5.44167C8.2871 5.73991 8.31137 6.06409 8.24491 6.37573C8.17844 6.68737 8.02404 6.97345 7.79998 7.20001L6.74165 8.25834C7.92798 10.3446 9.65536 12.072 11.7417 13.2583L12.8 12.2C13.0266 11.976 13.3127 11.8216 13.6243 11.7551C13.9359 11.6886 14.2601 11.7129 14.5583 11.825C15.3144 12.1071 16.0999 12.3028 16.9 12.4083C17.3048 12.4654 17.6745 12.6693 17.9388 12.9812C18.203 13.2931 18.3435 13.6912 18.3333 14.1Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Connect Me Now
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="mt-4">
          <TabsList className="w-full justify-start border-b mb-4">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="case-results" className="text-sm">Case Results</TabsTrigger>
            <TabsTrigger value="reviews" className="text-sm">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4].map((i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                  <Star className="w-5 h-5 text-yellow-400 fill-current opacity-50" />
                </div>
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="w-3 h-3" />
                  LawPro Verified
                </Badge>
                <Badge variant="secondary" className="gap-1">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M10.5 3L4.5 9L1.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Free Consultant
                </Badge>
              </div>

              <p className="text-gray-600 text-sm">
                At the Wieczorek Law Firm, we pride ourselves on serving our clients with the utmost care and attention to detail. Whether you're facing felony charges or misdemeanor charges, we understand that a criminal conviction can have devastating long-term effects on your life.
              </p>

              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <PlayCircle className="w-12 h-12 text-indigo-600" />
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Meet Attorney Wieczorek and learn about his approach to criminal defense cases.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      Criminal Defense
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      Domestic Violence
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      Probation Violations
                    </li>
                  </ul>
                </div>
                <div>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      DUI Defense
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      Drug Charges
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      Expungements
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="case-results">
            <p className="text-sm text-gray-600">Case results content coming soon...</p>
          </TabsContent>

          <TabsContent value="reviews">
            <p className="text-sm text-gray-600">Reviews content coming soon...</p>
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  );
}