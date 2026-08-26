"use client";

import { GenerativeUi } from "./generative-ui";
import { WeatherCard, WeatherSkeleton } from "./weather-card";

const WEATHER_JSON = `{
  "location": "Shenzhen, CN",
  "temperature": 29,
  "feelsLike": 34,
  "humidity": 0.78,
  "forecast": [
    { "day": "Thu", "high": 31 },
    { "day": "Fri", "high": 28 },
    { "day": "Sat", "high": 27 }
  ]
}`;

export function DemoReady() {
  return (
    <GenerativeUi tool="getWeather" state="ready" data={WEATHER_JSON}>
      <WeatherCard />
    </GenerativeUi>
  );
}

export function DemoStreaming() {
  return (
    <GenerativeUi tool="getWeather" state="streaming" skeleton={<WeatherSkeleton />} />
  );
}

export function DemoUnsupported() {
  return (
    <GenerativeUi
      tool="getFlightStatus"
      state="unsupported"
      data={`{\n  "flight": "CZ3456",\n  "status": "on_time",\n  "gate": "B12"\n}`}
      fallback="CZ3456 is on time, departing from gate B12 at 14:05. Update the app to see the live boarding card."
    />
  );
}
