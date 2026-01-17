import LoginForm from '@/app/ui/login-form';
 
export default function LoginPage() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-white-off dark:bg-neutral-900 p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </main>
  );
}