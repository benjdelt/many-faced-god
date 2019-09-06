import React, { Fragment, useState } from 'react';
import FileUpload from './components/FileUpload';
import FaceDetection from './components/FaceDetection';

import './App.css';

function App() {
  const [imageURL, setImageURL] = useState('');
  const [loadingModels, setLoadingModels] = useState(true);
  const [loadingDetection, setLoadingDetection] = useState(false);
  const [imageFile, setImageFile] = useState('');


  return (
    <Fragment>
      <FileUpload 
        setImageURL={ setImageURL }
        setImageFile={ setImageFile }
      />
      <FaceDetection
        imageURL={ imageURL }
        setLoadingModels={ setLoadingModels }
        setLoadingDetection={ setLoadingDetection }
        imageFile={ imageFile }
      />
      {loadingModels &&
        <p>Loading Models...</p>
      }
      {loadingDetection &&
        <p>Loading Face Detection...</p>
      }
    </Fragment>
  );
}

export default App;
