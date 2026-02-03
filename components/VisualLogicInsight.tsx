
import React from 'react';
import { DiagramData } from '../types';

interface Props {
  diagram: DiagramData;
}

const VisualLogicInsight: React.FC<Props> = ({ diagram }) => {
  const { type, data } = diagram;

  const renderRadar = () => {
    const labels = data.labels || ['논리', '연산', '직관', '수식', '창의'];
    const student = data.studentValues || [80, 60, 90, 70, 85];
    const target = data.targetValues || [90, 80, 85, 90, 80];
    const size = 200;
    const center = size / 2;
    const radius = size * 0.4;

    const getPoint = (val: number, i: number, total: number) => {
      const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
      const dist = (val / 100) * radius;
      return `${center + dist * Math.cos(angle)},${center + dist * Math.sin(angle)}`;
    };

    const studentPoints = student.map((v: number, i: number) => getPoint(v, i, labels.length)).join(' ');
    const targetPoints = target.map((v: number, i: number) => getPoint(v, i, labels.length)).join(' ');

    return (
      <svg width="100%" height="220" viewBox={`0 0 ${size} ${size}`} className="mx-auto">
        {/* Grids */}
        {[20, 40, 60, 80, 100].map(r => (
          <circle key={r} cx={center} cy={center} r={(r/100)*radius} fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
        ))}
        {/* Axes */}
        {labels.map((_: any, i: number) => {
          const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
          return <line key={i} x1={center} y1={center} x2={center + radius * Math.cos(angle)} y2={center + radius * Math.sin(angle)} stroke="#e2e8f0" strokeWidth="1" />;
        })}
        {/* Target Area */}
        <polygon points={targetPoints} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
        {/* Student Area */}
        <polygon points={studentPoints} fill="rgba(37, 99, 235, 0.2)" stroke="#2563eb" strokeWidth="2" />
        {/* Labels */}
        {labels.map((l: string, i: number) => {
          const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
          const labelDist = radius + 15;
          return (
            <text key={i} x={center + labelDist * Math.cos(angle)} y={center + labelDist * Math.sin(angle)} textAnchor="middle" className="text-[8px] font-bold fill-slate-400 uppercase">
              {l}
            </text>
          );
        })}
      </svg>
    );
  };

  const renderFlowchart = () => {
    const steps = data.steps || ['시작', '과정', '결과'];
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        {steps.map((step: string, idx: number) => (
          <React.Fragment key={idx}>
            <div className="bg-white border-2 border-blue-100 px-4 py-2 rounded-lg shadow-sm text-xs font-bold text-slate-700 w-full text-center">
              {step}
            </div>
            {idx < steps.length - 1 && (
              <div className="h-6 w-0.5 bg-blue-200 relative">
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-200 rounded-full"></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderComparison = () => {
    const categories = data.categories || ['집중도', '속도', '정확성'];
    const scores = data.score || [70, 50, 90];
    return (
      <div className="space-y-4 w-full">
        {categories.map((cat: string, i: number) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>{cat}</span>
              <span>{scores[i]}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${scores[i]}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full flex items-center justify-center min-h-[180px]">
      {type === 'radar' && renderRadar()}
      {type === 'flowchart' && renderFlowchart()}
      {type === 'comparison' && renderComparison()}
    </div>
  );
};

export default VisualLogicInsight;
