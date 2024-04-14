export type FileUploadResult = {
  path: string;
  url: string;
};
export abstract class IUploadService {
  abstract upload(buffer: Buffer, fileName: string): Promise<FileUploadResult>;
  abstract delete(key: string): Promise<void>;
}
