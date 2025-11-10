'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, Upload, CheckCircle, AlertCircle, 
  TrendingUp, DollarSign, Calendar, Clock
} from 'lucide-react';

interface StatsData {
  totalDocuments: number;
  processedDocuments: number;
  pendingDocuments: number;
  errorDocuments: number;
  totalAmount: number;
  averageConfidence: number;
  documentsThisMonth: number;
  processingTime: number;
}

interface DashboardStatsProps {
  className?: string;
  refreshTrigger?: number;
}

// Mock data - replace with API calls
const mockStats: StatsData = {
  totalDocuments: 156,
  processedDocuments: 142,
  pendingDocuments: 8,
  errorDocuments: 6,
  totalAmount: 12450.75,
  averageConfidence: 0.89,
  documentsThisMonth: 34,
  processingTime: 2.3
};

export default function DashboardStats({ 
  className = '', 
  refreshTrigger = 0 
}: DashboardStatsProps) {
  const [stats, setStats] = useState<StatsData>(mockStats);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate API call
    const fetchStats = async () => {
      setIsLoading(true);
      // In real implementation, fetch from /api/v1/documents/stats
      await new Promise(resolve => setTimeout(resolve, 500));
      setStats(mockStats);
      setIsLoading(false);
    };

    fetchStats();
  }, [refreshTrigger]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fi-FI', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  const getSuccessRate = (): number => {
    if (stats.totalDocuments === 0) return 0;
    return stats.processedDocuments / stats.totalDocuments;
  };

  const statCards = [
    {
      title: 'Dokumentteja yhteensä',
      value: stats.totalDocuments.toLocaleString('fi-FI'),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: `+${stats.documentsThisMonth} tässä kuussa`,
      changeColor: 'text-green-600'
    },
    {
      title: 'Käsiteltyjä',
      value: stats.processedDocuments.toLocaleString('fi-FI'),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: `${formatPercentage(getSuccessRate())} onnistumisprosentti`,
      changeColor: 'text-green-600'
    },
    {
      title: 'Odottaa käsittelyä',
      value: stats.pendingDocuments.toLocaleString('fi-FI'),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      change: `Keskimäärin ${stats.processingTime}s käsittelyaika`,
      changeColor: 'text-gray-600'
    },
    {
      title: 'Virheitä',
      value: stats.errorDocuments.toLocaleString('fi-FI'),
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: `${formatPercentage(stats.errorDocuments / stats.totalDocuments)} virheprosentti`,
      changeColor: stats.errorDocuments > 0 ? 'text-red-600' : 'text-green-600'
    },
    {
      title: 'Kokonaissumma',
      value: formatCurrency(stats.totalAmount),
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: 'Käsitellyistä dokumenteista',
      changeColor: 'text-gray-600'
    },
    {
      title: 'Keskimääräinen luotettavuus',
      value: formatPercentage(stats.averageConfidence),
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      change: stats.averageConfidence > 0.8 ? 'Erinomainen taso' : 'Hyvä taso',
      changeColor: stats.averageConfidence > 0.8 ? 'text-green-600' : 'text-yellow-600'
    }
  ];

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          
          return (
            <div
              key={index}
              className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-md ${card.bgColor}`}>
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500 truncate">
                          {card.title}
                        </p>
                        <p className={`text-2xl font-semibold text-gray-900 ${isLoading ? 'animate-pulse' : ''}`}>
                          {isLoading ? '...' : card.value}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className={`text-sm ${card.changeColor}`}>
                        {card.change}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Pikavalinnat</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Upload className="h-5 w-5 mr-2 text-gray-400" />
              Lataa dokumentti
            </button>
            
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <FileText className="h-5 w-5 mr-2 text-gray-400" />
              Selaa dokumentteja
            </button>
            
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <TrendingUp className="h-5 w-5 mr-2 text-gray-400" />
              Näytä raportit
            </button>
            
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Calendar className="h-5 w-5 mr-2 text-gray-400" />
              Kuukausiraportti
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Viimeisimmät tapahtumat</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[
              {
                type: 'success',
                message: 'Kuitti "kauppa_kuitti.jpg" käsitelty onnistuneesti',
                time: '2 minuuttia sitten',
                icon: CheckCircle,
                color: 'text-green-600'
              },
              {
                type: 'upload',
                message: 'Uusi dokumentti "lasku_123.pdf" ladattu',
                time: '5 minuuttia sitten',
                icon: Upload,
                color: 'text-blue-600'
              },
              {
                type: 'error',
                message: 'Virhe käsiteltäessä dokumenttia "epäselvä_kuitti.jpg"',
                time: '12 minuuttia sitten',
                icon: AlertCircle,
                color: 'text-red-600'
              },
              {
                type: 'success',
                message: 'Lasku "toimittaja_lasku.pdf" hyväksytty',
                time: '1 tunti sitten',
                icon: CheckCircle,
                color: 'text-green-600'
              }
            ].map((activity, index) => {
              const Icon = activity.icon;
              
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Icon className={`h-5 w-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
