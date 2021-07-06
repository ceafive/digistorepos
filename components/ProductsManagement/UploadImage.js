import React from "react";
import ImageUploading from "react-images-uploading";

export default function UploadImage({ classes }) {
  const [images, setImages] = React.useState([]);
  const maxNumber = 4;

  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    console.log(imageList, addUpdateIndex);
    setImages(imageList);
  };

  return (
    <div className=" w-full h-full">
      <ImageUploading multiple value={images} onChange={onChange} maxNumber={maxNumber} dataURLKey="data_url">
        {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
          // write your building UI
          <div className="w-full h-full">
            <div className="flex w-full justify-between items-center h-1/3 z-10">
              {imageList.map((image, index) => (
                <div key={index} className="flex flex-wrap justify-center items-center  h-full">
                  <img className="h-full" src={image["data_url"]} alt="" width="100" />
                  {/* <div className="flex justify-between items-center w-full">
                    <button className="text-sm text-green-500 font-bold focus:outline-none" onClick={() => onImageUpdate(index)}>
                      Update
                    </button>
                    <button className="text-sm text-red-500 font-bold focus:outline-none" onClick={() => onImageRemove(index)}>
                      Remove
                    </button>
                  </div> */}
                </div>
              ))}
            </div>
            <button
              className="w-full focus:outline-none"
              style={isDragging ? { color: "red" } : undefined}
              onClick={onImageUpload}
              {...dragProps}
            >
              Drag &amp; drop files here or click to add files
            </button>
            &nbsp;
            {/* <button onClick={onImageRemoveAll}>Remove all images</button> */}
          </div>
        )}
      </ImageUploading>
    </div>
  );
}
