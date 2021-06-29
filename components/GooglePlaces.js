import React, { useState } from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

const GooglePlaces = ({ value, setValue, selectProps }) => {
  return (
    <div>
      <GooglePlacesAutocomplete
        selectProps={{
          ...selectProps,
          value,
          onChange: setValue,
        }}
      />
    </div>
  );
};

export default GooglePlaces;
