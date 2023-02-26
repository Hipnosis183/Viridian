import { createStore } from "@stencil/store";

const { state } = createStore({
  filePaths: {
    ffmpeg: '/home/renzo/Downloads/ffmpeg/',
    temp: process.cwd() + '/temp/',
  },
  fileInfo: [
    // fileConcat: null,
    // fileExtension: null,
    // fileName: null,
    // filePath: null,
    // fileThumb: null,
    // fileType: null,
  ],
  filterInfo: {
    filterConcat: [],
    filterHeight: 0,
    filterWidth: 0,
    filterX: 0,
    filterY: 0,
  },
  playerInfo: {
    playerCrop: null,
    playerIndex: 0,
    playerVideo: [],
    playerHeight: 0,
    playerWidth: 0,
  },
  videoInfo: [
    // videoHeight: null,
    // videoStreams: null,
    // videoStreamsText: [],
    // videoWidth: null,
  ]
});

export default state;