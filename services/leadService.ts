
export const saveLead = async (email: string, surveyData: any) => {
  // 실제 운영시에는 아래 URL에 Zapier 또는 본인 서버의 Webhook 주소를 입력합니다.
  // const WEBHOOK_URL = 'https://hooks.zapier.com/...'
  
  console.log("Saving Lead:", { email, surveyData, timestamp: new Date().toISOString() });

  // 로컬 스토리지에 저장 (데모용 관리자 확인용)
  const existingLeads = JSON.parse(localStorage.getItem('questio_leads') || '[]');
  existingLeads.push({ email, surveyData, date: new Date().toLocaleDateString() });
  localStorage.setItem('questio_leads', JSON.stringify(existingLeads));

  // 서버 전송 시뮬레이션
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true });
    }, 1500);
  });
};
