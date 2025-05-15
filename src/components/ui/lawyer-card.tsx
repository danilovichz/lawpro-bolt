import React from 'react';
import { LawyerPreview } from './lawyer-preview';

interface LawyerCardProps {
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

export const LawyerCard: React.FC<LawyerCardProps> = ({ lawyer }) => {
  return <LawyerPreview lawyer={lawyer} />;
};