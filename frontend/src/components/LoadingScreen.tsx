export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-purple-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent mb-4"></div>
        <h2 className="text-2xl font-semibold text-gray-800">Loading presentation...</h2>
        <p className="text-gray-600 mt-2">Please wait while we prepare your experience</p>
      </div>
    </div>
  );
}
