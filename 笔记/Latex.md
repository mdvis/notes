## 行间距
- 宏包 `setspace`
```latex
\usepackage(setspace)

\singlespacing %单倍
\onehalfspacing %1.5倍
\doublespacing %双倍

\setstretch{1.25} % 自定义行距
```
- 全局
```latex
\linespread{1.25} %全局行距
```
## 颜色
- 宏包 `xcolor`
```latex
\usepackage{xcolor}
\usepackage[dvipsnames]{xcolor} %支持 68 种颜色(CMYK)
\usepackage[svgnames]{xcolor} %支持 151 种颜色(RGB)
\usepackage[xllnames]{xcolor} %支持 317 种颜色(RGB)

\color{red}
{\color{blue} 蓝色}

\textcolor{<颜色>}{<文字>}
\colorbox{<背景>}{<文字>}
```
## 字号
- `\tiny`：最小字体。
- `\scriptsize`：小号字体。
- `\footnotesize`：脚注字体。
- `\small`：小字体。
- `\normalsize`：标准字体。
- `\large`：大号字体。
- `\Large`：更大字体。
- `\huge`：非常大的字体。
- `\Huge`：极大的字体。
```latex
\begin{HUGE}\ttfamily \string\HUGE{} text
\end{HUGE}
```
## 段落和换行
- `\newline` 或 `\\`：换行。
- `\par`：新段落（与空行相同）。
## 字体样式
- `\textbf{...}`：加粗。
- `\textit{...}`：斜体。
- `\texttt{...}`：打字机字体（等宽字体）。
- `\underline{...}`：下划线。
## 表格
- `\begin{tabular}{|c|c|c|}`：开始表格，`c` 表示居中对齐，`|` 表示列之间有竖线。
- `\hline`：绘制横线。
- `\\`：换行。
   ```latex
   \begin{tabular}{|c|c|c|}
   \hline
   A & B & C \\
   \hline
   1 & 2 & 3 \\
   4 & 5 & 6 \\
   \hline
   \end{tabular}
   ```
## 图片
- `\usepackage{graphicx}`：导入图形包。
- `\includegraphics[width=0.5\textwidth]{image.jpg}`：插入图片，调整宽度为文本宽度的一半。
## 文献
- `\cite{reference_key}`：引用文献。
- `\bibliographystyle{style}`：设置引用样式。
- `\bibliography{filename}`：指定参考文献文件`.bib`。
## 章节与标题
- `\chapter{...}`：章节标题。
- `\chapter*{...}`：章节标题，不带序号。
- `\label{...}`：标识某个章节、图片或表格等。以便之后引用。引用时用 `\ref{标识}`
- `\section{...}`：章节标题。
- `\subsection{...}`：子章节。
- `\subsubsection{...}`：子子章节。
- `\chapter{...}`：用于书籍类文档。
## 列表
   - `itemize` 环境：无序列表。
   - `enumerate` 环境：有序列表。
   - `\item`：每一项。
   ```latex
   \begin{itemize}
       \item 项目 1
       \item 项目 2
   \end{itemize}
   ```
## 注释
   - `\%`：百分号表示注释。
   - `%` 后面的一行内容会被视为注释，不会显示在最终文档中。