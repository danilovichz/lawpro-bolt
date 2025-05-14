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
import React, { useState, useRef, useEffect } from "react";
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
import { getAIResponse, generateTitle, findLocalLawyers } from "../../lib/ai";
import { LawyerCard } from "../../components/ui/lawyer-card";

interface Message {
  id: string;
  content: string;
  is_user: boolean;
  created_at: string;
  metadata?: {
    name?: string;
    size?: number;
    lawyers?: any[];
  };
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  session_key: string;
}

const loadingMessages = [
  "Let me think about that...",
  "Looking into similar cases...",
  "Checking what the law says...",
  "Finding the best way to explain this...",
  "Putting the pieces together...",
  "Almost ready with an answer...",
  "Making sure I get this right...",
  "Breaking this down for you..."
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

  useEffect(() => {
    loadSessions();
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
      // First check if we can connect to Supabase
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
      // You might want to show this error to the user in a more user-friendly way
      // For now, we'll just log it to help with debugging
      console.error('Please check:');
      console.error('1. Your Supabase project is running');
      console.error('2. Your environment variables are correct');
      console.error('3. Your network connection is stable');
      console.error('4. CORS is properly configured in Supabase');
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

    setMessages(data || []);
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

      setSessions([session, ...sessions]);
      return session;
    } catch (error) {
      console.error('Error in createNewSession:', error);
      return null;
    }
  };

  const updateSessionTitle = async (sessionId: string, messageText: string) => {
    try {
      const title = await generateTitle(messageText);
      const { error } = await supabase
        .from('chat_sessions')
        .update({ title })
        .eq('id', sessionId);

      if (error) throw error;

      setSessions(sessions.map(session => 
        session.id === sessionId ? { ...session, title } : session
      ));
    } catch (error) {
      console.error('Error in updateSessionTitle:', error);
    }
  };

  const handleNewChat = async () => {
    const session = await createNewSession();
    if (session) {
      setCurrentSession(session.id);
      setMessages([]);
      setCurrentMessage("");
      setIsSidebarOpen(false);
    }
  };

  const formatMessageContent = (content: string) => {
    return content.replace(/-/g, '•');
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
        if (!session) return;
        sessionId = session.id;
        setCurrentSession(sessionId);
      }

      const { data: userMessage, error: userError } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          content: formatMessageContent(`Attached file: ${file.name}`),
          is_user: true,
          metadata: {
            name: file.name,
            size: file.size,
          }
        }])
        .select()
        .single();

      if (userError) throw userError;

      setMessages(prev => [...prev, userMessage]);

      const { response } = await getAIResponse(`The user has uploaded a file named ${file.name}. Please acknowledge receipt of the file and ask how you can help with it.`, sessionId);

      const { data: aiMessage, error: aiError } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          content: formatMessageContent(response),
          is_user: false
        }])
        .select()
        .single();

      if (aiError) throw aiError;

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error handling file upload:', error);
    } finally {
      setIsLoading(false);
    }
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
        if (!session) return;
        sessionId = session.id;
        setCurrentSession(sessionId);
      }

      const { data: userMessage, error: userError } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          content: formatMessageContent(messageText),
          is_user: true
        }])
        .select()
        .single();

      if (userError) throw userError;

      setMessages(prev => [...prev, userMessage]);

      if (messages.length === 0) {
        await updateSessionTitle(sessionId, messageText);
      }

      const { response, showLawyers } = await getAIResponse(messageText, sessionId);

      const { data: aiMessage, error: aiError } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          content: formatMessageContent(response),
          is_user: false
        }])
        .select()
        .single();

      if (aiError) throw aiError;

      setMessages(prev => [...prev, aiMessage]);

      if (showLawyers) {
        const lawyers = await findLocalLawyers();
        
        if (lawyers && lawyers.length > 0) {
          const recommendationMessage = "Here are some qualified legal professionals who might be able to help with your case:";
          
          const { data: recommendationMsg, error: recError } = await supabase
            .from('chat_messages')
            .insert([{
              session_id: sessionId,
              content: recommendationMessage,
              is_user: false,
              metadata: { lawyers }
            }])
            .select()
            .single();

          if (!recError && recommendationMsg) {
            setMessages(prev => [...prev, recommendationMsg]);
          }
        }
      }

    } catch (error) {
      console.error('Error in message handling:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatMessage = (content: string, metadata?: any) => {
    if (metadata?.lawyers) {
      return (
        <div className="space-y-4">
          <p className="mb-4">{content}</p>
          <div className="grid gap-4">
            {metadata.lawyers.map((lawyer: any, index: number) => (
              <LawyerCard key={`${lawyer.id}-${index}`} lawyer={lawyer} />
            ))}
          </div>
        </div>
      );
    }

    const sections = content.split(/(?=^\d+\.|^[A-Z][^.!?]*:)/m);
    
    return sections.map((section, i) => {
      const lines = section.trim().split('\n');
      
      const isNumberedHeader = /^\d+\./.test(lines[0]);
      const isHeader = /^[A-Z][^.!?]*:/.test(lines[0]);
      const isListItem = /^[•-]/.test(lines[0]);
      
      return (
        <div key={i} className="mb-4 last:mb-0">
          {lines.map((line, j) => {
            if (j === 0 && (isHeader || isNumberedHeader)) {
              return (
                <h3 key={j} className="font-semibold text-lg mb-2">
                  {line}
                </h3>
              );
            }
            if (isListItem) {
              return (
                <li key={j} className="mb-2 last:mb-0 ml-4">
                  {line.replace(/^[•-]/, '').trim()}
                </li>
              );
            }
            return line.trim() && (
              <p key={j} className="mb-2 last:mb-0 leading-relaxed">
                {line}
              </p>
            );
          })}
        </div>
      );
    });
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
                      <div className={`flex flex-col ${message.is_user ? 'items-end' : 'items-start'}`}>
                        <div className={`p-3 md:p-4 rounded-2xl text-sm md:text-base ${
                          message.is_user 
                            ? 'bg-indigo-700 text-white rounded-br-none' 
                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}>
                          {formatMessage(message.content, message.metadata)}
                          {message.metadata?.name && (
                            <div className="mt-2 text-xs md:text-sm">
                              📎 {message.metadata.name} ({(message.metadata.size / 1024 / 1024).toFixed(2)}MB)
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] md:text-xs text-gray-500 mt-1">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
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
    </div>
  );
};