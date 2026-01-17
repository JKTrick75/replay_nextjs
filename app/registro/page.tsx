import RegisterForm from '@/app/ui/register-form';

export default function RegisterPage() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-white-off dark:bg-neutral-900 p-4 transition-colors duration-300">
      {/* Contenedor principal más ancho (max-w-md) */}
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </main>
  );
}