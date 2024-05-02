export const getS3Url = (path: string) => {
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${path}`;
};
export const cookieDomain = (hostname: string) => (hostname === 'localhost' ? 'localhost' : `.voffice.space`);
