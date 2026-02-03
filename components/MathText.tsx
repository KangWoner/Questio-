
import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

const MathText: React.FC<MathTextProps> = ({ text, className }) => {
  if (!text) return null;
  
  // $ ... $ 패턴을 찾아 분리합니다.
  const parts = text.split(/(\$.*?\$)/g);
  
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          try {
            return (
              <span
                key={i}
                className="inline-block px-0.5 math-node"
                dangerouslySetInnerHTML={{
                  __html: katex.renderToString(math, {
                    throwOnError: false,
                    displayMode: false,
                  }),
                }}
              />
            );
          } catch (e) {
            return <span key={i}>{part}</span>;
          }
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

export default MathText;
