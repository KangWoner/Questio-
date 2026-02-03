
import { University } from './types';

export const UNIVERSITIES: University[] = [
  // 약술형 (Tier: 약술형)
  { name: '가천대', type: 1, tier: '약술형', scope: ['수학 I', '수학 II'], preferredStyle: '연산 중심', features: '약술형 논술의 메카, 빠르고 정확한 연산이 핵심' },
  { name: '수원대', type: 1, tier: '약술형', scope: ['수학 I', '수학 II'], preferredStyle: '연산 중심', features: '단답형 중심, 실수 없는 연산력이 합격의 열쇠' },
  { name: '상명대', type: 1, tier: '약술형', scope: ['수학 I', '수학 II'], preferredStyle: '논증 중심', features: '교과 개념의 정확한 정의와 서술 중시' },
  { name: '한국공학대', type: 1, tier: '약술형', scope: ['수학 I', '수학 II'], preferredStyle: '연산 중심', features: '공학적 계산 능력과 수능형 문항 익숙도 중요' },
  
  // 중위권 (Tier: 중위권)
  { name: '한양대(에리카)', type: 2, tier: '중위권', scope: ['수학 I', '수학 II', '미적분'], preferredStyle: '연산 중심', features: '전통적인 미적분 계산 비중이 높음' },
  { name: '건국대', type: 2, tier: '중위권', scope: ['수학 I', '수학 II', '미적분'], preferredStyle: '논증 중심', features: '함수의 성질을 이용한 논리적 추론 강조' },
  { name: '단국대', type: 2, tier: '중위권', scope: ['수학 I', '수학 II', '미적분'], preferredStyle: '연산 중심', features: '다양한 미적분 공식의 숙달과 적용 능력 요구' },
  { name: '아주대', type: 2, tier: '중위권', scope: ['수학 I', '수학 II', '미적분'], preferredStyle: '논증 중심', features: '긴 호흡의 논증과 증명 문항이 당락 결정' },
  { name: '숙명여대', type: 2, tier: '중위권', scope: ['수학 I', '수학 II', '미적분'], preferredStyle: '논증 중심', features: '정교한 답안 서술과 논리적 비약 방지 중요' },
  
  // 상위권 (Tier: 상위권)
  { name: '한양대', type: 2, tier: '상위권', scope: ['수학 I', '수학 II', '미적분'], preferredStyle: '연산 중심', features: '극강의 미적분 계산량, 시간 내 풀이 능력이 최우선' },
  { name: '서강대', type: 3, tier: '상위권', scope: ['수학 I', '수학 II', '미적분', '확률과 통계'], preferredStyle: '논증 중심', features: '전범위 통합 사고력과 엄밀한 논증 요구' },
  { name: '성균관대', type: 3, tier: '상위권', scope: ['수학 I', '수학 II', '미적분', '확률과 통계'], preferredStyle: '논증 중심', features: '제시문 기반의 추론과 학문적 깊이 평가' },
  { name: '중앙대', type: 3, tier: '상위권', scope: ['수학 I', '수학 II', '미적분', '확률과 통계'], preferredStyle: '연산 중심', features: '확통 파트의 복잡한 연산 및 케이스 분류가 핵심' },
  { name: '연세대', type: 4, tier: '상위권', scope: ['수학 I', '수학 II', '미적분', '확률과 통계', '기하'], preferredStyle: '논증 중심', features: '기하와 증명을 통한 독보적인 변별력 행사' },
  { name: '고려대', type: 4, tier: '상위권', scope: ['수학 I', '수학 II', '미적분', '확률과 통계', '기하'], preferredStyle: '논증 중심', features: '신설 전형, 전 영역에 걸친 고른 논리력 측정' },
  { name: '서울시립대', type: 4, tier: '상위권', scope: ['수학 I', '수학 II', '미적분', '확률과 통계', '기하'], preferredStyle: '연산 중심', features: '공대 중심의 기하 연산과 공간 지각력 요구' }
];
