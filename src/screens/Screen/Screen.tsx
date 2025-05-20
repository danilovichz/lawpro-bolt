import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../components/ui/use-toast';
import { supabase } from '../../lib/supabase';
import { LawyerCard } from '../../components/ui/lawyer-card';
import { LawyerPreview } from '../../components/ui/lawyer-preview';

export function Screen() {
  const { id: sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState<any>(null);

  useEffect(() => {
    if (sessionId) {
      fetchMessages();
      fetchLawyers();
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch messages',
        variant: 'destructive',
      });
    }
  };

  const fetchLawyers = async () => {
    try {
      const { data: lawyers, error } = await supabase
        .from('lawyers_real')
        .select('*')
        .limit(10);

      if (error) throw error;
      setLawyers(lawyers || []);
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const { data: message, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: sessionId,
            content: newMessage,
            is_user: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.is_user ? 'justify-end' : 'justify-start'
                }`}
              >
                <Card
                  className={`max-w-[70%] p-4 ${
                    message.is_user
                      ? 'bg-blue-500 text-white'
                      : 'bg-white text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </Card>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              Send
            </Button>
          </form>
        </div>
      </div>
      <div className="w-80 border-l bg-white p-4">
        <Tabs defaultValue="lawyers">
          <TabsList className="w-full">
            <TabsTrigger value="lawyers" className="flex-1">
              Lawyers
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">
              Preview
            </TabsTrigger>
          </TabsList>
          <Separator className="my-4" />
          <TabsContent value="lawyers" className="space-y-4">
            {lawyers.map((lawyer) => (
              <LawyerCard
                key={lawyer.id}
                lawyer={lawyer}
                onSelect={() => setSelectedLawyer(lawyer)}
              />
            ))}
          </TabsContent>
          <TabsContent value="preview">
            {selectedLawyer ? (
              <LawyerPreview lawyer={selectedLawyer} />
            ) : (
              <p className="text-center text-gray-500">
                Select a lawyer to preview
              </p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}