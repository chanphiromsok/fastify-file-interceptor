export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size?: number;
  buffer?: Buffer;
  stream?: NodeJS.ReadableStream;
  filename?: string;
  destination?: string;
  path?: string;
  fields?: Record<string, unknown>;
}
