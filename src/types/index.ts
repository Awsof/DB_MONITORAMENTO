export interface Endpoint {
  id: string;
  name: string;
  url: string;
  soapAction: string;
  xml: string;
  prefix: string;
  seqCounter: number;
  intervalId: number | null;
  corsErrors: number;
}

export interface RequestRecord {
  id?: number;
  epId: string;
  epName: string;
  seqId: string;
  timestamp: number;
  duration: number;
  success: boolean;
  statusCode: number;
  response: string;
}
