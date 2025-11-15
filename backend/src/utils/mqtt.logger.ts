import fs from 'fs';
import path from 'path';

class MqttLogger {
  private logFile: string;
  private logStream: fs.WriteStream | null = null;

  constructor() {
    const logsDir = path.join(__dirname, '../../logs');

    // S'assurer que le dossier logs existe
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Créer un nom de fichier avec la date du jour
    const date = new Date().toISOString().split('T')[0];
    this.logFile = path.join(logsDir, `mqtt-${date}.log`);

    // Créer le stream d'écriture
    this.logStream = fs.createWriteStream(this.logFile, { flags: 'a' });
  }

  /**
   * Formate le timestamp pour les logs
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Écrit un log dans le fichier
   */
  private writeLog(level: string, message: string): void {
    if (!this.logStream) return;

    const timestamp = this.getTimestamp();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;

    this.logStream.write(logEntry);
  }

  /**
   * Log d'information
   */
  public info(message: string): void {
    this.writeLog('INFO', message);
  }

  /**
   * Log d'erreur
   */
  public error(message: string, error?: Error | unknown): void {
    let errorMessage = message;

    if (error) {
      if (error instanceof Error) {
        errorMessage += ` - ${error.message}`;
      } else {
        errorMessage += ` - ${String(error)}`;
      }
    }

    this.writeLog('ERROR', errorMessage);
  }

  /**
   * Log de débogage
   */
  public debug(message: string): void {
    this.writeLog('DEBUG', message);
  }

  /**
   * Log un objet JSON
   */
  public json(label: string, data: unknown): void {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      this.writeLog('JSON', `${label}: ${jsonString}`);
    } catch (error) {
      this.error(`Failed to stringify JSON for ${label}`, error);
    }
  }

  /**
   * Ferme le stream de log
   */
  public close(): void {
    if (this.logStream) {
      this.logStream.end();
      this.logStream = null;
    }
  }

  /**
   * Retourne le chemin du fichier de log actuel
   */
  public getLogFilePath(): string {
    return this.logFile;
  }
}

export const mqttLogger = new MqttLogger();
