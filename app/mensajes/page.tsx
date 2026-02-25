import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import ChatWindow from '@/app/ui/mensajes/chat-window';
import { Chat, User, Listing, Message } from '@/app/lib/definitions'; 

export default async function MessagesPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ chat?: string }> 
}) {
  const session = await auth();
  if (!session?.user?.email) redirect('/login');

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!currentUser) redirect('/login');

  const { chat: selectedChatId } = await searchParams;

  //MARCAR COMO LEÍDO
  if (selectedChatId) {
    await prisma.message.updateMany({
      where: {
        chatId: selectedChatId,
        senderId: { not: currentUser.id },
        read: false
      },
      data: { read: true }
    });
  }

  //1- Obtener TODOS los chats
  const chats = await prisma.chat.findMany({
    where: {
      OR: [
        { buyerId: currentUser.id },
        { sellerId: currentUser.id }
      ]
    },
    include: {
      buyer: true,
      seller: true,
      listing: { include: { game: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    },
    orderBy: { updatedAt: 'desc' }
  });

  //2- Obtener chat activo
  let activeChat = null;
  if (selectedChatId) {
    const rawChat = await prisma.chat.findUnique({
      where: { id: selectedChatId },
      include: {
        buyer: true,
        seller: true,
        listing: { include: { game: true } },
        messages: { orderBy: { createdAt: 'asc' } }
      }
    });
    
    if (rawChat && (rawChat.buyerId === currentUser.id || rawChat.sellerId === currentUser.id)) {
      activeChat = rawChat;
    }
  }

  const safeChats = chats as unknown as (Chat & { buyer: User, seller: User, listing: Listing & { game: any }, messages: Message[] })[];
  const safeActiveChat = activeChat as unknown as (Chat & { buyer: User, seller: User, listing: Listing & { game: any }, messages: Message[] });

  //3- FILTRAR VACÍOS
  const visibleChats = safeChats.filter(chat => {
    const hasMessages = chat.messages && chat.messages.length > 0;
    const isCurrent = chat.id === selectedChatId;
    return hasMessages || isCurrent;
  });

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white dark:bg-neutral-900 overflow-hidden">
      
      {/* SIDEBAR */}
      <div className={`
        w-full md:w-[350px] lg:w-[400px] border-r border-gray-200 dark:border-neutral-800 flex flex-col bg-white dark:bg-neutral-900
        ${selectedChatId ? 'hidden md:flex' : 'flex'} 
      `}>
        <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center bg-gray-50/50 dark:bg-neutral-900">
          <h1 className="text-xl font-bold text-dark dark:text-white">Mensajes</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {visibleChats.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
              <p>No tienes mensajes activos.</p>
              <p className="text-sm mt-2">Contacta con un vendedor desde la tienda.</p>
              <Link href="/tienda" className="mt-4 inline-block text-primary hover:underline font-bold text-sm">
                Ir a la tienda
              </Link>
            </div>
          ) : (
            visibleChats.map((chat) => {
              const isMeBuyer = chat.buyerId === currentUser.id;
              const otherUser = isMeBuyer ? chat.seller : chat.buyer;
              const lastMsg = chat.messages[0];
              const isActive = selectedChatId === chat.id;
              const isCancelled = chat.listing?.status === 'cancelled';
              const isSold = chat.listing?.status === 'sold';

              //DETECTAR NO LEÍDO (Si hay mensaje, no está leído y no soy yo el que lo envió)
              const hasUnread = lastMsg && !lastMsg.read && lastMsg.senderId !== currentUser.id;

              return (
                <Link 
                  key={chat.id} 
                  href={`/mensajes?chat=${chat.id}`}
                  className={`
                    block p-4 border-b border-gray-50 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors relative
                    ${isActive ? 'bg-primary/5 border-l-4 border-l-primary dark:bg-primary/10' : 'border-l-4 border-l-transparent'}
                  `}
                >
                  <div className="flex gap-3">
                    <img src={otherUser.image || '/placeholder-user.png'} alt={otherUser.name} className="w-12 h-12 rounded-full object-cover bg-gray-200"/>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`font-bold truncate text-sm ${hasUnread ? 'text-dark dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                          {otherUser.name}
                        </p>
                        {lastMsg && (
                          <span 
                            suppressHydrationWarning
                            className={`text-[10px] whitespace-nowrap ml-2 ${hasUnread ? 'text-primary font-bold' : 'text-gray-400'}`}
                          >
                            {new Date(lastMsg.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      
                      {chat.listing && (
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={`text-xs font-medium truncate ${isCancelled ? 'text-primary line-through' : 'text-primary'}`}>
                            {chat.listing.game?.title}
                          </p>
                          {isCancelled && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 rounded">Cancelado</span>}
                          {isSold && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 rounded">Vendido</span>}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <p className={`text-xs truncate max-w-[85%] ${hasUnread ? 'font-bold text-dark dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                          {lastMsg ? (
                            lastMsg.senderId === currentUser.id 
                              ? `Tú: ${lastMsg.content || '📷 Foto'}` 
                              : (lastMsg.content || '📷 Foto')
                          ) : 'Chat iniciado'}
                        </p>
                        
                        {/* PUNTO ROJO DE NO LEÍDO */}
                        {hasUnread && (
                          <span className="w-2.5 h-2.5 bg-primary rounded-full shadow-sm animate-pulse"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className={`
        flex-1 bg-white-off dark:bg-black/20 flex flex-col
        ${!selectedChatId ? 'hidden md:flex' : 'flex'} 
      `}>
        {safeActiveChat ? (
          <>
            <div className="md:hidden flex items-center p-2 bg-white dark:bg-neutral-900 border-b border-gray-100 dark:border-neutral-800">
               <Link href="/mensajes" className="p-2 text-gray-500 flex items-center gap-1 font-medium">
                  ← Volver
               </Link>
            </div>
            
            <ChatWindow 
              chat={safeActiveChat} 
              currentUser={currentUser as unknown as User} 
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center opacity-60">
             <div className="bg-gray-100 dark:bg-neutral-800 p-6 rounded-full mb-6">
                <MessageSquare size={64} className="text-primary/50" />
             </div>
             <h2 className="text-2xl font-bold text-dark dark:text-white mb-2">Tus Mensajes</h2>
             <p>Selecciona una conversación de la izquierda para empezar a chatear.</p>
          </div>
        )}
      </div>

    </div>
  );
}