import moment from 'moment';
export const getS3Url = (path: string) => {
  return path ? `${process.env.AWS_S3_ENDPOINT}/${process.env.AWS_BUCKET_NAME}/${path}` : path;
};
export const cookieDomain = (hostname: string) => (hostname === 'localhost' ? 'localhost' : `.voffice.space`);
export const addDateUnit = (startDate: Date, unit: moment.unitOfTime.DurationConstructor, amount: number = 1) => {
  return moment(startDate).add(amount, unit).toDate();
};
