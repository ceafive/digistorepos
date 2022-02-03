import React from "react";
import GooglePlacesAutocomplete from "react-google-places-autocomplete";

const GooglePlaces = ({ value, setValue, selectProps }) => {
  return (
    <div>
      <GooglePlacesAutocomplete
        apiKey="AIzaSyAZxtyoPfteFDtEe0avkN0u3jdWuYiDC0U"
        autocompletionRequest={{
          componentRestrictions: {
            country: ["gh"],
          },
        }}
        apiOptions={{
          // v: "weekly",
          // libraries: "places",
          region: "GH",
        }}
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
