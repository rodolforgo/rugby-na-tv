export default function Header() {
  return (
    <header className="navbar navbar-sm bg-base-200 shadow-sm">
      <div className="max-w-5xl mx-auto w-full px-6">
        <div className="navbar-start">
          <a href="/" className="flex flex-col items-center gap-0.5">
            <img src="/logo.svg" alt="Rugby na TV" className="h-8 w-auto" />
            <span className="text-xs font-semibold tracking-wide">Rugby na TV</span>
          </a>
        </div>
      </div>
    </header>
  );
}
