export interface MqttMessage {
  deviceId: string;
  timestamp: string;
  data: unknown;
}
