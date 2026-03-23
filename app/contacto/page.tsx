import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import ContactForm from '@/app/ui/contacto/contact-form'; // Importamos el formulario cliente

export default async function ContactPage(props: {
  searchParams?: Promise<{ asunto?: string; id?: string }>;
}) {
  const searchParams = await props.searchParams;
  const initialAsunto = searchParams?.asunto || '';
  const initialId = searchParams?.id || '';

  const session = await auth();
  const userEmail = session?.user?.email;

  let userOrders: any[] = [];

  if (userEmail) {
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (user) {
      // Buscamos los pedidos donde el usuario es comprador o vendedor
      userOrders = await prisma.listing.findMany({
        where: {
          OR: [{ buyerId: user.id }, { sellerId: user.id }],
          status: { in: ['sold', 'cancelled'] } // Solo traemos pedidos ya tramitados
        },
        include: { game: true },
        orderBy: { updatedAt: 'desc' },
      });
    }
  }

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center p-4 md:p-8">
      {/* Pasamos los datos iniciales de la URL y la lista de pedidos al componente cliente */}
      <ContactForm 
        initialAsunto={initialAsunto} 
        initialId={initialId} 
        orders={userOrders} 
      />
    </main>
  );
}