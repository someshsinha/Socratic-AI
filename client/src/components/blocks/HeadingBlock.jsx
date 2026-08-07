import React from 'react';

export default function HeadingBlock({ text }) {
  return (
    <h2 className="text-xl font-bold text-white pt-4 mt-6 first:mt-0 leading-tight">
      {text}
    </h2>
  );
}
