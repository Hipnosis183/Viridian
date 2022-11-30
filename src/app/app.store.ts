import { createStore } from "@stencil/store";

const { state } = createStore({
  filePaths: {
    ffmpeg: '/home/renzo/Downloads/ffmpeg/',
  },
  fileInfo: {
    fileExtension: null,
    fileLoaded: false,
    fileName: null,
    filePath: null,
    fileType: null,
  },
  filterInfo: {
    filterHeight: null,
    filterWidth: null
  },
  playerInfo: {
    playerCrop: null,
    playerVideo: null,
  },
  videoInfo: {
    videoHeight: null,
    videoStreams: null,
    videoStreamsText: [],
    videoWidth: null,
  }
});

export default state;