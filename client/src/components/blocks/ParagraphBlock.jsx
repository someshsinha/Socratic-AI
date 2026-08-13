import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function ParagraphBlock({ text }) {
  return (
    <div className="text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkMath, { singleDollar: true }]]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Render paragraph wrappers
          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,

          // Render textbook-styled blockquotes, with color-coded callouts
          // based on a leading "**Label:**" convention from the AI (e.g. "> **Warning:** ...")
          blockquote: ({ children }) => {
            const getTextContent = (node) => {
              if (!node) return '';
              if (typeof node === 'string' || typeof node === 'number') return String(node);
              if (Array.isArray(node)) return node.map(getTextContent).join('');
              if (node.props && node.props.children) return getTextContent(node.props.children);
              return '';
            };
            const text = getTextContent(children);
            const label = /warning/i.test(text)
              ? { border: 'border-amber-500/60', bg: 'bg-amber-950/10', text: 'text-amber-300' }
              : /(pro.?tip|tip)/i.test(text)
                ? { border: 'border-emerald-500/60', bg: 'bg-emerald-950/10', text: 'text-emerald-300' }
                : /note/i.test(text)
                  ? { border: 'border-sky-500/60', bg: 'bg-sky-950/10', text: 'text-sky-300' }
                  : { border: 'border-violet-500/60', bg: 'bg-violet-950/10', text: 'text-slate-400' };
            return (
              <blockquote className={`border-l-4 ${label.border} ${label.bg} px-4 py-3 my-4 italic rounded-r-xl ${label.text} shadow-inner`}>
                {children}
              </blockquote>
            );
          },

          // Render bulleted lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside pl-4 my-2 space-y-1">
              {children}
            </ul>
          ),

          // Render numbered lists
          ol: ({ children }) => (
            <ol className="list-decimal list-inside pl-4 my-2 space-y-1">
              {children}
            </ol>
          ),

          // Render list items
          li: ({ children }) => <li className="text-slate-350">{children}</li>,

          // Render inline code / block code overrides
          code({ node, inline, className, children, ...props }) {
            // Under react-markdown, we can check if it's inline by matching className (prism-style) or inline flag
            const isInline = inline ?? !className;
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded bg-slate-950 text-violet-400 font-mono text-xs border border-slate-850 font-semibold">
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-slate-950 p-4 rounded-xl overflow-x-auto text-xs font-mono text-violet-300 my-2 border border-slate-850">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },

          // Render bold emphasis with high contrast
          strong: ({ children }) => <strong className="font-extrabold text-white">{children}</strong>,

          // Render external textbook links
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-violet-400 hover:text-violet-300 underline font-semibold transition duration-150"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}