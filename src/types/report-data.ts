export interface ReportData {
  trends: {
    labels: string[];
    sxh: number[];
    tcm: number[];
    soi: number[];
  };
  composition: {
    labels: string[];
    data: number[];
  };
  highlights: {
    tongKham: string;
    tongKhamSo: number;
    khamNoiTru: number;
    tieuChay: number;
    hiv: number;
    naoMoCau: number;
  };
}
