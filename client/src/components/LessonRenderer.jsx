import React from 'react';
import HeadingBlock from './blocks/HeadingBlock';
import ParagraphBlock from './blocks/ParagraphBlock';
import CodeBlock from './blocks/CodeBlock';
import VideoBlock from './blocks/VideoBlock';
import MCQBlock from './blocks/MCQBlock';

export default function LessonRenderer({ content }) {
  if (!content || !Array.isArray(content) || content.length === 0) {
    return (
      <div className="p-8 bg-slate-800/20 border border-slate-750 rounded-2xl text-center">
        <p className="text-slate-400 text-sm">No structured content generated for this lesson.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {content.map((block, idx) => {
        switch (block.type) {
          case 'heading':
            return <HeadingBlock key={idx} text={block.text} />;
          case 'paragraph':
            return <ParagraphBlock key={idx} text={block.text} />;
          case 'code':
            return <CodeBlock key={idx} text={block.text} language={block.language} />;
          case 'video':
            return <VideoBlock key={idx} query={block.query} />;
          case 'mcq':
            return (
              <MCQBlock
                key={idx}
                question={block.question}
                options={block.options}
                answer={block.answer}
                explanation={block.explanation}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
