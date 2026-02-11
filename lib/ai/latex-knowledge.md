# LaTeX Comprehensive Knowledge Base

---

## Section 1: Document Classes

### article

The most common class for short documents, journal papers, and assignments.

```latex
\documentclass[12pt, a4paper, twocolumn]{article}
```

Common options:
- `10pt`, `11pt`, `12pt` — base font size
- `a4paper`, `letterpaper` — paper size
- `twocolumn` — two-column layout
- `titlepage` — separate title page
- `draft` — marks overfull boxes, does not load images
- `fleqn` — left-aligned equations
- `leqno` — equation numbers on the left

### report

For longer documents with chapters.

```latex
\documentclass[12pt, a4paper]{report}
```

Adds `\chapter{}` command and default title page. Good for theses, technical reports, and longer academic works.

Additional options beyond article:
- `openright` — chapters start on right-hand pages
- `openany` — chapters start on any page

### book

For full books with front/back matter.

```latex
\documentclass[12pt, a4paper, twoside]{book}
```

Adds `\frontmatter`, `\mainmatter`, `\backmatter` for page numbering changes. Supports `\part{}` for grouping chapters.

Additional options:
- `oneside` — no distinction between left/right pages
- `twoside` — different headers for odd/even pages (default)

### letter

For formal letters.

```latex
\documentclass{letter}
\begin{document}
\begin{letter}{Recipient Name \\ Address Line 1 \\ City, Country}
  \opening{Dear Sir/Madam,}
  Your letter content here.
  \closing{Sincerely,}
  \encl{Enclosed documents}
  \cc{CC recipients}
\end{letter}
\end{document}
```

### beamer

For presentations and slides.

```latex
\documentclass{beamer}
\usetheme{Madrid}
\usecolortheme{seahorse}

\title{Presentation Title}
\author{Author Name}
\date{\today}

\begin{document}
\begin{frame}
  \titlepage
\end{frame}

\begin{frame}{Slide Title}
  \begin{itemize}
    \item First point
    \item Second point
  \end{itemize}
\end{frame}
\end{document}
```

Popular themes: `Madrid`, `Berlin`, `Copenhagen`, `Darmstadt`, `Frankfurt`, `Singapore`, `Warsaw`, `AnnArbor`, `Boadilla`, `CambridgeUS`, `Malmoe`, `Montpellier`, `Rochester`.

Color themes: `default`, `albatross`, `beaver`, `beetle`, `crane`, `dolphin`, `dove`, `fly`, `lily`, `orchid`, `rose`, `seagull`, `seahorse`, `whale`, `wolverine`.

### standalone

For compiling single figures, tikz pictures, or equations.

```latex
\documentclass[border=5mm]{standalone}
\usepackage{tikz}
\begin{document}
\begin{tikzpicture}
  \draw (0,0) circle (1);
\end{tikzpicture}
\end{document}
```

Options: `border=5mm` adds padding, `crop` auto-crops to content.

### memoir

A flexible class that combines features of article, report, and book.

```latex
\documentclass[12pt, a4paper]{memoir}
```

Supports extensive customization of chapter styles, page layouts, headers/footers, and more without additional packages.

### KOMA-Script Classes

Modern alternatives to the standard classes with better European defaults.

- `scrartcl` — replaces article
- `scrreprt` — replaces report
- `scrbook` — replaces book
- `scrlttr2` — replaces letter

```latex
\documentclass[12pt, a4paper, parskip=half]{scrartcl}
```

---

## Section 2: Essential Packages

### amsmath — Mathematics

The essential package for mathematical typesetting.

```latex
\usepackage{amsmath}
```

Key environments:
- `equation` — single numbered equation
- `equation*` — unnumbered equation
- `align` — multiple aligned equations
- `align*` — unnumbered aligned equations
- `gather` — centered equations
- `multline` — long equations that break across lines
- `split` — splitting a single equation
- `cases` — piecewise functions

```latex
% Aligned equations
\begin{align}
  f(x) &= x^2 + 2x + 1 \label{eq:quadratic} \\
  g(x) &= \frac{d}{dx} f(x) = 2x + 2 \label{eq:derivative}
\end{align}

% Cases
\begin{equation}
  f(x) = \begin{cases}
    x^2 & \text{if } x \geq 0 \\
    -x  & \text{if } x < 0
  \end{cases}
\end{equation}

% Matrices
\begin{equation}
  A = \begin{pmatrix}
    a_{11} & a_{12} \\
    a_{21} & a_{22}
  \end{pmatrix}
\end{equation}

% Text within math
\text{some text}, \quad \intertext{paragraph between equations}
```

Matrix variants: `pmatrix` (parentheses), `bmatrix` (brackets), `Bmatrix` (braces), `vmatrix` (vertical lines/determinant), `Vmatrix` (double vertical lines).

### amssymb — Additional Math Symbols

```latex
\usepackage{amssymb}
```

Provides symbols like `\mathbb{R}`, `\mathbb{N}`, `\mathbb{Z}`, `\mathbb{C}`, `\mathbb{Q}`, `\therefore`, `\because`, `\leqslant`, `\geqslant`, `\varnothing`, `\square`, `\blacksquare`, `\triangle`, `\nexists`, `\complement`.

### mathtools — Enhanced Math

```latex
\usepackage{mathtools}
```

Extends amsmath with:
- `\coloneqq` for definitions (:=)
- `\DeclarePairedDelimiter` for auto-sizing delimiters
- Starred variants of math environments

```latex
\DeclarePairedDelimiter{\abs}{\lvert}{\rvert}
\DeclarePairedDelimiter{\norm}{\lVert}{\rVert}
\DeclarePairedDelimiter{\ceil}{\lceil}{\rceil}
\DeclarePairedDelimiter{\floor}{\lfloor}{\rfloor}

% Usage: \abs{x}, \abs*{\frac{a}{b}} (auto-sized)
```

### geometry — Page Layout

```latex
\usepackage[
  a4paper,
  top=2.5cm,
  bottom=2.5cm,
  left=3cm,
  right=3cm,
  headheight=14pt
]{geometry}
```

Common options: `margin=1in` (all margins), `hmargin=2cm` (horizontal), `vmargin=3cm` (vertical), `bindingoffset=5mm`, `landscape`.

### graphicx — Images

```latex
\usepackage{graphicx}

\includegraphics[width=0.8\textwidth]{image.png}
\includegraphics[height=5cm, keepaspectratio]{image.pdf}
\includegraphics[scale=0.5, angle=90]{image.jpg}
```

Options: `width`, `height`, `scale`, `angle`, `trim=left bottom right top`, `clip`, `keepaspectratio`, `page=N` (for multi-page PDFs).

Graphics path: `\graphicspath{{images/}{figures/}}` sets search directories.

### hyperref — Hyperlinks and PDF Metadata

```latex
\usepackage[
  colorlinks=true,
  linkcolor=blue,
  citecolor=green,
  urlcolor=cyan,
  pdfauthor={Author Name},
  pdftitle={Document Title},
  pdfsubject={Subject},
  bookmarks=true
]{hyperref}
```

**Important:** Load `hyperref` as one of the last packages (before `cleveref`).

Commands: `\href{url}{text}`, `\url{url}`, `\hyperref[label]{text}`, `\autoref{label}`, `\nameref{label}`.

### babel — Multilingual Support

```latex
\usepackage[english]{babel}
\usepackage[brazilian]{babel}
\usepackage[french, english]{babel}  % English is main, French available
```

Sets hyphenation rules, date formats, and localized strings (e.g., "Chapter" becomes "Chapitre" in French).

### fontenc and inputenc

```latex
\usepackage[T1]{fontenc}      % Output encoding (accented characters)
\usepackage[utf8]{inputenc}   % Input encoding (mostly unnecessary with modern engines)
```

Note: With LuaLaTeX or XeLaTeX, use `fontspec` instead:

```latex
\usepackage{fontspec}
\setmainfont{Linux Libertine}
\setsansfont{Linux Biolinum}
\setmonofont{Fira Code}
```

### listings — Code Listings

```latex
\usepackage{listings}

\lstset{
  language=Python,
  basicstyle=\ttfamily\small,
  keywordstyle=\color{blue}\bfseries,
  commentstyle=\color{gray}\itshape,
  stringstyle=\color{red},
  numbers=left,
  numberstyle=\tiny\color{gray},
  stepnumber=1,
  numbersep=8pt,
  frame=single,
  breaklines=true,
  captionpos=b,
  tabsize=2,
  showstringspaces=false
}

\begin{lstlisting}[caption={Hello World}, label=lst:hello]
def hello():
    print("Hello, World!")
\end{lstlisting}
```

Supported languages: Python, Java, C, C++, JavaScript, HTML, SQL, R, Matlab, Bash, Haskell, Perl, Ruby, and many more.

Inline code: `\lstinline|print("hello")|` or `\lstinline{code}`.

### minted — Syntax-Highlighted Code (requires Pygments)

```latex
\usepackage{minted}

\begin{minted}[
  linenos,
  frame=lines,
  fontsize=\small,
  bgcolor=lightgray!20
]{python}
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\end{minted}
```

Requires `-shell-escape` flag during compilation. Provides superior syntax highlighting via Pygments.

### tikz — Vector Graphics

```latex
\usepackage{tikz}
\usetikzlibrary{arrows.meta, calc, positioning, shapes.geometric}
```

Basic drawing:

```latex
\begin{tikzpicture}
  % Line
  \draw (0,0) -- (2,0) -- (2,2) -- cycle;
  % Circle
  \draw[fill=blue!20] (3,1) circle (0.5);
  % Rectangle
  \draw[rounded corners, thick] (5,0) rectangle (7,2);
  % Arrow
  \draw[->, thick, red] (0,3) -- (7,3);
  % Node
  \node[draw, circle] at (4,4) {A};
\end{tikzpicture}
```

### pgfplots — Scientific Plots

```latex
\usepackage{pgfplots}
\pgfplotsset{compat=1.18}

\begin{tikzpicture}
\begin{axis}[
  title={Function Plot},
  xlabel={$x$},
  ylabel={$f(x)$},
  grid=major,
  legend pos=north west
]
  \addplot[blue, thick, domain=-3:3, samples=100]{x^2};
  \addlegendentry{$x^2$}
  \addplot[red, dashed, domain=-3:3, samples=100]{x^3};
  \addlegendentry{$x^3$}
\end{axis}
\end{tikzpicture}
```

### booktabs — Professional Tables

```latex
\usepackage{booktabs}

\begin{table}[htbp]
  \centering
  \caption{Experimental Results}
  \label{tab:results}
  \begin{tabular}{lcc}
    \toprule
    Method & Accuracy & F1 Score \\
    \midrule
    Baseline  & 0.82 & 0.79 \\
    Proposed  & 0.91 & 0.88 \\
    Enhanced  & 0.94 & 0.92 \\
    \bottomrule
  \end{tabular}
\end{table}
```

Rules: `\toprule` (top), `\midrule` (middle), `\bottomrule` (bottom), `\cmidrule{2-3}` (partial rule). Never use `\hline` with `booktabs`.

### multirow — Multi-Row Table Cells

```latex
\usepackage{multirow}

\begin{tabular}{lcc}
  \toprule
  \multirow{2}{*}{Category} & \multicolumn{2}{c}{Scores} \\
  \cmidrule(lr){2-3}
  & Train & Test \\
  \midrule
  A & 95 & 90 \\
  B & 88 & 85 \\
  \bottomrule
\end{tabular}
```

### xcolor — Colors

```latex
\usepackage[dvipsnames, svgnames, x11names]{xcolor}
```

Predefined colors: `red`, `green`, `blue`, `cyan`, `magenta`, `yellow`, `black`, `white`, `gray`, `darkgray`, `lightgray`, `brown`, `lime`, `olive`, `orange`, `pink`, `purple`, `teal`, `violet`.

With `dvipsnames`: `ForestGreen`, `RoyalBlue`, `Maroon`, `NavyBlue`, `Orchid`, `RedOrange`, `Salmon`, `Turquoise`, and more.

Custom colors:

```latex
\definecolor{myblue}{RGB}{0, 102, 204}
\definecolor{mygray}{HTML}{F5F5F5}
\definecolor{accent}{rgb}{0.8, 0.2, 0.1}

\textcolor{myblue}{Blue text}
\colorbox{yellow}{Highlighted text}
\fcolorbox{red}{white}{Boxed text}
```

Color mixing: `blue!50!red` (50% blue, 50% red), `green!30` (30% green, 70% white).

### fancyhdr — Custom Headers and Footers

```latex
\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhf{}  % Clear all

\fancyhead[L]{\leftmark}   % Section name on left
\fancyhead[R]{\thepage}    % Page number on right
\fancyfoot[C]{Draft — \today}
\renewcommand{\headrulewidth}{0.4pt}
\renewcommand{\footrulewidth}{0.4pt}
```

Selectors: `L` (left), `C` (center), `R` (right), `LE` (left even), `RO` (right odd).

### titlesec — Custom Section Formatting

```latex
\usepackage{titlesec}

\titleformat{\section}
  {\Large\bfseries\sffamily}  % Format
  {\thesection}                % Label
  {1em}                        % Sep between label and title
  {}                           % Before code
  [\titlerule]                 % After code

\titlespacing{\section}
  {0pt}     % Left margin
  {12pt}    % Before spacing
  {6pt}     % After spacing
```

### natbib — Bibliography (Traditional)

```latex
\usepackage[round, sort&compress]{natbib}

\cite{key}          % Jones et al. (1990)
\citep{key}         % (Jones et al., 1990)
\citet{key}         % Jones et al. (1990)
\citep[p.~5]{key}   % (Jones et al., 1990, p. 5)

\bibliographystyle{plainnat}
\bibliography{references}
```

Styles: `plainnat`, `abbrvnat`, `unsrtnat`, `apalike`, `ieeetr`, `acm`.

### biblatex — Modern Bibliography

```latex
\usepackage[
  backend=biber,
  style=authoryear,
  sorting=nyt,
  maxbibnames=10
]{biblatex}
\addbibresource{references.bib}

\cite{key}
\parencite{key}     % (Author, Year)
\textcite{key}      % Author (Year)
\footcite{key}      % Footnote citation

\printbibliography
```

Styles: `authoryear`, `numeric`, `alphabetic`, `apa`, `ieee`, `chicago-authordate`, `mla`.

### caption and subcaption

```latex
\usepackage{caption}
\usepackage{subcaption}

\captionsetup{
  font=small,
  labelfont=bf,
  format=hang,
  margin=10pt
}

\begin{figure}[htbp]
  \centering
  \begin{subfigure}[b]{0.45\textwidth}
    \includegraphics[width=\textwidth]{fig1}
    \caption{First subfigure}
    \label{fig:sub1}
  \end{subfigure}
  \hfill
  \begin{subfigure}[b]{0.45\textwidth}
    \includegraphics[width=\textwidth]{fig2}
    \caption{Second subfigure}
    \label{fig:sub2}
  \end{subfigure}
  \caption{Overall caption}
  \label{fig:both}
\end{figure}
```

### float — Float Placement Control

```latex
\usepackage{float}

\begin{figure}[H]  % Force "here" placement
  \centering
  \includegraphics[width=0.5\textwidth]{image}
  \caption{Placed exactly here}
\end{figure}
```

Specifiers: `h` (here), `t` (top), `b` (bottom), `p` (separate page), `H` (force here, requires float package), `!` (override restrictions).

### algorithm2e — Algorithms

```latex
\usepackage[ruled, linesnumbered]{algorithm2e}

\begin{algorithm}[H]
  \SetAlgoLined
  \KwIn{Array $A$ of $n$ elements}
  \KwOut{Sorted array $A$}
  \For{$i \leftarrow 1$ \KwTo $n-1$}{
    $key \leftarrow A[i]$\;
    $j \leftarrow i - 1$\;
    \While{$j \geq 0$ \textbf{and} $A[j] > key$}{
      $A[j+1] \leftarrow A[j]$\;
      $j \leftarrow j - 1$\;
    }
    $A[j+1] \leftarrow key$\;
  }
  \caption{Insertion Sort}
\end{algorithm}
```

### enumitem — Custom Lists

```latex
\usepackage{enumitem}

\begin{enumerate}[label=(\alph*), start=1, itemsep=5pt]
  \item First
  \item Second
\end{enumerate}

\begin{itemize}[label=\textbullet, leftmargin=2cm, nosep]
  \item Compact item
  \item Another item
\end{itemize}
```

Label formats: `\arabic*`, `\alph*`, `\Alph*`, `\roman*`, `\Roman*`.

### siunitx — Units and Numbers

```latex
\usepackage{siunitx}

\qty{9.81}{\meter\per\second\squared}   % 9.81 m/s^2
\num{1.23e4}                             % 1.23 x 10^4
\ang{45}                                 % 45 degrees
\SI{100}{\kilo\hertz}                    % 100 kHz (v2 syntax)
```

### cleveref — Smart Cross-References

```latex
\usepackage{cleveref}  % Load AFTER hyperref

\cref{fig:plot}        % Figure 1
\Cref{fig:plot}        % Figure 1 (start of sentence)
\cref{eq:1,eq:2,eq:3}  % Equations (1) to (3)
```

### tcolorbox — Colored Boxes

```latex
\usepackage[most]{tcolorbox}

\begin{tcolorbox}[
  colback=blue!5,
  colframe=blue!75,
  title={Important Note},
  fonttitle=\bfseries
]
  This is a colored box with a title.
\end{tcolorbox}
```

### microtype — Microtypography

```latex
\usepackage{microtype}
```

Improves text appearance with character protrusion, font expansion, and tracking. Load it and let it work automatically — highly recommended for any document.

### setspace — Line Spacing

```latex
\usepackage{setspace}
\onehalfspacing       % 1.5 line spacing
% \doublespacing      % Double spacing
% \singlespacing      % Single spacing
```

### parskip — Paragraph Spacing

```latex
\usepackage{parskip}
```

Replaces paragraph indentation with vertical spacing. Clean look for many document types.

---

## Section 3: Common Document Templates

### Academic Article

```latex
\documentclass[12pt, a4paper]{article}

\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[english]{babel}
\usepackage{amsmath, amssymb, amsthm}
\usepackage[margin=2.5cm]{geometry}
\usepackage{graphicx}
\usepackage{booktabs}
\usepackage{hyperref}
\usepackage{cleveref}
\usepackage{microtype}

\theoremstyle{plain}
\newtheorem{theorem}{Theorem}[section]
\newtheorem{lemma}[theorem]{Lemma}
\newtheorem{corollary}[theorem]{Corollary}
\theoremstyle{definition}
\newtheorem{definition}{Definition}[section]
\theoremstyle{remark}
\newtheorem{remark}{Remark}

\title{Your Article Title}
\author{Author One\thanks{University A} \and Author Two\thanks{University B}}
\date{\today}

\begin{document}

\maketitle

\begin{abstract}
  Your abstract text here. Keep it concise and informative.
\end{abstract}

\section{Introduction}
\label{sec:intro}

Your introduction text.

\section{Methods}
\label{sec:methods}

\section{Results}
\label{sec:results}

\section{Conclusion}
\label{sec:conclusion}

\bibliographystyle{plainnat}
\bibliography{references}

\end{document}
```

### Technical Report

```latex
\documentclass[12pt, a4paper]{report}

\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[english]{babel}
\usepackage{amsmath, amssymb}
\usepackage[margin=2.5cm]{geometry}
\usepackage{graphicx}
\usepackage{booktabs}
\usepackage{listings}
\usepackage{xcolor}
\usepackage{hyperref}
\usepackage{fancyhdr}
\usepackage{microtype}

\pagestyle{fancy}
\fancyhf{}
\fancyhead[L]{\leftmark}
\fancyhead[R]{\thepage}

\title{Technical Report Title}
\author{Author Name \\ Organization}
\date{Version 1.0 — \today}

\begin{document}

\maketitle
\tableofcontents
\listoffigures
\listoftables

\chapter{Introduction}
Overview of the project.

\chapter{Architecture}
System design details.

\chapter{Implementation}
Code and technical details.

\chapter{Testing}
Test results.

\chapter{Conclusion}
Summary and future work.

\appendix
\chapter{Additional Data}

\end{document}
```

### CV/Resume — Modern Style

```latex
\documentclass[11pt, a4paper]{article}

\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[margin=1.5cm]{geometry}
\usepackage{xcolor}
\usepackage{hyperref}
\usepackage{titlesec}
\usepackage{enumitem}
\usepackage{fontawesome5}
\usepackage{parskip}

\definecolor{primary}{HTML}{2B3A67}
\definecolor{accent}{HTML}{496A81}

\titleformat{\section}{\large\bfseries\color{primary}}{}{0em}{}[\titlerule]
\titlespacing{\section}{0pt}{12pt}{6pt}

\pagestyle{empty}

\begin{document}

\begin{center}
  {\Huge\bfseries\color{primary} Your Name} \\[6pt]
  \faEnvelope\ \href{mailto:email@example.com}{email@example.com} \quad
  \faPhone\ +1 (234) 567-8900 \quad
  \faLinkedin\ \href{https://linkedin.com/in/yourname}{yourname} \quad
  \faGithub\ \href{https://github.com/yourname}{yourname}
\end{center}

\section{Education}

\textbf{University Name} \hfill City, Country \\
\textit{M.Sc. Computer Science} \hfill Sep 2022 -- Jun 2024
\begin{itemize}[nosep, leftmargin=*]
  \item GPA: 3.9/4.0
  \item Thesis: ``Your thesis title here''
\end{itemize}

\section{Experience}

\textbf{Company Name} \hfill City, Country \\
\textit{Software Engineer} \hfill Jan 2024 -- Present
\begin{itemize}[nosep, leftmargin=*]
  \item Developed feature X, improving performance by 30\%
  \item Led team of 5 engineers on project Y
\end{itemize}

\section{Skills}

\textbf{Languages:} Python, Java, C++, JavaScript \\
\textbf{Tools:} Git, Docker, Kubernetes, AWS

\section{Publications}

Author, A. and Author, B. (2024). ``Paper Title.'' \textit{Journal Name}, 10(2), 100--110.

\end{document}
```

### CV/Resume — Academic Style

```latex
\documentclass[11pt, a4paper]{article}

\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[margin=2cm]{geometry}
\usepackage{hyperref}
\usepackage{enumitem}

\pagestyle{empty}

\newcommand{\cvsection}[1]{%
  \vspace{10pt}%
  {\Large\bfseries #1}%
  \vspace{4pt}%
  \hrule
  \vspace{6pt}%
}

\begin{document}

{\LARGE\bfseries Your Name} \\[4pt]
Department of Computer Science \\
University Name, City, Country \\
\href{mailto:email@university.edu}{email@university.edu}

\cvsection{Research Interests}
Machine learning, natural language processing, computer vision.

\cvsection{Education}
\textbf{Ph.D. Computer Science}, University Name \hfill 2020--2024 \\
\textbf{M.Sc. Computer Science}, University Name \hfill 2018--2020 \\
\textbf{B.Sc. Mathematics}, University Name \hfill 2014--2018

\cvsection{Publications}
\begin{enumerate}[label={[\arabic*]}, leftmargin=*]
  \item Author et al. ``Paper title.'' \textit{Conference}, 2024.
  \item Author et al. ``Another paper.'' \textit{Journal}, 2023.
\end{enumerate}

\cvsection{Teaching}
Teaching Assistant, CS 101 — Introduction to Programming \hfill Fall 2022

\cvsection{Awards}
Best Paper Award, Conference Name \hfill 2023

\end{document}
```

### Beamer Presentation

```latex
\documentclass{beamer}
\usetheme{Madrid}
\usecolortheme{default}

\usepackage[utf8]{inputenc}
\usepackage{amsmath, amssymb}
\usepackage{graphicx}
\usepackage{booktabs}
\usepackage{tikz}

\title[Short Title]{Full Presentation Title}
\subtitle{An Optional Subtitle}
\author{Author Name}
\institute{University / Organization}
\date{\today}

\begin{document}

\begin{frame}
  \titlepage
\end{frame}

\begin{frame}{Outline}
  \tableofcontents
\end{frame}

\section{Introduction}

\begin{frame}{Introduction}
  \begin{itemize}
    \item<1-> First point (appears on click 1)
    \item<2-> Second point (appears on click 2)
    \item<3-> Third point (appears on click 3)
  \end{itemize}
\end{frame}

\section{Results}

\begin{frame}{Results Table}
  \begin{table}
    \centering
    \begin{tabular}{lcc}
      \toprule
      Method & Accuracy & Speed \\
      \midrule
      A & 95\% & Fast \\
      B & 98\% & Slow \\
      \bottomrule
    \end{tabular}
    \caption{Comparison of methods}
  \end{table}
\end{frame}

\begin{frame}{Math Example}
  \begin{theorem}[Pythagorean]
    For a right triangle with legs $a$, $b$ and hypotenuse $c$:
    \begin{equation}
      a^2 + b^2 = c^2
    \end{equation}
  \end{theorem}
\end{frame}

\section{Conclusion}

\begin{frame}{Conclusion}
  \begin{block}{Summary}
    Key takeaways from this presentation.
  \end{block}
  \begin{alertblock}{Important}
    Something critical to remember.
  \end{alertblock}
  \begin{exampleblock}{Example}
    An illustrative example.
  \end{exampleblock}
\end{frame}

\begin{frame}{References}
  \bibliography{references}
  \bibliographystyle{apalike}
\end{frame}

\end{document}
```

### Formal Letter

```latex
\documentclass[12pt, a4paper]{letter}

\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[margin=2.5cm]{geometry}
\usepackage{hyperref}

\signature{Your Name \\ Your Title}
\address{Your Address \\ City, ZIP \\ Country}

\begin{document}

\begin{letter}{Recipient Name \\ Recipient Organization \\ Address \\ City, ZIP}

\opening{Dear Mr./Ms. Recipient,}

I am writing to you regarding...

Second paragraph with more details.

\closing{Sincerely,}

\encl{Document 1 \\ Document 2}
\cc{Person A \\ Person B}

\end{letter}

\end{document}
```

### Thesis Template

```latex
\documentclass[12pt, a4paper, twoside, openright]{book}

\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[english]{babel}
\usepackage{amsmath, amssymb, amsthm}
\usepackage[margin=2.5cm, bindingoffset=1cm]{geometry}
\usepackage{graphicx}
\usepackage{booktabs}
\usepackage{setspace}
\usepackage{fancyhdr}
\usepackage{hyperref}
\usepackage{cleveref}
\usepackage{microtype}

\onehalfspacing

\pagestyle{fancy}
\fancyhf{}
\fancyhead[LE]{\leftmark}
\fancyhead[RO]{\rightmark}
\fancyfoot[C]{\thepage}

\theoremstyle{plain}
\newtheorem{theorem}{Theorem}[chapter]
\newtheorem{lemma}[theorem]{Lemma}
\theoremstyle{definition}
\newtheorem{definition}{Definition}[chapter]

\begin{document}

\frontmatter

\begin{titlepage}
  \centering
  \vspace*{2cm}
  {\Huge\bfseries Thesis Title \par}
  \vspace{1.5cm}
  {\Large Author Name \par}
  \vspace{1cm}
  {\large A thesis submitted for the degree of \\ Doctor of Philosophy \par}
  \vspace{1cm}
  {\large Department of Computer Science \\ University Name \par}
  \vspace{1cm}
  {\large \today \par}
  \vfill
  \includegraphics[width=3cm]{university-logo}
\end{titlepage}

\chapter*{Abstract}
Your abstract here.

\chapter*{Acknowledgements}
Thanks to everyone.

\tableofcontents
\listoffigures
\listoftables

\mainmatter

\chapter{Introduction}
\label{ch:intro}
\section{Background}
\section{Motivation}
\section{Contributions}
\section{Outline}

\chapter{Literature Review}
\label{ch:literature}

\chapter{Methodology}
\label{ch:methods}

\chapter{Results}
\label{ch:results}

\chapter{Discussion}
\label{ch:discussion}

\chapter{Conclusion}
\label{ch:conclusion}

\backmatter

\bibliographystyle{plainnat}
\bibliography{references}

\appendix
\chapter{Supplementary Material}

\end{document}
```

### Book Chapter

```latex
\documentclass[12pt, a4paper]{book}

\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{amsmath}
\usepackage[margin=2.5cm]{geometry}
\usepackage{graphicx}
\usepackage{hyperref}
\usepackage{microtype}

\begin{document}

\chapter{Chapter Title}
\label{ch:title}

\section{First Section}
\label{sec:first}

Content of the first section.

\subsection{A Subsection}

More detailed content.

\subsubsection{Even More Detail}

Very specific content.

\section{Second Section}

\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.6\textwidth]{figure}
  \caption{A descriptive caption.}
  \label{fig:example}
\end{figure}

As shown in \cref{fig:example}, ...

\end{document}
```

---

## Section 4: Math Typesetting

### Inline vs Display Math

```latex
Inline: $E = mc^2$ or \(E = mc^2\)

Display (unnumbered):
\[ E = mc^2 \]

Display (numbered):
\begin{equation}
  E = mc^2
  \label{eq:einstein}
\end{equation}
```

### Fractions and Binomials

```latex
\frac{a}{b}          % Standard fraction
\dfrac{a}{b}         % Display-style fraction (larger)
\tfrac{a}{b}         % Text-style fraction (smaller)
\cfrac{1}{1+\cfrac{1}{2}}  % Continued fraction
\binom{n}{k}         % Binomial coefficient
```

### Subscripts and Superscripts

```latex
x_i               % Subscript
x^2               % Superscript
x_{ij}            % Multi-character subscript
x^{n+1}           % Multi-character superscript
x_i^2             % Both
{}^{14}_{6}C      % Pre-scripts (isotope notation)
```

### Common Math Symbols

```latex
% Greek letters
\alpha \beta \gamma \delta \epsilon \varepsilon \zeta \eta \theta
\vartheta \iota \kappa \lambda \mu \nu \xi \pi \rho \sigma
\tau \upsilon \phi \varphi \chi \psi \omega
\Gamma \Delta \Theta \Lambda \Xi \Pi \Sigma \Phi \Psi \Omega

% Operators
\sum_{i=1}^{n}     \prod_{i=1}^{n}    \int_{a}^{b}
\iint              \iiint              \oint
\lim_{x \to 0}     \sup               \inf
\max               \min               \log
\ln                \exp               \sin \cos \tan

% Relations
\leq  \geq  \neq  \approx  \equiv  \sim  \simeq
\propto  \ll  \gg  \subset  \supset  \subseteq  \supseteq
\in  \notin  \ni  \forall  \exists  \nexists

% Arrows
\rightarrow  \leftarrow  \leftrightarrow
\Rightarrow  \Leftarrow  \Leftrightarrow
\mapsto  \longmapsto  \hookrightarrow
\xrightarrow{text}  \xrightarrow[below]{above}

% Dots
\ldots  \cdots  \vdots  \ddots

% Accents
\hat{a}  \bar{a}  \vec{a}  \tilde{a}  \dot{a}  \ddot{a}
\widehat{abc}  \widetilde{abc}  \overline{abc}  \underline{abc}
\overbrace{abc}^{text}  \underbrace{abc}_{text}

% Miscellaneous
\infty  \partial  \nabla  \hbar  \ell  \Re  \Im
\aleph  \wp  \emptyset  \varnothing
\angle  \triangle  \square  \diamond  \star
```

### Aligned Equations

```latex
\begin{align}
  f(x) &= (x+1)(x-1) \\
       &= x^2 - 1
\end{align}

% Multiple alignment points
\begin{alignat}{2}
  x &= a + b  &\quad y &= c + d \\
  x' &= a' + b' &\quad y' &= c' + d'
\end{alignat}

% Gathered (centered, no alignment)
\begin{gather}
  x + y = z \\
  a = b + c
\end{gather}
```

### Matrices

```latex
% Parentheses
\begin{pmatrix} a & b \\ c & d \end{pmatrix}

% Brackets
\begin{bmatrix} 1 & 0 \\ 0 & 1 \end{bmatrix}

% Braces
\begin{Bmatrix} x \\ y \end{Bmatrix}

% Determinant
\begin{vmatrix} a & b \\ c & d \end{vmatrix}

% Small matrix (inline)
$\bigl(\begin{smallmatrix} a & b \\ c & d \end{smallmatrix}\bigr)$

% Large matrix with dots
\begin{pmatrix}
  a_{11} & a_{12} & \cdots & a_{1n} \\
  a_{21} & a_{22} & \cdots & a_{2n} \\
  \vdots & \vdots & \ddots & \vdots \\
  a_{m1} & a_{m2} & \cdots & a_{mn}
\end{pmatrix}
```

### Theorem Environments

```latex
\usepackage{amsthm}

\theoremstyle{plain}    % Italic body
\newtheorem{theorem}{Theorem}[section]
\newtheorem{proposition}[theorem]{Proposition}
\newtheorem{lemma}[theorem]{Lemma}
\newtheorem{corollary}[theorem]{Corollary}

\theoremstyle{definition}  % Normal body
\newtheorem{definition}{Definition}[section]
\newtheorem{example}{Example}[section]

\theoremstyle{remark}      % Italic label, normal body
\newtheorem*{remark}{Remark}
\newtheorem*{note}{Note}

% Usage
\begin{theorem}[Fundamental Theorem]
  \label{thm:fund}
  Every continuous function on $[a,b]$ is integrable.
\end{theorem}

\begin{proof}
  The proof follows from... \qedhere
\end{proof}
```

### Delimiters

```latex
\left( \frac{a}{b} \right)
\left[ \sum_{i=1}^{n} x_i \right]
\left\{ x \in \mathbb{R} \mid x > 0 \right\}
\left\langle v, w \right\rangle
\left| x \right|
\left\| v \right\|
\left\lfloor x \right\rfloor
\left\lceil x \right\rceil

% Manual sizing
\bigl( \Bigl( \biggl( \Biggl(
```

### Spacing in Math

```latex
\,    % thin space (3/18 em)
\:    % medium space (4/18 em)
\;    % thick space (5/18 em)
\!    % negative thin space
\quad % em space
\qquad % 2em space
```

### Math Fonts

```latex
\mathrm{text}     % Roman
\mathit{text}     % Italic
\mathbf{text}     % Bold
\mathsf{text}     % Sans-serif
\mathtt{text}     % Monospace
\mathcal{ABC}     % Calligraphic
\mathbb{R}        % Blackboard bold
\mathfrak{g}      % Fraktur
\boldsymbol{\alpha} % Bold Greek
```

---

## Section 5: Tables and Figures

### Simple Table

```latex
\begin{table}[htbp]
  \centering
  \caption{A Simple Table}
  \label{tab:simple}
  \begin{tabular}{lcr}
    \toprule
    Left & Center & Right \\
    \midrule
    Data & Data & Data \\
    More & More & More \\
    \bottomrule
  \end{tabular}
\end{table}
```

Column types: `l` (left), `c` (center), `r` (right), `p{3cm}` (paragraph with width), `m{3cm}` (vertical center paragraph), `b{3cm}` (bottom-aligned paragraph).

### Complex Table with Booktabs

```latex
\begin{table}[htbp]
  \centering
  \caption{Experimental Results Across Datasets}
  \label{tab:results}
  \begin{tabular}{l *{3}{S[table-format=2.1]}}
    \toprule
    & \multicolumn{3}{c}{Accuracy (\%)} \\
    \cmidrule(lr){2-4}
    Method & {Dataset A} & {Dataset B} & {Dataset C} \\
    \midrule
    Baseline     & 82.3 & 75.1 & 68.9 \\
    Method 1     & 88.7 & 81.4 & 74.2 \\
    Method 2     & 91.2 & 84.6 & 79.8 \\
    \addlinespace
    Ours         & 94.1 & 88.3 & 83.5 \\
    Ours (large) & 95.6 & 90.1 & 86.2 \\
    \bottomrule
  \end{tabular}
\end{table}
```

### Multi-row and Multi-column

```latex
\usepackage{multirow}

\begin{tabular}{llcc}
  \toprule
  \multirow{2}{*}{Category} & \multirow{2}{*}{Sub-cat} & \multicolumn{2}{c}{Metrics} \\
  \cmidrule(lr){3-4}
  & & Precision & Recall \\
  \midrule
  \multirow{2}{*}{Group A}
    & Type 1 & 0.92 & 0.88 \\
    & Type 2 & 0.85 & 0.91 \\
  \midrule
  \multirow{2}{*}{Group B}
    & Type 1 & 0.78 & 0.82 \\
    & Type 2 & 0.90 & 0.86 \\
  \bottomrule
\end{tabular}
```

### Long Tables (Spanning Pages)

```latex
\usepackage{longtable}

\begin{longtable}{lcc}
  \caption{Long Table Example} \label{tab:long} \\
  \toprule
  Name & Value & Description \\
  \midrule
  \endfirsthead

  \multicolumn{3}{c}{\tablename\ \thetable{} -- continued} \\
  \toprule
  Name & Value & Description \\
  \midrule
  \endhead

  \midrule
  \multicolumn{3}{r}{Continued on next page...} \\
  \endfoot

  \bottomrule
  \endlastfoot

  Row 1 & 1 & First \\
  Row 2 & 2 & Second \\
  % ... many more rows ...
\end{longtable}
```

### Tabularx — Tables with Auto-Width Columns

```latex
\usepackage{tabularx}

\begin{table}[htbp]
  \centering
  \begin{tabularx}{\textwidth}{lXXr}
    \toprule
    ID & Description & Notes & Value \\
    \midrule
    1 & This column stretches to fill space & Additional notes here & 42 \\
    2 & Another entry & More notes & 73 \\
    \bottomrule
  \end{tabularx}
\end{table}
```

### Figure Placement

```latex
\begin{figure}[htbp]
  \centering
  \includegraphics[width=0.7\textwidth]{plot.pdf}
  \caption{A descriptive caption explaining what the figure shows.}
  \label{fig:plot}
\end{figure}
```

### Subfigures

```latex
\usepackage{subcaption}

\begin{figure}[htbp]
  \centering
  \begin{subfigure}[b]{0.32\textwidth}
    \centering
    \includegraphics[width=\textwidth]{fig_a}
    \caption{First result}
    \label{fig:result_a}
  \end{subfigure}
  \hfill
  \begin{subfigure}[b]{0.32\textwidth}
    \centering
    \includegraphics[width=\textwidth]{fig_b}
    \caption{Second result}
    \label{fig:result_b}
  \end{subfigure}
  \hfill
  \begin{subfigure}[b]{0.32\textwidth}
    \centering
    \includegraphics[width=\textwidth]{fig_c}
    \caption{Third result}
    \label{fig:result_c}
  \end{subfigure}
  \caption{Overall comparison of results.}
  \label{fig:comparison}
\end{figure}
```

### Wrapping Text Around Figures

```latex
\usepackage{wrapfig}

\begin{wrapfigure}{r}{0.4\textwidth}
  \centering
  \includegraphics[width=0.38\textwidth]{small_fig}
  \caption{A wrapped figure.}
  \label{fig:wrapped}
\end{wrapfigure}

Text that wraps around the figure goes here. It will flow
around the image naturally.
```

Position: `r` (right), `l` (left), `i` (inner), `o` (outer).

### Rotating Figures and Tables

```latex
\usepackage{rotating}

\begin{sidewaysfigure}
  \centering
  \includegraphics[width=\textwidth]{wide_figure}
  \caption{A landscape figure.}
\end{sidewaysfigure}

\begin{sidewaystable}
  \centering
  \caption{A landscape table.}
  \begin{tabular}{lccccc}
    % wide table content
  \end{tabular}
\end{sidewaystable}
```

---

## Section 6: Bibliography

### BibTeX Entry Types

```bibtex
@article{key,
  author  = {Last, First and Last, First},
  title   = {Article Title},
  journal = {Journal Name},
  year    = {2024},
  volume  = {10},
  number  = {2},
  pages   = {100--120},
  doi     = {10.1234/example}
}

@book{key,
  author    = {Author Name},
  title     = {Book Title},
  publisher = {Publisher},
  year      = {2024},
  edition   = {3rd},
  isbn      = {978-0-123456-78-9}
}

@inproceedings{key,
  author    = {Author, A. and Author, B.},
  title     = {Paper Title},
  booktitle = {Proceedings of Conference},
  year      = {2024},
  pages     = {1--10},
  publisher = {ACM}
}

@phdthesis{key,
  author = {Student Name},
  title  = {Thesis Title},
  school = {University Name},
  year   = {2024}
}

@misc{key,
  author       = {Author},
  title        = {Title},
  howpublished = {\url{https://example.com}},
  year         = {2024},
  note         = {Accessed: 2024-01-15}
}

@online{key,
  author  = {Author},
  title   = {Web Page Title},
  url     = {https://example.com},
  urldate = {2024-01-15},
  year    = {2024}
}
```

### natbib Commands

```latex
\cite{key}           % Jones et al. (1990)
\citep{key}          % (Jones et al., 1990)
\citet{key}          % Jones et al. (1990)
\citep[p.~5]{key}    % (Jones et al., 1990, p. 5)
\citep[see][]{key}   % (see Jones et al., 1990)
\citeauthor{key}     % Jones et al.
\citeyear{key}       % 1990
\citep{key1,key2}    % (Jones, 1990; Smith, 1995)
```

### biblatex Commands

```latex
\cite{key}           % Author (Year) or [1]
\parencite{key}      % (Author, Year) or [1]
\textcite{key}       % Author (Year)
\footcite{key}       % Footnote citation
\autocite{key}       % Style-dependent
\fullcite{key}       % Full citation in text
\citeauthor{key}     % Author only
\citeyear{key}       % Year only
\citetitle{key}      % Title only
```

### Bibliography Styles Comparison

natbib styles:
- `plainnat` — numbered, sorted alphabetically
- `abbrvnat` — abbreviated first names
- `unsrtnat` — numbered in citation order
- `apalike` — APA-like author-year

biblatex styles:
- `numeric` — [1], [2], [3]
- `alphabetic` — [Knu86], [Lam94]
- `authoryear` — (Knuth, 1986)
- `apa` — APA 7th edition
- `ieee` — IEEE format
- `chicago-authordate` — Chicago style

---

## Section 7: Troubleshooting

### Common Compilation Errors

**"Undefined control sequence"**
Cause: Using a command without loading its package.
Fix: Add the appropriate `\usepackage{}` in the preamble.

```latex
% Error: \textcolor undefined
% Fix: Add \usepackage{xcolor}

% Error: \includegraphics undefined
% Fix: Add \usepackage{graphicx}

% Error: \toprule undefined
% Fix: Add \usepackage{booktabs}
```

**"Missing $ inserted"**
Cause: Using math-mode commands outside of math mode, or special characters without escaping.
Fix: Wrap in `$...$` or escape the character.

```latex
% Error: x_i outside math
% Fix: $x_i$

% Error: Using _ in text
% Fix: \_ or use within math mode
```

**"Environment undefined"**
Cause: Using an environment from a package not loaded.
Fix: Load the package.

```latex
% Error: \begin{align} undefined
% Fix: \usepackage{amsmath}

% Error: \begin{lstlisting} undefined
% Fix: \usepackage{listings}
```

**"File not found"**
Cause: Image or input file not in search path.
Fix: Check path, use `\graphicspath`, or provide full path.

```latex
\graphicspath{{images/}{figures/}{./}}
```

**"Too many unprocessed floats"**
Cause: Too many figures/tables without enough text to place them.
Fix: Add `\clearpage`, use `[H]` placement, or adjust float parameters.

```latex
\usepackage{float}
\begin{figure}[H]  % Force here
  ...
\end{figure}

% Or adjust float parameters
\renewcommand{\topfraction}{0.9}
\renewcommand{\bottomfraction}{0.8}
\renewcommand{\textfraction}{0.1}
\renewcommand{\floatpagefraction}{0.7}
```

**"Overfull \hbox"**
Cause: Text or image too wide for the column.
Fix: Reduce width, allow hyphenation, use `\sloppy`, or adjust content.

```latex
% Allow more flexible line breaking
\sloppy

% Or for specific paragraphs
\begin{sloppypar}
  Your text here...
\end{sloppypar}

% Or adjust specific words
\hyphenation{spe-ci-fi-ca-tion}
```

**"LaTeX Error: Option clash for package"**
Cause: A package is loaded with different options in two places.
Fix: Load the package once with all options, or use `\PassOptionsToPackage` before `\documentclass`.

```latex
% Before \documentclass
\PassOptionsToPackage{dvipsnames}{xcolor}
\documentclass{article}
\usepackage{xcolor}
```

**"Counter too large"**
Cause: Using more than 26 items with alphabetic numbering, or similar overflow.
Fix: Switch to numeric labeling or reset counters.

**"Missing \begin{document}"**
Cause: Content before `\begin{document}` or encoding issue (BOM in file).
Fix: Move content after `\begin{document}` or save file as UTF-8 without BOM.

**"! Extra alignment tab character &"**
Cause: More `&` separators than columns defined in tabular.
Fix: Match number of `&` to column count minus one.

**"Misplaced \noalign"**
Cause: Using `\hline` or `\toprule` after `\\` with trailing spaces or comments.
Fix: Ensure nothing between `\\` and the rule command.

### Package Conflicts

**hyperref conflicts:**
- Load `hyperref` near the end of the preamble
- Load `cleveref` after `hyperref`
- Some packages require specific loading order with hyperref

**xcolor conflicts:**
- If both `tikz` and another package load `xcolor` with different options, use `\PassOptionsToPackage`
- Load `xcolor` before `tikz` if custom options are needed

**babel and other packages:**
- Some packages redefine commands that `babel` also changes
- Use `\shorthandoff` to disable babel shorthands when they conflict

**fontenc and special characters:**
- `[T1]{fontenc}` changes how characters are encoded in the PDF
- May affect copy-paste behavior of accented characters
- With modern engines (LuaLaTeX, XeLaTeX), use `fontspec` instead

### Font Issues

```latex
% If fonts are missing, try:
\usepackage{lmodern}   % Latin Modern (improved Computer Modern)
\usepackage{mathptmx}  % Times-like
\usepackage{helvet}     % Helvetica-like
\usepackage{courier}    % Courier-like

% For XeLaTeX/LuaLaTeX:
\usepackage{fontspec}
\setmainfont{TeX Gyre Termes}  % Times-like, widely available
```

### Debug Techniques

```latex
% Show overfull boxes
\documentclass[draft]{article}

% Show labels in margin
\usepackage{showlabels}

% Show frame around text area
\usepackage{showframe}

% Show keys for labels
\usepackage[draft]{showkeys}

% Detailed log output
\tracingmacros=1  % in preamble

% Check for common issues
\usepackage{nag}  % Warns about obsolete commands and packages
```

---

## Section 8: Best Practices

### File Organization

```
project/
  main.tex              % Main file with \input commands
  preamble.tex          % All \usepackage and custom commands
  chapters/
    01-introduction.tex
    02-methods.tex
    03-results.tex
  figures/
    plot1.pdf
    diagram.png
  tables/
    results.tex
  bibliography/
    references.bib
```

Use `\input{chapters/01-introduction}` to include files. Use `\include{}` for chapters in book/report (adds `\clearpage`).

### Writing Tips

- Use `~` for non-breaking spaces: `Figure~\ref{fig:1}`, `Dr.~Smith`
- Use `--` for en-dash (ranges: 1--10), `---` for em-dash (parenthetical)
- Use `\,` for thin space in abbreviations: `e.g.\,` or `i.e.\,`
- Use `\@.` after capital letters to get correct spacing: `NASA\@.`
- Use `\phantom{}` for invisible spacing alignment
- Use `\mbox{}` to prevent hyphenation of a word

### Performance Tips

- Use PDF images instead of PNG/JPG when possible (vector graphics)
- Use `\includeonly{}` to compile only specific chapters during editing
- Use `draft` mode to speed up compilation (skips images)
- Minimize TikZ in large documents (pre-compile with `standalone`)
- Use `\graphicspath` to organize images

### Accessibility

- Always provide `\caption` for figures and tables
- Use `\label` and cross-references instead of hard-coded numbers
- Use `alt` text for images when possible (via `\pdftooltip` with `pdfcomment`)
- Use semantic markup: `\emph{}` not `\textit{}` for emphasis
- Avoid relying solely on color to convey information
- Provide table headers and structure for screen readers

### Version Control

- Use `.gitignore` for LaTeX auxiliary files:

```
*.aux
*.log
*.out
*.toc
*.lof
*.lot
*.bbl
*.blg
*.synctex.gz
*.fdb_latexmk
*.fls
*.nav
*.snm
*.vrb
```

- One sentence per line for better diffs
- Use `latexdiff` to visualize changes between versions

---

## Section 9: TikZ and Diagrams

### Basic Shapes

```latex
\usepackage{tikz}

\begin{tikzpicture}
  % Line
  \draw (0,0) -- (3,0);

  % Rectangle
  \draw (0,1) rectangle (3,3);

  % Filled rectangle
  \fill[blue!30] (4,1) rectangle (6,3);

  % Circle
  \draw (8,2) circle (1);

  % Ellipse
  \draw (11,2) ellipse (1.5 and 0.8);

  % Arc
  \draw (14,2) arc (0:270:1);

  % Curved path
  \draw (0,-1) .. controls (1,-2) and (2,0) .. (3,-1);
\end{tikzpicture}
```

### Styling

```latex
\begin{tikzpicture}
  % Line styles
  \draw[thick] (0,0) -- (3,0);
  \draw[dashed] (0,-0.5) -- (3,-0.5);
  \draw[dotted, very thick] (0,-1) -- (3,-1);
  \draw[red, line width=2pt] (0,-1.5) -- (3,-1.5);

  % Arrows
  \draw[->] (4,0) -- (7,0);
  \draw[<->] (4,-0.5) -- (7,-0.5);
  \draw[-{Stealth[length=3mm]}] (4,-1) -- (7,-1);
  \draw[-{Latex[round]}] (4,-1.5) -- (7,-1.5);

  % Fill patterns
  \fill[red!50] (0,-3) circle (0.5);
  \filldraw[fill=green!20, draw=green!70!black] (2,-3) circle (0.5);
  \shade[left color=blue, right color=white] (4,-3.5) rectangle (6,-2.5);
\end{tikzpicture}
```

### Nodes and Labels

```latex
\begin{tikzpicture}
  \node (a) at (0,0) {Start};
  \node[draw, rectangle] (b) at (3,0) {Process};
  \node[draw, circle, fill=green!20] (c) at (6,0) {End};

  \draw[->] (a) -- (b);
  \draw[->] (b) -- (c);

  % Node options
  \node[draw, rounded corners, minimum width=2cm, minimum height=1cm,
        text=white, fill=blue!70] at (3,-2) {Styled Node};
\end{tikzpicture}
```

### Flowcharts

```latex
\usetikzlibrary{shapes.geometric, arrows.meta, positioning}

\tikzstyle{startstop} = [rectangle, rounded corners, minimum width=3cm,
  minimum height=1cm, text centered, draw=black, fill=red!30]
\tikzstyle{process} = [rectangle, minimum width=3cm, minimum height=1cm,
  text centered, draw=black, fill=orange!30]
\tikzstyle{decision} = [diamond, minimum width=3cm, minimum height=1cm,
  text centered, draw=black, fill=green!30, aspect=2]
\tikzstyle{io} = [trapezium, trapezium left angle=70, trapezium right angle=110,
  minimum width=3cm, minimum height=1cm, text centered, draw=black, fill=blue!30]
\tikzstyle{arrow} = [thick, ->, >=Stealth]

\begin{tikzpicture}[node distance=1.5cm]
  \node (start) [startstop] {Start};
  \node (input) [io, below of=start] {Input};
  \node (process) [process, below of=input] {Process};
  \node (decide) [decision, below of=process, yshift=-0.5cm] {Condition?};
  \node (out1) [process, right of=decide, xshift=3cm] {Action A};
  \node (out2) [process, below of=decide, yshift=-0.5cm] {Action B};
  \node (stop) [startstop, below of=out2] {End};

  \draw [arrow] (start) -- (input);
  \draw [arrow] (input) -- (process);
  \draw [arrow] (process) -- (decide);
  \draw [arrow] (decide) -- node[anchor=south] {Yes} (out1);
  \draw [arrow] (decide) -- node[anchor=east] {No} (out2);
  \draw [arrow] (out1) |- (stop);
  \draw [arrow] (out2) -- (stop);
\end{tikzpicture}
```

### Graphs and Trees

```latex
\usetikzlibrary{graphs, graphdrawing}
% Note: graphdrawing requires LuaLaTeX

% Manual graph
\begin{tikzpicture}
  \node[draw, circle] (1) at (0,0) {1};
  \node[draw, circle] (2) at (2,1) {2};
  \node[draw, circle] (3) at (2,-1) {3};
  \node[draw, circle] (4) at (4,0) {4};

  \draw (1) -- (2);
  \draw (1) -- (3);
  \draw (2) -- (4);
  \draw (3) -- (4);
  \draw (2) -- (3);
\end{tikzpicture}

% Tree
\begin{tikzpicture}[
  level 1/.style={sibling distance=4cm},
  level 2/.style={sibling distance=2cm},
  every node/.style={draw, circle}
]
  \node {Root}
    child {node {A}
      child {node {D}}
      child {node {E}}
    }
    child {node {B}
      child {node {F}}
    }
    child {node {C}
      child {node {G}}
      child {node {H}}
    };
\end{tikzpicture}
```

### Coordinate Systems and Calculations

```latex
\usetikzlibrary{calc}

\begin{tikzpicture}
  \coordinate (A) at (0,0);
  \coordinate (B) at (4,0);
  \coordinate (C) at (2,3);

  % Triangle
  \draw (A) -- (B) -- (C) -- cycle;

  % Midpoint
  \coordinate (M) at ($(A)!0.5!(B)$);
  \fill[red] (M) circle (2pt);

  % Point along path
  \coordinate (P) at ($(A)!0.3!(C)$);
  \fill[blue] (P) circle (2pt);

  % Perpendicular
  \draw[dashed] (C) -- ($(A)!(C)!(B)$);
\end{tikzpicture>
```

### Pgfplots Examples

```latex
\usepackage{pgfplots}
\pgfplotsset{compat=1.18}

% Bar chart
\begin{tikzpicture}
\begin{axis}[
  ybar,
  symbolic x coords={A, B, C, D},
  xtick=data,
  ylabel={Value},
  nodes near coords,
  bar width=15pt
]
  \addplot coordinates {(A,10) (B,25) (C,15) (D,30)};
\end{axis}
\end{tikzpicture}

% Scatter plot
\begin{tikzpicture}
\begin{axis}[
  only marks,
  xlabel={$x$},
  ylabel={$y$},
  grid=major
]
  \addplot table[x=x, y=y, col sep=comma]{data.csv};
\end{axis}
\end{tikzpicture}

% 3D surface
\begin{tikzpicture}
\begin{axis}[
  view={60}{30},
  xlabel=$x$, ylabel=$y$, zlabel=$z$,
  colormap/viridis
]
  \addplot3[surf, domain=-2:2, domain y=-2:2, samples=25]
    {exp(-x^2-y^2)};
\end{axis}
\end{tikzpicture}

% Polar plot
\begin{tikzpicture}
\begin{polaraxis}
  \addplot[domain=0:360, samples=100, thick, blue]
    {1 + cos(x)};
\end{polaraxis}
\end{tikzpicture}
```

### Circuit Diagrams

```latex
\usepackage{circuitikz}

\begin{tikzpicture}
  \draw (0,0) to[V, v=$V_s$] (0,3)
              to[R, l=$R_1$] (3,3)
              to[C, l=$C$] (3,0)
              to[short] (0,0);
  \draw (3,3) to[R, l=$R_2$] (6,3)
              to[L, l=$L$] (6,0)
              to[short] (3,0);
\end{tikzpicture}
```

### Chemical Diagrams

```latex
\usepackage{chemfig}

\chemfig{H-C(-[2]H)(-[6]H)-C(-[2]H)(-[6]H)-H}  % Ethane

\usepackage{mhchem}
\ce{2H2 + O2 -> 2H2O}       % Chemical equation
\ce{^{227}_{90}Th}           % Isotope
\ce{SO4^{2-}}                % Ion
```

---

## Section 10: Advanced Topics

### Custom Commands and Environments

```latex
% Simple command
\newcommand{\R}{\mathbb{R}}
\newcommand{\N}{\mathbb{N}}

% Command with arguments
\newcommand{\norm}[1]{\left\| #1 \right\|}
\newcommand{\abs}[1]{\left| #1 \right|}
\newcommand{\set}[1]{\left\{ #1 \right\}}

% Command with optional argument
\newcommand{\chapter}[2][Chapter]{%
  \section*{#1: #2}%
}

% Custom environment
\newenvironment{important}
  {\begin{tcolorbox}[colback=red!5, colframe=red!75]}
  {\end{tcolorbox}}

% Renew existing commands
\renewcommand{\emph}[1]{\textbf{#1}}
```

### Page Layout Tricks

```latex
% Two-column for specific section
\begin{multicols}{2}
  Text in two columns...
\end{multicols}

% Landscape page
\usepackage{pdflscape}
\begin{landscape}
  Wide content here (table, figure, etc.)
\end{landscape}

% Custom page size for a single page
\newgeometry{margin=1cm}
  % Content with narrow margins
\restoregeometry

% Blank page
\newpage
\thispagestyle{empty}
\mbox{}
\newpage
```

### Cross-referencing

```latex
% Labels
\label{sec:intro}    % After \section
\label{eq:main}      % After equation number
\label{fig:plot}     % Inside figure
\label{tab:data}     % Inside table
\label{thm:main}     % After theorem

% References
\ref{fig:plot}       % Just the number
\pageref{fig:plot}   % Page number
\eqref{eq:main}      % Equation number in parentheses

% With hyperref
\autoref{fig:plot}   % "Figure 1"
\nameref{sec:intro}  % Section name

% With cleveref
\cref{fig:plot}      % "fig. 1" or "Figure 1"
\Cref{fig:plot}      % "Figure 1" (capitalized)
\crefrange{eq:1}{eq:5}  % "eqs. (1) to (5)"
```

### Glossaries and Acronyms

```latex
\usepackage[acronym]{glossaries}
\makeglossaries

\newacronym{api}{API}{Application Programming Interface}
\newacronym{ml}{ML}{Machine Learning}

\newglossaryentry{latex}{
  name=LaTeX,
  description={A typesetting system}
}

% Usage
\gls{api}    % First use: Application Programming Interface (API)
\gls{api}    % Subsequent: API
\acrfull{ml} % Machine Learning (ML)
\acrshort{ml} % ML

\printglossaries
```

### Index

```latex
\usepackage{makeidx}
\makeindex

% In text
Some important \index{term} here.
\index{category!subcategory}

\printindex
```

### Conditional Content

```latex
\usepackage{ifthen}

\newboolean{draft}
\setboolean{draft}{true}

\ifthenelse{\boolean{draft}}{%
  \textcolor{red}{TODO: Finish this section}
}{%
  % Final version content
}

% Or with etoolbox
\usepackage{etoolbox}
\newtoggle{showproofs}
\toggletrue{showproofs}

\iftoggle{showproofs}{%
  \begin{proof} ... \end{proof}
}{}
```

### Including External Documents

```latex
% Include LaTeX file (adds \clearpage)
\include{chapters/chapter1}

% Input LaTeX file (no \clearpage)
\input{sections/intro}

% Include PDF pages
\usepackage{pdfpages}
\includepdf[pages=1-3]{external.pdf}
\includepdf[pages={1,3,5}, nup=2x2]{slides.pdf}

% Compile only specific includes
\includeonly{chapters/chapter1, chapters/chapter3}
```

### Custom Page Styles

```latex
\usepackage{fancyhdr}

% Define a custom style
\fancypagestyle{chapterstyle}{
  \fancyhf{}
  \fancyhead[LE,RO]{\thepage}
  \fancyhead[RE]{\textit{\leftmark}}
  \fancyhead[LO]{\textit{\rightmark}}
  \renewcommand{\headrulewidth}{0.4pt}
  \renewcommand{\footrulewidth}{0pt}
}

% Apply to specific pages
\thispagestyle{chapterstyle}

% Or globally
\pagestyle{chapterstyle}
```

### Watermarks

```latex
\usepackage{draftwatermark}
\SetWatermarkText{DRAFT}
\SetWatermarkScale{3}
\SetWatermarkColor[gray]{0.9}
```

### Footnotes and Endnotes

```latex
% Footnotes
Text with a footnote\footnote{This is the footnote text.}.

% Footnotes in tables (use minipage)
\begin{table}
  \centering
  \begin{minipage}{0.8\textwidth}
    \centering
    \begin{tabular}{ll}
      \toprule
      Item & Value\footnotemark \\
      \midrule
      A & 10 \\
      \bottomrule
    \end{tabular}
    \footnotetext{Measured in units.}
  \end{minipage}
\end{table}

% Endnotes
\usepackage{endnotes}
Text with endnote\endnote{Endnote text.}
\theendnotes  % Print all endnotes
```

### Multi-language Documents

```latex
\usepackage[brazilian, english]{babel}

% Switch languages
\selectlanguage{brazilian}
Texto em portugues.

\selectlanguage{english}
Text in English.

% Or inline
\foreignlanguage{brazilian}{Texto em portugues}
```

### Exam Documents

```latex
\documentclass{exam}

\begin{document}
\begin{questions}

\question[10] What is $2 + 2$?
\begin{solution}
  $2 + 2 = 4$
\end{solution}

\question[20] Prove that $\sqrt{2}$ is irrational.
\begin{parts}
  \part[5] State the proof strategy.
  \part[15] Complete the proof.
\end{parts}

\question[10] Multiple choice:
\begin{choices}
  \choice Option A
  \CorrectChoice Option B
  \choice Option C
\end{choices}

\end{questions}
\end{document}
```

---

## Section 11: Quick Reference — Special Characters

```latex
% Characters that need escaping in text mode
\#  \$  \%  \&  \_  \{  \}  \textbackslash  \textasciitilde  \textasciicircum

% Quotes
``double quotes''       % Double
`single quotes'         % Single

% Dashes
-     % Hyphen
--    % En-dash (ranges: 1--10)
---   % Em-dash (parenthetical)

% Ellipsis
\ldots or \dots   % Three dots: ...

% Non-breaking space
Figure~\ref{fig:1}

% Manual line break
\\          % In tabular, align, etc.
\newline    % In paragraphs
\linebreak  % With justification

% Manual page break
\newpage
\clearpage     % Also flushes floats
\cleardoublepage

% Horizontal space
\hspace{1cm}
\hfill        % Fill remaining space
\quad \qquad  % Standard spaces

% Vertical space
\vspace{1cm}
\vfill        % Fill remaining space
\bigskip \medskip \smallskip
```

---

## Section 12: LaTeX Compilation Engines

### pdfLaTeX (Default)
- Most compatible, widest package support
- Uses `.eps` or `.pdf`/`.png`/`.jpg` images
- Standard font encodings (`fontenc`)
- Compile: `pdflatex main.tex`

### XeLaTeX
- Unicode native, system fonts via `fontspec`
- Good for multilingual documents
- Compile: `xelatex main.tex`

### LuaLaTeX
- Most modern, Lua scripting support
- Required for some TikZ graph drawing features
- Unicode native, system fonts via `fontspec`
- Compile: `lualatex main.tex`

### Compilation Workflow

```bash
# Standard (with bibliography)
pdflatex main.tex
bibtex main          # or: biber main (for biblatex)
pdflatex main.tex
pdflatex main.tex    # Run twice to resolve references

# With latexmk (automated)
latexmk -pdf main.tex        # pdfLaTeX
latexmk -xelatex main.tex    # XeLaTeX
latexmk -lualatex main.tex   # LuaLaTeX
latexmk -c                   # Clean auxiliary files
```
