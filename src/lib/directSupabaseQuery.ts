/**
 * DEPRECATED - This file is no longer used. 
 * The functionality has been moved to locationService.ts
 */

import { supabase } from './supabase';
import { Lawyer } from './lawyerService';

/**
 * Directly query lawyers from Supabase by location
 * This function bypasses the complex fallback logic and directly queries
 * Supabase based on the provided location parameters
 */
export const getDirectLawyersForLocation = async (county?: string, state?: string): Promise<Lawyer[]> => {
  console.log('[DIRECT QUERY] Fetching lawyers for:', { county, state });
  
  if (!county && !state) {
    console.warn('[DIRECT QUERY] No location provided, cannot search');
    throw new Error('Location information required');
  }
  
  try {
    // Clean input parameters
    const cleanedCounty = county?.trim() || '';
    const cleanedState = state?.trim() || '';
    
    let data = null;
    let error = null;
    
    // Case 1: Both county and state provided
    if (cleanedCounty && cleanedState) {
      console.log(`[DIRECT QUERY] Searching for lawyers in ${cleanedCounty}, ${cleanedState}`);
      
      const result = await supabase
        .from('lawyers_real')
        .select('*')
        .ilike('county', `%${cleanedCounty}%`)
        .ilike('state', `%${cleanedState}%`)
        .order('id')
        .limit(10);
      
      data = result.data;
      error = result.error;
      
      // If no results with both, try state-only (in case county has formatting differences)
      if (!error && (!data || data.length === 0)) {
        console.log(`[DIRECT QUERY] No results with county+state, trying state-only: ${cleanedState}`);
        
        const stateResult = await supabase
          .from('lawyers_real')
          .select('*')
          .ilike('state', `%${cleanedState}%`)
          .order('id')
          .limit(10);
        
        data = stateResult.data;
        error = stateResult.error;
      }
    }
    // Case 2: Only state provided
    else if (cleanedState) {
      console.log(`[DIRECT QUERY] Searching for lawyers in state: ${cleanedState}`);
      
      const result = await supabase
        .from('lawyers_real')
        .select('*')
        .ilike('state', `%${cleanedState}%`)
        .order('id')
        .limit(10);
      
      data = result.data;
      error = result.error;
    }
    // Case 3: Only county provided
    else if (cleanedCounty) {
      console.log(`[DIRECT QUERY] Searching for lawyers in county: ${cleanedCounty}`);
      
      const result = await supabase
        .from('lawyers_real')
        .select('*')
        .ilike('county', `%${cleanedCounty}%`)
        .order('id')
        .limit(10);
      
      data = result.data;
      error = result.error;
    }
    
    if (error) {
      console.error('[DIRECT QUERY] Error fetching lawyers:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.warn('[DIRECT QUERY] No lawyers found for the specified location');
      throw new Error(`No lawyers found for ${county || ''}, ${state || ''}`);
    }
    
    console.log(`[DIRECT QUERY] Found ${data.length} lawyers for location`);
    
    // Format the lawyer data
    return data.map(formatLawyerData);
  } catch (error: any) {
    console.error('[DIRECT QUERY] Error:', error.message || error);
    throw error;
  }
};

/**
 * Format raw database lawyer data
 */
const formatLawyerData = (rawData: any): Lawyer => {
  const lawFirm = rawData["Law Firm"] || "";
  
  // Extract a reasonable name from law firm
  let name = "Attorney Representative";
  if (lawFirm.includes("Law Offices of")) {
    name = lawFirm.replace("Law Offices of", "").trim();
  } else if (lawFirm.includes("&")) {
    name = lawFirm.split("&")[0].trim();
    if (name.includes(",")) {
      name = name.split(",")[0].trim();
    }
  } else if (lawFirm.includes("Law Firm")) {
    name = lawFirm.replace("Law Firm", "").trim();
  } else if (lawFirm) {
    name = lawFirm.split(" ")[0];
  }
  
  // Create a descriptive specialty based on location
  const specialty = rawData.county && rawData.state ?
    `${rawData.county}, ${rawData.state} Legal Specialist` :
    (rawData.state ? `${rawData.state} Legal Specialist` : 'Legal Professional');
  
  // Create practice areas
  const practiceAreas = ["Legal Consultation", "Case Evaluation"];
  if (rawData.state) {
    practiceAreas.push(`${rawData.state} Legal Services`);
  }
  if (rawData.county) {
    practiceAreas.push(`${rawData.county} Local Expert`);
  }
  
  return {
    id: rawData.id,
    state: rawData.state,
    city: rawData.city,
    county: rawData.county,
    lawFirm: rawData["Law Firm"] || "",
    phoneNumber: rawData["Phone Number"] || "",
    email: rawData.email,
    website: rawData.website,
    createdAt: rawData.created_at,
    // Computed fields
    name,
    specialty,
    rating: 4.7, // Consistent rating
    profileImageUrl: "/placeholder-attorney.jpg", 
    availability: "Available Now",
    isFirmVerified: true,
    description: `At ${lawFirm || "our firm"}, we pride ourselves on serving our clients with the utmost care and attention to detail. We understand that legal matters can have significant impacts on your life, and we're committed to providing the guidance and representation you need.`,
    practiceAreas
  };
}; 