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
faceapi.env.monkeyPatch({ Canvas, Image, ImageData })
console.log(faceapi.nets);
const path = './models';
    Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri(path),
      faceapi.nets.faceLandmark68Net.loadFromUri(path),
      faceapi.nets.ssdMobilenetv1.loadFromUri(path)
    ]).then(() => {
      console.log("Something")
      // this.setState({loadingModels: false})
    }).catch(err => console.log(err))

class FileUpload extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      imageURL: 'http://localhost:3001/public/image.jpg',
      loadingModels: true,
    };

    this.handleUploadImage = this.handleUploadImage.bind(this);
  }

  handleUploadImage(ev) {
    ev.preventDefault();

    const data = new FormData();
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
    
  }

  render() {
    return (
      <form onSubmit={this.handleUploadImage}>
        <div>
          <input ref={(ref) => { this.uploadInput = ref; }} type="file" />
        </div>
        <br />
        <div>
          <button>Upload</button>
        </div>
        <img src={this.state.imageURL} alt="img" />
      </form>
    );
  }
}

export default FileUpload;
