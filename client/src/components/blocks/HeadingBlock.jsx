import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function HeadingBlock({ text }) {
  return (
    <h2 className="text-xl sm:text-2xl font-extrabold text-[#111827] pt-4 mt-8 first:mt-0 leading-tight tracking-tight border-b border-[#e5e7eb] pb-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, [remarkMath, { singleDollar: true }]]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => <>{children}</>,
        }}
      >
        {text}
      </ReactMarkdown>
    </h2>
  );
}
