import mqtt, { MqttClient } from 'mqtt';
import { mqttConfig } from '../config/mqtt.config';
import { mqttLogger } from '../utils/mqtt.logger';
import { influxDbService } from './influxdb.service';

class MqttService {
  private client: MqttClient | null = null;

  /**
   * Initialise la connexion au broker MQTT
   */
  public connect(): void {
    mqttLogger.info(`Connection to broker: ${mqttConfig.broker}`);

    this.client = mqtt.connect(mqttConfig.broker, {
      ...mqttConfig.options,
      clientId: mqttConfig.clientId,
    });

    this.setupEventHandlers();
  }

  /**
   * Configure les gestionnaires d'événements MQTT
   */
  private setupEventHandlers(): void {
    if (!this.client) return;

    // Connexion réussie
    this.client.on('connect', () => {
      mqttLogger.info('Successfully connected');
      this.subscribe();
    });

    // Réception d'un message
    this.client.on('message', (topic: string, payload: Buffer) => {
      this.handleMessage(topic, payload);
    });

    // Erreur de connexion
    this.client.on('error', (error: Error) => {
      mqttLogger.error('Connection error', error);
    });

    // Déconnexion
    this.client.on('close', () => {
      mqttLogger.info('Disconnected from broker');
    });

    // Reconnexion
    this.client.on('reconnect', () => {
      mqttLogger.info('Try to reconnect to broker');
    });
  }

  /**
   * S'abonne aux topics MQTT
   */
  private subscribe(): void {
    if (!this.client) return;

    const topic = mqttConfig.topics.esp32;

    this.client.subscribe(topic, (err) => {
      if (err) {
        mqttLogger.error(`Error on subscribe on "${topic}"`, err);
      } else {
        mqttLogger.info(`Subscribed to: ${topic}`);
      }
    });
  }

  /**
   * Gère les messages MQTT reçus
   */
  private handleMessage(topic: string, payload: Buffer): void {
    try {
      const message = payload.toString();

      // Tentative de parser en JSON si possible
      let parsedPayload: unknown;
      try {
        parsedPayload = JSON.parse(message);
      } catch {
        // Ce n'est pas du JSON, on garde le message brut
        parsedPayload = message;
      }

      // Log en une seule ligne avec le topic et le payload
      mqttLogger.json('Message received', { topic, payload: parsedPayload });

      // Store temperature and humidity data in InfluxDB
      this.storeToInfluxDB(topic, parsedPayload);

    } catch (error) {
      mqttLogger.error('Error with message', error);
    }
  }

  /**
   * Store sensor data to InfluxDB
   */
  private storeToInfluxDB(topic: string, payload: unknown): void {
    try {
      // Only process numeric values (temperature/humidity)
      if (typeof payload !== 'number') {
        return;
      }

      // Extract info from topic: sensors/esp32-001/temperature -> device: esp32-001, sensor: temperature
      const parts = topic.split('/');
      if (parts.length < 3) {
        return;
      }

      const deviceId = parts[1];  // esp32-001
      const sensorType = parts[2]; // temperature or humidity

      // Only store temperature and humidity
      if (sensorType !== 'temperature' && sensorType !== 'humidity') {
        return;
      }

      // Tags for filtering
      const tags = {
        device_id: deviceId,
        sensor_type: sensorType,
      };

      // Fields (the actual value)
      const fields = {
        value: payload,
      };

      // Write to InfluxDB
      influxDbService.writePoint('sensor_readings', tags, fields);
      mqttLogger.info(`Stored ${sensorType}=${payload} for device ${deviceId}`);

    } catch (error) {
      mqttLogger.error('Error storing to InfluxDB', error);
    }
  }

  /**
   * Publie un message sur un topic MQTT
   */
  public publish(topic: string, message: string): void {
    if (!this.client || !this.client.connected) {
      mqttLogger.error('Client not connected');
      return;
    }

    this.client.publish(topic, message, (err) => {
      if (err) {
        mqttLogger.error(`Publish error on topic "${topic}"`, err);
      } else {
        mqttLogger.info(`Message published on topic "${topic}"`);
      }
    });
  }

  /**
   * Déconnecte le client MQTT
   */
  public disconnect(): void {
    if (this.client) {
      this.client.end();
      mqttLogger.info('Disconnected from client');
      mqttLogger.close();
    }
  }
}

export const mqttService = new MqttService();
