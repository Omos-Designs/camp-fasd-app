import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="bg-camp-green shadow-md">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">CAMP FASD</h1>
            <p className="text-white/90 mt-1">Camper Application Portal</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-6 py-2 bg-white text-camp-green font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-camp-orange text-white font-semibold rounded-lg hover:bg-camp-orange/90 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-camp-charcoal mb-4">
              Welcome to CAMP!
            </h2>
            <p className="text-xl text-gray-600">
              A FASD Community - Camper Application System
            </p>
          </div>

          {/* Status Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Backend Status */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-camp-green">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-camp-charcoal">Backend API</h3>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Running
                </span>
              </div>
              <p className="text-gray-600 mb-4">FastAPI server is active and healthy</p>
              <a
                href="http://localhost:8000/api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-camp-green hover:text-camp-orange font-medium transition-colors"
              >
                View API Docs →
              </a>
            </div>

            {/* Database Status */}
            <div className="bg-white rounded-lg shadow-lg p-6 border-t-4 border-camp-orange">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-camp-charcoal">Database</h3>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Connected
                </span>
              </div>
              <p className="text-gray-600 mb-2">Supabase PostgreSQL</p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>✓ 17 application sections</li>
                <li>✓ 44 sample questions</li>
                <li>✓ Super admin configured</li>
              </ul>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-camp-charcoal mb-4">
              🚀 System Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <h4 className="font-semibold text-camp-charcoal">Foundation Complete</h4>
                  <p className="text-gray-600 text-sm">
                    Project structure, database schema, and configuration are ready
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <h4 className="font-semibold text-camp-charcoal">Backend Running</h4>
                  <p className="text-gray-600 text-sm">
                    FastAPI server on port 8000 with health check endpoints
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">✅</span>
                <div>
                  <h4 className="font-semibold text-camp-charcoal">Frontend Running</h4>
                  <p className="text-gray-600 text-sm">
                    Next.js development server on port 3000
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-2xl mr-3">🚧</span>
                <div>
                  <h4 className="font-semibold text-camp-charcoal">Ready for Development</h4>
                  <p className="text-gray-600 text-sm">
                    Authentication, application forms, and admin dashboard ready to build
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <a
              href="http://localhost:8000/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-camp-green hover:bg-camp-green/90 text-white rounded-lg p-4 text-center font-medium transition-colors shadow-md"
            >
              API Documentation
            </a>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-camp-orange hover:bg-camp-orange/90 text-white rounded-lg p-4 text-center font-medium transition-colors shadow-md"
            >
              Supabase Dashboard
            </a>
            <a
              href="http://localhost:8000/api/health"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-camp-charcoal hover:bg-camp-charcoal/90 text-white rounded-lg p-4 text-center font-medium transition-colors shadow-md"
            >
              Health Check
            </a>
          </div>

          {/* Admin Info */}
          {/* <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold text-blue-900 mb-2">👤 Super Admin Account</h4>
            <p className="text-blue-800 text-sm">
              <strong>Email:</strong> yianni@fasdcamp.org<br />
              <strong>Password:</strong> ChangeMe123!<br />
              <span className="text-blue-600 text-xs">
                (Login page will be available once authentication is implemented)
              </span>
            </p>
          </div> */}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-camp-charcoal text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/80">
            CAMP – A FASD Community | Application Portal v1.0.0
          </p>
          <p className="text-white/60 text-sm mt-2">
            Development Environment | Port 3000
          </p>
        </div>
      </footer>
    </main>
  )
}