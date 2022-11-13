import { createStore } from "@stencil/store";

const { state } = createStore({
  filePaths: {
    ffmpeg: '/home/renzo/Downloads/ffmpeg/',
  },
  fileInfo: {
    fileLoaded: false,
    fileName: null,
    filePath: null,
    fileType: null,
  },
  videoInfo: {
    videoHeight: null,
    videoStreams: null,
    videoStreamsText: [],
    videoWidth: null,
  }
});

export default state;