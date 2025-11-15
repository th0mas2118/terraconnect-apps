import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { mqttService } from './services/mqtt.service';

// Charger les variables d'environnement
config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de santé
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'homelab-iot-backend',
  });
});

// Route racine
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Homelab IoT API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
    },
  });
});

// Démarrage du serveur
const startServer = async () => {
  try {
    // Démarrage du serveur HTTP
    app.listen(PORT, () => {
      console.log('🚀 Serveur démarré');
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });

    // Connexion au broker MQTT
    mqttService.connect();

  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

// Gestion de l'arrêt gracieux
const shutdown = () => {
  console.log('\n⚠️  Arrêt du serveur...');
  mqttService.disconnect();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Démarrer l'application
startServer();
