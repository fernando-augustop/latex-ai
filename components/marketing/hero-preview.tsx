// Line mapping (after adding empty lines around equation):
// 0: \documentclass{article}
// 1: \usepackage{amsmath}
// 2: \title{Meu Artigo de Pesquisa}       → title
// 3: \author{Maria Silva}                 → author
// 4: \begin{document}
// 5: \maketitle                           → divider
// 6: (empty)
// 7: \section{Introdução}                 → section heading
// 8: A relação entre energia e massa      → paragraph line 1
// 9: transformou nossa compreensão...     → paragraph line 2
// 10: e estabeleceu as bases...           → paragraph line 3
// 11: (empty)
// 12: \begin{equation}                    → equation box
// 13: E = mc^2                            → equation content
// 14: \end{equation}
// 15: (empty)

export function HeroPreview({ completedLines }: { completedLines: number }) {
  const showTitle = completedLines >= 3;
  const showAuthor = completedLines >= 4;
  const showDivider = completedLines >= 6;
  const showSection = completedLines >= 8;
  const showPara1 = completedLines >= 9;
  const showPara2 = completedLines >= 10;
  const showPara3 = completedLines >= 11;
  const showEquation = completedLines >= 14;

  const reveal = (visible: boolean) =>
    `transition-all duration-500 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`;

  return (
    <div
      className="relative flex-1 overflow-hidden rounded-md border border-zinc-300/65 bg-gradient-to-b from-white to-zinc-50 px-6 py-6 text-zinc-900 shadow-[0_2px_8px_rgba(0,0,0,0.08),0_20px_40px_rgba(0,0,0,0.15)]"
      style={{
        fontFamily: '"Times New Roman", "Georgia", "Noto Serif", serif',
      }}
    >
      <h2 className={`text-center text-lg font-bold leading-snug tracking-tight text-zinc-950 ${reveal(showTitle)}`}>
        Meu Artigo de Pesquisa
      </h2>

      <p className={`mt-1.5 text-center text-sm text-zinc-500 ${reveal(showAuthor)}`}>
        Maria Silva
      </p>

      <div className={`mx-auto mt-1.5 h-px w-16 bg-zinc-300 ${reveal(showDivider)}`} />

      <div className="mt-4 space-y-3 text-[13px] leading-[1.9] text-zinc-800">
        <div className={reveal(showSection)}>
          <h3 className="text-base font-bold text-zinc-950">
            <span className="mr-1.5">1</span>Introdu&ccedil;&atilde;o
          </h3>
        </div>

        <p className={`mt-1.5 text-[14px] leading-[1.95] text-justify ${reveal(showPara1)}`}>
          <span className={reveal(showPara1)}>A rela&ccedil;&atilde;o entre energia e massa </span>
          <span className={reveal(showPara2)}>transformou nossa compreens&atilde;o da f&iacute;sica moderna </span>
          <span className={reveal(showPara3)}>e estabeleceu as bases da relatividade especial.</span>
        </p>

        <div className={`my-2 flex items-center justify-center py-3 ${reveal(showEquation)}`}>
          <p
            className="max-w-full text-center text-[clamp(28px,5vw,42px)] leading-none tracking-tight text-zinc-800 break-words"
            style={{ fontFamily: '"Times New Roman", "Georgia", serif' }}
          >
            <span className="italic">E</span>
            <span className="mx-[4px]">=</span>
            <span className="italic">mc</span>
            <sup className="relative -top-[20px] text-[24px]">2</sup>
          </p>
        </div>
      </div>
    </div>
  );
}
