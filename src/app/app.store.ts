import { createStore } from "@stencil/store";
import DefaultColors from 'tailwindcss/colors'

const { state } = createStore({
  filePaths: {
    temp: process.cwd() + '/temp/',
  },
  settings: {
    ffmpeg: {
      filesPath: localStorage.getItem('ffmpeg.filesPath') || process.cwd() + '/ffmpeg/',
      saveCommands: JSON.parse(localStorage.getItem('ffmpeg.saveCommands') || 'true'),
    },
    general: {
      createThumbs: JSON.parse(localStorage.getItem('general.createThumbs') || 'false'),
    }
  },
  colorInfo: [
    DefaultColors.blue,
    DefaultColors.red,
    DefaultColors.green,
    DefaultColors.yellow,
    DefaultColors.purple,
    DefaultColors.pink,
    DefaultColors.teal,
    DefaultColors.indigo,
    DefaultColors.amber,
    DefaultColors.sky,
    DefaultColors.rose,
    DefaultColors.lime,
    DefaultColors.fuchsia,
    DefaultColors.orange,
  ],
  fileInfo: [
    // fileColor: 0,
    // fileClip: null,
    // fileClips: [],
    // fileConcat: null,
    // fileConcatClip: null,
    // fileExtension: null,
    // fileIndex: 0,
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
    playerLoaded: null,
    playerLoading: null,
    playerVideo: [],
    playerHeight: 0,
    playerWidth: 0,
  },
  videoInfo: [
    // videoFrameRate: null,
    // videoHeight: null,
    // videoKeyFrames: [],
    // videoStreams: null,
    // videoStreamsText: [],
    // videoWidth: null,
  ]
});

export default state;