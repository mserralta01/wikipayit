export interface MapboxSettings {
  enabled: boolean;
  apiKey: string;
  geocodingEndpoint?: string;
}

export interface SendGridSettings {
  enabled: boolean;
  apiKey: string;
  fromEmail: string;
}

export interface APISettings {
  mapbox?: MapboxSettings;
  sendgrid?: SendGridSettings;
} 