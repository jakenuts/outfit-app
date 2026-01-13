export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-5xl font-bold text-red-600 mb-4">
          Outfit App
        </h1>
        <p className="text-xl text-red-500 mb-8">
          A minimal Next.js starter with TypeScript and Tailwind CSS
        </p>
        <div className="space-x-4">
          <a
            href="https://nextjs.org/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Next.js Docs
          </a>
          <a
            href="https://tailwindcss.com/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Tailwind Docs
          </a>
        </div>
      </div>
    </div>
  );
}
