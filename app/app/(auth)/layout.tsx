export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12">
        <div className="text-primary-foreground max-w-md">
          <h1 className="text-4xl font-bold mb-4">Pipelight</h1>
          <p className="text-lg text-primary-foreground/70">
            AI-powered pipeline monitoring. Detect sync failures before they
            become data incidents.
          </p>
        </div>
      </div>
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
