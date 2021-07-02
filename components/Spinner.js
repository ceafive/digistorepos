import Loader from "react-loader-spinner";
const Spinner = ({ type = "Puff", color = "#00BFFF", height = 100, width = 100, timeout = 3000000 }) => {
  return <Loader type={type} color={color} height={height} width={width} timeout={timeout} />;
};

export default Spinner;
