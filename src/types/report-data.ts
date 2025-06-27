export interface ReportData {
  trends: {
    labels: string[];
    sxh: number[];
    tcm: number[];
    soi: number[];
    dauMuaKhi: number[];
    bachHau: number[];
    sars: number[];
    cumAH5N1: number[];
    cumAH1N1: number[];
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
  accidents: {
    trafficAccidents: {
      total: number;
      localCases: number;
      localPercentage: number;
      alcoholCases: number;
      alcoholPercentage: number;
    };
    occupationalAccidents: {
      total: number;
      injuries: number;
      deaths: number;
    };
  };
  additionalDiseases: {
    dauMuaKhi: number;
    bachHau: number;
    sars: number;
    cumAH5N1: number;
    cumAH1N1: number;
  };
}
