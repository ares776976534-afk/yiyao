// HTTP请求相关类型定义

export interface TypeHttpRequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  data?: any;
  headers?: Record<string, string>;
  timeout?: number;
  [key: string]: any;
}

export interface TypeHttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  url: string;
}

export interface TypeMtopRequestOptions {
  data?: any;
  [key: string]: any;
}

export type TypeContentType = 
  | 'application/json'
  | 'application/x-www-form-urlencoded'
  | 'multipart/form-data'
  | 'text/plain'
  | 'text/html'
  | 'application/xml'
  | 'text/xml'
  | 'application/octet-stream'
  | 'application/pdf';
