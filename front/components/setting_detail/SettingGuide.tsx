'use client';

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { SettingDes } from '@/app/settings/[select]/content';

interface SettingGuideProps {
  serviceKey: string;
}

interface RenderStep {
  desc: string;
  img: string;
}

export default function SettingGuide({ serviceKey }: SettingGuideProps) {
  const router = useRouter();
  const currentService = SettingDes[serviceKey];
  const gmailService = SettingDes['gmail'];

  if (!currentService) {
    return (
      <div style={styles.appContainer}>
        <div style={{ ...styles.scrollContent, justifyContent: 'center', alignItems: 'center' }}>
          <p style={styles.subDescriptionText}>존재하지 않는 서비스 경로입니다.</p>
        </div>
      </div>
    );
  }

  // 네이버/다음 특수 배열 믹싱 헬퍼 함수
  const getMixedSteps = (): RenderStep[] => {
    const steps: RenderStep[] = [];
    if (!gmailService) return steps;

    const curLen = currentService.description.length;
    const gLen = gmailService.description.length;

    for (let i = 0; i < curLen - 1; i++) {
      steps.push({ desc: currentService.description[i], img: currentService.img[i] });
    }
    for (let i = 0; i < gLen - 1; i++) {
      steps.push({ desc: gmailService.description[i], img: gmailService.img[i] });
    }
    if (curLen > 0) {
      steps.push({ desc: currentService.description[curLen - 1], img: currentService.img[curLen - 1] });
    }
    if (gLen > 0) {
      steps.push({ desc: gmailService.description[gLen - 1], img: gmailService.img[gLen - 1] });
    }
    return steps;
  };

  const getSequentialSteps = (): RenderStep[] => {
    return currentService.description.map((desc, idx) => ({
      desc,
      img: currentService.img[idx] || '',
    }));
  };

  const isMixedService = serviceKey === 'naver' || serviceKey === 'daum';
  const renderSteps = isMixedService ? getMixedSteps() : getSequentialSteps();

  return (
    <div style={styles.appContainer}>
      {/* 1. 상단 백버튼 상시 대기 헤더 바 */}
      <div style={styles.headerBlock}>
        <button 
          onClick={() => router.back()} 
          style={styles.backBtn}
        >
          <ChevronLeft size={22} color="#1D1D1F" />
        </button>
      </div>

      {/* 스크롤 가능한 메인 가이드 영역 */}
      <div style={styles.scrollContent} className="scroll-hide">
        
        {/* 2. 서비스 메인 타이틀 헤더 섹션 */}
        <div style={styles.guideHeaderSection}>
          <div style={styles.titleInfoRow}>
            {currentService.logo && (
              <img 
                src={currentService.logo} 
                alt="logo" 
                style={styles.serviceLogoIcon}
              />
            )}
            <h1 style={styles.guideTitleText}>{currentService.title || '연동 설정 가이드'}</h1>
          </div>
          <div style={styles.envMetaLine}>
            {currentService.pcActive && (<span style={styles.envBadge}>안내</span>)}
            <span style={styles.envText}>
              {currentService.pcActive ? 'PC 환경에서만 설정 가능합니다.' : ''}
            </span>
          </div>
        </div>

        {/* 3. 단계별 카드 가이드 보드 루프 */}
        {renderSteps.map((step, index) => (
          <div key={index} style={styles.stepCardContainer}>
            {/* 단락별 상단 정보 바 (Step 번호 표기) */}
            <div style={styles.stepHeaderLine}>
              <div style={styles.stepIndexBadge}>STEP {index + 1}</div>
            </div>

            {/* 본문 안내 설명문 */}
            <h2 style={styles.stepDescText}>{step.desc}</h2>

            {/* 내부 가이드 이미지 배정 */}
            {step.img && (
              <div style={styles.imageFrameWrapper}>
                <Image
                  src={step.img}
                  alt={`Step ${index + 1} screenshot`}
                  width={720}
                  height={450}
                  unoptimized
                  className="w-full h-auto block object-contain"
                  style={{ borderRadius: '8px' }}
                  priority={index < 2}
                />
              </div>
            )}
          </div>
        ))}

      </div>
    </div>
  );
}

// 제공해주신 메인 페이지 스타일북 규칙 완벽 동기화 명세
const styles: Record<string, React.CSSProperties> = {
  appContainer: { width: '100%', padding: '0 0 24px 0', height: '90vh', backgroundColor: '#F5F5F7', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', margin: '0 auto', boxSizing: 'border-box' },
  
  // 헤더 바 & 백버튼
  headerBlock: { display: 'flex', alignItems: 'center', padding: '12px 16px', backgroundColor: 'transparent' },
  backBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' },

  // 내부 스크롤뷰
  scrollContent: { flex: 1, overflowY: 'auto', padding: '0 16px 100px 16px', display: 'flex', flexDirection: 'column', gap: '14px' },
  
  // 타이틀 요약 프로필 탑섹션 대체 구조
  guideHeaderSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', margin: '4px 0 16px 0', gap: '10px' },
  titleInfoRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  serviceLogoIcon: { width: '22px', height: '22px', objectFit: 'contain' },
  guideTitleText: { fontSize: '19px', fontWeight: '700', color: '#1D1D1F', letterSpacing: '-0.3px' },
  
  envMetaLine: { display: 'flex', alignItems: 'center', gap: '6px' },
  envBadge: { backgroundColor: '#E5E5EA', borderRadius: '8px', padding: '2px 6px', fontSize: '11px', fontWeight: '600', color: '#48484A' },
  envText: { fontSize: '13px', fontWeight: '500', color: '#86868B', letterSpacing: '-0.1px' },
  subDescriptionText: { fontSize: '13px', fontWeight: '500', color: '#86868B' },

  // 제공해주신 FAQ 카드 보드를 계승한 스텝별 백색 카드 모듈
  stepCardContainer: { backgroundColor: '#FFFFFF', borderRadius: '16px', padding: '18px 16px', display: 'flex', flexDirection: 'column', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' },
  stepHeaderLine: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  stepIndexBadge: { backgroundColor: '#3A3A3C', borderRadius: '10px', padding: '3px 8px', fontSize: '11px', fontWeight: '700', color: '#FFFFFF', letterSpacing: '0.2px' },
  
  // 과도하게 컸던 글자 크기 보완 및 pText 수준 정돈
  stepDescText: { fontSize: '14.5px', fontWeight: '600', color: '#1D1D1F', lineHeight: '1.55', margin: '0 0 16px 0', paddingLeft: '2px', wordBreak: 'keep-all' },
  
  // 이미지 내부 액션 프레임
  imageFrameWrapper: { width: '100%', overflow: 'hidden', border: '1px solid #F5F5F7', borderRadius: '10px', backgroundColor: '#FAFAFA' }
};