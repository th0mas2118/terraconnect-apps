# Homelab IoT Backend

API Node.js avec Express et TypeScript pour gérer les messages MQTT provenant des ESP32.

## Structure du projet

```
apps/backend/
├── src/
│   ├── config/          # Configuration (MQTT, etc.)
│   ├── services/        # Services (MQTT, etc.)
│   ├── routes/          # Routes API Express
│   └── index.ts         # Point d'entrée
├── Dockerfile
├── package.json
└── tsconfig.json
```

## Prérequis

- Node.js 20+
- npm ou yarn
- Docker & Docker Compose (pour déploiement)

## Installation

### En local (développement)

```bash
# Installer les dépendances
npm install

# Démarrer en mode dev avec hot reload
npm run dev

# Builder le projet
npm run build

# Démarrer en mode production
npm start
```

### Variables d'environnement

Copier `.env.example` vers `.env` et adapter les valeurs :

```env
PORT=3000
NODE_ENV=development
MQTT_BROKER=mqtt://localhost:1883
MQTT_TOPIC=homelab/esp32/#
```

## Utilisation avec Docker

### Démarrer tous les services (depuis la racine du projet)

```bash
# Build et démarrage
docker-compose up -d

# Voir les logs
docker-compose logs -f backend

# Arrêter
docker-compose down
```

### Tester la connexion

```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000
```

## Tester MQTT

Pour tester la réception de messages MQTT :

```bash
# Publier un message de test (depuis votre machine)
mosquitto_pub -h localhost -t "homelab/esp32/test" -m "Hello from terminal"

# Ou avec un payload JSON
mosquitto_pub -h localhost -t "homelab/esp32/sensor" -m '{"temperature": 22.5, "humidity": 45}'
```

Les messages apparaîtront dans les logs du backend.

## Fonctionnalités actuelles

- ✅ Serveur Express avec TypeScript
- ✅ Connexion au broker MQTT
- ✅ Écoute des messages MQTT sur `homelab/esp32/#`
- ✅ Logging des messages reçus
- ✅ Health check endpoint

## Prochaines étapes

- [ ] Ajout d'une base de données (PostgreSQL/InfluxDB)
- [ ] Routes API pour récupérer les données
- [ ] WebSockets pour temps réel
- [ ] Dashboard frontend
