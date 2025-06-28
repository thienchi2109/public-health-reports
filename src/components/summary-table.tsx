import type { ReportData } from "@/types/report-data";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface SummaryTableProps {
  data: ReportData;
}

export default function SummaryTable({ data }: SummaryTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bảng Tổng Hợp Dữ Liệu</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Bảng tổng hợp các số liệu thống kê chính.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={2} className="font-semibold text-lg">Mục</TableHead>
              <TableHead className="text-right font-semibold text-lg">Giá trị</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Highlights Section */}
            <TableRow className="bg-muted/50">
              <TableCell colSpan={3} className="font-medium">Điểm nổi bật</TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Tổng lượt khám</TableCell>
              <TableCell className="text-right">{data.highlights.tongKham}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Tổng lượt khám (số)</TableCell>
              <TableCell className="text-right">{data.highlights.tongKhamSo.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Khám nội trú</TableCell>
              <TableCell className="text-right">{data.highlights.khamNoiTru.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Ca tiêu chảy</TableCell>
              <TableCell className="text-right">{data.highlights.tieuChay.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Ca HIV/AIDS</TableCell>
              <TableCell className="text-right">{data.highlights.hiv.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Ca viêm màng não do não mô cầu</TableCell>
              <TableCell className="text-right">{data.highlights.naoMoCau.toLocaleString()}</TableCell>
            </TableRow>

            {/* Accidents Section */}
            <TableRow className="bg-muted/50">
              <TableCell colSpan={3} className="font-medium">Tai nạn</TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Tai nạn giao thông - Tổng số</TableCell>
              <TableCell className="text-right">{data.accidents.trafficAccidents.total.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Tai nạn giao thông - Ca tại địa phương</TableCell>
              <TableCell className="text-right">{data.accidents.trafficAccidents.localCases.toLocaleString()} ({data.accidents.trafficAccidents.localPercentage}%)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Tai nạn giao thông - Ca do rượu bia</TableCell>
              <TableCell className="text-right">{data.accidents.trafficAccidents.alcoholCases.toLocaleString()} ({data.accidents.trafficAccidents.alcoholPercentage}%)</TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Tai nạn lao động - Tổng số</TableCell>
              <TableCell className="text-right">{data.accidents.occupationalAccidents.total.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Tai nạn lao động - Số người bị thương</TableCell>
              <TableCell className="text-right">{data.accidents.occupationalAccidents.injuries.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Tai nạn lao động - Số người tử vong</TableCell>
              <TableCell className="text-right">{data.accidents.occupationalAccidents.deaths.toLocaleString()}</TableCell>
            </TableRow>

            {/* Additional Diseases Section */}
            <TableRow className="bg-muted/50">
              <TableCell colSpan={3} className="font-medium">Các bệnh truyền nhiễm khác</TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Đậu mùa khỉ</TableCell>
              <TableCell className="text-right">{data.additionalDiseases.dauMuaKhi.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Bạch hầu</TableCell>
              <TableCell className="text-right">{data.additionalDiseases.bachHau.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>SARS</TableCell>
              <TableCell className="text-right">{data.additionalDiseases.sars.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Cúm A(H5N1)</TableCell>
              <TableCell className="text-right">{data.additionalDiseases.cumAH5N1.toLocaleString()}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>Cúm A(H1N1)</TableCell>
              <TableCell className="text-right">{data.additionalDiseases.cumAH1N1.toLocaleString()}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
