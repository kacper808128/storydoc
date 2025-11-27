import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Save, Eye, ArrowLeft } from 'lucide-react';
import LoadingScreen from '../components/LoadingScreen';
import ErrorScreen from '../components/ErrorScreen';

interface PresentationVersion {
  id: string;
  versionSlug: string;
  variables: Record<string, any>;
  presentation: {
    id: string;
    title: string;
    content: any;
  };
}

export default function PresentationEditor() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [data, setData] = useState<PresentationVersion | null>(null);
  const [variables, setVariables] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug || !token) {
      setError('Invalid edit link');
      setLoading(false);
      return;
    }

    axios
      .get(`/api/versions/${slug}?token=${token}`)
      .then((res) => {
        if (!res.data.data.isEditable) {
          setError('This link is view-only. You need an edit link to make changes.');
          setLoading(false);
          return;
        }

        setData(res.data.data);
        setVariables(res.data.data.variables || {});
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to load presentation');
        setLoading(false);
      });
  }, [slug, token]);

  const saveChanges = async () => {
    if (!slug || !token) return;

    setSaving(true);

    try {
      await axios.put(`/api/versions/${slug}`, {
        token,
        variables,
      });

      alert('Changes saved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const updateVariable = (key: string, value: any) => {
    setVariables((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const viewPresentation = () => {
    if (!slug) return;
    const viewUrl = `/view/${slug}?token=${token}`;
    window.open(viewUrl, '_blank');
  };

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;
  if (!data) return <ErrorScreen error="Presentation not found" />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Edit: {data.presentation.title}
                </h1>
                <p className="text-sm text-gray-600">
                  Customize the variables for this version
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={viewPresentation}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button
                onClick={saveChanges}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Presentation Variables
          </h2>

          <div className="space-y-6">
            {/* Client Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name
              </label>
              <input
                type="text"
                value={variables.clientName || ''}
                onChange={(e) => updateVariable('clientName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., SMART BISTRO Sp. z o.o."
              />
            </div>

            {/* Client Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Email
              </label>
              <input
                type="email"
                value={variables.clientEmail || ''}
                onChange={(e) => updateVariable('clientEmail', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., contact@smartbistro.pl"
              />
            </div>

            {/* Offer Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Offer Title
              </label>
              <input
                type="text"
                value={variables.offerTitle || ''}
                onChange={(e) => updateVariable('offerTitle', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., Oferta Black Week 2025"
              />
            </div>

            {/* Total Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Price (PLN)
              </label>
              <input
                type="number"
                value={variables.totalPrice || 0}
                onChange={(e) => updateVariable('totalPrice', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="e.g., 98500"
              />
            </div>

            {/* Account Manager */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Manager
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={variables.accountManager?.name || ''}
                    onChange={(e) =>
                      updateVariable('accountManager', {
                        ...variables.accountManager,
                        name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Adrian Grzegolec"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={variables.accountManager?.email || ''}
                    onChange={(e) =>
                      updateVariable('accountManager', {
                        ...variables.accountManager,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., adrian.grzegolec@justjoin.it"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={variables.accountManager?.phone || ''}
                    onChange={(e) =>
                      updateVariable('accountManager', {
                        ...variables.accountManager,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., 507 241 808"
                  />
                </div>
              </div>
            </div>

            {/* Raw JSON Editor (for advanced users) */}
            <div className="border-t border-gray-200 pt-6">
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  Advanced: Edit Raw JSON
                </summary>
                <div className="mt-4">
                  <textarea
                    value={JSON.stringify(variables, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setVariables(parsed);
                      } catch (err) {
                        // Invalid JSON, ignore
                      }
                    }}
                    className="w-full h-64 px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Changes will be reflected immediately in the presentation
            when you save. Share the view-only link with your client.
          </p>
        </div>
      </main>
    </div>
  );
}
