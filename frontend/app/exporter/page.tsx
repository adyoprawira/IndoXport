'use client';

import { useState, useEffect } from 'react';
import ExporterDashboard from '@/components/ExporterDashboard';

export default function ExporterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Exporter Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Match supplier batches with buyer requirements and manage export deals
          </p>
        </div>
        <ExporterDashboard />
      </div>
    </div>
  );
}