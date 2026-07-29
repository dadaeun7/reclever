interface DesProps {
  title: string;
  logo: string;
  img: string[];
  pcActive: boolean;
  description: string[];
}

const GOOGLE_IMG_ROOT = "/google/google-";
const NAVER_IMG_ROOT = "/naver/naver-";
const DAUM_IMG_ROOT = "/daum/daum-";
const KERLY_IMG_ROOT = "/kerly/kerly-";
const BAEMIN_IMG_ROOT = "/baemin/baemin-";
const COUPANG_IMG_ROOT = "/coupang/coupang-";

export const SettingDes: { [key: string]: DesProps } = {
  gmail: {
    title: "",
    logo: "",
    img: [
      GOOGLE_IMG_ROOT + "1.png",
      GOOGLE_IMG_ROOT + "2.png",
      GOOGLE_IMG_ROOT + "3.png",
      GOOGLE_IMG_ROOT + "4.png",
      GOOGLE_IMG_ROOT + "5.png",
    ],
    pcActive: true,
    description: [
      "지메일 접속 후 설정 아이콘을 누르고, 모든 설정 보기를 클릭합니다.",
      "계정 및 가져오기에서 다른 계정에서 메일 확인하기에 메일 계정 추가를 클릭합니다.",
      "연동하려는 이메일 주소를 입력 후 다음을 누릅니다.",
      "다른 계정에서 이메일 가져오기(POP3) 선택합니다.",
      "아니요 체크 후 완료를 누릅니다.",
    ],
  },
  naver: {
    title: "네이버 → gmail에 연동하기",
    logo: NAVER_IMG_ROOT + "logo.png",
    img: [
      NAVER_IMG_ROOT + "1.png",
      NAVER_IMG_ROOT + "2.png",
      NAVER_IMG_ROOT + "3.png",
      NAVER_IMG_ROOT + "4.png",
      NAVER_IMG_ROOT + "5.png",
    ],
    pcActive: true,
    description: [
      "네이버 메인 페이지 자물쇠 아이콘을 클릭합니다.",
      "2단계 인증 관리에 접속합니다.",
      "네이버 계정 비밀번호를 입력합니다.",
      "애플리케이션 종류: 지메일, 비밀번호 생성하기를 통해 생성된 비밀번호 12자리를 확인합니다.",
      "네이버 이메일, 네이버 애플리케이션 비밀번호와 이미지와 같이 나머지 설정을 해줍니다.",
    ],
  },
  daum: {
    title: "다음 → gmail에 연동하기",
    logo: DAUM_IMG_ROOT + "logo.png",
    img: [
      DAUM_IMG_ROOT + "1.png",
      DAUM_IMG_ROOT + "2.png",
      DAUM_IMG_ROOT + "3.png",
      DAUM_IMG_ROOT + "4.png",
      DAUM_IMG_ROOT + "5.png",
      DAUM_IMG_ROOT + "6.png",
      DAUM_IMG_ROOT + "7.png",
    ],
    pcActive: true,
    description: [
      "다음 메인 페이지에서 메일을 클릭합니다.",
      "이미지 순서대로 체크 후 2단계 인증 설정하기를 클릭합니다.",
      "다음 계정 비밀번호를 입력합니다.",
      "앱 비밀번호로 접속합니다.",
      "자신의 gmail 계정 입력 후 생성을 클릭합니다.",
      "앱 비밀번호를 복사해둡니다.",
      "다음 이메일, 다음 애플리케이션 비밀번호와 이미지와 같이 나머지 설정을 해줍니다.",
    ],
  },
  kerly: {
    title: "컬리 수신 이메일 변경하기",
    logo: KERLY_IMG_ROOT + "logo.png",
    img: [
      KERLY_IMG_ROOT + "1.png",
      KERLY_IMG_ROOT + "2.png",
      KERLY_IMG_ROOT + "3.png",
    ],
    pcActive: false,
    description: [
      "마이컬리 > 회원 정보 관리에 접속합니다.",
      "회원 정보 관리 > 개인 정보 수정에 접속합니다.",
      "개인 정보 수정 > 이메일을 변경합니다.",
    ],
  },
  baemin: {
    title: "배달의 민족 수신 이메일 변경하기",
    logo: BAEMIN_IMG_ROOT + "logo.png",
    img: [
      BAEMIN_IMG_ROOT + "1.png",
      BAEMIN_IMG_ROOT + "2.png",
      BAEMIN_IMG_ROOT + "3.png",
    ],
    pcActive: false,
    description: [
      "마이배민 > 연필 아이콘을 클릭합니다.",
      "내 정보 수정 > 대표 이메일을 클릭합니다.",
      "대표이메일 변경 > 이메일 직접 등록하기 합니다.",
    ],
  },
  coupang: {
    title: "쿠팡 수신 이메일 변경하기",
    logo: COUPANG_IMG_ROOT + "logo.png",
    img: [
      COUPANG_IMG_ROOT + "1.png",
      COUPANG_IMG_ROOT + "2.png",
      COUPANG_IMG_ROOT + "3.png",
    ],
    pcActive: false,
    description: [
      "마이쿠팡 > 설정 아이콘을 클릭합니다.",
      "내정보관리 > 회원정보 수정을 클릭합니다.",
      "회원정보확인 > 아이디(이메일) 수정을 합니다.",
    ],
  },
};
