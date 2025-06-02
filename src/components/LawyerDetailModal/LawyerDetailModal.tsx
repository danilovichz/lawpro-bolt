import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import AttorneyCard from '../AttorneyCard/AttorneyCard';
import { Lawyer } from '../../lib/lawyerService';

interface LawyerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  county?: string;
  state?: string;
  caseType?: string;
  lawyer?: Lawyer;
}

const LawyerDetailModal: React.FC<LawyerDetailModalProps> = ({
  isOpen,
  onClose,
  county,
  state,
  caseType,
  lawyer
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 md:p-6">
      <div 
        className="relative bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - positioned outside the header to avoid overlap */}
        <div className="absolute top-0 right-0 z-10 p-1 m-2">
          <button 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Attorney Card with increased padding for better touchability on mobile */}
        <div className="pt-2">
          {lawyer ? (
            <AttorneyCard
              caseType={caseType}
              county={lawyer.county}
              state={lawyer.state}
              attorneyName={lawyer.name}
              attorneySpecialty={lawyer.specialty}
              firmName={lawyer.lawFirm}
              profileImageUrl={lawyer.profileImageUrl}
              rating={lawyer.rating}
              availability={lawyer.availability}
              isFirmVerified={lawyer.isFirmVerified}
              description={lawyer.description}
              practiceAreas={lawyer.practiceAreas}
            />
          ) : (
            <AttorneyCard 
              county={county} 
              state={state} 
              caseType={caseType} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LawyerDetailModal; 