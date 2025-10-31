export interface CustomerDetails {
  bodySize: string;
  bodyNature: string;
}

export interface StyleSuggestion {
  styleName: string;
  description: string;
  occasions: string;
  sketchUrl: string;
}

export interface StylePreferences {
    inspirations: string[];
    garmentType: string;
}