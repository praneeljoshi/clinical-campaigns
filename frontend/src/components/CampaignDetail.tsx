import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CampaignDetail as CampaignDetailType, CallStatus } from '../types';
import { campaignApi } from '../services/api';

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<CampaignDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<CallStatus | 'ALL'>('ALL');

  useEffect(() => {
    loadCampaign();
  }, [id]);

  const loadCampaign = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await campaignApi.getCampaignById(id);
      setCampaign(data);
    } catch (error) {
      console.error('Failed to load campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: CallStatus) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'SCHEDULED':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'CONTACTED':
        return <Phone className="h-5 w-5 text-yellow-500" />;
      case 'ATTEMPTED':
        return <Clock className="h-5 w-5 text-orange-500" />;
      case 'NOT_CONTACTED':
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
      case 'OPTED_OUT':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: CallStatus) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'CONTACTED':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'ATTEMPTED':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'NOT_CONTACTED':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'OPTED_OUT':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: CallStatus) => {
    switch (status) {
      case 'NOT_CONTACTED':
        return 'Not Contacted';
      case 'ATTEMPTED':
        return 'Attempted';
      case 'CONTACTED':
        return 'Contacted';
      case 'SCHEDULED':
        return 'Scheduled';
      case 'COMPLETED':
        return 'Completed';
      case 'OPTED_OUT':
        return 'Opted Out';
      default:
        return status;
    }
  };

  const getPatientsByStatus = () => {
    if (!campaign) return [];
    const statusCounts = campaign.patients.reduce((acc, patient) => {
      acc[patient.callStatus] = (acc[patient.callStatus] || 0) + 1;
      return acc;
    }, {} as Record<CallStatus, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: getStatusLabel(status as CallStatus),
      value: count,
      status: status as CallStatus,
    }));
  };

  const getFilteredPatients = () => {
    if (!campaign) return [];
    if (selectedStatus === 'ALL') return campaign.patients;
    return campaign.patients.filter((p) => p.callStatus === selectedStatus);
  };

  const COLORS: Record<CallStatus, string> = {
    COMPLETED: '#10b981',
    SCHEDULED: '#3b82f6',
    CONTACTED: '#eab308',
    ATTEMPTED: '#f97316',
    NOT_CONTACTED: '#6b7280',
    OPTED_OUT: '#ef4444',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Campaign not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 text-primary-600 hover:text-primary-700"
          >
            Return to dashboard
          </button>
        </div>
      </div>
    );
  }

  const chartData = getPatientsByStatus();
  const filteredPatients = getFilteredPatients();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-start">
            <button
              onClick={() => navigate('/')}
              className="mr-4 mt-1 p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
              <p className="mt-1 text-sm text-gray-500">{campaign.description}</p>
              <div className="mt-2 flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  <strong>Type:</strong> {campaign.screeningType}
                </span>
                <span className="text-sm text-gray-600">
                  <strong>Status:</strong> {campaign.status}
                </span>
                <span className="text-sm text-gray-600">
                  <strong>Period:</strong> {new Date(campaign.startDate).toLocaleDateString()} -{' '}
                  {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Ongoing'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{campaign.totalPatients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
                <Phone className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Contacted</p>
                <p className="text-2xl font-bold text-gray-900">{campaign.contactedPatients}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">{campaign.scheduledAppointments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{campaign.completedScreenings}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Patient Status Distribution Chart */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Patient Status
              </h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.status]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500 py-8">No patient data available</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Campaign Metrics
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Contact Rate</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {campaign.totalPatients > 0
                      ? Math.round((campaign.contactedPatients / campaign.totalPatients) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {campaign.contactedPatients > 0
                      ? Math.round(
                          (campaign.scheduledAppointments / campaign.contactedPatients) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completion Rate</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {campaign.scheduledAppointments > 0
                      ? Math.round(
                          (campaign.completedScreenings / campaign.scheduledAppointments) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Patient List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Patient Progress</h2>

                {/* Status Filter */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedStatus('ALL')}
                    className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                      selectedStatus === 'ALL'
                        ? 'bg-primary-100 text-primary-800 border-primary-300 font-medium'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    All ({campaign.patients.length})
                  </button>
                  {chartData.map((item) => (
                    <button
                      key={item.status}
                      onClick={() => setSelectedStatus(item.status)}
                      className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                        selectedStatus === item.status
                          ? getStatusColor(item.status) + ' font-medium'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {item.name} ({item.value})
                    </button>
                  ))}
                </div>
              </div>

              {/* Patient Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Notes
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          No patients found with this status
                        </td>
                      </tr>
                    ) : (
                      filteredPatients.map((patient) => (
                        <tr key={patient.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-primary-700 font-medium text-sm">
                                  {patient.firstName[0]}
                                  {patient.lastName[0]}
                                </span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {patient.firstName} {patient.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{patient.language}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{patient.phoneNumber}</div>
                            <div className="text-sm text-gray-500">{patient.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {getStatusIcon(patient.callStatus)}
                              <span className="ml-2 text-sm text-gray-900">
                                {getStatusLabel(patient.callStatus)}
                              </span>
                            </div>
                            {patient.scheduledDate && (
                              <div className="text-xs text-gray-500 mt-1">
                                Scheduled: {new Date(patient.scheduledDate).toLocaleDateString()}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {patient.lastContactDate
                              ? new Date(patient.lastContactDate).toLocaleDateString()
                              : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {patient.notes || '-'}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
