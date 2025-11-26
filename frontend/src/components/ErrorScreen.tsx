import { AlertCircle } from 'lucide-react';

interface ErrorScreenProps {
  error: string;
}

export default function ErrorScreen({ error }: ErrorScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="text-center max-w-md px-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h1>
        <p className="text-lg text-gray-600 mb-8">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );
}
