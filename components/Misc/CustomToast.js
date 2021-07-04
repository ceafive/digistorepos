import { DefaultToast } from "react-toast-notifications"

const MyCustomToast = ({ children, ...props }) => (
  <DefaultToast {...props} style={{ zIndex: 99999 }}>
    {children}
  </DefaultToast>
)

export default MyCustomToast
