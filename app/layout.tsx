import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Debugify - AI-Powered Code Debugger & Editor",
  description: "Transform your coding experience with Debugify's AI-powered debugging and intelligent code editing. Chat with your code, fix bugs instantly, and boost productivity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <SignedOut>
            <div className="fixed top-0 right-0 z-[60] flex items-center gap-3 p-6">
              <SignInButton mode="modal">
                <button className="bg-transparent border border-[#ff6b35] text-[#ff6b35] rounded-lg font-medium text-sm h-10 px-4 hover:bg-[#ff6b35]/10 transition-all">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-[#ff6b35] text-white rounded-lg font-medium text-sm h-10 px-4 hover:bg-[#ff8c42] transition-all">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="fixed top-0 right-0 z-[60] flex items-center p-6">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10 border-2 border-[#ff6b35]"
                  }
                }}
              />
            </div>
          </SignedIn>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
