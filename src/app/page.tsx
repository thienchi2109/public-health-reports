'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import InfographicTemplate from '@/components/infographic-template';
import type { ReportData } from '@/types/report-data';
import { loadAllReports } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function Home() {
  const [allReports, setAllReports] = useState<Record<string, ReportData> | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [displayData, setDisplayData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadAllReports();
        setAllReports(data);
        // Auto-select the latest month if available
        const months = Object.keys(data);
        if (months.length > 0) {
          const latestMonth = months.sort((a, b) => {
            const monthA = parseInt(a.replace('Tháng ', ''));
            const monthB = parseInt(b.replace('Tháng ', ''));
            return monthB - monthA;
          })[0];
          setSelectedMonths([latestMonth]);
        }
      } catch (error) {
        console.error("Failed to load reports:", error);
        setAllReports({});
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!allReports || selectedMonths.length === 0) {
      setDisplayData(null);
      return;
    }

    const aggregateData = (): ReportData => {
      const initial: ReportData = {
        trends: { 
          labels: [], 
          sxh: [], 
          tcm: [], 
          soi: [],
          dauMuaKhi: [],
          bachHau: [],
          sars: [],
          cumAH5N1: [],
          cumAH1N1: []
        },
        composition: { labels: ["Sốt xuất huyết", "Tay chân miệng", "Sởi"], data: [0, 0, 0] },
        highlights: { tongKham: '', tongKhamSo: 0, khamNoiTru: 0, tieuChay: 0, hiv: 0, naoMoCau: 0 },
        accidents: {
          trafficAccidents: {
            total: 0,
            localCases: 0,
            localPercentage: 0,
            alcoholCases: 0,
            alcoholPercentage: 0
          },
          occupationalAccidents: {
            total: 0,
            injuries: 0,
            deaths: 0
          }
        },
        additionalDiseases: {
          dauMuaKhi: 0,
          bachHau: 0,
          sars: 0,
          cumAH5N1: 0,
          cumAH1N1: 0
        }
      };

      const sortedMonths = selectedMonths.sort((a, b) => {
        const monthA = parseInt(a.replace('Tháng ', ''));
        const monthB = parseInt(b.replace('Tháng ', ''));
        return monthA - monthB;
      });

      const aggregated = sortedMonths.reduce((acc, month) => {
        const report = allReports[month];
        if (!report) return acc;

        // Aggregate trends - use the actual month as the label
        acc.trends.labels.push(month);
        acc.trends.sxh.push(...report.trends.sxh);
        acc.trends.tcm.push(...report.trends.tcm);
        acc.trends.soi.push(...report.trends.soi);
        
        // Add new disease trends with fallback to 0
        acc.trends.dauMuaKhi.push(...(report.trends.dauMuaKhi || [0]));
        acc.trends.bachHau.push(...(report.trends.bachHau || [0]));
        acc.trends.sars.push(...(report.trends.sars || [0]));
        acc.trends.cumAH5N1.push(...(report.trends.cumAH5N1 || [0]));
        acc.trends.cumAH1N1.push(...(report.trends.cumAH1N1 || [0]));

        // Aggregate composition
        acc.composition.data[0] += report.composition.data[0] || 0;
        acc.composition.data[1] += report.composition.data[1] || 0;
        acc.composition.data[2] += report.composition.data[2] || 0;

        // Aggregate highlights
        acc.highlights.tongKhamSo += report.highlights.tongKhamSo || 0;
        acc.highlights.khamNoiTru += report.highlights.khamNoiTru || 0;
        acc.highlights.tieuChay += report.highlights.tieuChay || 0;
        acc.highlights.hiv += report.highlights.hiv || 0;
        acc.highlights.naoMoCau += report.highlights.naoMoCau || 0;

        // Aggregate accidents with fallback
        if (report.accidents) {
          acc.accidents.trafficAccidents.total += report.accidents.trafficAccidents?.total || 0;
          acc.accidents.trafficAccidents.localCases += report.accidents.trafficAccidents?.localCases || 0;
          acc.accidents.trafficAccidents.alcoholCases += report.accidents.trafficAccidents?.alcoholCases || 0;
          acc.accidents.occupationalAccidents.total += report.accidents.occupationalAccidents?.total || 0;
          acc.accidents.occupationalAccidents.injuries += report.accidents.occupationalAccidents?.injuries || 0;
          acc.accidents.occupationalAccidents.deaths += report.accidents.occupationalAccidents?.deaths || 0;
        }

        // Aggregate additional diseases with fallback
        if (report.additionalDiseases) {
          acc.additionalDiseases.dauMuaKhi += report.additionalDiseases.dauMuaKhi || 0;
          acc.additionalDiseases.bachHau += report.additionalDiseases.bachHau || 0;
          acc.additionalDiseases.sars += report.additionalDiseases.sars || 0;
          acc.additionalDiseases.cumAH5N1 += report.additionalDiseases.cumAH5N1 || 0;
          acc.additionalDiseases.cumAH1N1 += report.additionalDiseases.cumAH1N1 || 0;
        }
        
        return acc;
      }, initial);

      // Calculate percentages for traffic accidents
      if (aggregated.accidents.trafficAccidents.total > 0) {
        aggregated.accidents.trafficAccidents.localPercentage = 
          Math.round((aggregated.accidents.trafficAccidents.localCases / aggregated.accidents.trafficAccidents.total) * 100 * 10) / 10;
        aggregated.accidents.trafficAccidents.alcoholPercentage = 
          Math.round((aggregated.accidents.trafficAccidents.alcoholCases / aggregated.accidents.trafficAccidents.total) * 100 * 10) / 10;
      }
      
      // Format tongKham after aggregation
      if (aggregated.highlights.tongKhamSo >= 1_000_000) {
        aggregated.highlights.tongKham = `${(aggregated.highlights.tongKhamSo / 1_000_000).toFixed(2)}tr`;
      } else if (aggregated.highlights.tongKhamSo >= 1_000) {
        aggregated.highlights.tongKham = `${(aggregated.highlights.tongKhamSo / 1_000).toFixed(1)}k`;
      } else {
        aggregated.highlights.tongKham = aggregated.highlights.tongKhamSo.toString();
      }

      return aggregated;
    };

    setDisplayData(aggregateData());
  }, [selectedMonths, allReports]);
  
  const handleMonthSelection = (month: string, checked: boolean) => {
    setSelectedMonths(prev => {
      if (checked) {
        return [...prev, month];
      } else {
        return prev.filter(m => m !== month);
      }
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
         <div className="flex flex-col items-center justify-center h-screen text-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Đang tải dữ liệu...</p>
         </div>
      );
    }

    if (!allReports || Object.keys(allReports).length === 0) {
       return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
          <div className="bg-card border rounded-lg p-8 max-w-md mx-auto animate-in fade-in-50 duration-500">
            <h2 className="text-2xl font-bold mb-2">Chưa có Dữ liệu</h2>
            <p className="mb-4 text-muted-foreground">
              Chưa có báo cáo nào được tải lên. Vui lòng truy cập Bảng điều khiển để xử lý.
            </p>
            <Button asChild>
              <Link href="/admin">Đến Bảng điều khiển</Link>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-80'
        } flex-shrink-0`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <h2 className="text-lg font-semibold text-gray-900">Chọn Báo cáo</h2>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2"
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className={`p-4 ${sidebarCollapsed ? 'hidden' : 'block'}`}>
            <p className="text-sm text-gray-600 mb-4">
              Chọn một hoặc nhiều tháng để xem infographic tổng hợp.
            </p>
            
            <div className="space-y-3">
              {Object.keys(allReports).sort((a, b) => {
                const monthA = parseInt(a.replace('Tháng ', ''));
                const monthB = parseInt(b.replace('Tháng ', ''));
                return monthA - monthB;
              }).map(month => (
                <div key={month} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox 
                    id={month} 
                    checked={selectedMonths.includes(month)}
                    onCheckedChange={(checked) => handleMonthSelection(month, checked as boolean)}
                  />
                  <Label htmlFor={month} className="cursor-pointer text-sm font-medium">{month}</Label>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin">
                  <Settings className="mr-2 h-4 w-4" />
                  Quản lý báo cáo
                </Link>
              </Button>
            </div>
          </div>
          
          {sidebarCollapsed && (
            <div className="p-2">
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link href="/admin">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          {displayData ? (
            <InfographicTemplate 
              key={selectedMonths.join('-')} 
              data={displayData} 
              selectedMonths={selectedMonths} 
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
               <h2 className="text-2xl font-bold mb-2 text-gray-900">Chọn Dữ liệu để Hiển thị</h2>
               <p className="mb-4 text-gray-600 max-w-md">
                   Vui lòng chọn ít nhất một tháng từ sidebar bên trái để xem báo cáo infographic.
               </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
}
