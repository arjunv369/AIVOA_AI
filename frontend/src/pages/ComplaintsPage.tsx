import React, { useState } from 'react';
import { PageContainer } from '../components/layout/PageContainer';
import { Plus, Search, Filter, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/common/StatusBadge';

interface MockComplaint {
  id: string;
  customer: string;
  product: string;
  batch: string;
  type: string;
  severity: 'Minor' | 'Major' | 'Critical';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: string;
  date: string;
}

const MOCK_COMPLAINTS: MockComplaint[] = [
  {
    id: 'CMP-00124',
    customer: 'ABC Pharma Distributors',
    product: 'Paracetamol Tablets 500mg',
    batch: 'PCM500-2026-07',
    type: 'Product Quality',
    severity: 'Major',
    priority: 'High',
    status: 'Under Investigation',
    date: '2026-08-01',
  },
  {
    id: 'CMP-00125',
    customer: 'Apollo Pharmacy Retail Chain',
    product: 'Amoxicillin Capsules 500mg',
    batch: 'BMX24602',
    type: 'Foreign Matter',
    severity: 'Critical',
    priority: 'Urgent',
    status: 'Pending Triage',
    date: '2026-08-05',
  },
  {
    id: 'CMP-00126',
    customer: 'Novartis Healthcare Pvt Ltd',
    product: 'Metformin hydrochloride API',
    batch: 'MFH260712A',
    type: 'Stability Issue',
    severity: 'Major',
    priority: 'High',
    status: 'Pending Triage',
    date: '2026-08-07',
  },
  {
    id: 'CMP-00122',
    customer: 'MedPlus Logistics',
    product: 'Ibuprofen Oral Suspension',
    batch: 'IBU100-2026-01',
    type: 'Packaging Defect',
    severity: 'Minor',
    priority: 'Low',
    status: 'Resolved',
    date: '2026-07-20',
  },
];

export const ComplaintsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  const filtered = MOCK_COMPLAINTS.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.batch.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity =
      severityFilter === 'ALL' || item.severity === severityFilter;

    return matchesSearch && matchesSeverity;
  });

  return (
    <PageContainer>
      <div className="space-y-5">
        {/* Page Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Customer Complaints Records
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Overview of all logged pharmaceutical customer quality complaints
            </p>
          </div>

          <Link
            to="/complaints/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            + New Complaint
          </Link>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search complaints by ID, customer, product, batch..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>Severity:</span>
            </div>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All Severities</option>
              <option value="Minor">Minor</option>
              <option value="Major">Major</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Complaint ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Product & Strength</th>
                  <th className="py-3 px-4">Batch #</th>
                  <th className="py-3 px-4">Complaint Type</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold font-mono text-blue-700">
                      {item.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      {item.customer}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {item.product}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800 font-semibold">
                      {item.batch}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {item.type}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge type="severity" value={item.severity} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge type="priority" value={item.priority} />
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {item.date}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => alert(`Opening complaint details for ${item.id}`)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center gap-1"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
