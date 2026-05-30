/**
 * Page 2: Model Intelligence - Table Relationships Diagram
 */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import RelationshipDiagram from '../../components/model/RelationshipDiagram';
import MigrationSidebar from '../../components/migration/MigrationSidebar';
import api from '../../services/api';

export default function Page2ModelIntelligence() {
  const navigate = useNavigate();
  const { migrationId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [joins, setJoins] = useState([]);

  useEffect(() => {
    if (!migrationId) {
      toast.error('No migration found. Please start a migration first.');
      navigate('/');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        // Read model json file representing tables & joins
        const response = await fetch(`/api/v1/ts-migration/${migrationId}/download?file=json`);
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        const data = await response.json();
        
        if (data?.tables) {
          setTables(data.tables);
          setJoins(data.joins || []);
        }
      } catch (error) {
        console.error('Failed to load data model:', error);
        toast.error('Failed to load data model relationships');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [migrationId, navigate]);

  const handleNext = () => {
    navigate(`/migration-wizard/${migrationId}/field-mapping`);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
        <MigrationSidebar currentStep={2} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-primary-650 mx-auto mb-4" />
            <p className="text-gray-655 font-medium">Loading data model relationships...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: '#e5e5e5' }}>
      <MigrationSidebar currentStep={2} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 shadow-sm px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Data Model Configuration</h1>
              <p className="text-sm text-gray-600 mt-1">
                Visualizing relationships parsed from ThoughtSpot worksheets and models
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => navigate(`/migration-wizard/${migrationId}/data-understanding`)}
              >
                Back
              </Button>
              <Button onClick={handleNext}>
                Next Step
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col min-h-0">
          {tables.length === 0 ? (
            <Card className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tables Found</h3>
              <p className="text-gray-600">
                No data tables were found in the workbook models.
              </p>
            </Card>
          ) : (
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden flex flex-col min-h-0">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 shrink-0">
                <h2 className="text-lg font-semibold text-gray-900">
                  Relationship Diagram (ERD)
                </h2>
              </div>
              <div className="flex-1 relative">
                <RelationshipDiagram
                  tables={tables}
                  joins={joins}
                  height={500}
                  loading={isLoading}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
