
import { GoogleGenAI, Type } from "@google/genai";
import { SurveyData, ReportSection } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAnalysis = async (data: SurveyData): Promise<{ personaName: string; analysisText: string }> => {
  const targetList = data.targetUniversities.filter(u => u.trim() !== '').join(', ');
  const prompt = `
    수리논술 전문 컨설턴트로서 다음 수험생의 데이터를 분석하여 맞춤형 결과 요약과 분석을 제공해주세요.
    
    [수험생 데이터]
    - 목표 대학 라인: ${data.tier}
    - 지망 대학 리스트 (1, 2, 3지망): ${targetList}
    - 수능 선택 과목: ${data.csatSubject}
    - 현재 학습 가능한 범위: ${data.studyScope.join(', ')}
    - 자신 있는 스타일: ${data.solvingStyle}
    - 가장 큰 고민: ${data.writingConcern}
    
    [요구사항]
    1. 이 학생을 정의하는 한 줄 페르소나 이름 (예: "기하 탑재 논증 특화 - 연세대형", "전략적 확통 보완 - 성균관대형" 등)
    2. 데이터에 기반한 3~4문장의 상세 분석. 특히 1지망인 ${data.targetUniversities[0]}와 나머지 지망 대학들 사이의 공통된 전략을 찾아주세요.
    3. JSON 형식으로 응답하세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            personaName: { type: Type.STRING },
            analysisText: { type: Type.STRING }
          },
          required: ["personaName", "analysisText"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    return { personaName: `${data.targetUniversities[0]} 전략가`, analysisText: "분석 중 오류가 발생했습니다. 하지만 귀하의 지망 대학들을 중심으로 최적의 분석 결과를 제공합니다." };
  }
};

export const generateDetailedReport = async (data: SurveyData, persona: string): Promise<ReportSection[]> => {
  const targetList = data.targetUniversities.filter(u => u.trim() !== '').join(', ');
  const prompt = `
    당신은 대한민국 최고의 수리논술 입시 전문가입니다. 
    페르소나명이 '${persona}'인 수험생을 위한 '15페이지 합격 전략 보고서'의 내용을 생성하십시오.
    
    [수험생 상세 프로필]
    - 지망 대학: ${targetList}
    - 학습 범위: ${data.studyScope.join(', ')}
    - 강점: ${data.solvingStyle}
    - 약점: ${data.writingConcern}
    
    [보고서 섹션별 시각화(Diagram) 규칙]
    각 섹션마다 'diagram' 객체를 생성하십시오. 
    1. type: 'radar' | 'flowchart' | 'comparison' 중 하나를 선택.
    2. data 구조 (type에 따라 아래 필드 중 필요한 것만 포함):
       - radar 사용 시: labels, studentValues, targetValues 필드 포함
       - flowchart 사용 시: steps 필드 포함
       - comparison 사용 시: categories, score 필드 포함

    [섹션 구성]
    1. 표지 및 리포트 개요
    2. 데이터 기반 심층 성향 분석
    3. ${targetList} 합격 가능성 분석
    4. ${data.solvingStyle} 강점 극대화 포지셔닝
    5. ${data.writingConcern} 해결 시간 운용 전략
    6. 1~4주차: 개념 재구조화
    7. 5~8주차: 심화 논증 정복
    8. 9~12주차: 대학별 파이널 실전
    9. 대학별 채점 기준표 독해법
    10. 감점 방지 답안 서술 테크닉
    11. 고난도 문항 발상법
    12. 합격생 오답 노트 사례
    13. 시험장 멘탈 관리
    14. 수능 최저 및 정시 병행
    15. 합격을 위한 마지막 제언

    JSON 배열 형식으로 반환하십시오.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              proTip: { type: Type.STRING },
              diagramDescription: { type: Type.STRING },
              diagram: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  data: { 
                    type: Type.OBJECT,
                    properties: {
                      labels: { type: Type.ARRAY, items: { type: Type.STRING } },
                      studentValues: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                      targetValues: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                      steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                      categories: { type: Type.ARRAY, items: { type: Type.STRING } },
                      score: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                    },
                    description: "Diagram data fields. Use labels/studentValues/targetValues for radar, steps for flowchart, or categories/score for comparison."
                  }
                },
                required: ["type", "data"]
              }
            },
            required: ["title", "content", "proTip", "diagramDescription", "diagram"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Report Generation Error:", error);
    return Array(15).fill(0).map((_, i) => ({
      title: `${i+1}번 섹션: 분석 보고서`,
      content: "상세 내용을 생성하는 중 오류가 발생했습니다.",
      proTip: "다시 시도해 주세요.",
      diagramDescription: "데이터 시각화 영역",
      diagram: { type: 'flowchart', data: { steps: ['데이터 수집', 'AI 분석', '전략 생성'] } }
    }));
  }
};
