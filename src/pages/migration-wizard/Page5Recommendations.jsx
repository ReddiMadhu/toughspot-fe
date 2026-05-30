/**
 * Page 5: Recommendations & Download - Final Wizard Page
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Download,
  FileText,
  Package,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import MigrationSidebar from '../../components/migration/MigrationSidebar';
import migrationApi from '../../services/migrationApi';

export default function Page5Recommendations() {
  const navigate = useNavigate();
  const { migrationId } = useParams();

  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!migrationId) {
      toast.error('No migration found. Please start a migration first.');
      navigate('/');
      return;
    }
  }, [migrationId, navigate]);

  const handleExportAll = async () => {
    try {
      setDownloading(true);
      await migrationApi.downloadAllArtifacts(migrationId);
      toast.success('Migration package downloaded successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to download migration package');
    } finally {
      setDownloading(false);
    }
  };

  const handleBack = () => {
    navigate(`/migration-wizard/${migrationId}/formula-conversion`);
  };

  const handleComplete = () => {
    toast.success('Migration completed successfully!');
    navigate(`/migration/${migrationId}/workspace`);
  };

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
      <MigrationSidebar currentStep={5} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Download & Complete</h1>
              <p className="text-sm text-gray-600 mt-1">
                Your ThoughtSpot to Power BI migration is complete. Download your artifacts below.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleBack}
              >
                Back
              </Button>
              <Button onClick={handleComplete}>
                Go to Workspace
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Success Banner */}
            <Card className="bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-200 shadow-md">
              <div className="p-8 text-center">
                <CheckCircle className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Analysis & Conversion Complete!
                </h2>
                <p className="text-gray-700 max-w-2xl mx-auto text-sm leading-relaxed">
                  Your ThoughtSpot TML models and worksheet columns have been parsed, converted to Power BI measures, and validated.
                  The final packaged artifacts are ready for download.
                </p>
              </div>
            </Card>

            {/* Download Section */}
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 shadow-md">
              <div className="p-8">
                <Download className="w-12 h-12 text-primary-650 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Download Complete Migration Package
                </h2>
                <p className="text-gray-700 mb-6 max-w-2xl mx-auto text-center text-sm">
                  The packaged archive contains the PBIP project folder, DAX measures script, model enhancements guide, and tabular json models.
                </p>

                {/* Package Contents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-3xl mx-auto text-left">
                  <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <FileText className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Excel Report</p>
                      <p className="text-xs text-gray-500 mt-0.5">migration_report_{migrationId?.substring(0,6)}.xlsx</p>
                      <p className="text-xs text-gray-400 mt-1">Conversions index, worksheet mapping, and stats</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <Package className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Power BI Project (PBIP)</p>
                      <p className="text-xs text-gray-500 mt-0.5">pbip/ folder</p>
                      <p className="text-xs text-gray-400 mt-1">Native TMDL model metadata files</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <FileText className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">DAX Measures File</p>
                      <p className="text-xs text-gray-500 mt-0.5">measures_{migrationId?.substring(0,6)}.dax</p>
                      <p className="text-xs text-gray-400 mt-1">All converted DAX measures for quick copy-paste</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Model Enhancements Guide</p>
                      <p className="text-xs text-gray-500 mt-0.5">MODEL_ENHANCEMENTS_REQUIRED.md</p>
                      <p className="text-xs text-gray-400 mt-1">M-scripts and setup steps for window calculations</p>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <div className="text-center">
                  <Button
                    onClick={handleExportAll}
                    size="lg"
                    className="px-8 shadow-md"
                    disabled={downloading}
                  >
                    {downloading ? 'Downloading...' : 'Download Complete Package (ZIP)'}
                  </Button>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
