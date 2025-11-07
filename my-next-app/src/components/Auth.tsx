
// wrapps the whole form (Login/email ..etc)

export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
      {children}
    </div>
  );
}
