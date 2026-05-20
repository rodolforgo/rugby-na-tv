export default function Home() {
  return (
    <main className="min-h-screen bg-base-100 flex flex-col items-center justify-center">
      <div className="text-center">
        <img src="/logo.svg" alt="Rugby na TV" className="w-40 mx-auto mb-6" />
        <h1 className="text-4xl font-bold text-primary">Rugby na TV</h1>
        <p className="mt-2 text-lg font-light text-primary/60">Em breve</p>
        <p className="mt-4 text-sm text-base-content/50">Transmissões de rugby no Brasil em um só lugar</p>
      </div>
    </main>
  );
}
