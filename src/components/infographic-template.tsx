'use client';

import { useEffect, useRef } from 'react';
import type { ReportData } from "@/types/report-data";

// TypeScript declaration for Chart.js
import InfographicDashboard from './infographic-dashboard'; // Đảm bảo import này được thêm vào
import { Button } from './ui/button'; // Thêm nếu chưa có
import { Download } from 'lucide-react'; // Thêm nếu chưa có
import html2canvas from 'html2canvas'; // Thêm nếu chưa có
import jsPDF from 'jspdf'; // Thêm nếu chưa có

declare global {
  interface Window {
    Chart: any; // Giữ lại nếu vẫn dùng chart.js trực tiếp, nếu không thì bỏ
  }
}

interface InfographicTemplateProps {
  data: ReportData | null; // Cho phép data là null
  selectedMonths: string[];
}

export default function InfographicTemplate({ data, selectedMonths }: InfographicTemplateProps) {
  const printRef = useRef<HTMLDivElement>(null); // Thêm printRef

  const handleDownload = async () => { // Thêm handleDownload
    const element = printRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      logging: true,
      useCORS: true,
      scrollY: -window.scrollY
    });

    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

    const safeMonthsString = selectedMonths.join('_').replace(/\s+/g, '_');
    pdf.save(`infographic_${safeMonthsString}.pdf`);
  };

  // Giữ lại các refs và useEffects hiện tại của bạn cho Chart.js
  const trendsChartRef = useRef<HTMLCanvasElement>(null);
  const compositionChartRef = useRef<HTMLCanvasElement>(null);
  const trafficChartRef = useRef<HTMLCanvasElement>(null);
  const trafficPieChartRef = useRef<HTMLCanvasElement>(null);
  const trendsChartInstanceRef = useRef<any>(null);
  const compositionChartInstanceRef = useRef<any>(null);
  const trafficChartInstanceRef = useRef<any>(null);
  const trafficPieChartInstanceRef = useRef<any>(null);
  
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
    if (trafficChartInstanceRef.current) {
      trafficChartInstanceRef.current.destroy();
      trafficChartInstanceRef.current = null;
    }
    if (trafficPieChartInstanceRef.current) {
      trafficPieChartInstanceRef.current.destroy();
      trafficPieChartInstanceRef.current = null;
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
    if (!trendsChartRef.current || !compositionChartRef.current || !trafficChartRef.current || !trafficPieChartRef.current || !window.Chart) return;

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
            },
            {
              label: 'Đậu mùa khỉ',
              data: data.trends.dauMuaKhi || [],
              borderColor: '#58508D',
              backgroundColor: '#58508D',
              tension: 0.3,
              borderWidth: 2
            },
            {
              label: 'Bạch hầu',
              data: data.trends.bachHau || [],
              borderColor: '#003F5C',
              backgroundColor: '#003F5C',
              tension: 0.3,
              borderWidth: 2
            },
            {
              label: 'Cúm A (H1N1)',
              data: data.trends.cumAH1N1 || [],
              borderColor: '#665191',
              backgroundColor: '#665191',
              tension: 0.3,
              borderWidth: 2
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

    // Initialize traffic accidents chart
    if (trafficChartRef.current) {
      const trafficCtx = trafficChartRef.current.getContext('2d');
      if (trafficCtx) {
        trafficChartInstanceRef.current = new window.Chart(trafficCtx, {
          type: 'bar',
          data: {
            labels: ['Tổng số vụ TNGT', 'TNGT xảy ra địa bàn', 'TNGT có nồng độ cồn', 'Tai nạn lao động'],
            datasets: [{
              label: 'Số lượng',
              data: [
                data.accidents?.trafficAccidents?.total || 0,
                data.accidents?.trafficAccidents?.localCases || 0,
                data.accidents?.trafficAccidents?.alcoholCases || 0,
                data.accidents?.occupationalAccidents?.total || 0
              ],
              backgroundColor: [
                '#FF6361',
                '#FFA600', 
                '#BC5090',
                '#58508D'
              ],
              borderColor: [
                '#FF6361',
                '#FFA600',
                '#BC5090', 
                '#58508D'
              ],
              borderWidth: 2,
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
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
                  font: { family: 'Inter', size: 11 }
                },
                grid: {
                  display: false
                }
              },
              y: {
                beginAtZero: true,
                ticks: {
                  color: '#475569',
                  font: { family: 'Inter' }
                },
                grid: {
                  color: '#e2e8f0'
                }
              }
            }
          }
        });
      }
    }

    // Initialize traffic pie chart for percentages
    if (trafficPieChartRef.current) {
      const trafficPieCtx = trafficPieChartRef.current.getContext('2d');
      if (trafficPieCtx) {
        trafficPieChartInstanceRef.current = new window.Chart(trafficPieCtx, {
          type: 'doughnut',
          data: {
            labels: ['Địa bàn', 'Ngoài địa bàn'],
            datasets: [{
              label: 'Tỷ lệ địa bàn',
              data: [
                data.accidents?.trafficAccidents?.localPercentage || 0,
                100 - (data.accidents?.trafficAccidents?.localPercentage || 0)
              ],
              backgroundColor: ['#FFA600', '#e2e8f0'],
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
                  boxWidth: 12,
                  padding: 8
                }
              },
              tooltip: {
                enabled: true,
                backgroundColor: '#003F5C',
                callbacks: {
                  label: function(context: any) {
                    return context.label + ': ' + context.parsed + '%';
                  }
                }
              }
            }
          }
        });
      }
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

  const latestData = data ? getLatestMonthData() : { tcm: 0, sxh: 0 }; // Xử lý trường hợp data là null

  // Nếu data là null, hiển thị thông báo hoặc loader
  if (!data) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-muted-foreground text-lg">
          Không có dữ liệu để hiển thị. Vui lòng chọn một tháng từ sidebar.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 p-4 sm:p-6 md:p-8 min-h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            {/* Sử dụng generateTitle đã có hoặc một tiêu đề tương tự */}
            {selectedMonths.length === 1 ? `Báo cáo ${selectedMonths[0]}` : `Báo cáo tổng hợp ${selectedMonths.join(', ')}`}
          </h1>
          <Button onClick={handleDownload} variant="outline" size="sm" className="bg-white">
            <Download className="mr-2 h-4 w-4" />
            Tải PDF
          </Button>
        </div>

        <div
          ref={printRef}
          className="bg-white p-4 sm:p-6 md:p-8 shadow-lg rounded-lg"
        >
          {/* Thay thế toàn bộ nội dung main bằng InfographicDashboard */}
          <InfographicDashboard data={data} />

          {/* Giữ lại footer nếu muốn */}
          <footer className="text-center mt-12 pt-8 border-t border-slate-300">
            <p className="text-sm text-slate-500">
              Nguồn: Tổng hợp từ các Báo cáo công tác y tế của Sở Y tế Cần Thơ.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Phân tích & Trực quan hóa hoàn toàn tự động - Phát triển bởi Nguyễn Thiện Chí
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}