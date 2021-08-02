import { useMediaQuery } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import Slide from "@material-ui/core/Slide";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import React from "react";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AlertDialogSlide({ maxWidth = "md", open = false, onClose = () => {}, children }) {
  const theme = useTheme();
  const classes = useStyles();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      fullScreen={fullScreen}
      fullWidth
      maxWidth={maxWidth}
      PaperProps={{ className: classes.paymentContainer }}
      onClose={onClose}
    >
      <div className="relative h-full flex flex-col justify-center items-center m-3 border border-gray-200 bg-white rounded-xl text-center font-semibold">
        <button className="absolute right-0 top-0 p-2 pt-0 text-2xl focus:outline-none text-red-500" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        {children}
      </div>
    </Dialog>
  );
}

const useStyles = makeStyles((theme) => ({
  paymentContainer: {
    // height: "100%",
    borderRadius: 15,
    backgroundColor: "#fff",
  },
  root: {
    zIndex: 100,
  },
}));
