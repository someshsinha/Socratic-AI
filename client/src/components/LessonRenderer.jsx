import React from 'react';
import HeadingBlock from './blocks/HeadingBlock';
import ParagraphBlock from './blocks/ParagraphBlock';
import CodeBlock from './blocks/CodeBlock';
import VideoBlock from './blocks/VideoBlock';
import MCQBlock from './blocks/MCQBlock';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function LessonRenderer({ content }) {
  if (!content || !Array.isArray(content) || content.length === 0) {
    return (
      <div className="p-8 bg-[#fbfaf6] border border-[#d8d3c7] text-center my-6">
        <p className="text-[#5f6673] text-sm m-0">No structured content generated for this lesson.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {content.map((block, idx) => {
        const key = `block-${idx}`;

        switch (block.type) {
          case 'heading':
            return (
              <div
                key={key}
                id={`section-heading-${idx}`}
                data-section-target
                data-section-title={block.text?.replace(/[*_#]/g, '') || `Section ${idx + 1}`}
                className="scroll-mt-24"
              >
                <HeadingBlock text={block.text} />
              </div>
            );

          case 'paragraph':
            return <ParagraphBlock key={key} text={block.text} />;

          case 'code':
            return (
              <div
                key={key}
                id={`section-code-${idx}`}
                data-section-target
                data-section-title={`Code: ${block.language || 'Snippet'}`}
                className="scroll-mt-24"
              >
                <CodeBlock text={block.text} language={block.language} />
              </div>
            );

          case 'video':
            return (
              <div
                key={key}
                id={`section-video-${idx}`}
                data-section-target
                data-section-title="Video Lecture"
                className="scroll-mt-24"
              >
                <VideoBlock query={block.query} />
              </div>
            );

          case 'mcq':
          case 'knowledge_check':
            return (
              <div
                key={key}
                id={`section-mcq-${idx}`}
                data-section-target
                data-section-title="Knowledge Check"
                className="scroll-mt-24"
              >
                <MCQBlock
                  question={block.question}
                  options={block.options}
                  answer={block.answer}
                  explanation={block.explanation}
                />
              </div>
            );

          case 'definition':
          case 'theorem':
          case 'proof':
            return (
              <div
                key={key}
                id={`section-def-${idx}`}
                data-section-target
                data-section-title={`${block.type.toUpperCase()}${block.title ? `: ${block.title}` : ''}`}
                className="p-5 my-6 bg-[#fbfaf6] border-l-4 border-[#111827] border border-y-[#d8d3c7] border-r-[#d8d3c7] space-y-2 scroll-mt-24"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#2f6f4f]">
                    [{block.type.toUpperCase()}{block.title ? `: ${block.title.toUpperCase()}` : ''}]
                  </span>
                </div>
                <div className="text-[#1f2937] text-base leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, [remarkMath, { singleDollar: true }]]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {block.text || block.content}
                  </ReactMarkdown>
                </div>
              </div>
            );

          case 'key_takeaway':
          case 'quick_tip':
          case 'callout':
            return (
              <div
                key={key}
                className="p-5 my-6 bg-white border border-[#d8d3c7] space-y-2 shadow-xs"
              >
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#315f88] block">
                  [{block.type.replace('_', ' ').toUpperCase()}]
                </span>
                <div className="text-[#1f2937] text-sm sm:text-base leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, [remarkMath, { singleDollar: true }]]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {block.text || block.content}
                  </ReactMarkdown>
                </div>
              </div>
            );

          case 'equation':
            return (
              <div key={key} className="my-6 py-4 overflow-x-auto text-center font-serif text-lg">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, [remarkMath, { singleDollar: true }]]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {`$$${block.text || block.content}$$`}
                </ReactMarkdown>
              </div>
            );

          default:
            if (block.text) {
              return <ParagraphBlock key={key} text={block.text} />;
            }
            return null;
        }
      })}
    </div>
  );
}
