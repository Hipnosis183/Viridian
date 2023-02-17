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
    filterHeight: 0,
    filterWidth: 0,
    filterX: 0,
    filterY: 0,
  },
  playerInfo: {
    playerCrop: null,
    playerVideo: null,
    playerHeight: 0,
    playerWidth: 0,
  },
  videoInfo: {
    videoHeight: null,
    videoStreams: null,
    videoStreamsText: [],
    videoWidth: null,
  }
});

export default state;