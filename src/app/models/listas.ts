// Codec.
export interface Codec {
  code: string,
  name: string,
  encoders: string[],
};

// Encoder.
export interface Encoder {
  codes: string[],
  quality: number[],
  presets: { [index: string]: any },
  rates: { [index: string]: any },
};

// Encoding presets.
export interface EncodingPreset {
  text: string,
  value: string,
};

// Encoding rates.
export interface EncodingRate {
  text: string,
  value: string,
};

// Format.
export interface Format {
  name: string,
  extensions: string[],
  codecs: string[],
};

// Concat modes.
export interface OutputConcat {
  code: string,
  name: string,
};

// Cut modes.
export interface OutputCut {
  code: string,
  name: string,
};

// Scaling options.
export interface Scaling {
  algorithm: {
    text: string,
    value: string,
  }[],
  ratio: {
    text: string,
    value: number,
  }[],
  scale: {
    text: string,
    value: number,
  }[],
};