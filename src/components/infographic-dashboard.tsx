'use client';

import type { ReportData } from "@/types/report-data";
import StatCard from "./stat-card";
import TrendsChart from "./charts/trends-chart";
import CompositionChart from "./charts/composition-chart";
import { Activity, Bed, Droplets, Siren, Users } from "lucide-react";

interface InfographicDashboardProps {
  data: ReportData;
}

export default function InfographicDashboard({ data }: InfographicDashboardProps) {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tổng quan Dữ liệu Y tế</h1>
        <p className="text-muted-foreground">Tóm tắt báo cáo y tế công cộng mới nhất.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard 
          title="Tổng Lượt Khám" 
          value={data.highlights.tongKham} 
          description="Tổng số lượt khám bệnh"
          icon={<Users className="h-4 w-4 text-muted-foreground" />} 
        />
        <StatCard 
          title="Tiêu Chảy" 
          value={data.highlights.tieuChay} 
          description="Ca tiêu chảy"
          icon={<Droplets className="h-4 w-4 text-muted-foreground" />} 
        />
        <StatCard 
          title="HIV/AIDS" 
          value={data.highlights.hiv} 
          description="Ca HIV/AIDS"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />} 
        />
        <StatCard 
          title="Não mô cầu" 
          value={data.highlights.naoMoCau} 
          description="Ca viêm màng não"
          icon={<Siren className="h-4 w-4 text-muted-foreground" />} 
        />
        <StatCard 
          title="Khám Nội Trú" 
          value={data.highlights.khamNoiTru}
          description="Ca điều trị nội trú"
          icon={<Bed className="h-4 w-4 text-muted-foreground" />} 
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <TrendsChart data={data.trends} />
        </div>
        <div className="lg:col-span-3">
          <CompositionChart data={data.composition} />
        </div>
      </div>
    </div>
  );
}
