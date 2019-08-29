import React from 'react';

// import nodejs bindings to native tensorflow,
// not required, but will speed up things drastically (python required)
// import '@tensorflow/tfjs-node';

// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
import * as canvas from 'canvas';

import * as faceapi from 'face-api.js';


// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement, additionally an implementation
// of ImageData is required, in case you want to use the MTCNN
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ 
  Canvas: HTMLCanvasElement,
  Image: HTMLImageElement,
  ImageData: ImageData,
  Video: HTMLVideoElement,
  createCanvasElement: () => document.createElement('canvas'),
  createImageElement: () => document.createElement('img')
})


class FileUpload extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      imageURL: '',
      loadingModels: true,
      loadingDetection: false,
      imageFile: ''
    };

    this.handleUploadImage = this.handleUploadImage.bind(this);
    this.start = this.start.bind(this);
  }

  handleUploadImage(ev) {
    ev.preventDefault();

    const data = new FormData();
    this.setState({ imageFile: this.uploadInput.files[0] })
    data.append('file', this.uploadInput.files[0]);
    fetch('http://localhost:3001/upload', {
      method: 'POST',
      body: data,
    }).then((response) => {
      response.json().then((body) => {
        this.setState({ imageURL: `http://localhost:3001/${body.file}` });
      });
    });
  }

  componentDidMount = () => {
    const path = '/models';
    Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri(path),
      faceapi.nets.faceLandmark68Net.loadFromUri(path),
      faceapi.nets.ssdMobilenetv1.loadFromUri(path)
    ]).then(() => {
      this.setState({loadingModels: false})
    }).catch(err => console.log(err))
    
  }

  async start() {
    this.setState({ loadingDetection: true });
    // const imageUpload = document.getElementById('imageUpload');
    const container = document.getElementsByClassName('image-container')[0];
    container.style.position = 'relative';
    // document.body.append(container);
    document.body.append('Loaded');
    // fetch(imageUpload.src).then(res => res.blob()).then(async (blob) =>{
        // console.log(blob)
        const image = await faceapi.bufferToImage(this.state.imageFile);
        // container.append(image);
        const canvas = faceapi.createCanvasFromMedia(image);
        container.append(canvas);
        const displaySize = { width: image.width, height: image.height };
        faceapi.matchDimensions(canvas, displaySize);
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        resizedDetections.forEach(detection => {
          const box = detection.detection.box;
          const drawBox = new faceapi.draw.DrawBox(box, { label: 'Face' });
          drawBox.draw(canvas);
          this.setState({ loadingDetection: false });
      })
    // })

  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleUploadImage}>
          <div>
            <input ref={(ref) => { this.uploadInput = ref; }} type="file" />
          </div>
          <div>
            <button>Upload</button>
          </div>
        </form>
        <div className="image-container">
          { this.state.imageURL && 
            <img src={this.state.imageURL} alt="img" id="imageUpload"/>
          }
        </div>
        <button onClick={ this.start }>Detect Faces</button>
        { this.state.loadingModels &&
          <p>Loading Models...</p>
        }
        { this.state.loadingDetection &&
          <p>Loading Face Detection...</p>
        }
      </div>
    );
  }
}

export default FileUpload;
