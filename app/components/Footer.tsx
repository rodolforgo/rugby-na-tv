export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-content pt-10 pb-12">
      <div className="max-w-5xl mx-auto px-6 flex justify-between gap-7 flex-wrap">
        <div className="max-w-[30ch]">
          <div className="font-black text-xl tracking-[-0.03em] uppercase mb-2.5">
            Rugby na <span className="text-[#6FA0FF]"> TV </span>
          </div>
          <p className="text-[12px] tracking-[0.04em] leading-relaxed text-[#AFC0E8]">
            Plataforma colaborativa de divulgação de transmissões.
          </p>
        </div>
        <p className="max-w-[52ch] text-[12.5px] leading-relaxed text-[#8FA4D4]">
          Esta plataforma não distribui, hospeda ou intermedia conteúdo audiovisual, limitando-se à divulgação da grade de programação de
          emissoras e serviços de streaming autorizados.
        </p>
      </div>
    </footer>
  );
}
