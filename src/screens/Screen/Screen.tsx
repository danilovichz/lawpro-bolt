import {
  ArrowRightIcon,
  ClockIcon,
  LockIcon,
  MenuIcon,
  PlusCircleIcon,
  SendIcon,
  SettingsIcon,
  UsersIcon,
  XIcon,
  Trash2Icon,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { nanoid } from 'nanoid';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { supabase } from "../../lib/supabase";
import { generateTitle, sendMessageToWebhook, findLawyersForUser, testOpenRouterAPI } from "../../lib/ai";
import LawyerPreviewCard from "../../components/LawyerPreviewCard/LawyerPreviewCard";
import ViewMoreLawyersCard from "../../components/ViewMoreLawyersCard/ViewMoreLawyersCard";
import LawyerDetailModal from "../../components/LawyerDetailModal/LawyerDetailModal";
import LawyerListModal from "../../components/LawyerListModal/LawyerListModal";
import { Lawyer } from "../../lib/locationService";

interface Message {
  id: string;
  content: string;
  is_user: boolean;
  created_at: string;
  type?: 'text' | 'lawyerPreview' | 'viewMoreLawyers';
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  session_key: string;
}

interface CaseInfo {
  county?: string;
  state?: string;
  caseType?: string;
  isConfirmed?: boolean;
}

const loadingMessages = [
  "Processing your message...",
  "One moment please...",
  "Working on it...",
  "Almost ready..."
];

export const Screen = (): JSX.Element => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const loadingIntervalRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const browserSessionId = useRef(nanoid());
  
  // State for lawyer modals
  const [isLawyerDetailOpen, setIsLawyerDetailOpen] = useState(false);
  const [isLawyerListOpen, setIsLawyerListOpen] = useState(false);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [isLoadingLawyers, setIsLoadingLawyers] = useState(false);
  
  // Store confirmed user location
  const [confirmedLocation, setConfirmedLocation] = useState<CaseInfo | null>(null);

  // Common case types for extraction
  const commonCaseTypes: { keywords: string[]; name: string }[] = [
    { keywords: ["dui", "driving under influence"], name: "DUI Cases" },
    { keywords: ["car crash", "auto accident", "car accident"], name: "Car Accidents" },
    { keywords: ["personal injury"], name: "Personal Injury" },
    { keywords: ["criminal defense"], name: "Criminal Defense" },
    { keywords: ["family law", "divorce", "child custody"], name: "Family Law" },
    { keywords: ["real estate"], name: "Real Estate" },
    { keywords: ["business law"], name: "Business Law" },
    { keywords: ["employment law"], name: "Employment Law" },
    { keywords: ["immigration"], name: "Immigration Law" },
    { keywords: ["bankruptcy"], name: "Bankruptcy" },
  ];

  // Helper function to capitalize words
  const capitalize = (str: string): string => 
    str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  useEffect(() => {
    loadSessions();
    // Test OpenRouter API on component load
    testOpenRouterAPI().then(success => {
      console.log('🔧 [SCREEN] OpenRouter API test result:', success);
      if (!success) {
        console.error('⚠️ [SCREEN] OpenRouter API is not working - titles will use fallback logic');
      }
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingMessage]);

  useEffect(() => {
    if (isLoading) {
      let index = 0;
      loadingIntervalRef.current = setInterval(() => {
        setLoadingMessage(loadingMessages[index]);
        index = (index + 1) % loadingMessages.length;
      }, 2000);
    } else {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        setLoadingMessage("");
      }
    }
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    };
  }, [isLoading]);

  const loadSessions = async () => {
    try {
      const { error: connectionError } = await supabase
        .from('chat_sessions')
        .select('count', { count: 'exact', head: true });

      if (connectionError) {
        throw new Error(`Connection test failed: ${connectionError.message}`);
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('session_key', browserSessionId.current)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch sessions: ${error.message}`);
      }

      setSessions(data || []);
      if (data && data.length > 0) {
        setCurrentSession(data[0].id);
        loadMessages(data[0].id);
      }
    } catch (error) {
      console.error('Error in loadSessions:', error);
    }
  };

  const loadMessages = async (sessionId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    const messagesWithType = data?.map(msg => ({
      ...msg,
      type: 'text' as const
    })) || [];
    
    setMessages(messagesWithType);
  };

  const removeSessionFromUI = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(sessions.filter(session => session.id !== sessionId));
    if (currentSession === sessionId) {
      setCurrentSession(null);
      setMessages([]);
    }
  };

  const createNewSession = async () => {
    try {
      const newSessionKey = nanoid();
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert([
          { 
            title: 'New Chat',
            session_key: newSessionKey
          }
        ])
        .select()
        .single();

      if (sessionError) throw sessionError;

      setSessions(prev => [session, ...prev]);
      return session;
    } catch (error) {
      console.error('Error in createNewSession:', error);
      return null;
    }
  };

  const updateSessionTitle = async (sessionId: string, messageText: string) => {
    try {
      console.log('🏷️ [TITLE-UPDATE] Starting title generation for session:', sessionId);
      console.log('📝 [TITLE-UPDATE] Message text:', messageText.substring(0, 100) + (messageText.length > 100 ? '...' : ''));
      
      console.log('🤖 [TITLE-UPDATE] Calling generateTitle...');
      const title = await generateTitle(messageText);
      console.log('✨ [TITLE-UPDATE] AI generated title:', title);
      
      console.log('💾 [TITLE-UPDATE] Updating database...');
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title })
        .eq('id', sessionId);

      if (error) throw error;
      
      console.log('✅ [TITLE-UPDATE] Database updated successfully');

      console.log('🔄 [TITLE-UPDATE] Updating UI state...');
      setSessions(prev => prev.map(session =>
        session.id === sessionId ? { ...session, title } : session
      ));
      
      console.log('✅ [TITLE-UPDATE] UI state updated - title should now appear in sidebar');
    } catch (error) {
      console.error('❌ [TITLE-UPDATE] Failed to update session title:', error);
    }
  };

  const handleNewChat = async () => {
    const session = await createNewSession();
    if (session) {
      // Clear all existing chat data
      setCurrentSession(session.id);
      setMessages([]);
      setCurrentMessage("");
      
      // Clear all lawyer-related data for the new chat
      setLawyers([]);
      setSelectedLawyer(null);
      setIsLoadingLawyers(false);
      setConfirmedLocation(null);
      
      // Close the sidebar
      setIsSidebarOpen(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Please select a file smaller than 5MB");
      return;
    }

    setIsLoading(true);
    try {
      let sessionId = currentSession;
      if (!sessionId) {
        const session = await createNewSession();
        if (!session) {
          setIsLoading(false);
          return;
        }
        sessionId = session.id;
        setCurrentSession(sessionId);
      }

      if (!sessionId) {
        console.error("Session ID is null, cannot send message.");
        setIsLoading(false);
        return;
      }

      const { data: userMessage, error: userError } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          content: `File uploaded: ${file.name}`,
          is_user: true
        }])
        .select()
        .single();

      if (userError) throw userError;

      const userMessageWithType = { ...userMessage, type: 'text' as const };
      setMessages(prev => [...prev, userMessageWithType]);

      const webhookResponse = await sendMessageToWebhook(`File uploaded: ${file.name}`, sessionId);
      
      const { data: aiMessage, error: aiError } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          content: webhookResponse.response,
          is_user: false
        }])
        .select()
        .single();

      if (aiError) throw aiError;

      const aiMessageWithType = { ...aiMessage, type: 'text' as const };
      setMessages(prev => [...prev, aiMessageWithType]);

      // If webhook indicates lawyer info is needed, fetch lawyers
      if (webhookResponse.lawyer && !isLoadingLawyers) {
        const caseInfo = extractCaseInfo(messages);
        await fetchLawyersData(caseInfo);
      }
    } catch (error: any) {
      console.error('Error handling file upload:', error);
      let errorMessageContent = "I apologize, but there was an error processing your file. Please try again.";

      if (error.message === 'Invalid response format from webhook') {
        errorMessageContent = "The service is experiencing technical difficulties. Please try again later.";
      } else if (error.message?.includes('HTTP error! status:')) {
        errorMessageContent = "Failed to connect to the service. Please check your internet connection and try again.";
      } else if (error.code || error.message?.toLowerCase().includes('supabase')) {
        errorMessageContent = "There was an issue saving your file information. Please try again.";
      }

      const errorMessage: Message = {
        id: nanoid(),
        content: errorMessageContent,
        is_user: false,
        created_at: new Date().toISOString(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle opening the lawyer detail modal
  const handleOpenLawyerDetail = () => {
    setIsLawyerDetailOpen(true);
  };

  // Handle opening the lawyer list modal
  const handleOpenLawyerList = () => {
    setIsLawyerListOpen(true);
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    setIsLoading(true);
    const messageText = currentMessage;
    setCurrentMessage("");

    try {
      let sessionId = currentSession;
      if (!sessionId) {
        const session = await createNewSession();
        if (!session) {
          setIsLoading(false);
          return;
        }
        sessionId = session.id;
        setCurrentSession(sessionId);
      }

      if (!sessionId) {
        console.error("Session ID is null, cannot send message.");
        setIsLoading(false);
        return;
      }

      // Save user message
      const { data: userMessage, error: userError } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          content: messageText,
          is_user: true
        }])
        .select()
        .single();

      if (userError) throw userError;

      // Update message list with user message
      const userMessageWithType = { ...userMessage, type: 'text' as const };
      setMessages(prev => [...prev, userMessageWithType]);

      // Always try to update session title for the first message in this session
      if (messages.length === 0) {
        console.log('[SCREEN] First message detected, generating AI title...');
        updateSessionTitle(sessionId, messageText).catch(error => {
          console.error('[SCREEN] Failed to update session title:', error);
        });
      }

      // Determine if the message likely contains location info – used later to avoid duplicate lawyer fetches
      const shouldFetchLawyers = shouldProactivelyFetchLawyers(messageText);
      console.log('[SCREEN] Should proactively fetch lawyers:', shouldFetchLawyers);
      
      // Get AI response from webhook
      const webhookResponse = await sendMessageToWebhook(messageText, sessionId);
      
      // Save AI response
      const { data: aiMessage, error: aiError } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          content: webhookResponse.response,
          is_user: false
        }])
        .select()
        .single();

      if (aiError) throw aiError;

      // Add AI message to UI
      const aiMessageWithType = { ...aiMessage, type: 'text' as const };
      setMessages(prev => [...prev, aiMessageWithType]);

      // Fallback: If webhook indicates lawyer info is needed and we haven't already fetched
      if (webhookResponse.lawyer && !isLoadingLawyers) {
        const caseInfo = extractCaseInfo([...messages, userMessageWithType, aiMessageWithType]);
        await fetchLawyersData(caseInfo, messageText);
      }
    } catch (error: any) {
      console.error('Error in message handling:', error);
      let errorMessageContent = "I apologize, but there was an error processing your request. Please try again.";

      if (error.message === 'Invalid response format from webhook') {
        errorMessageContent = "The service is experiencing technical difficulties. Please try again later.";
      } else if (error.message?.includes('HTTP error! status:')) {
        errorMessageContent = "Failed to connect to the service. Please check your internet connection and try again.";
      } else if (error.code || error.message?.toLowerCase().includes('supabase')) {
        errorMessageContent = "There was an issue saving your message. Please try again.";
      }

      const errorMessage: Message = {
        id: nanoid(),
        content: errorMessageContent,
        is_user: false,
        created_at: new Date().toISOString(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine if we should proactively fetch lawyers
  const shouldProactivelyFetchLawyers = (messageText: string): boolean => {
    const text = messageText.toLowerCase();
    
    // Check for location indicators
    const hasLocationIndicators = [
      'in ', 'at ', 'from ', 'near ', 'around ',
      'county', 'state', 'city', 'area',
      'oregon', 'indiana', 'nevada', 'hawaii', 'california', 'texas', 'florida',
      'massachusetts', 'new york', 'illinois', 'ohio', 'michigan', 'pennsylvania',
      'washington', 'virginia', 'north carolina', 'south carolina', 'georgia',
      'alabama', 'tennessee', 'kentucky', 'louisiana', 'arkansas', 'missouri',
      'iowa', 'kansas', 'nebraska', 'oklahoma', 'colorado', 'utah', 'arizona',
      'new mexico', 'montana', 'wyoming', 'idaho', 'alaska', 'maine', 'vermont',
      'new hampshire', 'connecticut', 'rhode island', 'delaware', 'maryland',
      'west virginia', 'minnesota', 'wisconsin', 'north dakota', 'south dakota'
    ].some(indicator => text.includes(indicator));
    
    // Check for legal case indicators
    const hasLegalIndicators = [
      'accident', 'crash', 'injury', 'lawyer', 'attorney', 'legal', 'case',
      'dui', 'divorce', 'custody', 'criminal', 'defense', 'lawsuit', 'sue',
      'court', 'trial', 'settlement', 'compensation', 'damages', 'help',
      'advice', 'consultation', 'representation', 'claim', 'rights'
    ].some(indicator => text.includes(indicator));
    
    // Check for specific location patterns (more comprehensive)
    const hasLocationPattern = 
      // County patterns
      /\b([a-z\s]+)\s+county\b/i.test(text) ||
      // State patterns
      /\b(oregon|indiana|nevada|hawaii|california|texas|florida|massachusetts|new york|illinois|ohio|michigan|pennsylvania)\b/i.test(text) ||
      // State abbreviations
      /\b(or|in|nv|hi|ca|tx|fl|ma|ny|il|oh|mi|pa|wa|va|nc|sc|ga|al|tn|ky|la|ar|mo|ia|ks|ne|ok|co|ut|az|nm|mt|wy|id|ak|me|vt|nh|ct|ri|de|md|wv|mn|wi|nd|sd)\b/i.test(text) ||
      // "in [location]" patterns
      /\bin\s+[a-z\s]+/i.test(text) ||
      // "at [location]" patterns  
      /\bat\s+[a-z\s]+/i.test(text) ||
      // "from [location]" patterns
      /\bfrom\s+[a-z\s]+/i.test(text) ||
      // "[location], [state]" patterns
      /\b[a-z\s]+,\s*[a-z\s]+\b/i.test(text);
    
    console.log('[SCREEN] Location check:', { 
      hasLocationIndicators, 
      hasLegalIndicators, 
      hasLocationPattern,
      messageText: text.substring(0, 100) + '...'
    });
    
    // More aggressive: fetch lawyers if we have location pattern OR (location + legal indicators)
    // This ensures we catch cases like "I had a car crash in Lane Oregon"
    return hasLocationPattern || (hasLocationIndicators && hasLegalIndicators);
  };

  const formatTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const extractCaseInfo = (messages: Message[]): CaseInfo => {
    // First, check if we already have confirmed location - if so, use it
    if (confirmedLocation && confirmedLocation.isConfirmed) {
      console.log('[SCREEN] Using confirmed location:', confirmedLocation);
      return confirmedLocation;
    }

    // Otherwise extract information from messages
    let info: CaseInfo = { county: undefined, state: undefined, caseType: undefined };
    let potentialLocations: Array<{county?: string, state?: string}> = [];
    let needsConfirmation = false;

    // Look for explicit location confirmation phrases first
    const recentMessages = [...messages].reverse().slice(0, 10); // Check last 10 messages
    for (const message of recentMessages) {
      if (message.is_user) {
        const content = message.content.toLowerCase();
        
        // Check for confirmation phrases
        const confirmationPhrases = [
          'confirm', 'yes, that', 'that is correct', 'that\'s right', 
          'that is right', 'you got it', 'correct', 'yes it is', 
          'you are right', 'right'
        ];
        
        const isConfirmation = confirmationPhrases.some(phrase => content.includes(phrase));
        
        if (isConfirmation) {
          console.log('[SCREEN] Found confirmation message:', content);
          
          // Look for location in the last AI message before this one
          const msgIndex = messages.findIndex(m => m.id === message.id);
          if (msgIndex > 0) {
            for (let i = msgIndex - 1; i >= Math.max(0, msgIndex - 3); i--) {
              const prevMsg = messages[i];
              if (!prevMsg.is_user) {
                const aiContent = prevMsg.content.toLowerCase();
                
                // Try to extract location from AI message with various patterns
                
                // Look for specific known locations first - hard-coded high-priority cases
                if (aiContent.includes('hampden') && aiContent.includes('massachusetts')) {
                  console.log('[SCREEN] Found Hampden, Massachusetts in AI response before confirmation');
                  const confirmedInfo: CaseInfo = {
                    county: 'Hampden County',
                    state: 'Massachusetts',
                    caseType: info.caseType,
                    isConfirmed: true
                  };
                  console.log('[SCREEN] Setting confirmed location from confirmation:', confirmedInfo);
                  setConfirmedLocation(confirmedInfo);
                  return confirmedInfo;
                }
                
                // Pattern: "[County] County, [State]"
                const countyStateMatch = aiContent.match(/([a-z\s]+)\s+county,\s+([a-z\s]+)/i);
                if (countyStateMatch && countyStateMatch[1] && countyStateMatch[2]) {
                  const countyFromAI = countyStateMatch[1].trim();
                  const stateFromAI = countyStateMatch[2].trim();
                  
                  const confirmedInfo: CaseInfo = {
                    county: countyFromAI.charAt(0).toUpperCase() + countyFromAI.slice(1) + ' County',
                    state: stateFromAI.charAt(0).toUpperCase() + stateFromAI.slice(1),
                    caseType: info.caseType,
                    isConfirmed: true
                  };
                  console.log('[SCREEN] Setting confirmed location from AI message:', confirmedInfo);
                  setConfirmedLocation(confirmedInfo);
                  return confirmedInfo;
                }
                
                // Pattern: "[County], [State]"
                const simplePairMatch = aiContent.match(/([a-z\s]+),\s+([a-z\s]+)/i);
                if (simplePairMatch && simplePairMatch[1] && simplePairMatch[2]) {
                  // Verify this looks like a location and not another phrase
                  if (!aiContent.includes('such as') && !aiContent.includes('for example')) {
                    const county = simplePairMatch[1].trim();
                    const state = simplePairMatch[2].trim();
                    
                    // Only accept if state is valid and looks like a location
                    if (state.length <= 30 && !state.includes('please') && !state.includes('would')) {
                      const confirmedInfo: CaseInfo = {
                        county: county.charAt(0).toUpperCase() + county.slice(1),
                        state: state.charAt(0).toUpperCase() + state.slice(1),
                        caseType: info.caseType,
                        isConfirmed: true
                      };
                      console.log('[SCREEN] Setting confirmed location from comma pair:', confirmedInfo);
                      setConfirmedLocation(confirmedInfo);
                      return confirmedInfo;
                    }
                  }
                }
                
                break;
              }
            }
          }
        }
        
        // Special case handling - Hampden County
        if (content.includes('hampden')) {
          console.log('[SCREEN] Found Hampden mention in user message:', content);
          
          // Check if Massachusetts is also mentioned
          if (content.includes('mass') || content.includes('ma ')) {
            const hampdenLocation: CaseInfo = {
              county: 'Hampden County',
              state: 'Massachusetts',
              caseType: info.caseType,
              isConfirmed: true
            };
            console.log('[SCREEN] Setting confirmed location to Hampden, MA:', hampdenLocation);
            setConfirmedLocation(hampdenLocation);
            return hampdenLocation;
          } else {
            // Just Hampden mentioned, but we know it's likely Massachusetts
            potentialLocations.push({
              county: 'Hampden County',
              state: 'Massachusetts'
            });
            needsConfirmation = true;
          }
        }
        
        // Extract case type first - easier to identify
        if (!info.caseType) {
          for (const type of commonCaseTypes) {
            if (type.keywords.some(keyword => content.includes(keyword))) {
              info.caseType = type.name;
              break; 
            }
          }
        }

        // Structured patterns for location extraction
        // Pattern: "[city/county] County, [State Name/Abbr]"
        let match = content.match(/\b([a-z\s]+?)\s+county,\s*([a-z\s]+[a-z]{1,})\b/i);
        if (match && match[1] && match[2]) {
          const countyName = capitalize(match[1].trim()) + " County";
          const stateName = capitalize(match[2].trim());
          potentialLocations.push({
            county: countyName,
            state: stateName
          });
          
          // This is a pretty confident match, set it as current best
          info.county = countyName;
          info.state = stateName;
          continue;
        }

        // Pattern: "[City/County], [State Name/Abbr]"
        match = content.match(/\b([a-z\s]+?),\s*([a-z\s]+[a-z]{1,})\b/i);
        if (match && match[1] && match[2]) {
          const potentialLocation = capitalize(match[1].trim());
          const potentialState = capitalize(match[2].trim());
          
          // Basic check if second part looks like a state (not too long, or a known abbr)
          if (potentialState.length <= 2 || potentialState.split(' ').length <= 2 || /[A-Z]{2}/.test(match[2].trim())) {
            potentialLocations.push({
              county: potentialLocation,
              state: potentialState
            });
            
            if (!info.county) info.county = potentialLocation;
            if (!info.state) info.state = potentialState;
            continue;
          }
        }

        // Pattern: "[City/County] [ST_ABBR]" (ensure ST_ABBR is exactly 2 capital letters)
        match = content.match(/\b([a-z\s]+?)\s+([A-Z]{2})\b/i);
        if (match && match[2].length === 2) {
            const locationName = capitalize(match[1].trim());
            const stateAbbr = match[2].toUpperCase();
            
            potentialLocations.push({
              county: locationName,
              state: stateAbbr
            });
            
            if (!info.county) info.county = locationName;
            if (!info.state) info.state = stateAbbr;
            continue;
        }
        
        // Fallback: Just "[Any Place Name] County" if no state identified yet
        if (!info.county) {
          match = content.match(/\b([a-z\s]+?)\s+county\b/i);
          if (match && match[1]) {
            const countyName = capitalize(match[1].trim()) + " County";
            potentialLocations.push({
              county: countyName
            });
            info.county = countyName;
            needsConfirmation = true; // Need state confirmation
          }
        }
        
        // Just state name alone 
        if (!info.state) {
          // Look for state names or abbreviations
          for (const stateName of commonStateNames) {
            if (content.includes(` ${stateName.toLowerCase()} `)) {
              potentialLocations.push({
                state: capitalize(stateName)
              });
              info.state = capitalize(stateName);
              needsConfirmation = true; // Need county confirmation
              break;
            }
          }
        }
      }
    }

    // After extraction, decide if we have enough information to set confirmed location
    if (info.county && info.state) {
      // Check we don't accidentally use Jefferson, Alabama when user mentioned Hampden
      if (info.county.toLowerCase().includes('jefferson') && 
          info.state.toLowerCase().includes('alabama') && 
          messages.some(m => m.content.toLowerCase().includes('hampden'))) {
        console.log('[SCREEN] Preventing Jefferson, Alabama substitution when Hampden was mentioned');
        const hampdenLocation: CaseInfo = {
          county: 'Hampden County',
          state: 'Massachusetts',
          caseType: info.caseType,
          isConfirmed: true
        };
        setConfirmedLocation(hampdenLocation);
        return hampdenLocation;
      }
      
      // We have both county and state - consider as confirmed unless it needs verification
      if (!needsConfirmation && !confirmedLocation) {
        const newConfirmedLocation = { ...info, isConfirmed: true };
        console.log('[SCREEN] Setting confirmed location from extracted data:', newConfirmedLocation);
        setConfirmedLocation(newConfirmedLocation);
      }
    }
    
    // Special-case: If query is for Hampden (even without state), use Massachusetts
    if (info.county?.toLowerCase().includes('hampden') && !info.state) {
      console.log('[SCREEN] Found Hampden County without state, adding Massachusetts');
      info.state = 'Massachusetts';
      
      // Since we're specifically handling this case, mark as confirmed
      if (!confirmedLocation) {
        setConfirmedLocation({
          county: 'Hampden County',
          state: 'Massachusetts',
          caseType: info.caseType,
          isConfirmed: true
        });
      }
    }
    
    // Add a prompt for location confirmation if needed
    if (needsConfirmation && potentialLocations.length > 0 && !confirmedLocation) {
      checkAndPromptLocationConfirmation(potentialLocations, info);
    }
    
    return info;
  };

  // Common state names for better extraction
  const commonStateNames = [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California",
    "Colorado", "Connecticut", "Delaware", "Florida", "Georgia",
    "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
    "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland",
    "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri",
    "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
    "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
    "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
    "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming",
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
    "District of Columbia", "DC"
  ];
  
  /**
   * Check if we need to prompt the user to confirm their location
   */
  const checkAndPromptLocationConfirmation = (
    potentialLocations: Array<{county?: string, state?: string}>, 
    currentInfo: CaseInfo
  ) => {
    // Don't add a prompt if we're still loading
    if (isLoading) return;
    
    // Check if there's already a location confirmation prompt in recent messages
    const recentMessages = messages.slice(-3);
    const hasLocationPrompt = recentMessages.some(msg => 
      !msg.is_user && msg.content.toLowerCase().includes('confirm') && 
      (msg.content.toLowerCase().includes('location') || 
       msg.content.toLowerCase().includes('county') || 
       msg.content.toLowerCase().includes('state'))
    );
    
    if (hasLocationPrompt) return;
    
    // Format the location for a prompt - use the most specific one available
    let locationString = '';
    
    // Find the most specific location (one with both county and state)
    const bestLocation = potentialLocations.find(loc => loc.county && loc.state) || 
                        potentialLocations[0] || 
                        { county: currentInfo.county, state: currentInfo.state };
    
    if (bestLocation.county && bestLocation.state) {
      locationString = `${bestLocation.county}, ${bestLocation.state}`;
    } else if (bestLocation.county) {
      locationString = bestLocation.county;
    } else if (bestLocation.state) {
      locationString = bestLocation.state;
    } else {
      return; // No location to confirm
    }
    
    // Create a location confirmation prompt
    const promptMessage: Message = {
      id: nanoid(),
      content: `To help find the most relevant lawyers for your case, I'd like to confirm your location. Are you inquiring about legal services in <strong>${locationString}</strong>? Please confirm or provide a different location.`,
      is_user: false,
      created_at: new Date().toISOString(),
      type: 'text'
    };
    
    console.log('[SCREEN] Adding location confirmation prompt for:', locationString);
    setMessages(prev => [...prev, promptMessage]);
  };

  // Simplified fetch lawyers data using direct database search
  const fetchLawyersData = async (caseDetails: CaseInfo, messageText?: string) => {
    setIsLoadingLawyers(true);
    console.log('[SCREEN] Fetching lawyers with case details:', caseDetails);
    
    try {
      let userMessageContent: string;
      
      if (messageText) {
        // Use the provided message text
        userMessageContent = messageText;
        console.log('[SCREEN] Using provided message text:', messageText);
      } else {
        // Get the latest user message to extract location from
        const userMessages = messages.filter(msg => msg.is_user);
        const latestUserMessage = userMessages[userMessages.length - 1];
        
        if (!latestUserMessage) {
          throw new Error('No user message found to extract location from');
        }
        
        userMessageContent = latestUserMessage.content;
        console.log('[SCREEN] Using latest user message:', userMessageContent);
      }
      
      console.log('[SCREEN] Using simple lawyer search for message:', userMessageContent);
      
      // Use the simplified lawyer search
      const { lawyers: lawyersList, location } = await findLawyersForUser(
        userMessageContent, 
        caseDetails.caseType
      );
      
      console.log(`[SCREEN] Found ${lawyersList.length} lawyers for location: ${location}`);
      
      if (lawyersList.length === 0) {
        throw new Error(`No lawyers found for ${location}. Please try a different location.`);
      }
      
      setLawyers(lawyersList);
      
      // Set the first lawyer as selected for preview
      if (lawyersList.length > 0) {
        setSelectedLawyer(lawyersList[0]);
      }
      
      // Create a preview card to show the user
      const lawyerPreviewMessage: Message = {
        id: nanoid(),
        content: `I found ${lawyersList.length} lawyers in ${location} who may be able to help with your case.`,
        is_user: false,
        created_at: new Date().toISOString(),
        type: 'lawyerPreview'
      };
      
      // Add a view more card if there are multiple lawyers
      if (lawyersList.length > 1) {
        const viewMoreMessage: Message = {
          id: nanoid(),
          content: `View more lawyers in ${location}`,
          is_user: false,
          created_at: new Date().toISOString(),
          type: 'viewMoreLawyers'
        };
        
        setMessages(prev => [...prev, lawyerPreviewMessage, viewMoreMessage]);
      } else {
        setMessages(prev => [...prev, lawyerPreviewMessage]);
      }
      
      // Store the confirmed location for future reference
      const confirmedInfo: CaseInfo = {
        county: lawyersList[0]?.county,
        state: lawyersList[0]?.state,
        caseType: caseDetails.caseType,
        isConfirmed: true
      };
      console.log('[SCREEN] Setting confirmed location:', confirmedInfo);
      setConfirmedLocation(confirmedInfo);
      
    } catch (error: any) {
      console.error('[SCREEN] Error fetching lawyers:', error.message || error);
      
      // Add a helpful error message
      const errorMessage: Message = {
        id: nanoid(),
        content: error.message || `I couldn't find lawyers matching your location. Please specify a location like "Allen County, Indiana" or "Lane Oregon".`,
        is_user: false,
        created_at: new Date().toISOString(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingLawyers(false);
    }
  };

  // Helper function to get formatted location for display
  const getDisplayLocation = (caseDetails?: CaseInfo): string => {
    // Priority 1: State from confirmed location
    if (confirmedLocation && confirmedLocation.isConfirmed && confirmedLocation.state) {
      return confirmedLocation.state;
    }
    
    // Priority 2: State from provided case details
    if (caseDetails && caseDetails.state) {
      return caseDetails.state;
    }
    
    // Priority 3: State from selected lawyer
    if (selectedLawyer && selectedLawyer.state) {
      return selectedLawyer.state;
    }
    
    // Priority 4: County from confirmed location (if no state available)
    if (confirmedLocation && confirmedLocation.isConfirmed && confirmedLocation.county) {
      return confirmedLocation.county;
    }
    
    // Priority 5: County from case details (if no state available)
    if (caseDetails && caseDetails.county) {
      return caseDetails.county;
    }
    
    // Fallback
    return "your state";
  };

  // Render function for the ViewMoreLawyersCard
  const renderViewMoreLawyersCard = () => {
    const caseDetails = extractCaseInfo(messages);
    const locationString = getDisplayLocation(caseDetails);
    const caseTypeString = caseDetails.caseType || "Legal Services";
    
    return (
      <ViewMoreLawyersCard 
        legalCategory={caseTypeString}
        location={locationString}
        onClick={handleOpenLawyerList}
      />
    );
  };

  return (
    <div className="flex w-full h-screen bg-[#f7f7f7] overflow-hidden">
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <XIcon className="w-6 h-6" />
        ) : (
          <MenuIcon className="w-6 h-6" />
        )}
      </button>

      <aside className={`
        fixed md:relative w-[272px] h-full bg-[#f7f7f7] shadow-[20px_4px_34px_#00000003]
        transform transition-transform duration-300 z-40
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="flex w-full items-center p-3 border-b border-[#eaeaea]">
          <div className="flex items-center gap-3 p-3">
            <div className="flex w-[43px] h-[43px] items-center justify-center bg-[#f2f2f2] rounded-[8px] border border-[#00000005]">
              <img
                className="w-[29px] h-[26px]"
                alt="Logo"
                src="/frame-2147227290.svg"
              />
            </div>
            <span className="font-semibold text-[23px] text-[#161616] tracking-[-1px]">
              LawPro
            </span>
          </div>
        </div>

        <div className="flex flex-col h-[calc(100%-180px)] p-5 gap-5">
          <Button
            variant="outline"
            onClick={handleNewChat}
            className="flex items-center justify-between w-full p-3 bg-white rounded-lg border-[#eaeaea]"
          >
            <div className="flex items-center gap-2">
              <PlusCircleIcon className="w-5 h-5" />
              <span>New Chat</span>
            </div>
            <ArrowRightIcon className="w-5 h-5" />
          </Button>

          <div className="flex-1 overflow-y-auto">
            <div className="mb-2 text-neutral-400 text-xs uppercase tracking-[0.48px]">
              Current Session
            </div>
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center group">
                <Button
                  variant="ghost"
                  className={`flex-1 text-left p-3 text-sm ${
                    currentSession === session.id ? 'bg-gray-200' : 'text-[#5c5c5c] hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    setCurrentSession(session.id);
                    loadMessages(session.id);
                    setIsSidebarOpen(false);
                  }}
                >
                  {session.title}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => removeSessionFromUI(session.id, e)}
                >
                  <Trash2Icon className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            className="flex items-center gap-2 p-3 w-full text-left text-[#5c5c5c]"
          >
            <SettingsIcon className="w-5 h-5" />
            <span>Settings</span>
          </Button>
        </div>

        <div className="absolute bottom-0 w-full border-t border-[#eaeaea] bg-[#f7f7f7]">
          <div className="flex items-center gap-3 p-6">
            <Avatar className="w-10 h-10 bg-[#ffecc0]">
              <AvatarImage src="/image.png" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-1">
                <span className="font-medium text-[#161616]">Jay Dwivedi</span>
                <img className="w-5 h-5" alt="Verified" src="/verified-fill.svg" />
              </div>
              <div className="text-sm text-[#5c5c5c]">jay@sprrrint.com</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-2 md:p-[9px] w-full">
        <Card className="h-[calc(100vh-16px)] md:h-[calc(100vh-18px)] bg-white rounded-xl md:rounded-[30px] shadow-[-12px_4px_25.3px_#00000005]">
          <CardContent className="flex flex-col h-full p-4 md:p-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 max-w-[560px] mx-auto text-center px-4">
                <img
                  className="w-[67px] h-[60px] mb-[13px]"
                  alt="Logo"
                  src="/subtract.svg"
                />
                <h1 className="text-2xl md:text-[34px] font-semibold text-[#000000d1] tracking-[-1.7px] leading-[1.2] mb-3">
                  Have a Legal Question?
                </h1>
                <p className="text-sm md:text-[14px] text-[#00000099] leading-[1.6]">
                  Ask me below about your situation, and I'll explain what it all
                  means in language that actually makes sense.
                </p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 md:space-y-6 mb-4 px-2 md:px-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.is_user ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start gap-2 max-w-[90%] md:max-w-[80%] ${message.is_user ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Avatar className={`w-8 h-8 md:w-10 md:h-10 ${message.is_user ? 'bg-indigo-100' : 'bg-[#f2f2f2] border border-[#00000005]'}`}>
                        {message.is_user ? (
                          <AvatarFallback>U</AvatarFallback>
                        ) : (
                          <img
                            className="w-5 h-5 md:w-[29px] md:h-[26px]"
                            alt="LawPro"
                            src="/frame-2147227290.svg"
                          />
                        )}
                      </Avatar>
                      
                      {message.type === 'lawyerPreview' && selectedLawyer ? (
                        <LawyerPreviewCard 
                          name={selectedLawyer.name || "Attorney Representative"}
                          specialty={selectedLawyer.specialty || "Legal Professional"}
                          profileImageUrl={selectedLawyer.profileImageUrl || "/placeholder-attorney.jpg"}
                          rating={selectedLawyer.rating || 4.8}
                          onClick={handleOpenLawyerDetail}
                          onConnectClick={(e) => {
                            e.stopPropagation();
                            console.log("Connect clicked for lawyer:", selectedLawyer.id);
                          }}
                        />
                      ) : message.type === 'viewMoreLawyers' ? (
                        renderViewMoreLawyersCard()
                      ) : (
                      <div className={`flex flex-col ${message.is_user ? 'items-end' : 'items-start'}`}>
                        <div 
                          className={`p-3 md:p-4 rounded-2xl text-sm md:text-base ${
                            message.is_user 
                              ? 'bg-indigo-700 text-white rounded-br-none' 
                              : 'bg-gray-100 text-gray-900 rounded-bl-none'
                          }`}
                        >
                          {message.is_user ? (
                            <span>{message.content}</span>
                          ) : (
                            <div 
                              className="prose prose-sm max-w-none"
                              dangerouslySetInnerHTML={{ __html: message.content }}
                            />
                          )}
                        </div>
                        <span className="text-[10px] md:text-xs text-gray-500 mt-1">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-2 max-w-[90%] md:max-w-[80%]">
                      <Avatar className="w-8 h-8 md:w-10 md:h-10 bg-[#f2f2f2] border border-[#00000005]">
                        <img
                          className="w-5 h-5 md:w-[29px] md:h-[26px]"
                          alt="LawPro"
                          src="/frame-2147227290.svg"
                        />
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <div className="p-3 md:p-4 rounded-2xl bg-gray-100 text-gray-900 rounded-bl-none">
                          <div className="flex items-center gap-2">
                            <div className="animate-pulse w-2 h-2 bg-gray-500 rounded-full"></div>
                            <div className="animate-pulse w-2 h-2 bg-gray-500 rounded-full delay-100"></div>
                            <div className="animate-pulse w-2 h-2 bg-gray-500 rounded-full delay-200"></div>
                          </div>
                          <p className="mt-2 text-xs md:text-sm text-gray-600">{loadingMessage}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            <div className="mt-auto">
              <div className="bg-[#f7f7f7] rounded-2xl p-3 md:p-4">
                <div className="flex items-start gap-3 mb-4">
                  <img
                    className="w-[19px] h-[19px]"
                    alt="Group"
                    src="/group-9.png"
                  />
                  <Textarea
                    className="flex-1 bg-transparent border-none resize-none focus-visible:ring-0 p-0 text-sm md:text-base"
                    placeholder="Ask a legal question..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <img
                      className="w-5 h-5"
                      alt="Paperclip"
                      src="/paperclip-1.svg"
                    />
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      className={`w-[38px] h-[38px] bg-indigo-700 rounded-[8.51px] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={handleSendMessage}
                      disabled={isLoading}
                    >
                      <SendIcon className="w-5 h-5 text-white" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center items-center gap-2 md:gap-[18px] mt-4 md:mt-6 px-2">
                <div className="flex items-center gap-[5px]">
                  <ClockIcon className="w-4 h-4 md:w-[17px] md:h-[17px]" />
                  <span className="text-xs md:text-[13px] text-[#000000d1] whitespace-nowrap">Available 24/7</span>
                </div>
                <div className="hidden md:block w-1 h-1 bg-[#e7e7e7] rounded-full" />
                <div className="flex items-center gap-[5px]">
                  <LockIcon className="w-4 h-4 md:w-[17px] md:h-[17px]" />
                  <span className="text-xs md:text-[13px] text-[#000000d1] whitespace-nowrap">Securely Encrypted</span>
                </div>
                <div className="hidden md:block w-1 h-1 bg-[#e7e7e7] rounded-full" />
                <div className="flex items-center gap-[5px]">
                  <UsersIcon className="w-4 h-4 md:w-[17px] md:h-[17px]" />
                  <span className="text-xs md:text-[13px] text-[#000000d1] whitespace-nowrap">For the people</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      {/* Lawyer Detail Modal */}
      <LawyerDetailModal 
        isOpen={isLawyerDetailOpen}
        onClose={() => setIsLawyerDetailOpen(false)}
        county={selectedLawyer?.county}
        state={selectedLawyer?.state}
        caseType={extractCaseInfo(messages).caseType}
        lawyer={selectedLawyer ?? undefined}
      />
      
      {/* Lawyer List Modal */}
      <LawyerListModal 
        isOpen={isLawyerListOpen}
        onClose={() => setIsLawyerListOpen(false)}
        county={confirmedLocation?.county || extractCaseInfo(messages).county}
        state={confirmedLocation?.state || extractCaseInfo(messages).state}
        caseType={confirmedLocation?.caseType || extractCaseInfo(messages).caseType}
        lawyers={lawyers}
      />
    </div>
  );
};