// types/disease.ts
export interface Performance {
    sensitivity?: string;
    specificity?: string;
    kappaAgreement?: string;
    accuracy?: string;
    dataset?: string;
  }
  
  export interface Resource {
    type: string;
    url: string;
  }
  
  export interface Disease {
    id: number;
    title: string;
    description: string;
    banner?: string;
    performance: Performance;
    resources: Resource[];
  }
  