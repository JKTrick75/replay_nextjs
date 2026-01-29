import { auth } from '@/auth';
import { prisma } from '@/app/lib/db';
import ProfileForm from '@/app/ui/dashboard/profile-form';

export default async function ProfilePage() {
  const session = await auth();
  const userEmail = session?.user?.email;

  if (!userEmail) return <div>No tienes permiso.</div>;

  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) return <div>Usuario no encontrado.</div>;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-dark dark:text-white">
          Mi Perfil
        </h1>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-light dark:border-neutral-700 overflow-hidden">
        {/* Pasamos los datos del usuario al formulario cliente */}
        <ProfileForm user={user} />
      </div>
    </div>
  );
}