import React from "react";
import ImageUploading from "react-images-uploading";
import { useSelector } from "react-redux";
import { useToasts } from "react-toast-notifications";

export default function UploadImage({ maxNumber, classes, setValue, images, setImages }) {
  const { addToast } = useToasts();
  const onChange = (imageList, addUpdateIndex) => {
    // data for submit
    // console.log(imageList);
    setImages(imageList);
    setValue("productImages", imageList);
  };

  return (
    <div className=" w-full h-full">
      <ImageUploading
        multiple={false}
        maxFileSize={2000000}
        value={images}
        onChange={onChange}
        maxNumber={maxNumber}
        dataURLKey="data_url"
        onError={(errors, files) => {
          // console.log({ errors, files });

          errors.maxNumber &&
            addToast(`Number of selected images exceed maxNumber of ${maxNumber}`, { appearance: `error`, autoDismiss: true });
          errors.acceptType && addToast(`Your selected file type is not allow`, { appearance: `error`, autoDismiss: true });
          errors.maxFileSize &&
            addToast(`Selected file size exceed maxFileSize of 2000000 bytes`, { appearance: `error`, autoDismiss: true });
          errors.resolution && addToast(`Selected file is not match your desired resolution`, { appearance: `error`, autoDismiss: true });
        }}
      >
        {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
          // write your building UI
          <div className="w-full h-full">
            <div className={`flex w-full items-center ${images.length > 0 ? "h-1/3" : "h-0"} z-10`}>
              {imageList.map((image, index) => {
                return (
                  <div key={index} className={`relative h-full border border-black`}>
                    {typeof image === "string" ? (
                      <img className="h-full" src={image} alt="" width="100" />
                    ) : (
                      <img className="h-full" src={image["data_url"]} alt="" width="100" />
                    )}
                    <div className="absolute top-5 left-0 flex justify-center items-center w-full">
                      <div className="flex justify-between items-center w-1/2">
                        <button className="text-sm font-bold focus:outline-none" onClick={() => onImageUpdate(index)}>
                          <i className="fas fa-pencil-alt text-blue-500"></i>
                        </button>
                        <button className="text-sm font-bold focus:outline-none" onClick={() => onImageRemove(index)}>
                          <i className="fas fa-trash-alt text-red-500"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              className={`w-full focus:outline-none font-bold  ${images.length > 0 ? "h-2/3" : "h-full"}`}
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
