// References: NOAA's general solar-position equations and Open-Meteo's hourly
// global_tilted_irradiance. These are models, not electrical or thermal readings.
// https://gml.noaa.gov/grad/solcalc/solareqns.PDF
// https://open-meteo.com/en/docs/historical-weather-api
// https://pvpmc.sandia.gov/modeling-guide/5-ac-system-output/pv-performance-metrics/performance-ratio/
// https://pvpmc.sandia.gov/modeling-guide/2-dc-module-iv/cell-temperature/noct-cell-temperature/

const DAY_MS = 86400000;
const HOUR_MS = 3600000;
const RAD = Math.PI / 180;
const weatherCache = new Map();

function number(value, min = -Infinity, max = Infinity) {
  if ((typeof value !== 'number' && typeof value !== 'string') || value === '' || typeof value === 'string' && !value.trim()) return null;
  const result = Number(value);
  return Number.isFinite(result) && result >= min && result <= max ? result : null;
}

function firstNumber(values, min, max) {
  for (const value of values) {
    const result = number(value, min, max);
    if (result !== null) return result;
  }
  return null;
}

function round(value, digits = 3) {
  return value === null || !Number.isFinite(value) ? null : Number(value.toFixed(digits));
}

function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function dateString(date) { return date.toISOString().slice(0, 10); }
function shiftedDate(day, days) { return dateString(new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS)); }

function validTimezone(value) {
  try {
    if (typeof value !== 'string' || !value) return null;
    new Intl.DateTimeFormat('en', { timeZone: value }).format();
    return value;
  } catch { return null; }
}

function localDay(date, timezone = 'UTC') {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const part = (name) => parts.find((item) => item.type === name)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

function midnightEpoch(day, timezone) {
  const target = Date.parse(`${day}T00:00:00Z`);
  let guess = target;
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = formatter.formatToParts(new Date(guess));
    const part = (name) => Number(parts.find((item) => item.type === name)?.value);
    const represented = Date.UTC(part('year'), part('month') - 1, part('day'), part('hour'), part('minute'), part('second'));
    guess += target - represented;
  }
  return guess;
}

function readGeometry(facts) {
  const latitude = number(facts.latitude, -90, 90);
  const longitude = number(facts.longitude, -180, 180);
  const tilt = firstNumber([facts.tilt, facts.panelTiltDegrees, facts.tiltDegrees], 0, 90);
  const azimuth = firstNumber([facts.panelAzimuthDegrees, facts.azimuthDegrees, facts.panelAzimuth], 0, 360);
  return { latitude, longitude, tilt, azimuth: azimuth === 360 ? 0 : azimuth };
}

export function buildSolarContext(facts = {}) {
  facts = facts && typeof facts === 'object' && !Array.isArray(facts) ? facts : {};
  const { latitude, longitude, tilt, azimuth } = readGeometry(facts);
  const captureValue = facts.captureAt ?? facts.capturedAt;
  // A timezone-less camera timestamp is ambiguous, and upload time is not capture time.
  const captureTime = typeof captureValue === 'string' && /T\d{2}:\d{2}.*(?:Z|[+-]\d{2}:\d{2})$/i.test(captureValue)
    ? Date.parse(captureValue) : NaN;
  const context = {
    available: false, latitude, longitude, captureAt: Number.isFinite(captureTime) ? new Date(captureTime).toISOString() : null,
    sun: { azimuthDegrees: null, elevationDegrees: null, daylight: null, method: 'NOAA approximate solar position' },
    panel: { tiltDegrees: tilt, azimuthDegrees: azimuth, incidenceAngleDegrees: null, incidenceCosine: null },
    temperature: { ambientTemperatureC: firstNumber([facts.ambientTemperatureC, facts.ambientTempC], -100, 80), measuredPanelTemperatureC: null, estimatedCellTemperatureC: null, source: 'unavailable' },
    limitations: [],
  };
  if (latitude === null || longitude === null) context.limitations.push('missing_location');
  if (!context.captureAt) context.limitations.push('missing_capture_time_with_timezone');
  if (tilt === null) context.limitations.push('missing_measured_panel_tilt');
  if (azimuth === null && tilt !== 0) context.limitations.push('missing_measured_panel_azimuth');
  if (latitude !== null && longitude !== null && context.captureAt) {
    const capture = new Date(captureTime);
    const year = capture.getUTCFullYear();
    const daysInYear = new Date(Date.UTC(year, 1, 29)).getUTCMonth() === 1 ? 366 : 365;
    const day = Math.floor((Date.UTC(year, capture.getUTCMonth(), capture.getUTCDate()) - Date.UTC(year, 0, 1)) / DAY_MS) + 1;
    const hours = capture.getUTCHours() + capture.getUTCMinutes() / 60 + capture.getUTCSeconds() / 3600;
    const gamma = 2 * Math.PI / daysInYear * (day - 1 + (hours - 12) / 24);
    const equationMinutes = 229.18 * (0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma) - 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma));
    const declination = 0.006918 - 0.399912 * Math.cos(gamma) + 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma) + 0.000907 * Math.sin(2 * gamma) - 0.002697 * Math.cos(3 * gamma) + 0.00148 * Math.sin(3 * gamma);
    const solarMinutes = ((hours * 60 + equationMinutes + 4 * longitude) % 1440 + 1440) % 1440;
    const hourAngle = (solarMinutes / 4 - 180) * RAD;
    const lat = latitude * RAD;
    const cosZenith = clamp(Math.sin(lat) * Math.sin(declination) + Math.cos(lat) * Math.cos(declination) * Math.cos(hourAngle), -1, 1);
    const elevation = 90 - Math.acos(cosZenith) / RAD;
    const sunAzimuth = (Math.atan2(Math.sin(hourAngle), Math.cos(hourAngle) * Math.sin(lat) - Math.tan(declination) * Math.cos(lat)) / RAD + 180 + 360) % 360;
    context.available = true;
    context.sun.azimuthDegrees = round(sunAzimuth, 1);
    context.sun.elevationDegrees = round(elevation, 1);
    context.sun.daylight = elevation > 0;
    if (tilt !== null && (azimuth !== null || tilt === 0) && elevation > 0) {
      const incidence = clamp(Math.sin(elevation * RAD) * Math.cos(tilt * RAD) + Math.cos(elevation * RAD) * Math.sin(tilt * RAD) * Math.cos((sunAzimuth - (azimuth ?? 0)) * RAD), -1, 1);
      context.panel.incidenceAngleDegrees = round(Math.acos(incidence) / RAD, 1);
      context.panel.incidenceCosine = round(Math.max(0, incidence), 4);
    }
    if (Math.abs(latitude) > 72) context.limitations.push('reduced_solar_position_accuracy_at_high_latitude');
    context.limitations.push('approximate_position_without_atmospheric_refraction');
  }
  const measuredTemperature = firstNumber([facts.measuredPanelTemperatureC, facts.panelTemperatureC], -100, 150);
  const measuredCellTemperature = number(facts.measuredCellTemperatureC, -100, 150);
  const irradiance = number(facts.irradianceWm2, 0, 1500);
  const noct = number(facts.nominalOperatingCellTemperatureC, 25, 80);
  if (measuredTemperature !== null || measuredCellTemperature !== null) {
    context.temperature.measuredPanelTemperatureC = measuredTemperature;
    context.temperature.estimatedCellTemperatureC = measuredCellTemperature;
    context.temperature.source = 'measured';
  } else if (context.temperature.ambientTemperatureC !== null && irradiance !== null && noct !== null) {
    // NOCT approximation assumes nominal mounting and wind; it is never an RGB measurement.
    context.temperature.estimatedCellTemperatureC = round(context.temperature.ambientTemperatureC + (noct - 20) * irradiance / 800, 1);
    context.temperature.source = 'NOCT_model';
    context.limitations.push('cell_temperature_model_requires_matching_capture_time_and_nominal_wind_mounting');
  } else context.limitations.push('rgb_and_sun_direction_do_not_measure_panel_temperature');
  return context;
}

function monthPeriod(value, now, timezone) {
  if (typeof value !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return null;
  const [year, month] = value.split('-').map(Number);
  if (year < 1940 || year > 2100) return null;
  const startDate = `${value}-01`;
  const monthEnd = dateString(new Date(Date.UTC(year, month, 0)));
  const today = localDay(now, timezone);
  const endDate = monthEnd < today ? monthEnd : shiftedDate(today, -1);
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const daysIncluded = endDate >= startDate ? Math.floor((Date.parse(endDate) - Date.parse(startDate)) / DAY_MS) + 1 : 0;
  return { startDate, endDate: daysIncluded ? endDate : null, monthEnd, daysInMonth, daysIncluded, complete: monthEnd < today, timezone };
}

async function weatherRequest(base, startDate, endDate, geometry, timezone) {
  const query = new URLSearchParams({
    latitude: String(geometry.latitude), longitude: String(geometry.longitude), start_date: startDate, end_date: endDate,
    hourly: 'global_tilted_irradiance,temperature_2m', timezone: timezone || 'auto', timeformat: 'unixtime',
    tilt: String(geometry.tilt),
    // The UI uses clockwise from north; Open-Meteo uses south=0, east=-90.
    azimuth: String(geometry.azimuth - 180),
  });
  const response = await fetch(`${base}?${query}`, { signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error(`weather_http_${response.status}`);
  const data = await response.json();
  if (data.error || !Array.isArray(data.hourly?.time) || !Array.isArray(data.hourly?.global_tilted_irradiance)) throw new Error('weather_invalid_response');
  return data;
}

async function monthWeather(geometry, month, requestedTimezone, now) {
  const cacheKey = JSON.stringify([geometry, month, requestedTimezone, dateString(now)]);
  const cached = weatherCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  const initial = monthPeriod(month, now, requestedTimezone || 'UTC');
  if (!initial) return null;
  // Request the next date to obtain the backward-averaged interval ending at 00:00.
  // Today may be returned by the API, but only completed local days are counted below.
  const requestEnd = [shiftedDate(initial.monthEnd, 1), dateString(now)].sort()[0];
  if (requestEnd < initial.startDate) return null;
  const archiveEnd = shiftedDate(dateString(now), -7);
  const requests = [];
  if (initial.startDate <= archiveEnd) {
    requests.push({ source: 'open_meteo_reanalysis', promise: weatherRequest('https://archive-api.open-meteo.com/v1/archive', initial.startDate, [archiveEnd, requestEnd].sort()[0], geometry, requestedTimezone) });
  }
  const recentStart = [initial.startDate, shiftedDate(archiveEnd, 1)].sort().at(-1);
  if (recentStart <= requestEnd) {
    requests.push({ source: 'open_meteo_recent_weather_model', promise: weatherRequest('https://api.open-meteo.com/v1/forecast', recentStart, requestEnd, geometry, requestedTimezone) });
  }
  const responses = await Promise.allSettled(requests.map((request) => request.promise));
  const successful = responses.flatMap((response, index) => response.status === 'fulfilled' ? [{ data: response.value, source: requests[index].source }] : []);
  if (!successful.length) throw new Error('monthly_weather_unavailable');
  const timezone = validTimezone(successful[0].data.timezone) || requestedTimezone || 'UTC';
  const period = monthPeriod(month, now, timezone);
  const rows = new Map();
  for (const { data, source } of successful) {
    for (let index = 0; index < data.hourly.time.length; index += 1) {
      const stamp = number(data.hourly.time[index], 0);
      const irradiance = number(data.hourly.global_tilted_irradiance[index], 0, 2000);
      if (stamp === null || irradiance === null) continue;
      const day = localDay(new Date(stamp * 1000 - 1), timezone);
      if (!period.endDate || day < period.startDate || day > period.endDate) continue;
      rows.set(stamp, { day, irradiance, temperature: number(data.hourly.temperature_2m?.[index], -100, 80), source });
    }
  }
  const dayRows = new Map();
  for (const row of rows.values()) {
    if (!dayRows.has(row.day)) dayRows.set(row.day, []);
    dayRows.get(row.day).push(row);
  }
  // Reject missing hours rather than silently treating an incomplete day as complete.
  const validDays = [...dayRows].filter(([day, values]) => {
    const expectedHours = (midnightEpoch(shiftedDate(day, 1), timezone) - midnightEpoch(day, timezone)) / HOUR_MS;
    return values.length === expectedHours;
  });
  const usable = validDays.flatMap(([, values]) => values);
  const radiation = usable.reduce((sum, row) => sum + row.irradiance / 1000, 0);
  const daytime = usable.filter((row) => row.irradiance > 20 && row.temperature !== null);
  const temperature = daytime.length ? daytime.reduce((sum, row) => sum + row.temperature * row.irradiance, 0) / daytime.reduce((sum, row) => sum + row.irradiance, 0) : null;
  const result = {
    period, daysAvailable: validDays.length, completeCoverage: validDays.length === period.daysIncluded,
    irradiationKwhPerM2: usable.length ? round(radiation, 4) : null,
    radiationWeightedAmbientTemperatureC: round(temperature, 1),
    source: [...new Set(usable.map((row) => row.source))],
    unavailableRequests: responses.filter((response) => response.status === 'rejected').length,
  };
  if (weatherCache.size >= 100) weatherCache.delete(weatherCache.keys().next().value);
  weatherCache.set(cacheKey, { expiresAt: Date.now() + 5 * 60000, value: result });
  return result;
}

function resolveTariff(tariff, facts, invoice, warnings) {
  const entered = firstNumber([tariff, facts.tariffOmrPerKwh, facts.tariff], 0, 10);
  if (entered !== null) return { value: entered, basis: 'user_supplied' };
  const invoiceAccepted = invoice?.confirmed === true && invoice.documentReadable === true && invoice.currency === 'OMR' && ['medium', 'high'].includes(invoice.confidence);
  if (invoiceAccepted && invoice.tariffBasis === 'printed') {
    const printed = number(invoice.energyTariffPerKwh, 0, 10);
    if (printed !== null) return { value: printed, basis: 'confirmed_printed_bill_tariff' };
  }
  warnings.push('missing_confirmed_omr_energy_tariff');
  return { value: null, basis: 'unavailable' };
}

export async function estimateMonthlyLoss({ facts = {}, analysis = {}, invoice = null, month, tariff, expectedMonthlyKwh, actualMonthlyKwh } = {}) {
  facts = facts && typeof facts === 'object' && !Array.isArray(facts) ? facts : {};
  analysis = analysis && typeof analysis === 'object' && !Array.isArray(analysis) ? analysis : {};
  const warnings = [];
  const assumptions = [];
  const now = new Date();
  const timezone = validTimezone(facts.timezone) || 'UTC';
  const selectedMonth = typeof month === 'string' ? month : typeof facts.billMonth === 'string' ? facts.billMonth : localDay(now, timezone).slice(0, 7);
  const period = monthPeriod(selectedMonth, now, timezone);
  if (!validTimezone(facts.timezone)) warnings.push('missing_timezone_using_utc_until_weather_resolves_local_timezone');
  const resolvedTariff = resolveTariff(tariff, facts, invoice, warnings);
  const output = {
    month: selectedMonth, status: 'unavailable', method: 'unavailable', period,
    expectedKwh: null, actualKwh: firstNumber([actualMonthlyKwh, facts.actualMonthlyKwh], 0, 1e12), lostKwh: null, lossMoney: null,
    tariff: resolvedTariff.value, tariffBasis: resolvedTariff.basis, currency: 'OMR', weather: null,
    assumptions, warnings,
    components: {
      dust: { coveragePercent: number(analysis.dustCoveragePercent, 0, 100), energyLossPercent: null },
      shade: { coveragePercent: number(analysis.shadeCoveragePercent, 0, 100), energyLossPercent: null },
      heat: { energyLossPercent: null, note: 'performance_ratio_includes_temperature_do_not_add_again' },
      orientation: { energyLossPercent: null, note: 'measured_orientation_in_tilted_irradiance_do_not_add_again' },
      combinedLossPercent: null,
    },
  };
  if (!period) { warnings.push('invalid_selected_month'); return output; }
  if (!period.daysIncluded) { warnings.push('selected_month_has_no_completed_days'); return output; }
  if (invoice?.billingMonth && invoice.billingMonth !== selectedMonth) warnings.push('invoice_month_differs_from_selected_month');
  warnings.push('bill_grid_consumption_is_not_solar_production', 'visible_surface_coverage_is_not_energy_loss');
  const enteredExpected = firstNumber([expectedMonthlyKwh, facts.expectedMonthlyKwh], 0, 1e12);
  if (enteredExpected !== null) {
    output.expectedKwh = enteredExpected;
    output.method = 'provided_expected_generation';
    assumptions.push('expected_and_actual_pv_generation_refer_to_same_selected_period');
  } else {
    const geometry = readGeometry(facts);
    if (geometry.tilt === 0 && geometry.azimuth === null) geometry.azimuth = 180;
    const power = number(facts.systemPowerWatts, 1, 100000000);
    if (geometry.latitude === null || geometry.longitude === null) warnings.push('monthly_model_requires_location');
    else if (geometry.tilt === null || geometry.azimuth === null) warnings.push('monthly_model_requires_measured_tilt_and_azimuth');
    else if (power === null) warnings.push('monthly_model_requires_installed_power');
    else {
      try {
        output.weather = await monthWeather(geometry, selectedMonth, validTimezone(facts.timezone), now);
        if (output.weather) {
          output.period = output.weather.period;
          if (output.weather.completeCoverage && output.weather.irradiationKwhPerM2 !== null) {
            const suppliedRatio = number(facts.performanceRatio, 0.1, 1);
            const ratio = suppliedRatio ?? 0.8;
            output.expectedKwh = round(power / 1000 * output.weather.irradiationKwhPerM2 * ratio);
            output.method = 'weather_modeled_expected_generation';
            output.weather.performanceRatio = ratio;
            output.weather.performanceRatioSource = suppliedRatio === null ? 'default_assumption' : 'user_supplied';
            assumptions.push('expected_generation_equals_installed_kw_times_plane_of_array_kwh_per_m2_times_performance_ratio');
            assumptions.push('performance_ratio_is_aggregate_and_includes_temperature_inverter_and_other_losses');
            assumptions.push('open_meteo_isotropic_sky_and_ground_albedo_0_2');
            if (suppliedRatio === null) assumptions.push('default_performance_ratio_0_8_not_a_site_calibration');
            warnings.push('weather_model_is_not_metered_site_generation');
          } else warnings.push('incomplete_monthly_weather_no_full_period_estimate');
        } else warnings.push('monthly_weather_unavailable');
      } catch { warnings.push('monthly_weather_unavailable'); }
    }
  }
  if (!output.period.complete) warnings.push('current_month_includes_completed_days_only_align_inverter_reading_to_end_of_yesterday');
  if (output.expectedKwh === null) return output;
  if (output.actualKwh === null) {
    output.status = 'expected_generation_only';
    warnings.push('actual_inverter_generation_required_for_monthly_loss');
    return output;
  }
  const deficit = Math.max(0, output.expectedKwh - output.actualKwh);
  output.lostKwh = round(deficit);
  output.lossMoney = output.tariff === null ? null : round(deficit * output.tariff, 4);
  output.components.combinedLossPercent = output.expectedKwh > 0 ? round(deficit / output.expectedKwh * 100, 1) : null;
  output.status = enteredExpected !== null ? 'provided_generation_deficit' : 'modeled_generation_deficit';
  warnings.push('generation_deficit_cannot_be_attributed_to_dust_shade_heat_without_additional_measurements');
  if (output.actualKwh > output.expectedKwh) warnings.push('actual_generation_exceeds_reference_no_positive_deficit');
  if (output.lossMoney !== null) assumptions.push('energy_value_uses_constant_confirmed_omr_tariff_not_bill_total_or_tax');
  return output;
}
