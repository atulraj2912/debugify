import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-[#0a0a0a]/80 backdrop-blur-md z-50 border-b border-[#ff6b35]/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold">
            <span className="text-[#ff6b35]">Debug</span>
            <span className="text-white">ify</span>
          </div>
          <div className="hidden md:flex gap-8 items-center mr-48">
            <a href="#features" className="hover:text-[#ff6b35] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#ff6b35] transition-colors">How It Works</a>
            <a href="#about" className="hover:text-[#ff6b35] transition-colors">About</a>
          </div>
          {/* Auth buttons are in the layout.tsx header (top-right) */}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-full">
            <span className="text-[#ff6b35] font-semibold">✨ AI-Powered Debugging</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Debug Smarter, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b35] to-[#ff8c42]">
              Code Faster
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-3xl mx-auto">
            Transform your coding experience with our AI-based conversational code debugger and editor. 
            Chat with your code, fix bugs instantly, and boost your productivity by 10x.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/editor">
              <button className="bg-[#ff6b35] hover:bg-[#ff8c42] px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-[#ff6b35]/50">
                Start Debugging Now →
              </button>
            </Link>
            <button className="border-2 border-[#ff6b35] hover:bg-[#ff6b35]/10 px-8 py-4 rounded-lg font-bold text-lg transition-all">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-[#111111]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Powerful <span className="text-[#ff6b35]">Features</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-[#ff6b35]/20 hover:border-[#ff6b35] transition-all hover:shadow-lg hover:shadow-[#ff6b35]/20">
              <div className="w-12 h-12 bg-[#ff6b35]/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Conversational AI</h3>
              <p className="text-gray-400">
                Chat naturally with your code. Ask questions, get explanations, and receive intelligent suggestions in real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-[#ff6b35]/20 hover:border-[#ff6b35] transition-all hover:shadow-lg hover:shadow-[#ff6b35]/20">
              <div className="w-12 h-12 bg-[#ff6b35]/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🐛</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Instant Bug Detection</h3>
              <p className="text-gray-400">
                AI-powered analysis identifies bugs before they become problems. Get automatic fix suggestions with explanations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-[#ff6b35]/20 hover:border-[#ff6b35] transition-all hover:shadow-lg hover:shadow-[#ff6b35]/20">
              <div className="w-12 h-12 bg-[#ff6b35]/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Smart Code Editing</h3>
              <p className="text-gray-400">
                Context-aware code completion and refactoring. Write better code faster with AI assistance.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-[#ff6b35]/20 hover:border-[#ff6b35] transition-all hover:shadow-lg hover:shadow-[#ff6b35]/20">
              <div className="w-12 h-12 bg-[#ff6b35]/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Code Analysis</h3>
              <p className="text-gray-400">
                Deep insights into code quality, performance bottlenecks, and security vulnerabilities.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-[#ff6b35]/20 hover:border-[#ff6b35] transition-all hover:shadow-lg hover:shadow-[#ff6b35]/20">
              <div className="w-12 h-12 bg-[#ff6b35]/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Multi-Language Support</h3>
              <p className="text-gray-400">
                Works with JavaScript, Python, Java, C++, and 50+ programming languages seamlessly.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#0a0a0a] p-8 rounded-2xl border border-[#ff6b35]/20 hover:border-[#ff6b35] transition-all hover:shadow-lg hover:shadow-[#ff6b35]/20">
              <div className="w-12 h-12 bg-[#ff6b35]/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Performance Optimization</h3>
              <p className="text-gray-400">
                Get recommendations to optimize your code performance and reduce resource usage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            How It <span className="text-[#ff6b35]">Works</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff6b35] rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Paste Your Code</h3>
              <p className="text-gray-400">
                Simply paste your code or connect your repository to get started instantly.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff6b35] rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Ask Questions</h3>
              <p className="text-gray-400">
                Chat with the AI about bugs, improvements, or any coding questions you have.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#ff6b35] rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Get Solutions</h3>
              <p className="text-gray-400">
                Receive instant fixes, explanations, and optimizations tailored to your code.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="py-20 px-6 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-black">
            Ready to Transform Your Coding?
          </h2>
          <p className="text-xl mb-8 text-black/80">
            Join thousands of developers who are already coding smarter with AI assistance. 
            Free and open for everyone!
          </p>
          <Link href="/editor">
            <button className="bg-black hover:bg-gray-900 text-white px-10 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-2xl">
              Launch Editor →
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-[#111111] border-t border-[#ff6b35]/20">
        <div className="max-w-7xl mx-auto text-center text-gray-400">
          <p className="mb-4">
            <span className="text-[#ff6b35] font-bold">Debug</span>
            <span className="text-white font-bold">ify</span>
            <span className="ml-2">- Your AI Coding Assistant</span>
          </p>
          <p>© 2025 Debugify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
