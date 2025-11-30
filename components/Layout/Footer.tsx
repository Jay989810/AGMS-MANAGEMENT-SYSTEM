'use client';

export default function Footer({ darkMode }: { darkMode?: boolean }) {
  return (
    <footer className={`border-t ${darkMode ? 'border-gray-700 bg-transparent' : 'border-gray-200 bg-white'} mt-auto`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <span>Developed by</span>
          <a
            href="https://wa.me/07089799407"
            target="_blank"
            rel="noopener noreferrer"
            className={`font-semibold ${darkMode ? 'text-gold hover:text-white' : 'text-navy hover:text-gold'} transition-colors underline`}
          >
            JayOnChain
          </a>
        </div>
      </div>
    </footer>
  );
}

