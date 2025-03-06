import { startJobProcessor } from '../utils/jobProcessor';

export default defineNitroPlugin(() => {
  console.log('Starting job processor plugin...');
  
  // Start job processor if NODE_ENV is not test
  if (process.env.NODE_ENV !== 'test') {
    startJobProcessor();
    console.log('Job processor started');
  }
});
