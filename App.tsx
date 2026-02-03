
import React, { useState, useCallback } from 'react';
import { SurveyData, AnalysisResult, ReportSection, University } from './types';
import { UNIVERSITIES } from './constants';
import { generateAnalysis, generateDetailedReport, generatePersonaImage } from './services/geminiService';
import { saveLead } from './services/leadService';
import RoadmapViewer from './components/RoadmapViewer';
import MathText from './components/MathText';

const App: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showRoadmap, setShowRoadmap] = useState<boolean>(false);
  const [survey, setSurvey] = useState<SurveyData>({
    tier: '중위권',
    targetUniversities: ['', '', ''],
    csatSubject: '미적분',
    studyScope: ['수학 I', '수학 II'],
    solvingStyle: '연산 중심',
    writingConcern: '시간 부족/계산 실수',
  });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const startSurvey = () => setStep(1);

  const updateSurvey = <K extends keyof SurveyData>(key: K, value: SurveyData[K]) => {
    setSurvey(prev => ({ ...prev, [key]: value }));
  };

  const updateTargetUniv = (index: number, value: string) => {
    const newTargets = [...survey.targetUniversities];
    newTargets[index] = value;
    updateSurvey('targetUniversities', newTargets);
  };

  const handleScopeToggle = (scope: string) => {
    setSurvey(prev => {
      const newScope = prev.studyScope.includes(scope)
        ? prev.studyScope.filter(s => s !== scope)
        : [...prev.studyScope, scope];
      return { ...prev, studyScope: newScope };
    });
  };

  const calculateResults = useCallback(async () => {
    setLoading(true);
    setStep(7);
    try {
      const scoredUniversities = UNIVERSITIES.map(univ => {
        let score = 0;
        const hasScopeMatch = univ.scope.every(s => survey.studyScope.includes(s));
        if (hasScopeMatch) score += 100;
        else score -= 200;
        if (univ.tier === survey.tier) score += 60;
        if (univ.preferredStyle === survey.solvingStyle) score += 50;
        else score -= 30;
        const isTarget = survey.targetUniversities.some(t => t.trim() !== '' && univ.name.includes(t.trim()));
        if (isTarget) score += 40;
        return { univ, score };
      });

      const sortedResult = scoredUniversities
        .sort((a, b) => b.score - a.score)
        .map(item => item.univ);

      const aiAnalysis = await generateAnalysis(survey);
      
      setResult({
        ...aiAnalysis,
        recommendedUniversities: sortedResult.slice(0, 5)
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [survey]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await saveLead(email, survey);
      if (result) {
        const [reportData, personaImage] = await Promise.all([
          generateDetailedReport(survey, result.personaName),
          generatePersonaImage(survey, result.personaName)
        ]);
        setResult({ 
          ...result, 
          detailedReport: reportData.sections, 
          groundingUrls: reportData.groundingUrls,
          personaImageUrl: personaImage 
        });
      }
      setSubmitted(true);
      setTimeout(() => setShowRoadmap(true), 500);
    } catch (err) {
      alert("전송 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="flex flex-col items-center text-center py-12 px-6 bg-white rounded-3xl shadow-xl border border-slate-100">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-200">
              <i className="fa-solid fa-calculator text-white text-3xl"></i>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
              2027 수리논술<br/>
              <span className="text-blue-600">성향 분석 계산기</span>
            </h1>
            <p className="text-slate-600 mb-10 max-w-sm text-lg leading-relaxed">
              당신의 수학적 강점과 학습 범위를 분석하여<br/>
              합격 가능성이 가장 높은 대학을 찾아드립니다.
            </p>
            <button onClick={startSurvey} className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-95 text-lg">
              3분 만에 진단하기
            </button>
          </div>
        );
      case 1:
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">목표하는 대학 라인은 어디인가요?</h2>
            <div className="grid gap-4">
              {['상위권', '중위권', '약술형'].map((t) => (
                <button key={t} onClick={() => { updateSurvey('tier', t as any); setStep(2); }} className={`p-5 rounded-2xl border-2 text-left transition-all ${survey.tier === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-slate-300'}`}>
                  <div className="font-bold text-lg">{t}</div>
                  <p className="text-sm opacity-70">
                    {t === '상위권' && '연세대, 고려대, 서강대, 성균관대 등'}
                    {t === '중위권' && '건국대, 아주대, 숙명여대, 단국대 등'}
                    {t === '약술형' && '가천대, 상명대, 을지대, 수원대 등'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">목표 대학 지망 순위를 알려주세요.</h2>
            <div className="space-y-4">
              {['1지망 (가장 가고 싶은 곳)', '2지망', '3지망'].map((label, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">{label}</label>
                  <input 
                    type="text" 
                    placeholder={idx === 0 ? "예: 연세대" : "예: 한양대"}
                    className="w-full p-4 rounded-xl border-2 border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:border-blue-500 outline-none font-bold shadow-inner"
                    value={survey.targetUniversities[idx]}
                    onChange={(e) => updateTargetUniv(idx, e.target.value)}
                  />
                </div>
              ))}
              <button 
                onClick={() => setStep(3)} 
                disabled={!survey.targetUniversities[0].trim()}
                className="w-full mt-4 bg-slate-900 text-white font-bold py-4 rounded-2xl disabled:opacity-50 transition-all shadow-lg hover:bg-slate-800"
              >
                다음 단계로 (최소 1지망 필수)
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">수능 선택 과목은 무엇인가요?</h2>
            <div className="grid grid-cols-1 gap-4">
              {['미적분', '확률과 통계', '기하'].map((s) => (
                <button key={s} onClick={() => { updateSurvey('csatSubject', s as any); setStep(4); }} className={`p-5 rounded-2xl border-2 text-left transition-all ${survey.csatSubject === s ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-100 hover:border-slate-300'}`}>
                  <span className="font-bold text-lg">{s}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="mt-6 text-slate-400 font-medium underline">이전으로</button>
          </div>
        );
      case 4:
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-2 text-slate-900">학습 가능한 범위를 모두 선택하세요.</h2>
            <div className="grid gap-3">
              {['수학 I', '수학 II', '미적분', '확률과 통계', '기하'].map((scope) => (
                <label key={scope} className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${survey.studyScope.includes(scope) ? 'border-blue-500 bg-blue-50' : 'border-slate-100'}`}>
                  <input type="checkbox" className="hidden" checked={survey.studyScope.includes(scope)} onChange={() => handleScopeToggle(scope)} />
                  <div className={`w-6 h-6 rounded-md border-2 mr-4 flex items-center justify-center ${survey.studyScope.includes(scope) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'}`}>
                    {survey.studyScope.includes(scope) && <i className="fa-solid fa-check text-white text-xs"></i>}
                  </div>
                  <span className="font-semibold">{scope}</span>
                </label>
              ))}
            </div>
            <button onClick={() => setStep(5)} disabled={survey.studyScope.length === 0} className="w-full mt-8 bg-slate-900 text-white font-bold py-4 rounded-xl">다음 단계로</button>
          </div>
        );
      case 5:
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">가장 자신 있는 풀이 스타일은?</h2>
            <div className="grid gap-4">
              {['연산 중심', '논증 중심'].map((style) => (
                <button key={style} onClick={() => { updateSurvey('solvingStyle', style as any); setStep(6); }} className={`p-6 rounded-2xl border-2 text-left transition-all ${survey.solvingStyle === style ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300'}`}>
                  <div className="font-bold text-lg">{style}</div>
                  <p className="text-sm opacity-70">{style === '연산 중심' ? '복잡한 식을 풀어 답을 도출하는 스타일' : '정의와 성질을 이용해 답의 근거를 밝히는 스타일'}</p>
                </button>
              ))}
            </div>
          </div>
        );
      case 6:
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-slate-900">답안 작성 시 가장 큰 고민은?</h2>
            <div className="grid gap-4">
              {['시간 부족/계산 실수', '논리 비약/서술 부족'].map((concern) => (
                <button key={concern} onClick={() => { updateSurvey('writingConcern', concern as any); calculateResults(); }} className="p-6 rounded-2xl border-2 text-left border-slate-100 hover:border-slate-300">
                  <div className="font-bold text-lg">{concern}</div>
                </button>
              ))}
            </div>
          </div>
        );
      case 7:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative w-20 h-20 mb-8">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 italic">Questio AI 분석 중...</h3>
          </div>
        );
      default:
        return null;
    }
  };

  if (showRoadmap && result && result.detailedReport) {
    return <RoadmapViewer data={survey} result={result} onClose={() => setShowRoadmap(false)} />;
  }

  if (result) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-10 shadow-xl text-center">
            <h1 className="text-3xl font-extrabold mb-4">당신은 [{result.personaName}]형입니다!</h1>
            <MathText text={`"${result.analysisText}"`} className="text-blue-100 italic text-lg leading-relaxed block px-4" />
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">성향 기반 추천 대학</h2>
              <p className="text-xs text-slate-400 font-bold">*범위/스타일/지망 순위 종합 분석</p>
            </div>
            <div className="space-y-4">
              {result.recommendedUniversities.map((univ, idx) => {
                const isInputTarget = survey.targetUniversities.some(t => t.trim() !== '' && univ.name.includes(t.trim()));
                const styleMatch = univ.preferredStyle === survey.solvingStyle;
                
                return (
                  <div key={idx} className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${idx === 0 ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-white'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${idx < 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {idx+1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-800 text-lg">{univ.name}</h4>
                        {isInputTarget && <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-black">지망 대학</span>}
                        {styleMatch ? (
                          <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-black">스타일 일치</span>
                        ) : (
                          <span className="bg-slate-100 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-black italic">스타일 보완 필요</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 leading-snug">{univ.features}</p>
                    </div>
                    <div className="hidden sm:block text-right">
                      <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Match Rate</div>
                      <div className="text-xl font-black text-slate-200">{100 - (idx * 5)}%</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold mb-4">15페이지 분량의 '필승 로드맵' 가이드 받기</h2>
              <p className="text-slate-400 mb-8 max-w-lg">
                {isSending ? 'AI가 귀하의 성향을 바탕으로 상세 보고서를 작성 중입니다...' : `${survey.targetUniversities[0]}를 포함한 지망 대학 맞춤형 전략이 담긴 프리미엄 PDF를 즉시 생성합니다.`}
              </p>
              {!submitted ? (
                <form onSubmit={handleLeadSubmit} className="w-full max-w-md flex flex-col sm:flex-row gap-3">
                  <input type="email" placeholder="로드맵을 받을 이메일 주소" required value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 bg-slate-800 border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  <button disabled={isSending} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-4 rounded-xl transition-all min-w-[140px]">
                    {isSending ? (
                      <span className="flex items-center gap-2 justify-center">
                        <i className="fa-solid fa-circle-notch animate-spin"></i> 생성 중
                      </span>
                    ) : '로드맵 신청'}
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="text-green-400 font-bold text-lg"><i className="fa-solid fa-check-circle mr-2"></i> 보고서 생성이 완료되었습니다!</div>
                  <button onClick={() => setShowRoadmap(true)} className="bg-white text-slate-900 font-bold px-8 py-4 rounded-xl shadow-xl hover:bg-slate-100 transition-all">
                    지금 바로 로드맵 열기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">{renderStep()}</div>
    </div>
  );
};

export default App;
