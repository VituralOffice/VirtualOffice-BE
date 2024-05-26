import * as moment from 'moment';
export const getS3Url = (path: string) => {
  return path ? `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${path}` : path;
};
export const cookieDomain = (hostname: string) => (hostname === 'localhost' ? 'localhost' : `.voffice.space`);
export const addDateUnit = (startDate: Date, unit: moment.unitOfTime.DurationConstructor, amount: number = 1) => {
  return moment(startDate).add(amount, unit).toDate();
};
