import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function ParagraphBlock({ text }) {
  return (
    <div className="text-[#1f2937] text-base leading-relaxed space-y-4 font-normal">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkMath, { singleDollar: true }]]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // Render paragraph wrappers
          p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,

          // Render textbook-styled blockquotes
          blockquote: ({ children }) => {
            return (
              <blockquote className="border-l-4 border-[#111827] bg-[#fbfaf6] px-4 py-3 my-4 italic text-[#374151] border border-y-[#d8d3c7] border-r-[#d8d3c7]">
                {children}
              </blockquote>
            );
          },

          // Render bulleted lists
          ul: ({ children }) => (
            <ul className="list-disc list-inside pl-4 my-3 space-y-1.5 text-[#374151]">
              {children}
            </ul>
          ),

          // Render numbered lists
          ol: ({ children }) => (
            <ol className="list-decimal list-inside pl-4 my-3 space-y-1.5 text-[#374151]">
              {children}
            </ol>
          ),

          // Render list items
          li: ({ children }) => <li className="text-[#374151]">{children}</li>,

          // Render inline code / block code overrides
          code({ node, inline, className, children, ...props }) {
            const isInline = inline ?? !className;
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 bg-[#f3f4f6] text-[#111827] font-mono text-xs border border-[#d8d3c7] font-semibold">
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-[#111827] p-4 text-xs font-mono text-emerald-350 my-3 overflow-x-auto border border-[#d8d3c7]">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },

          // Render bold emphasis with high contrast
          strong: ({ children }) => <strong className="font-extrabold text-[#111827]">{children}</strong>,

          // Render external textbook links
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-[#315f88] hover:text-[#111827] underline font-semibold transition duration-150"
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