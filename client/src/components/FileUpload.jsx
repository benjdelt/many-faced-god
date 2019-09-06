import React, { createRef } from 'react';

function FileUpload(props) {

  const {setImageFile, setImageURL} = props;

  let uploadInput = createRef();

  const handleUploadImage = event => {
    event.preventDefault();
    const data = new FormData();
    setImageFile(uploadInput.files[0]);
    data.append('file', uploadInput.files[0]);
    fetch('http://localhost:3001/upload', {
      method: 'POST',
      body: data,
    }).then((response) => {
      response.json().then((body) => {
        setImageURL(`http://localhost:3001/${body.file}`);
      });
    });
  }

  return (
      <form onSubmit={handleUploadImage}>
        <div>
          <input ref={(ref) => { uploadInput = ref;}} type="file" />
        </div>
        <div>
          <button>Upload</button>
        </div>
      </form>   
  );
}

export default FileUpload;
