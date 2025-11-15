import { config } from 'dotenv';

config();

export const mqttConfig = {
  broker: process.env.MQTT_BROKER || 'mqtt://mqtt-broker-local:1883',
  clientId: `homelab-api-${Math.random().toString(16).substring(2, 8)}`,
  topics: {
    esp32: '#'
  },
  options: {
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
  }
};
