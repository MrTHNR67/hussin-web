import { randomUUID } from 'node:crypto';
import { updateDatabase } from './data-store.mjs';
import { fetchWeatherSnapshot } from './weather-data.mjs';

function nullableFiniteNumber(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function requiredNumber(value, errorMessage, { min = -Infinity, max = Infinity } = {}) {
  const number = nullableFiniteNumber(value);
  if (number === null || number < min || number > max) throw new Error(errorMessage);
  return number;
}

// Resolves one reading without writing a report. Missing readings remain nullable.
export async function resolveAnalysisTemperature(input) {
  const { latitude, longitude, ambientTempC } = input;
  const lat = nullableFiniteNumber(latitude);
  const lon = nullableFiniteNumber(longitude);
  const hasCoordinates = lat !== null && lon !== null && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  let ambientTemperature = nullableFiniteNumber(ambientTempC);
  let temperatureSource = ambientTemperature === null ? 'unavailable' : 'manual_fallback';

  if (hasCoordinates) {
    try {
      const weather = await fetchWeatherSnapshot(lat, lon);
      const currentTemperature = nullableFiniteNumber(weather.current?.temperature_2m);
      if (currentTemperature !== null) {
        ambientTemperature = currentTemperature;
        temperatureSource = 'weather_api';
      }
    } catch {
      // Keep the supplied reading as a disclosed fallback, or leave heat unavailable.
    }
  }
  return { ambientTempC: ambientTemperature, temperatureSource };
}

// Pure builder: the caller supplies identity, timestamp, reading, and current settings.
// It can be used inside the transaction that saves a visual analysis.
export function buildPanelAnalysis(input, settings) {
  const inputError = 'بيانات حساب الخسارة غير صالحة.';
  const settingsError = 'إعدادات حساب خسارة الحرارة غير صالحة.';
  const id = String(input.id || '');
  const userId = String(input.userId || '');
  const createdAt = String(input.createdAt || '');
  if (!id || !userId || !createdAt || !Number.isFinite(Date.parse(createdAt))) throw new Error(inputError);
  const monthlyProductionKwh = requiredNumber(input.monthlyProductionKwh, inputError, { min: 0 });
  const tariffOmrPerKwh = requiredNumber(input.tariffOmrPerKwh, inputError, { min: 0 });
  const dustLossPercent = input.dustLossPercent === null || input.dustLossPercent === undefined ? null
    : requiredNumber(input.dustLossPercent, inputError, { min: 0, max: 100 });
  const panelOffset = requiredNumber(settings?.panel_temperature_offset_c, settingsError);
  const heatThreshold = requiredNumber(settings?.heat_loss_threshold_c, settingsError);
  const percentPerDegree = requiredNumber(settings?.heat_loss_percent_per_c, settingsError, { min: 0 });
  const ambientTemperature = nullableFiniteNumber(input.ambientTempC);
  const temperatureSource = ambientTemperature === null ? 'unavailable'
    : input.temperatureSource === 'weather_api' ? 'weather_api' : 'manual_fallback';
  const panelTemperature = ambientTemperature === null ? null : ambientTemperature + panelOffset;
  const heatLossPercent = panelTemperature === null ? null
    : panelTemperature <= heatThreshold ? 0 : (panelTemperature - heatThreshold) * percentPerDegree;
  const heatLossOmr = heatLossPercent === null ? null
    : monthlyProductionKwh * (heatLossPercent / 100) * tariffOmrPerKwh;
  const dustLossOmr = dustLossPercent === null ? null
    : monthlyProductionKwh * (dustLossPercent / 100) * tariffOmrPerKwh;
  if ([panelTemperature, heatLossPercent, heatLossOmr, dustLossOmr].some((value) => value !== null && !Number.isFinite(value))) {
    throw new Error('تعذر حساب قيم الخسارة من البيانات المدخلة والإعدادات.');
  }
  return {
    id, user_id: userId, created_at: createdAt, location: String(input.location || ''),
    ambient_temp_c: ambientTemperature, temperature_source: temperatureSource, estimated_panel_temp_c: panelTemperature,
    monthly_production_kwh: monthlyProductionKwh, tariff_omr_per_kwh: tariffOmrPerKwh,
    dust_loss_percent: dustLossPercent, dust_loss_omr: dustLossOmr,
    heat_loss_percent: heatLossPercent, heat_loss_omr: heatLossOmr,
  };
}

export async function createPanelAnalysis(input) {
  const temperature = await resolveAnalysisTemperature(input);
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const record = await updateDatabase((db) => {
    const analysis = buildPanelAnalysis({ ...input, ...temperature, id, createdAt }, db.app_settings);
    db.panel_analyses.push(analysis);
    return analysis;
  });
  return record;
}
