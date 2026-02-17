'use client';

import { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { Send, Image as ImageIcon } from 'lucide-react';
import { sendMessage } from '@/app/lib/actions'; 
import { Chat, Message, User } from '@/app/lib/definitions';

export default function ChatWindow({ 
  chat, 
  currentUser 
}: { 
  chat: Chat & { messages: Message[], buyer: User, seller: User, listing?: any }; 
  currentUser: User 
}) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // ⚡ LÓGICA DE SCROLL INSTANTÁNEO
  const scrollToBottom = (instant = true) => {
    if (chatContainerRef.current) {
      const container = chatContainerRef.current;
      
      if (instant) {
        container.scrollTop = container.scrollHeight;
      } else {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      }
    }
  };

  useLayoutEffect(() => {
    scrollToBottom(true);
  }, []);

  useEffect(() => {
    scrollToBottom(true); 
  }, [chat.messages]);

  const handleSend = async (formData: FormData) => {
    if (!content.trim()) return;
    
    setIsSending(true);
    // Optimistic clean
    setContent('');
    
    await sendMessage(null as any, formData);
    
    setIsSending(false);
    formRef.current?.reset();
    
    setTimeout(() => scrollToBottom(true), 50); 
  };

  const otherUser = currentUser.id === chat.buyerId ? chat.seller : chat.buyer;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900">
      
      {/* CABECERA */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-10 shadow-sm">
        <img 
          src={otherUser?.image || '/placeholder-user.png'} 
          alt={otherUser?.name} 
          className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-neutral-700"
        />
        <div className="flex-1">
          <h2 className="font-bold text-dark dark:text-white leading-tight">{otherUser?.name}</h2>
          {chat.listing && (
            <p className="text-xs text-primary font-medium flex items-center gap-1 truncate">
              Sobre: {chat.listing.game?.title || 'Producto'} ({chat.listing.price}€)
            </p>
          )}
        </div>
        
        {chat.listing?.game?.coverImage && (
            <img 
              src={chat.listing.game.coverImage} 
              className="w-10 h-12 object-cover rounded-md border border-gray-200 dark:border-neutral-700" 
              alt="Producto"
            />
        )}
      </div>

      {/* ÁREA DE MENSAJES */}
      <div 
        ref={chatContainerRef} 
        style={{ scrollBehavior: 'auto' }}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black/20"
      >
        {chat.messages && chat.messages.length > 0 ? (
          chat.messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed shadow-sm relative break-words
                  ${isMe 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-white dark:bg-neutral-800 text-dark dark:text-gray-200 border border-gray-100 dark:border-neutral-700 rounded-bl-none'
                  }
                `}>
                  {msg.content}
                  
                  {/* 🟢 SOLUCIÓN AQUÍ: suppressHydrationWarning */}
                  <div 
                    suppressHydrationWarning
                    className={`text-[10px] mt-1 text-right opacity-70 ${isMe ? 'text-white' : 'text-gray-400'}`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 opacity-60">
            <p>👋 ¡Saluda a {otherUser?.name}!</p>
            <p className="text-xs">Pregunta por el estado del producto o negocia el envío.</p>
          </div>
        )}
      </div>

      {/* INPUT */}
      <div className="p-4 bg-white dark:bg-neutral-900 border-t border-gray-100 dark:border-neutral-800">
        <form ref={formRef} action={handleSend} className="flex gap-2 items-end">
          <input type="hidden" name="chatId" value={chat.id} />
          
          <button type="button" disabled className="p-3 text-gray-400 hover:text-primary transition-colors cursor-not-allowed">
            <ImageIcon size={20} />
          </button>

          <input
            name="content"
            autoComplete="off"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="flex-1 bg-gray-100 dark:bg-neutral-800 text-dark dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder-gray-400"
          />
          
          <button 
            type="submit" 
            disabled={!content.trim() || isSending}
            className="bg-primary hover:bg-primary-hover text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}