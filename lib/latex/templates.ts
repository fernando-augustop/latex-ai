export interface LatexTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  content: string;
}

export const templates: LatexTemplate[] = [
  {
    id: "blank",
    name: "Em Branco",
    description: "Documento vazio para comecar do zero",
    icon: "FileText",
    content: `\\documentclass[12pt]{article}

\\title{Titulo do Documento}
\\author{Seu Nome}
\\date{\\today}

\\begin{document}

\\maketitle

Comece a escrever aqui.

\\end{document}
`,
  },
  {
    id: "article",
    name: "Artigo Academico",
    description: "Template para artigos cientificos com secoes, referencias e abstract",
    icon: "BookOpen",
    content: `\\documentclass[12pt]{article}

\\title{Titulo do Artigo Academico}
\\author{
  Primeiro Autor \\and
  Segundo Autor
}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
Escreva o resumo do artigo aqui. O abstract deve conter entre 150 e 300 palavras, descrevendo o objetivo, metodologia, principais resultados e conclusoes do trabalho.
\\end{abstract}

\\textbf{Palavras-chave:} palavra1, palavra2, palavra3

\\section{Introducao}

Apresente o contexto e motivacao do trabalho. Descreva o problema de pesquisa e os objetivos do estudo.

\\section{Referencial Teorico}

Revise a literatura relevante sobre o tema.

\\subsection{Subtopico 1}

Detalhe conceitos importantes.

\\subsection{Subtopico 2}

Continue a revisao da literatura.

\\section{Metodologia}

Descreva os metodos utilizados na pesquisa.

\\section{Resultados}

Apresente os resultados obtidos.

\\begin{description}
  \\item[Metrica 1] Grupo A: 42.5 \\quad Grupo B: 38.2
  \\item[Metrica 2] Grupo A: 91.3 \\quad Grupo B: 87.6
  \\item[Metrica 3] Grupo A: 15.8 \\quad Grupo B: 22.1
\\end{description}

\\section{Discussao}

Interprete os resultados e compare com a literatura existente.

\\section{Conclusao}

Resuma as principais contribuicoes e sugira trabalhos futuros.

\\end{document}
`,
  },
  {
    id: "report",
    name: "Relatorio",
    description: "Template de relatorio com capa e capitulos",
    icon: "FileSpreadsheet",
    content: `\\documentclass[12pt]{article}

\\title{{\\Large \\textbf{Titulo do Relatorio}}\\\\[0.5cm]
{\\large Subtitulo ou descricao breve}}
\\author{Seu Nome\\\\Instituicao / Empresa}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introducao}

Descreva o objetivo e o escopo do relatorio.

\\subsection{Contexto}

Apresente o contexto do projeto ou trabalho.

\\subsection{Objetivos}

Liste os objetivos principais.

\\section{Desenvolvimento}

\\subsection{Metodologia}

Descreva a abordagem utilizada.

\\subsection{Implementacao}

Detalhe as etapas de implementacao.

Exemplo de codigo em texto simples:

\\begin{verbatim}
def hello_world():
    print("Hello, World!")

if __name__ == "__main__":
    hello_world()
\\end{verbatim}

\\subsection{Resultados}

Apresente e analise os resultados.

\\section{Conclusao}

Resuma as conclusoes e recomendacoes.

\\section*{Referencias}

Inclua suas referencias aqui.

\\end{document}
`,
  },
  {
    id: "resume",
    name: "Curriculo",
    description: "Template de curriculo profissional moderno",
    icon: "User",
    content: `\\documentclass[11pt]{article}

\\newcommand{\\cventry}[4]{
  \\noindent
  \\textbf{#1} \\hfill {#2} \\\\
  \\textit{#3} \\hfill {#4} \\\\[4pt]
}

\\begin{document}

\\begin{center}
  {\\Huge \\textbf{Seu Nome Completo}}\\\\[6pt]
  {\\large Desenvolvedor de Software}\\\\[8pt]
  email@example.com \\quad +55 (11) 99999-9999 \\quad Sao Paulo, SP\\\\[4pt]
  linkedin.com/in/seuperfil \\quad github.com/seuuser
\\end{center}

\\section*{Experiencia Profissional}
\\rule{\\textwidth}{0.4pt}

\\cventry{Engenheiro de Software Senior}{Jan 2022 -- Presente}{Empresa Tech SA}{Sao Paulo, SP}
\\begin{itemize}
  \\item Liderou o desenvolvimento de microsservicos em Go e TypeScript
  \\item Implementou pipeline de CI/CD com GitHub Actions
  \\item Mentorou equipe de 5 desenvolvedores juniores
\\end{itemize}

\\vspace{6pt}

\\cventry{Desenvolvedor Full Stack}{Mar 2019 -- Dez 2021}{Startup Inovacao Ltda}{Remoto}
\\begin{itemize}
  \\item Desenvolveu aplicacao web com React e Node.js atendendo 50k usuarios ativos
  \\item Projetou banco de dados PostgreSQL com mais de 20 tabelas
  \\item Integrou APIs de pagamento e autenticacao
\\end{itemize}

\\section*{Formacao Academica}
\\rule{\\textwidth}{0.4pt}

\\cventry{Bacharelado em Ciencia da Computacao}{2015 -- 2018}{Universidade de Sao Paulo (USP)}{Sao Paulo, SP}

\\section*{Habilidades Tecnicas}
\\rule{\\textwidth}{0.4pt}

\\begin{description}
  \\item[Linguagens] TypeScript, Python, Go, Java, SQL
  \\item[Frontend] React, Next.js, Tailwind CSS, Vue.js
  \\item[Backend] Node.js, Express, FastAPI, gRPC
  \\item[Banco de Dados] PostgreSQL, MongoDB, Redis, DynamoDB
  \\item[DevOps] Docker, Kubernetes, AWS, GitHub Actions
\\end{description}

\\section*{Idiomas}
\\rule{\\textwidth}{0.4pt}

\\begin{itemize}
  \\item Portugues --- Nativo
  \\item Ingles --- Fluente (C1)
  \\item Espanhol --- Intermediario (B1)
\\end{itemize}

\\end{document}
`,
  },
  {
    id: "presentation",
    name: "Apresentacao",
    description: "Template de slides para apresentacoes",
    icon: "Presentation",
    content: `\\documentclass[12pt]{article}

\\title{Titulo da Apresentacao}
\\author{Seu Nome\\\\Instituicao / Universidade}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Introducao}

\\begin{itemize}
  \\item Contexto do problema
  \\item Motivacao da pesquisa
  \\item Objetivos do trabalho
\\end{itemize}

\\subsection{Contexto}

\\textbf{Definicao:} Descreva o conceito principal aqui.

\\textbf{Problema:} Destaque o problema a ser resolvido.

\\textbf{Exemplo:} Forneca um exemplo ilustrativo.

\\section{Metodologia}

\\begin{enumerate}
  \\item Etapa 1: Coleta de dados
  \\item Etapa 2: Processamento
  \\item Etapa 3: Analise
  \\item Etapa 4: Validacao
\\end{enumerate}

\\subsection{Equacoes}

A equacao fundamental:
$$E = mc^2$$

Outra equacao importante:
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

\\section{Resultados}

\\begin{description}
  \\item[Metodo A] Precisao: 92.3\\% \\quad Tempo: 1.5s
  \\item[Metodo B] Precisao: 95.1\\% \\quad Tempo: 3.2s
  \\item[Proposto] Precisao: \\textbf{97.8\\%} \\quad Tempo: \\textbf{1.1s}
\\end{description}

\\section{Conclusao}

\\begin{itemize}
  \\item Resumo das contribuicoes
  \\item Limitacoes do estudo
  \\item Trabalhos futuros
\\end{itemize}

\\begin{center}
{\\Large Obrigado!}\\\\[0.5cm]
\\texttt{email@example.com}
\\end{center}

\\end{document}
`,
  },
];

export function getTemplateById(id: string): LatexTemplate | undefined {
  return templates.find((t) => t.id === id);
}

export function getDefaultTemplate(): LatexTemplate {
  return templates[0]; // blank template
}
