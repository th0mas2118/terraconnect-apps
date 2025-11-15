export const influxConfig = {
  url: process.env.INFLUXDB_URL || 'http://localhost:8086',
  token: process.env.INFLUXDB_TOKEN || '',
  org: process.env.INFLUXDB_ORG || 'homelab',
  bucket: process.env.INFLUXDB_BUCKET || 'iot_data',
};
