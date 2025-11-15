import { InfluxDB, Point, WriteApi, QueryApi } from '@influxdata/influxdb-client';
import { influxConfig } from '../config/influxdb.config';

class InfluxDbService {
  private influxDB: InfluxDB;
  private writeApi: WriteApi;
  private queryApi: QueryApi;

  constructor() {
    this.influxDB = new InfluxDB({
      url: influxConfig.url,
      token: influxConfig.token,
    });

    this.writeApi = this.influxDB.getWriteApi(
      influxConfig.org,
      influxConfig.bucket,
      'ns' // precision: nanoseconds
    );

    this.queryApi = this.influxDB.getQueryApi(influxConfig.org);

    // Auto-flush every 5 seconds
    this.writeApi.useDefaultTags({ service: 'homelab-iot' });
  }

  /**
   * Write sensor data to InfluxDB
   * @param measurement - The measurement name (e.g., 'sensor_data')
   * @param tags - Tags for filtering (e.g., { device_id: 'esp32_001', sensor: 'DHT22' })
   * @param fields - The actual data values (e.g., { temperature: 22.5, humidity: 65 })
   * @param timestamp - Optional timestamp (defaults to now)
   */
  public writePoint(
    measurement: string,
    tags: Record<string, string>,
    fields: Record<string, number | string | boolean>,
    timestamp?: Date
  ): void {
    const point = new Point(measurement);

    // Add tags
    Object.entries(tags).forEach(([key, value]) => {
      point.tag(key, value);
    });

    // Add fields
    Object.entries(fields).forEach(([key, value]) => {
      if (typeof value === 'number') {
        point.floatField(key, value);
      } else if (typeof value === 'boolean') {
        point.booleanField(key, value);
      } else {
        point.stringField(key, value);
      }
    });

    // Add timestamp if provided
    if (timestamp) {
      point.timestamp(timestamp);
    }

    this.writeApi.writePoint(point);
  }

    public async getLatestValues(deviceId: string): Promise<{ temperature?: number; humidity?: number }> {
    const fluxQuery = `
      from(bucket: "${influxConfig.bucket}")
        |> range(start: -24h)
        |> filter(fn: (r) => r._measurement == "sensor_readings")
        |> filter(fn: (r) => r.device_id == "${deviceId}")
        |> filter(fn: (r) => r._field == "value")
        |> last()
    `;

    const result: { temperature?: number; humidity?: number } = {};

    return new Promise((resolve, reject) => {
      this.queryApi.queryRows(fluxQuery, {
        next: (row, tableMeta) => {
          const record = tableMeta.toObject(row);
          const sensorType = record.sensor_type;
          const value = record._value;

          if (sensorType === 'temperature') {
            result.temperature = value;
          } else if (sensorType === 'humidity') {
            result.humidity = value;
          }
        },
        error: (error) => {
          reject(error);
        },
        complete: () => {
          resolve(result);
        },
      });
    });
  }

  /**
   * Flush all pending writes to InfluxDB
   */
  public async flush(): Promise<void> {
    await this.writeApi.flush();
  }

  /**
   * Close the write connection
   */
  public async close(): Promise<void> {
    await this.writeApi.close();
  }
}

export const influxDbService = new InfluxDbService();