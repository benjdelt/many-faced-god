import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';

import './App.css';

// import nodejs bindings to native tensorflow,
// not required, but will speed up things drastically (python required)
// import '@tensorflow/tfjs-node';

// implements nodejs wrappers for HTMLCanvasElement, HTMLImageElement, ImageData
import * as canvas from 'canvas';

import * as faceapi from 'face-api.js';


// patch nodejs environment, we need to provide an implementation of
// HTMLCanvasElement and HTMLImageElement, additionally an implementation
// of ImageData is required, in case you want to use the MTCNN
const { ImageData } = canvas
faceapi.env.monkeyPatch({ 
  Canvas: HTMLCanvasElement,
  Image: HTMLImageElement,
  ImageData: ImageData,
  Video: HTMLVideoElement,
  createCanvasElement: () => document.createElement('canvas'),
  createImageElement: () => document.createElement('img')
})


function App() {
  const [imageURL, setImageURL] = useState('');
  const [loadingModels, setLoadingModels] = useState(true);
  const [loadingDetection, setLoadingDetection] = useState(false);
  const [imageFile, setImageFile] = useState('');

  useEffect(() => {
    const path = '/models';
    Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri(path),
      faceapi.nets.faceLandmark68Net.loadFromUri(path),
      faceapi.nets.ssdMobilenetv1.loadFromUri(path)
    ]).then(() => {
      setLoadingModels(false);
    }).catch(err => console.log(err))
  }, []);

  const start = async () => {
    setLoadingDetection(true);
    const container = document.getElementsByClassName('image-container')[0];
    container.style.position = 'relative';
    const image = await faceapi.bufferToImage(imageFile);
    const canvas = faceapi.createCanvasFromMedia(image);
    container.append(canvas);
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    resizedDetections.forEach(detection => {
      const box = detection.detection.box;
      const drawBox = new faceapi.draw.DrawBox(box);
      drawBox.draw(canvas);
      setLoadingDetection(false);
    })
  }

  return (
    <div>
      <FileUpload 
        setImageURL={ setImageURL }
        setImageFile={ setImageFile }
      />
      <div className="image-container">
        { imageURL && 
          <img src={ imageURL } alt="img" id="imageUpload"/>
        }
      </div>
      { imageURL &&
        <button onClick={ start }>Detect Faces</button>
      }
      { loadingModels &&
        <p>Loading Models...</p>
      }
      { loadingDetection &&
        <p>Loading Face Detection...</p>
      }
    </div>
  );
}

export default App;
