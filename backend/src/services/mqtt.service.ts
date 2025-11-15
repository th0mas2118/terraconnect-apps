import mqtt, { MqttClient } from 'mqtt';
import { mqttConfig } from '../config/mqtt.config';

class MqttService {
  private client: MqttClient | null = null;

  /**
   * Initialise la connexion au broker MQTT
   */
  public connect(): void {
    console.log(`🔌 Connexion au broker MQTT: ${mqttConfig.broker}`);

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
      console.log('✅ Connecté au broker MQTT');
      this.subscribe();
    });

    // Réception d'un message
    this.client.on('message', (topic: string, payload: Buffer) => {
      this.handleMessage(topic, payload);
    });

    // Erreur de connexion
    this.client.on('error', (error: Error) => {
      console.error('❌ Erreur MQTT:', error.message);
    });

    // Déconnexion
    this.client.on('close', () => {
      console.log('🔌 Déconnecté du broker MQTT');
    });

    // Reconnexion
    this.client.on('reconnect', () => {
      console.log('🔄 Tentative de reconnexion au broker MQTT...');
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
        console.error(`❌ Erreur lors de l'abonnement au topic "${topic}":`, err);
      } else {
        console.log(`📡 Abonné au topic: ${topic}`);
      }
    });
  }

  /**
   * Gère les messages MQTT reçus
   */
  private handleMessage(topic: string, payload: Buffer): void {
    try {
      const message = payload.toString();

      console.log('📨 Message MQTT reçu:');
      console.log(`  📍 Topic: ${topic}`);
      console.log(`  📦 Payload: ${message}`);

      // Tentative de parser en JSON si possible
      try {
        const jsonData = JSON.parse(message);
        console.log(`  📊 Données JSON:`, jsonData);
      } catch {
        // Ce n'est pas du JSON, on log juste le message brut
        console.log(`  📝 Message brut: ${message}`);
      }

      console.log('---');

    } catch (error) {
      console.error('❌ Erreur lors du traitement du message:', error);
    }
  }

  /**
   * Publie un message sur un topic MQTT
   */
  public publish(topic: string, message: string): void {
    if (!this.client || !this.client.connected) {
      console.error('❌ Client MQTT non connecté');
      return;
    }

    this.client.publish(topic, message, (err) => {
      if (err) {
        console.error(`❌ Erreur lors de la publication sur "${topic}":`, err);
      } else {
        console.log(`✅ Message publié sur "${topic}"`);
      }
    });
  }

  /**
   * Déconnecte le client MQTT
   */
  public disconnect(): void {
    if (this.client) {
      this.client.end();
      console.log('👋 Client MQTT déconnecté');
    }
  }
}

export const mqttService = new MqttService();
