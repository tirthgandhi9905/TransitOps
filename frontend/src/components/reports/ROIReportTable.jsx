import React from 'react';

export default function ROIReportTable() {
  return (
    <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-lg">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-800 text-slate-200">
          <tr>
            <th className="p-3">Vehicle</th>
            <th className="p-3">Distance</th>
            <th className="p-3">Fuel</th>
            <th className="p-3">Expenses</th>
            <th className="p-3">Revenue</th>
            <th className="p-3">ROI</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-3 border-t border-slate-850" colSpan={6}>No report data seeded.</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
