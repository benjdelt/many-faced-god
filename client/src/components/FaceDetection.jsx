import React, { Fragment, useState, useEffect } from 'react';

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

function FaceDetection(props) {
  const {imageURL, setLoadingModels, setLoadingDetection, imageFile} = props;

  const [detectedFaces, setDetectedFaces] = useState(false);
  const [visibleFaces, setVisibleFaces] = useState(true);
  const [facesCoordinates, setFacesCoordinates] = useState([]);

  useEffect(() => {
    const path = '/models';
    Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri(path),
      faceapi.nets.faceLandmark68Net.loadFromUri(path),
      faceapi.nets.ssdMobilenetv1.loadFromUri(path)
    ]).then(() => {
      setLoadingModels(false);
      imageURL && start();
    }).catch(err => console.log(err))
  }, [setLoadingModels, imageURL]);

  const start = async () => {
    setLoadingDetection(true);
    const image = await faceapi.bufferToImage(imageFile);
    const canvas = document.getElementById('detected-faces');
    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    resizedDetections.forEach(detection => {
      setFacesCoordinates(facesCoordinates => [
        ...facesCoordinates, 
        detection.detection.box,
      ]);
      const box = detection.detection.box;
      const drawBox = new faceapi.draw.DrawBox(box);
      drawBox.draw(canvas);
      setLoadingDetection(false);
      setDetectedFaces(true)
    })
  }

  const handleToggleSwitch = () => {
    return visibleFaces ? setVisibleFaces(false) : setVisibleFaces(true);
  }

  const handleClickFace = (divPositioning) => {
    console.log(divPositioning);
  }
  
  return (
    <Fragment>
      <div className="image-container">
        {imageURL && 
          <Fragment>
            <img src={imageURL} alt="img"/>
            <canvas id="detected-faces" className={visibleFaces ? "" : "invisible"}/>
            {facesCoordinates.map(faceCoordinates => {
              const divPositioning = {
                top: faceCoordinates._y,
                left: faceCoordinates._x,
                height: faceCoordinates._height,
                width: faceCoordinates._width,
              }
              return (
                <div 
                  className={"face" + (visibleFaces ? "" : " invisible")} 
                  style={divPositioning} 
                  key={faceCoordinates._x}
                  onClick={() => handleClickFace(divPositioning)}
                >
                </div>
              )
            })}
          </Fragment>
        }
      </div>  
      {detectedFaces &&
          <label className="switch">
            <input type="checkbox" defaultChecked={visibleFaces} onChange={handleToggleSwitch} />
            <span className="slider round"></span>
          </label>
      }
    </Fragment>
  );
}

export default FaceDetection;
