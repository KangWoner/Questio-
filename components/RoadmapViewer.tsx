
import React, { useRef } from 'react';
import katex from 'katex';
import { SurveyData, AnalysisResult } from '../types';
import VisualLogicInsight from './VisualLogicInsight';
import MathText from './MathText';

interface Props {
  data: SurveyData;
  result: AnalysisResult;
  onClose: () => void;
}

const RoadmapViewer: React.FC<Props> = ({ data, result, onClose }) => {
  const sections = result.detailedReport || [];
  const validTargets = data.targetUniversities.filter(u => u.trim() !== '');
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownloadHtml = () => {
    if (!reportRef.current) return;
    
    const content = reportRef.current.innerHTML;
    const fullHtml = `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
        <meta charset="UTF-8">
        <title>Questio 수리논술 합격 전략 로드맵 - ${data.targetUniversities[0]}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;700;800&display=swap');
          body { font-family: 'Pretendard', sans-serif; background-color: #f8fafc; color: #0f172a; padding: 2rem; }
          .page-break-after { page-break-after: always; }
          .math-node { vertical-align: middle; }
          @media print { 
            .print\\:hidden { display: none; } 
            body { padding: 0; background: white; }
            .max-w-4xl { box-shadow: none; margin: 0; max-width: 100%; }
          }
          .max-w-4xl { max-width: 56rem; margin: 0 auto; background: white; padding: 3rem; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25); border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="max-w-4xl">
          ${content}
        </div>
      </body>
      </html>
    `;
    
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Questio_Roadmap_${data.targetUniversities[0] || 'Result'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`[Questio] ${result.personaName} 수리논술 합격 전략 로드맵`);
    const body = encodeURIComponent(`안녕하세요,\n\n신청하신 수리논술 합격 로드맵이 생성되었습니다.\n\n페르소나: ${result.personaName}\n\n상세 내용은 첨부된 결과 리포트를 확인해 주시기 바랍니다.\n\n합격을 기원합니다.\nQuestio AI 입시연구소 드림`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 overflow-y-auto print:bg-white print:overflow-visible font-sans">
      <div className="max-w-4xl mx-auto bg-white my-10 p-12 shadow-2xl rounded-sm print:my-0 print:shadow-none print:w-full min-h-screen" ref={reportRef}>
        <div className="flex justify-between items-center mb-10 print:hidden">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2 font-bold">
            <i className="fa-solid fa-arrow-left"></i> 결과 대시보드로
          </button>
          <div className="flex gap-2">
            <button onClick={handleEmailShare} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-bold hover:bg-slate-200 transition-all">
              <i className="fa-solid fa-envelope mr-2"></i> 이메일 공유
            </button>
            <button onClick={handleDownloadHtml} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-700 transition-all">
              <i className="fa-solid fa-code mr-2"></i> HTML 저장
            </button>
            <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all">
              <i className="fa-solid fa-file-pdf mr-2"></i> PDF 저장/인쇄
            </button>
          </div>
        </div>

        {/* 표지 섹션 */}
        <div className="border-b-8 border-slate-900 pb-16 mb-12 text-center relative overflow-hidden">
          <div className="inline-block px-4 py-1 bg-blue-600 text-white text-[10px] font-black tracking-widest mb-8 rounded uppercase">CONFIDENTIAL ADMISSION STRATEGY</div>
          <h1 className="text-5xl font-black text-slate-900 mb-6 leading-tight uppercase tracking-tighter">
            2027 수리논술<br/>합격 전략 마스터 플랜
          </h1>
          
          <div className="flex justify-center gap-2 mb-8">
            {validTargets.map((univ, i) => (
              <span key={i} className={`px-4 py-1 rounded-full text-xs font-bold ${i === 0 ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {i + 1}지망: {univ}
              </span>
            ))}
          </div>

          {/* AI 이미지 배치 - 텍스트 없는 깔끔한 추상 이미지 */}
          {result.personaImageUrl && (
            <div className="mb-10 w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-100 bg-slate-50">
              <img src={result.personaImageUrl} alt="Logical Insight Visualization" className="w-full h-auto object-cover" />
              <div className="py-3 px-6 text-left flex justify-between items-center bg-white border-t border-slate-100">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">A.I. Generated Logical Intelligence Structure</span>
                <span className="text-[9px] font-bold text-blue-600 uppercase">QUESTIO LABS 2027</span>
              </div>
            </div>
          )}

          <div className="h-1 w-24 bg-blue-600 mx-auto mb-8"></div>
          
          <div className="space-y-2 text-slate-600 font-bold">
            <p className="text-xl">대상: {result.personaName} 수험생</p>
            <p className="text-sm opacity-50 uppercase tracking-widest mt-4">Questio AI Admissions Lab</p>
            <p className="text-xs opacity-40">{new Date().toLocaleDateString()} 발행</p>
          </div>
        </div>

        {/* AI 생성 컨텐츠 렌더링 */}
        <div className="space-y-32">
          {sections.map((section, idx) => (
            <div key={idx} className="page-break-after relative pt-10">
              <div className="absolute top-0 right-0 text-9xl font-black text-slate-50 -z-10 opacity-50 select-none">
                {(idx + 1).toString().padStart(2, '0')}
              </div>
              
              <div className="mb-10">
                <h3 className="text-3xl font-black text-slate-900 flex items-center gap-4">
                  <span className="w-12 h-1 bg-blue-600"></span>
                  {section.title}
                </h3>
              </div>

              <div className="mb-12">
                <div className="text-xl leading-relaxed text-slate-700 whitespace-pre-wrap font-medium">
                  <MathText text={section.content} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                  <div className="text-xs font-black text-blue-600 uppercase mb-3 tracking-widest">PRO TIP</div>
                  <div className="text-base text-slate-600 leading-relaxed italic font-bold">
                    <MathText text={section.proTip || `합격 비결은 ${data.solvingStyle} 역량을 목표 대학 스타일에 맞게 변환하는 것입니다.`} />
                  </div>
                </div>
                
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col items-center justify-center">
                  <div className="text-center w-full px-4">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Visual Logic Insight</p>
                    {section.diagram ? (
                      <VisualLogicInsight diagram={section.diagram} />
                    ) : (
                      <div className="py-10">
                        <i className="fa-solid fa-diagram-project text-blue-200 text-4xl mb-2"></i>
                        <p className="text-xs text-slate-400">{section.diagramDescription}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-20 flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-widest border-t border-slate-100 pt-4">
                <span>Pass Strategy Roadmap v2.7</span>
                <span>Target: {data.targetUniversities[0] || 'Goal'}</span>
                <span>Page {idx + 1} / {sections.length}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 실시간 검색 출처 (References) */}
        {result.groundingUrls && result.groundingUrls.length > 0 && (
          <div className="mt-40 border-t-2 border-slate-100 pt-10">
            <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              <i className="fa-solid fa-link text-blue-600"></i>
              실시간 분석 참조 데이터 (References)
            </h4>
            <ul className="space-y-3">
              {result.groundingUrls.map((url, i) => (
                <li key={i}>
                  <a href={url.uri} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-2">
                    <span className="text-slate-400 font-bold">[{i+1}]</span> {url.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 클로징 */}
        <div className="mt-20 text-center py-24 bg-slate-900 rounded-3xl text-white">
          <h2 className="text-4xl font-black mb-6">당신의 합격을<br/>Questio가 확신합니다.</h2>
          <p className="text-slate-400 mb-12 max-w-md mx-auto leading-relaxed">
            귀하의 탁월한 {data.solvingStyle} 역량은 정교한 전략을 만났을 때 비로소 합격이라는 결과로 치환됩니다. 로드맵을 지금 바로 실행하십시오.
          </p>
          <div className="inline-block px-8 py-4 bg-blue-600 text-white rounded-full font-black shadow-xl animate-pulse">
            기대 합격 확률 84% 상승
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapViewer;
