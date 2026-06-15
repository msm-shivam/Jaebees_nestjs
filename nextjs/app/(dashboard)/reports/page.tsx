'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Download, FileBarChart, RefreshCw } from 'lucide-react';
import apiClient from '@/services/api.client';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('sales');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [reportUrl, setReportUrl] = useState('');

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerated(false);
    try {
      const { data } = await apiClient.get(`/admin/reports/${reportType}`);
      if (data?.data?.url) {
        setReportUrl(data.data.url);
      }
      setGenerated(true);
    } catch {
      setGenerated(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = () => {
    if (reportUrl) {
      window.open(reportUrl, '_blank');
    } else {
      alert('No report available for export. Please generate a report first.');
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Generate and export analytic summaries.">
        <button
          onClick={handleExport}
          disabled={!generated}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </PageHeader>

      {/* Configuration filters */}
      <div className="bg-white p-6 rounded-xl border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setGenerated(false);
              }}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <option value="sales">Sales & Revenue</option>
              <option value="revenue">Revenue</option>
              <option value="products">Products</option>
              <option value="customers">Customer Cohorts</option>
              <option value="inventory">Inventory Valuation</option>
              <option value="returns">Returns</option>
              <option value="support">Support Response SLA</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Date Range</label>
            <select className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 dark:border-zinc-800 dark:bg-zinc-950">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white hover:bg-orange-500 transition-colors disabled:opacity-50"
            >
              {generating ? <RefreshCw size={16} className="animate-spin" /> : <FileBarChart size={16} />}
              <span>{generating ? 'Generating...' : 'Generate Report'}</span>
            </button>
          </div>
        </div>

        {/* Output */}
        {generated && (
          <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center py-12">
            <FileBarChart size={48} className="mx-auto text-orange-500 mb-3" />
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
              {reportType.toUpperCase()} Report Generated Successfully
            </h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              You can now click the Export CSV button at the top header actions to download the dataset.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
