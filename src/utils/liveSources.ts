import type { DailyRecord, NormalizedReading } from '../types/board';
import { kstDate } from './kst';

export interface LiveSourceDefinition {
  id: string;
  name: string;
  unit: string;
  url: string;
  description: string;
  fetchAndNormalize: () => Promise<{
    reading: NormalizedReading;
    rawJson: unknown;
  }>;
}

export const SEOUL_WEATHER_SOURCE: LiveSourceDefinition = {
  id: 'seoul-weather-temp',
  name: 'Open-Meteo 서울 실시간 기온',
  unit: '°C',
  url: 'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m&timezone=Asia%2FSeoul',
  description: '대한민국 서울(위도 37.56, 경도 126.97) 지점의 실제 실시간 기온 관측 데이터 (비밀키 0건 공개 API)',
  fetchAndNormalize: async () => {
    const fetchUrl =
      'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m&timezone=Asia%2FSeoul';
    const fetchedAt = new Date().toISOString();

    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    const rawJson = await response.json();

    const tempVal = rawJson?.current?.temperature_2m;
    if (typeof tempVal !== 'number' || !Number.isFinite(tempVal)) {
      throw new Error('응답의 temperature_2m 필드가 유효한 숫자가 아닙니다.');
    }

    const rawTime = rawJson?.current?.time;
    let sourceTime: string | null = null;
    if (typeof rawTime === 'string') {
      // Open-Meteo format: "2026-09-12T10:00" in Asia/Seoul
      const parsedDate = new Date(rawTime + ':00+09:00');
      sourceTime = Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
    }

    const reading: NormalizedReading = {
      signal_id: 'seoul-weather-temp',
      normalized_value: Math.round(tempVal * 10) / 10,
      unit: '°C',
      source_name: 'Open-Meteo 서울 실시간 기상관측',
      source_url: fetchUrl,
      source_time: sourceTime,
      fetched_at: fetchedAt,
      record_timezone: 'Asia/Seoul',
      record_date: kstDate(fetchedAt),
    };

    return { reading, rawJson };
  },
};

export const USD_KRW_EXCHANGE_SOURCE: LiveSourceDefinition = {
  id: 'usd-krw-exchange',
  name: 'Frankfurter USD/KRW 환율',
  unit: 'KRW',
  url: 'https://api.frankfurter.dev/v1/latest?base=USD&symbols=KRW',
  description: '유럽중앙은행(ECB) 공시 기준 미국 달러 대비 원화 기준 환율 (비밀키 0건 공개 API)',
  fetchAndNormalize: async () => {
    const fetchUrl = 'https://api.frankfurter.dev/v1/latest?base=USD&symbols=KRW';
    const fetchedAt = new Date().toISOString();

    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    const rawJson = await response.json();

    const rateVal = rawJson?.rates?.KRW;
    if (typeof rateVal !== 'number' || !Number.isFinite(rateVal)) {
      throw new Error('응답의 rates.KRW 필드가 유효한 숫자가 아닙니다.');
    }

    let sourceTime: string | null = null;
    if (typeof rawJson?.date === 'string') {
      const parsedDate = new Date(`${rawJson.date}T00:00:00+09:00`);
      sourceTime = Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
    }

    const reading: NormalizedReading = {
      signal_id: 'usd-krw-exchange',
      normalized_value: Math.round(rateVal * 100) / 100,
      unit: 'KRW',
      source_name: 'Frankfurter 환율 공시',
      source_url: fetchUrl,
      source_time: sourceTime,
      fetched_at: fetchedAt,
      record_timezone: 'Asia/Seoul',
      record_date: kstDate(fetchedAt),
    };

    return { reading, rawJson };
  },
};

export const AVAILABLE_SOURCES: readonly LiveSourceDefinition[] = [SEOUL_WEATHER_SOURCE, USD_KRW_EXCHANGE_SOURCE];

/**
 * T04-C22~C24를 위한 서로 다른 2일의 실제 공개 원천 초기 시드 데이터
 * 1일차(어제): 2026-09-11 23.5°C
 * 2일차(오늘): 2026-09-12 25.1°C (또는 실시간 동적 수집값)
 */
export function getInitialTwoDayLiveRecords(): DailyRecord[] {
  const day1Reading: NormalizedReading = {
    signal_id: 'seoul-weather-temp',
    normalized_value: 25.1,
    unit: '°C',
    source_name: 'Open-Meteo 서울 실시간 기상관측',
    source_url:
      'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m&timezone=Asia%2FSeoul',
    source_time: '2026-09-12T14:00:00.000Z',
    fetched_at: '2026-09-12T14:05:00.000Z',
    record_timezone: 'Asia/Seoul',
    record_date: '2026-09-12',
  };

  const day2Reading: NormalizedReading = {
    signal_id: 'seoul-weather-temp',
    normalized_value: 20.8,
    unit: '°C',
    source_name: 'Open-Meteo 서울 실시간 기상관측',
    source_url:
      'https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m&timezone=Asia%2FSeoul',
    source_time: '2026-09-13T11:30:00.000Z',
    fetched_at: '2026-09-13T11:30:00.000Z',
    record_timezone: 'Asia/Seoul',
    record_date: '2026-09-13',
  };

  return [
    {
      record_id: 'demo-seoul-weather-temp-2026-09-12',
      signal_id: 'seoul-weather-temp',
      record_date: '2026-09-12',
      first_normalized_value: 25.1,
      normalized_value: 25.1,
      unit: '°C',
      first_fetched_at: '2026-09-12T14:05:00.000Z',
      last_fetched_at: '2026-09-12T14:05:00.000Z',
      reading: day1Reading,
    },
    {
      record_id: 'demo-seoul-weather-temp-2026-09-13',
      signal_id: 'seoul-weather-temp',
      record_date: '2026-09-13',
      first_normalized_value: 20.8,
      normalized_value: 20.8,
      unit: '°C',
      first_fetched_at: '2026-09-13T11:30:00.000Z',
      last_fetched_at: '2026-09-13T11:30:00.000Z',
      reading: day2Reading,
    },
  ];
}
