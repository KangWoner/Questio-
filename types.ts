
export type UniversityTier = '상위권' | '중위권' | '약술형';

export type Subject = '미적분' | '확률과 통계' | '기하';

export interface SurveyData {
  tier: UniversityTier;
  csatSubject: Subject;
  studyScope: string[];
  solvingStyle: '연산 중심' | '논증 중심';
  writingConcern: '시간 부족/계산 실수' | '논리 비약/서술 부족';
  targetUniversities: string[];
}

export interface University {
  name: string;
  type: number;
  scope: string[];
  features: string;
  preferredStyle: '연산 중심' | '논증 중심'; // 추가: 대학이 선호하는 풀이 스타일
  tier: UniversityTier; // 추가: 대학의 등급 분류
}

export interface DiagramData {
  type: 'radar' | 'flowchart' | 'comparison';
  data: any;
}

export interface ReportSection {
  title: string;
  content: string;
  proTip?: string;
  diagramDescription?: string;
  diagram?: DiagramData;
}

export interface AnalysisResult {
  personaName: string;
  analysisText: string;
  recommendedUniversities: University[];
  detailedReport?: ReportSection[];
}
