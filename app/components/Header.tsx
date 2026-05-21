export default function Header() {
  return (
    <header className="navbar navbar-sm bg-base-200 border-b border-base-300 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto w-full px-6">
        <a href="/" className="flex flex-col items-center gap-0.5">
          <img src="/logo.svg" alt="Rugby na TV" className="h-8 w-auto" />
          <span className="text-xs font-semibold tracking-wide">Rugby na TV</span>
        </a>
      </div>
    </header>
  );
}
