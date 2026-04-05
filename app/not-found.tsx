import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 text-5xl font-bold text-gray-700">404</div>
      <h1 className="text-xl font-semibold text-white mb-2">Page not found</h1>
      <p className="text-gray-400 text-sm mb-8">
        This system may have been deleted or the URL is incorrect.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Back to COMPASS OS
      </Link>
    </div>
  )
}
