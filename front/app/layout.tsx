import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cookies, headers } from "next/headers";
import { AuthProvider } from "@/context/AuthContext";
import UserInitializer from "@/components/UserInitializer";

export const metadata: Metadata = {
  title: "reclever",
  description: "재활용품 분류 추천 시스템",
  icons: "/logo.png",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isLoggedIn = !!cookieStore.get("reclever_access_token")?.value;

  const headerList = await headers();
  const userEmail = headerList.get("x-user-email") || "";

  return (
    <html lang="ko">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
      </head>
      <body>
        <AuthProvider isLoggedIn={isLoggedIn}>
          <UserInitializer email={userEmail} />
          <div style={styles.appContainer}>
            <Header />
            {children}
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appContainer: { maxWidth: "360px", margin: "0 auto" },
};
