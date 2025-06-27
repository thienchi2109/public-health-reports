'use client';

import { useEffect, useRef } from 'react';
import type { ReportData } from "@/types/report-data";

// TypeScript declaration for Chart.js
declare global {
  interface Window {
    Chart: any;
  }
}

interface InfographicTemplateProps {
  data: ReportData;
  selectedMonths: string[];
}

export default function InfographicTemplate({ data, selectedMonths }: InfographicTemplateProps) {
  const trendsChartRef = useRef<HTMLCanvasElement>(null);
  const compositionChartRef = useRef<HTMLCanvasElement>(null);
  const trendsChartInstanceRef = useRef<any>(null);
  const compositionChartInstanceRef = useRef<any>(null);
  
  // Generate dynamic title based on selected months
  const generateTitle = () => {
    if (selectedMonths.length === 0) return "Chưa chọn dữ liệu";
    if (selectedMonths.length === 1) return `Tình hình dịch bệnh ${selectedMonths[0]} năm 2025 tại TP. Cần Thơ`;
    
    const sortedMonths = selectedMonths.sort((a, b) => {
      const monthA = parseInt(a.replace('Tháng ', ''));
      const monthB = parseInt(b.replace('Tháng ', ''));
      return monthA - monthB;
    });
    
    const firstMonth = sortedMonths[0];
    const lastMonth = sortedMonths[sortedMonths.length - 1];
    
    return `Tình hình dịch bệnh từ ${firstMonth} đến ${lastMonth} năm 2025 tại TP. Cần Thơ`;
  };

  const generateSubtitle = () => {
    if (selectedMonths.length === 0) return "Vui lòng chọn dữ liệu từ sidebar";
    if (selectedMonths.length === 1) return `Phân tích chi tiết cho ${selectedMonths[0]}`;
    return `Phân tích tổng hợp cho ${selectedMonths.length} tháng được chọn`;
  };

  // Cleanup function to destroy existing charts
  const destroyCharts = () => {
    if (trendsChartInstanceRef.current) {
      trendsChartInstanceRef.current.destroy();
      trendsChartInstanceRef.current = null;
    }
    if (compositionChartInstanceRef.current) {
      compositionChartInstanceRef.current.destroy();
      compositionChartInstanceRef.current = null;
    }
  };

  useEffect(() => {
    // Load Chart.js if not already loaded
    if (typeof window !== 'undefined' && !window.Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => initializeCharts();
      document.head.appendChild(script);
    } else if (window.Chart) {
      initializeCharts();
    }

    // Cleanup on unmount
    return () => {
      destroyCharts();
    };
  }, [data]);

  const initializeCharts = () => {
    if (!trendsChartRef.current || !compositionChartRef.current || !window.Chart) return;

    // Destroy existing charts first
    destroyCharts();

    // Common chart options
    const commonChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            font: {
              family: 'Inter',
              size: 12,
            },
            color: '#475569'
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: '#003F5C',
          titleFont: { family: 'Inter', size: 14, weight: 'bold' },
          bodyFont: { family: 'Inter', size: 12 },
          padding: 10,
          cornerRadius: 4
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#475569',
            font: { family: 'Inter' }
          },
          grid: {
            display: false
          }
        },
        y: {
          ticks: {
            color: '#475569',
            font: { family: 'Inter' }
          },
          grid: {
            color: '#e2e8f0'
          }
        }
      }
    };

    // Initialize trends chart
    const trendsCtx = trendsChartRef.current.getContext('2d');
    if (trendsCtx) {
      trendsChartInstanceRef.current = new window.Chart(trendsCtx, {
        type: 'line',
        data: {
          labels: data.trends.labels,
          datasets: [
            {
              label: 'Sốt xuất huyết',
              data: data.trends.sxh,
              borderColor: '#FF6361',
              backgroundColor: '#FF6361',
              tension: 0.3,
              borderWidth: 3
            },
            {
              label: 'Tay chân miệng',
              data: data.trends.tcm,
              borderColor: '#BC5090',
              backgroundColor: '#BC5090',
              tension: 0.3,
              borderWidth: 3
            },
            {
              label: 'Sởi & nghi Sởi',
              data: data.trends.soi,
              borderColor: '#FFA600',
              backgroundColor: '#FFA600',
              tension: 0.3,
              borderWidth: 3
            }
          ]
        },
        options: commonChartOptions
      });
    }

    // Initialize composition chart
    const compositionCtx = compositionChartRef.current.getContext('2d');
    if (compositionCtx) {
      compositionChartInstanceRef.current = new window.Chart(compositionCtx, {
        type: 'doughnut',
        data: {
          labels: ['Sởi & nghi Sởi', 'Tay chân miệng', 'Sốt xuất huyết'],
          datasets: [{
            label: 'Tổng số ca',
            data: [data.composition.data[2], data.composition.data[1], data.composition.data[0]],
            backgroundColor: ['#FFA600', '#BC5090', '#FF6361'],
            borderColor: '#FFFFFF',
            borderWidth: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom' as const,
              labels: {
                font: { family: 'Inter', size: 10 },
                boxWidth: 15,
                padding: 10
              }
            },
            tooltip: {
              enabled: true,
              backgroundColor: '#003F5C'
            }
          }
        }
      });
    }
  };

  const getLatestMonthData = () => {
    // Get data for the latest selected month for highlighting
    const latestMonth = selectedMonths.sort((a, b) => {
      const monthA = parseInt(a.replace('Tháng ', ''));
      const monthB = parseInt(b.replace('Tháng ', ''));
      return monthB - monthA;
    })[0];
    
    const latestIndex = data.trends.labels.indexOf(latestMonth);
    if (latestIndex === -1) return { tcm: 0, sxh: 0 };
    
    return {
      tcm: data.trends.tcm[latestIndex] || 0,
      sxh: data.trends.sxh[latestIndex] || 0
    };
  };

  const latestData = getLatestMonthData();

  return (
    <div className="bg-slate-100 text-slate-800 p-4 md:p-8">
      <div className="container mx-auto">
        
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-[#003F5C] uppercase tracking-wide">
            Toàn cảnh Dịch bệnh
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-[#58508D] mt-2">
            {generateTitle()}
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-slate-600">
            {generateSubtitle()} - Phân tích tổng hợp dựa trên số liệu chính thức từ Báo cáo công tác y tế hàng tháng của Sở Y tế thành phố Cần Thơ.
          </p>
        </header>

        <main className="space-y-12">
          
          <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h3 className="text-2xl font-bold text-[#003F5C] mb-2">
              Diễn biến các ca mắc bệnh truyền nhiễm chính
            </h3>
            <p className="text-slate-600 mb-6">
              Biểu đồ đường thể hiện sự biến động số ca mắc Sốt xuất huyết, Tay chân miệng và Sởi qua từng tháng được chọn.
            </p>
            <div className="chart-container w-full max-w-full" style={{ height: '400px' }}>
              <canvas ref={trendsChartRef}></canvas>
            </div>
          </section>
          
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {selectedMonths.length > 0 && (
              <div className="bg-[#FF6361] text-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-lg">Điểm Nóng Gần Nhất</h4>
                  <p className="text-sm opacity-90 mt-2">
                    Số liệu từ tháng gần nhất được chọn cho thấy tình hình dịch bệnh hiện tại.
                  </p>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold">TCM: {latestData.tcm} ca</p>
                  <p className="text-2xl font-bold">SXH: {latestData.sxh} ca</p>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-bold text-lg text-[#003F5C] mb-2">Tổng Lượt Khám Chữa Bệnh</h4>
              <p className="text-8xl font-black text-[#FFA600]">
                {data.highlights.tongKham}
              </p>
              <p className="text-slate-600 mt-2">
                Tổng cộng {data.highlights.tongKhamSo.toLocaleString()} lượt khám đã được thực hiện.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-bold text-lg text-[#003F5C] mb-2">Tỷ lệ các bệnh chính</h4>
              <div className="chart-container mx-auto" style={{ height: '250px' }}>
                <canvas ref={compositionChartRef}></canvas>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h4 className="font-bold text-lg text-[#003F5C] mb-2">Các số liệu khác</h4>
              <div className="space-y-4 mt-4">
                <p className="text-2xl font-bold text-[#BC5090]">
                  {data.highlights.tieuChay} 
                  <span className="text-base font-normal block text-slate-600">Ca tiêu chảy</span>
                </p>
                <p className="text-2xl font-bold text-[#BC5090]">
                  {data.highlights.hiv} 
                  <span className="text-base font-normal block text-slate-600">Ca nhiễm HIV mới</span>
                </p>
                <p className="text-2xl font-bold text-[#BC5090]">
                  {data.highlights.naoMoCau} 
                  <span className="text-base font-normal block text-slate-600">Ca não mô cầu</span>
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            <h3 className="text-2xl font-bold text-center text-[#003F5C] mb-8">
              Hoạt Động Phòng Chống Dịch Trọng Tâm
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="border-t-4 border-[#FFA600] bg-slate-50 p-4 rounded-lg">
                <p className="text-5xl mb-2">💉</p>
                <h4 className="font-bold text-[#003F5C]">Tiêm Chủng</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Tổ chức các chiến dịch tiêm vắc xin phòng Sởi và tiêm bù vắc xin Uốn ván - Bạch hầu (Td).
                </p>
              </div>
              <div className="border-t-4 border-[#FF6361] bg-slate-50 p-4 rounded-lg">
                <p className="text-5xl mb-2">🦟</p>
                <h4 className="font-bold text-[#003F5C]">Giám Sát Véc-tơ</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Giám sát định kỳ và tổ chức các chiến dịch diệt lăng quăng để phòng chống Sốt xuất huyết.
                </p>
              </div>
              <div className="border-t-4 border-[#BC5090] bg-slate-50 p-4 rounded-lg">
                <p className="text-5xl mb-2">🔬</p>
                <h4 className="font-bold text-[#003F5C]">Xử Lý Ổ Dịch</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Chủ động giám sát và phối hợp xử lý kịp thời các ổ dịch Sốt xuất huyết và Tay chân miệng.
                </p>
              </div>
              <div className="border-t-4 border-[#58508D] bg-slate-50 p-4 rounded-lg">
                <p className="text-5xl mb-2">✈️</p>
                <h4 className="font-bold text-[#003F5C]">Kiểm Dịch Biên Giới</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Duy trì nghiêm ngặt hoạt động kiểm dịch y tế tại cảng hàng không và cảng đường thủy.
                </p>
              </div>
            </div>
          </section>
          
        </main>

        <footer className="text-center mt-12 pt-8 border-t border-slate-300">
          <p className="text-sm text-slate-500">
            Nguồn: Tổng hợp từ các Báo cáo công tác y tế của Sở Y tế Cần Thơ.
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Phân tích & Trực quan hóa bởi Hệ thống Báo cáo Y tế Công cộng.
          </p>
        </footer>

      </div>
    </div>
  );
} 