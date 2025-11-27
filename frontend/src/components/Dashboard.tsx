import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Eye, Edit, Trash2, ExternalLink, BarChart3 } from 'lucide-react';

interface Presentation {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  _count: {
    versions: number;
  };
}

export default function Dashboard() {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPresentations();
  }, []);

  const fetchPresentations = async () => {
    try {
      const response = await axios.get('/api/presentations');
      setPresentations(response.data.data);
    } catch (error) {
      console.error('Failed to fetch presentations:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePresentation = async (id: string) => {
    if (!confirm('Are you sure you want to delete this presentation?')) return;

    try {
      await axios.delete(`/api/presentations/${id}`);
      setPresentations(presentations.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Failed to delete presentation:', error);
      alert('Failed to delete presentation');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Storydoc</h1>
              <p className="text-gray-600 mt-1">Interactive Presentation Generator</p>
            </div>
            <button
              onClick={() => {
                // TODO: Implement create presentation modal
                alert('Create new presentation - coming soon!');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Presentation
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
            <p className="text-gray-600 mt-4">Loading presentations...</p>
          </div>
        ) : presentations.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No presentations yet
              </h3>
              <p className="text-gray-600 mb-6">
                Get started by creating your first interactive presentation or wait for a
                Pipedrive webhook to generate one automatically.
              </p>
              <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                Create Your First Presentation
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {presentations.map((presentation) => (
              <div
                key={presentation.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                    {presentation.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {presentation._count.versions} version(s) •{' '}
                    {new Date(presentation.createdAt).toLocaleDateString()}
                  </p>

                  <div className="flex gap-2">
                    <Link
                      to={`/presentations/${presentation.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    <Link
                      to={`/presentations/${presentation.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-50 text-primary-700 rounded hover:bg-primary-100 transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => deletePresentation(presentation.id)}
                      className="px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <Link
                      to={`/presentations/${presentation.id}/analytics`}
                      className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </Link>
                    <Link
                      to={`/presentations/${presentation.id}/versions`}
                      className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Versions
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            💡 Pipedrive Integration
          </h3>
          <p className="text-blue-800">
            Presentations are automatically generated when a deal is updated in Pipedrive.
            Configure your webhook URL to:{' '}
            <code className="bg-blue-100 px-2 py-1 rounded text-sm">
              {window.location.origin}/api/webhooks/pipedrive
            </code>
          </p>
        </div>
      </main>
    </div>
  );
}
