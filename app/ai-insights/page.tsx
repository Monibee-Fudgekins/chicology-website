'use client';

import { useEffect, useState } from 'react';

interface DiagnosticsData {
  diagnostics?: {
    failure_patterns: Record<string, number>;
    success_streak: number;
    last_success_date: string;
  };
  infrastructure_fix_analysis?: {
    total_attempts: number;
    success_rate: string;
    failed_error_types: string[];
    recurring_validation_issues: Record<string, number>;
  };
}

interface HealthData {
  ok: boolean;
  aiOk: boolean;
  healthScore?: { score: number };
  sla?: { status: string; success_rate: number };
}

export default function AIInsightsPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsData | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [diagRes, healthRes] = await Promise.all([
          fetch('/__diagnostics'),
          fetch('/__health')
        ]);

        if (!diagRes.ok || !healthRes.ok) throw new Error('Failed to fetch data');

        const diag = await diagRes.json();
        const healthData = await healthRes.json();

        setDiagnostics(diag);
        setHealth(healthData);
        setLoading(false);
      } catch (e) {
        setError(String(e));
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">AI Infrastructure Insights</h1>
        <p className="text-gray-500">Loading diagnostics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 rounded">
        <h1 className="text-3xl font-bold mb-4 text-red-900">Error Loading Insights</h1>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  const fixAnalysis = diagnostics?.infrastructure_fix_analysis;
  const healthScore = health?.healthScore?.score || 0;
  const slaStatus = health?.sla?.status || 'unknown';
  const slaRate = health?.sla?.success_rate || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">AI Infrastructure Insights</h1>
          <p className="text-slate-600">Real-time system health and automated fix performance</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Health Score Card */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <p className="text-sm font-medium text-slate-600 mb-2">Health Score</p>
            <p className="text-3xl font-bold text-slate-900">{healthScore.toFixed(0)}</p>
            <p className="text-xs text-slate-500 mt-2">/100</p>
          </div>

          {/* Fix Success Rate Card */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <p className="text-sm font-medium text-slate-600 mb-2">Fix Success Rate</p>
            <p className="text-3xl font-bold text-slate-900">{fixAnalysis?.success_rate || 'N/A'}</p>
            <p className="text-xs text-slate-500 mt-2">{fixAnalysis?.total_attempts || 0} attempts</p>
          </div>

          {/* SLA Status Card */}
          <div className={`rounded-lg shadow p-6 border-l-4 ${
            slaStatus === 'good' ? 'bg-green-50 border-green-500' :
            slaStatus === 'warn' ? 'bg-yellow-50 border-yellow-500' :
            'bg-red-50 border-red-500'
          }`}>
            <p className="text-sm font-medium text-slate-600 mb-2">SLA Status</p>
            <p className="text-3xl font-bold capitalize text-slate-900">{slaStatus}</p>
            <p className="text-xs text-slate-600 mt-2">{(slaRate * 100).toFixed(1)}% success</p>
          </div>

          {/* Consecutive Failures Card */}
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <p className="text-sm font-medium text-slate-600 mb-2">Success Streak</p>
            <p className="text-3xl font-bold text-slate-900">
              {diagnostics?.diagnostics?.success_streak || 0}
            </p>
            <p className="text-xs text-slate-500 mt-2">consecutive runs</p>
          </div>
        </div>

        {/* Error Patterns Section */}
        {diagnostics?.diagnostics?.failure_patterns && Object.keys(diagnostics.diagnostics.failure_patterns).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Failure Patterns</h2>
            <div className="space-y-2">
              {Object.entries(diagnostics.diagnostics.failure_patterns).map(([pattern, count]) => (
                <div key={pattern} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                  <span className="text-sm font-medium text-slate-700">{pattern}</span>
                  <span className="text-sm font-bold text-slate-900 bg-slate-200 px-3 py-1 rounded">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error Types Section */}
        {fixAnalysis?.failed_error_types && fixAnalysis.failed_error_types.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Failed Error Types</h2>
            <div className="flex flex-wrap gap-2">
              {fixAnalysis.failed_error_types.map((type) => (
                <span key={type} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  {type}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Validation Issues Section */}
        {fixAnalysis?.recurring_validation_issues && Object.keys(fixAnalysis.recurring_validation_issues).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Top Validation Issues</h2>
            <div className="space-y-2">
              {Object.entries(fixAnalysis.recurring_validation_issues)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .slice(0, 5)
                .map(([issue, count]) => (
                  <div key={issue} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                    <span className="text-sm text-slate-700 flex-1">{issue}</span>
                    <span className="text-sm font-bold text-slate-900 bg-slate-200 px-3 py-1 rounded">{count}x</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Last Success */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Last Successful Run</h2>
          <p className="text-slate-600">
            {diagnostics?.diagnostics?.last_success_date === 'never'
              ? 'No successful runs recorded'
              : `${diagnostics?.diagnostics?.last_success_date}`}
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Data updates every 30 seconds • Last refresh: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
}
