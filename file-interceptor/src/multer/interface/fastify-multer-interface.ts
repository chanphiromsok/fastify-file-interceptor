export interface FastifyMulterFile extends Express.Multer.File {}
export interface Fields {
  name: string;
  maxCount?: number;
}
