import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { BadgeCheck, MessageSquare, ChevronRight } from 'lucide-react';

interface LawyerPreviewCardProps {
  name: string;
  specialty: string;
  profileImageUrl: string;
  rating: number;
  onClick: () => void;
  onConnectClick: (e: React.MouseEvent) => void;
}

const LawyerPreviewCard: React.FC<LawyerPreviewCardProps> = ({
  name = "Attorney Representative",
  specialty = "Criminal Defense Attorney",
  profileImageUrl = "/placeholder-attorney.jpg",
  rating = 4.8,
  onClick,
  onConnectClick
}) => {
  return (
    <div 
      className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer w-full max-w-md"
      onClick={onClick}
    >
      <div className="p-4 flex items-center">
        {/* Avatar */}
        <div className="relative mr-3">
          <Avatar className="h-12 w-12 border-2 border-indigo-100">
            <AvatarImage src={profileImageUrl} alt={name} />
            <AvatarFallback className="bg-indigo-100 text-indigo-800">
              {name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -top-1 -right-1 bg-green-100 w-3 h-3 rounded-full border border-white">
            <span className="block w-full h-full rounded-full bg-green-500"></span>
          </div>
        </div>
        
        {/* Details */}
        <div className="flex-grow">
          <div className="flex items-center">
            <h3 className="font-medium text-gray-900">{name}</h3>
            <BadgeCheck className="w-4 h-4 ml-1 text-indigo-600" />
          </div>
          <p className="text-sm text-gray-600">{specialty}</p>
          <div className="flex items-center mt-1">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-600 ml-1">{rating.toFixed(1)}</span>
            <span className="text-xs text-gray-500 ml-auto flex items-center">
              Read more
              <ChevronRight className="w-4 h-4 ml-1" />
            </span>
          </div>
        </div>
      </div>
      
      {/* Connect Button */}
      <div className="border-t border-gray-100 px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <Button 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          onClick={onConnectClick}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Connect Now
        </Button>
      </div>
    </div>
  );
};

export default LawyerPreviewCard; 