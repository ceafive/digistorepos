// https://www.npmjs.com/package/react-responsive-carousel
import { Carousel } from "react-responsive-carousel";
import React from "react";

const DemoCarousel = ({ children, onChange, onClickItem, onClickThumb, ...props }) => {
  return (
    <Carousel autoPlay infiniteLoop showArrows={true} onChange={onChange} onClickItem={onClickItem} onClickThumb={onClickThumb} {...props}>
      {children}
    </Carousel>
  );
};

export default DemoCarousel;
