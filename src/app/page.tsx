'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import InfographicDashboard from '@/components/infographic-dashboard';
import type { ReportData } from '@/types/report-data';
import { loadAllReports } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [allReports, setAllReports] = useState<Record<string, ReportData> | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [displayData, setDisplayData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadAllReports();
        setAllReports(data);
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
        trends: { labels: [], sxh: [], tcm: [], soi: [] },
        composition: { labels: ["Sốt xuất huyết", "Tay chân miệng", "Sởi"], data: [0, 0, 0] },
        highlights: { tongKham: '', tongKhamSo: 0, khamNoiTru: 0, tieuChay: 0, hiv: 0, naoMoCau: 0 }
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
        
        return acc;
      }, initial);
      
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
         <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Đang tải dữ liệu...</p>
         </div>
      );
    }

    if (!allReports || Object.keys(allReports).length === 0) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-center">
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

    const availableMonths = Object.keys(allReports).sort((a, b) => {
        const monthA = parseInt(a.replace('Tháng ', ''));
        const monthB = parseInt(b.replace('Tháng ', ''));
        return monthA - monthB;
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <Card className="lg:col-span-1 h-fit">
                <CardHeader>
                    <CardTitle>Chọn Báo cáo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Chọn một hoặc nhiều tháng để xem infographic tổng hợp.</p>
                    <div className="space-y-2">
                        {availableMonths.map(month => (
                            <div key={month} className="flex items-center space-x-2">
                                <Checkbox 
                                    id={month} 
                                    onCheckedChange={(checked) => handleMonthSelection(month, checked as boolean)}
                                />
                                <Label htmlFor={month} className="cursor-pointer">{month}</Label>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <div className="lg:col-span-3">
                {displayData ? (
                    <InfographicDashboard data={displayData} />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center rounded-lg border-2 border-dashed border-muted-foreground p-8">
                       <h2 className="text-2xl font-bold mb-2">Chọn Dữ liệu để Hiển thị</h2>
                       <p className="mb-4 text-muted-foreground max-w-md">
                           Vui lòng chọn ít nhất một tháng từ bảng bên trái để xem dữ liệu tổng hợp.
                       </p>
                    </div>
                )}
            </div>
        </div>
    )
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
}
