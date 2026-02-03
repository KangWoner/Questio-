
import { GoogleGenAI, Type } from "@google/genai";
import { SurveyData, ReportSection } from "../types";
import { retrieveGuidelines } from "./retrievalService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAnalysis = async (data: SurveyData): Promise<{ personaName: string; analysisText: string }> => {
  const targetList = data.targetUniversities.filter(u => u.trim() !== '').join(', ');
  const prompt = `
    수리논술 전문 컨설턴트로서 다음 수험생의 데이터를 분석하여 맞춤형 결과 요약과 분석을 제공해주세요.
    
    [수험생 데이터]
    - 목표 대학 라인: ${data.tier}
    - 지망 대학 리스트: ${targetList}
    - 수능 선택 과목: ${data.csatSubject}
    - 현재 학습 가능한 범위: ${data.studyScope.join(', ')}
    - 자신 있는 스타일: ${data.solvingStyle}
    - 가장 큰 고민: ${data.writingConcern}
    
    [요구사항]
    1. 이 학생을 정의하는 한 줄 페르소나 이름 (예: "연산 기반 약술형 특화 - 가천대 실전 필승형")
    2. 데이터에 기반한 상세 분석. 1지망 대학을 중심으로 설명하되, 모든 수학적 기호와 논리 연결어(그러므로, 왜냐하면 등)는 반드시 LaTeX 문법($ \therefore $, $ \because $, $ f(x) $, $ \int $)을 사용하여 설명하십시오.
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
    return { personaName: `${data.targetUniversities[0]} 전략가`, analysisText: "분석 중 오류가 발생했습니다." };
  }
};

export const generatePersonaImage = async (data: SurveyData, personaName: string): Promise<string | undefined> => {
  const isCalculation = data.solvingStyle === '연산 중심';
  const styleTheme = isCalculation 
    ? "Futuristic mechanical grid, blueprint of mathematical logic, 3D calculus structures, glowing blue lines on deep slate background, abstract architectural geometry."
    : "Prism reflecting light into spectrums of logic, crystalline structures representing mathematical proofs, ethereal layers of geometric derivations, clean minimalist academic art.";
  
  const prompt = `
    [ABSURDLY CRITICAL REQUIREMENT: NO TEXT AT ALL. NO LETTERS. NO NUMBERS. NO KOREAN. NO ENGLISH. NO CHARACTERS. NO SYMBOLS THAT LOOK LIKE TEXT.]
    A professional, high-end abstract visualization representing a student's mathematical intuition and logic.
    Concept: ${styleTheme}
    Composition: Wide-angle, cinematic lighting, 4k, deep Indigo and Slate palette.
    Subject: Purely abstract geometric patterns, fractals, or architectural math structures.
    Constraint: Completely blank of any typography or fonts. Do not try to write any title.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image generation failed", error);
    return undefined;
  }
};

export const generateDetailedReport = async (data: SurveyData, persona: string): Promise<{ sections: ReportSection[], groundingUrls: {uri: string, title: string}[] }> => {
  const targetList = data.targetUniversities.filter(u => u.trim() !== '');
  const guidelines = retrieveGuidelines(targetList);
  
  const prompt = `
    당신은 대한민국 최고의 수리논술 입시 전문가입니다. 
    페르소나명이 '${persona}'인 수험생을 위한 **총 15개의 섹션으로 구성된 방대한 분량의 심층 보고서**를 작성하십시오.
    
    [참조 모집요강 데이터]: 
    ${guidelines}
    
    [필수 규칙]
    - 모든 수학 공식과 기호는 반드시 $ ... $ LaTeX 형식을 지키십시오. 
    - 특히 기호 ($ \\therefore $, $ \\because $, $ \\implies $, $ f(x) $, $ \\alpha $, $ \\beta $)를 적극 활용하십시오.
    - 각 섹션은 최소 5~8문장 이상의 풍부한 내용을 담아야 합니다.

    [보고서 섹션 상세 구성 가이드 (반드시 15개를 모두 생성하세요)]
    1. 리포트 개요 및 총평: 학생의 성향과 2027 입시 지형의 결합 분석.
    2. 데이터 기반 심층 성향 분석: ${data.solvingStyle} 역량의 수치화된 해석.
    3. ${targetList.join(', ')} 합격 가능성 분석: 최신 요강에 따른 대학별 유불리 판단.
    4. ${data.solvingStyle} 강점 극대화 전략: 실제 답안 작성 시 강점 활용법.
    5. ${data.writingConcern} 해결 및 시간 관리: 약점을 극복하는 실전 테크닉.
    6. [1~4주차] 기본 다지기: 수학 I, II 주요 논증 주제 정리.
    7. [5~8주차] 심화 논증 정복: 미적분/확통/기하 고난도 문항 대비.
    8. [9~12주차] 대학별 파이널: 지망 대학 기출 분석 로드맵.
    9. 대학별 채점 기준표(Rubric) 독해법: 교수들이 점수를 주는 '키워드' 선별.
    10. 감점 방지 답안 서술 테크닉: $ \\therefore $ 와 $ \\because $ 를 활용한 논리 연결법.
    11. 고난도 문항 발상법: 제시문에서 힌트를 찾아 식으로 연결하는 법.
    12. 합격생 오답 노트 사례: 비슷한 성향의 합격생이 범했던 실수 분석.
    13. 시험장 멘탈 및 컨디션 관리: 논술 고사 당일 시간 운용 전략.
    14. 수능 최저 학력 기준 및 정시 병행: 논술 100% 전형과 최저 있는 전형의 배분.
    15. 합격을 위한 최종 제언: 입시 전문가로서의 마지막 독려와 핵심 요약.

    반드시 위 15개 항목을 누락 없이 JSON 배열 형태로 반환하십시오.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
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
                  type: { type: Type.STRING, description: "One of: 'radar', 'flowchart', 'comparison'" },
                  data: { 
                    type: Type.OBJECT, 
                    description: "Diagram data parameters",
                    properties: {
                      labels: { type: Type.ARRAY, items: { type: Type.STRING } },
                      studentValues: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                      targetValues: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                      steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                      categories: { type: Type.ARRAY, items: { type: Type.STRING } },
                      score: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                    }
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

    const sections = JSON.parse(response.text);
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingUrls = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({ uri: chunk.web.uri, title: chunk.web.title }));

    return { sections, groundingUrls };
  } catch (error) {
    console.error("Report Generation Failed:", error);
    // API 실패 시 사용자에게 보여줄 최소한의 15개 섹션 폴백 데이터
    const fallbackSections = [
      "리포트 개요", "심층 성향 분석", "대학별 합격 분석", "강점 극대화", "약점 보완 전략",
      "개념 재구성", "심화 논증", "대학별 파이널", "채점 기준 독해", "답안 서술 테크닉",
      "고난도 발상법", "오답 노트 사례", "시험장 관리", "정시 병행 전략", "최종 제언"
    ].map(title => ({
      title,
      content: "상세 분석 내용을 생성하는 중 일시적인 오류가 발생했습니다. 잠시 후 '로드맵 신청' 버튼을 다시 눌러 생성해 주세요. 귀하의 데이터는 안전하게 보관되어 있습니다.",
      proTip: "다시 시도하시면 AI가 더 정교한 분석 결과를 제공합니다.",
      diagramDescription: "데이터 로딩 중...",
      diagram: { type: 'flowchart', data: { steps: ['데이터 수집', '분석 대기', '재전송 필요'] } }
    }));
    return { sections: fallbackSections as any, groundingUrls: [] };
  }
};
