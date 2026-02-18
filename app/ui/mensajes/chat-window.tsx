'use client';

import { useRef, useEffect, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; 
import { Send, Image as ImageIcon, X } from 'lucide-react';
import { sendMessage } from '@/app/lib/actions'; 
import { Chat, Message, User } from '@/app/lib/definitions';
import { askForInput, showToast } from '@/app/lib/swal'; 

export default function ChatWindow({ 
  chat, 
  currentUser 
}: { 
  chat: Chat & { messages: Message[], buyer: User, seller: User, listing?: any }; 
  currentUser: User 
}) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null); 
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  // 🟢 1. REF PARA CONTROLAR LA CANTIDAD DE MENSAJES PREVIA
  // Esto nos ayuda a saber si realmente ha llegado un mensaje nuevo o es solo un refresh
  const prevMessagesLength = useRef(chat.messages.length);

  const router = useRouter();

  // POLLING: Actualizar chat cada 3 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 3000); 

    return () => clearInterval(interval);
  }, [router]);

  // Función básica de scroll
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

  // Helper: ¿Está el usuario mirando el final del chat?
  // Consideramos "estar al final" si está a menos de 150px del fondo
  const isUserAtBottom = () => {
    const container = chatContainerRef.current;
    if (!container) return false;
    const threshold = 150; 
    return container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
  };

  // 🟢 2. SCROLL INICIAL (Solo al montar el componente)
  useLayoutEffect(() => {
    scrollToBottom(true);
  }, []);

  // 🟢 3. SCROLL INTELIGENTE CUANDO CAMBIAN LOS MENSAJES
  useEffect(() => {
    const currentLength = chat.messages.length;
    const prevLength = prevMessagesLength.current;
    const lastMessage = chat.messages[chat.messages.length - 1];
    
    // Solo actuamos si hay MÁS mensajes que antes (nuevo mensaje real)
    if (currentLength > prevLength) {
        const isMe = lastMessage?.senderId === currentUser.id;
        
        // Hacemos scroll si:
        // A) Fui yo quien envió el mensaje (siempre quiero verlo)
        // B) O si yo estaba ya al final del chat leyendo lo último
        if (isMe || isUserAtBottom()) {
            scrollToBottom(false); // false = con animación suave
        }
        // Si no se cumple (ej: estoy leyendo arriba y me escribe otro), NO hacemos scroll.
    }

    // Actualizamos la referencia para la próxima vez
    prevMessagesLength.current = currentLength;

  }, [chat.messages, currentUser.id]);

  const handleSend = async (formData: FormData) => {
    if (!content.trim()) return;
    
    setIsSending(true);
    setContent('');
    
    await sendMessage(null as any, formData);
    
    setIsSending(false);
    formRef.current?.reset();
    
    // Forzamos scroll al enviar manualmente también por si acaso
    setTimeout(() => scrollToBottom(false), 50); 
  };

  const handleImageClick = async () => {
    const result = await askForInput(
      'Enviar imagen',
      'Pega la URL de la imagen:',
      'https://...',
      'url',
      'Enviar'
    );

    if (result.isConfirmed && result.value) {
      setIsSending(true);
      
      const formData = new FormData();
      formData.append('chatId', chat.id);
      formData.append('image', result.value);
      formData.append('content', ''); 

      const response = await sendMessage(null as any, formData);
      
      if (!response.success) {
        showToast('error', 'Error', 'No se pudo enviar la imagen.');
      }
      setIsSending(false);
      setTimeout(() => scrollToBottom(false), 50);
    }
  };

  const otherUser = currentUser.id === chat.buyerId ? chat.seller : chat.buyer;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 relative">
      
      {/* MODAL ZOOM */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <button className="absolute top-4 right-4 text-white hover:text-gray-300">
             <X size={40} />
          </button>
          <img 
            src={previewImage} 
            alt="Zoom" 
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
          />
        </div>
      )}

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
            
            const imageRoundedClass = isMe
                ? (msg.content ? 'rounded-t-2xl' : 'rounded-t-2xl rounded-bl-2xl') 
                : (msg.content ? 'rounded-t-2xl' : 'rounded-t-2xl rounded-br-2xl');

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-[75%] rounded-2xl shadow-sm relative break-words flex flex-col
                  ${isMe 
                    ? 'bg-primary text-white rounded-br-none' 
                    : 'bg-white dark:bg-neutral-800 text-dark dark:text-gray-200 border border-gray-100 dark:border-neutral-700 rounded-bl-none'
                  }
                `}>
                  
                  {msg.image && (
                      <img 
                        src={msg.image} 
                        alt="Adjunto" 
                        onClick={() => setPreviewImage(msg.image || null)}
                        className={`w-full max-h-60 object-cover cursor-zoom-in hover:opacity-90 transition-opacity bg-black/10 ${imageRoundedClass}`}
                      />
                  )}

                  <div className={`${!msg.content && msg.image ? 'px-3 pb-2 pt-1' : 'px-4 py-2'}`}>
                        {msg.content && (
                           <p className="text-sm leading-relaxed mb-1">{msg.content}</p>
                        )}
                        
                        <div className={`flex items-end justify-end gap-1 ${isMe ? 'text-white' : 'text-gray-400'}`}>
                          <span 
                            suppressHydrationWarning
                            className="text-[10px] opacity-70"
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          {isMe && (
                             <span className={`text-xs leading-none mb-0.5 ${msg.read ? 'opacity-100' : 'opacity-60'}`}>
                                {msg.read ? '✓✓' : '✓'}
                             </span>
                          )}
                        </div>
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
          
          <button 
            type="button" 
            onClick={handleImageClick}
            disabled={isSending}
            className="p-3 text-gray-400 hover:text-primary transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-xl"
            title="Enviar imagen"
          >
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
            disabled={(!content.trim() && !isSending) || isSending}
            className="bg-primary hover:bg-primary-hover text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}