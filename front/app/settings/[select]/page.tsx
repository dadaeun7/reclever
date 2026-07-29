import SettingGuide from "@/components/setting_detail/SettingGuide";

interface PageProps {
  params: Promise<{
    select: string;
  }>;
}

export default async function SettingDetailPage({ params }: PageProps){

// Promise 풀어서 serviceKey 추출
  const resolvedParams = await params;
  const serviceKey = resolvedParams.select; 

  console.log('serviceKey: ' +serviceKey);

  // 하위 컴포넌트로 전달
  return <SettingGuide serviceKey={serviceKey} />;
}