// Video container.
export type VideoContainer = VideoFile | VideoStream;

// Video frames.
export interface VideoFrames {
  frames: {
    key_frame: number,
    pts_time: number,
  }[],
};

// Video file.
export interface VideoFile {
  filename: string,
  nb_streams: number,
  nb_programs: number,
  format_name: string,
  format_long_name: string,
  start_time: string,
  duration: string,
  size: string,
  bit_rate: string,
  probe_score: number,
  tags: {
    major_brand: string,
    minor_version: string,
    compatible_brands: string,
    encoder: string,
  },
};

// Video stream.
export interface VideoStream {
  index: number,
  codec_name: string,
  codec_long_name: string,
  profile: string,
  codec_type: string,
  codec_tag_string: string,
  codec_tag: string,
  width: number,
  height: number,
  coded_width: number,
  coded_height: number,
  closed_captions: number,
  film_grain: number,
  has_b_frames: number,
  pix_fmt: string,
  level: number,
  color_range: string,
  color_primaries: string,
  chroma_location: string,
  field_order: string,
  refs: number,
  id: string,
  r_frame_rate: string,
  avg_frame_rate: string,
  time_base: string,
  start_pts: number,
  start_time: string,
  duration_ts: number,
  duration: string,
  bit_rate: string,
  nb_frames: string,
  extradata_size: number,
  disposition: {
    default: number,
    dub: number,
    original: number,
    comment: number,
    lyrics: number,
    karaoke: number,
    forced: number,
    hearing_impaired: number,
    visual_impaired: number,
    clean_effects: number,
    attached_pic: number,
    timed_thumbnails: number,
    captions: number,
    descriptions: number,
    metadata: number,
    dependent: number,
    still_image: number,
  },
  tags: {
    language: string,
    handler_name: string,
    vendor_id: string,
    encoder: string,
  },
};