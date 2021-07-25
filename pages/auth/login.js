import axios from "axios";
import Spinner from "components/Spinner";
import Auth from "layouts/Auth.js";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { verifyToken } from "services";

export default function Login() {
  const router = useRouter();
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm();

  const [processing, setProcessing] = React.useState(false);
  const [loginError, setLoginError] = React.useState({
    status: false,
    message: "",
  });

  const handleUserSignIn = async (values) => {
    try {
      setProcessing(true);
      setLoginError({
        status: false,
        message: "",
      });
      const res = await axios.post("/api/auth/login", values);
      const data = await res.data;

      const { success, error } = verifyToken(JSON.stringify(data));

      if (error) {
        setLoginError({
          status: true,
          message: error,
        });
      }
      if (success) {
        router.push("/sell/sell");
      }
    } catch (error) {
      setLoginError({
        status: false,
        message: "ERROR",
      });
      setProcessing(false);
      if (error.response) {
        console.log(error.response.data);
      } else if (error.request) {
        console.log(error.request);
      } else {
        console.log("Error", error.message);
      }
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 h-full ">
        <div className="flex flex-col items-center justify-center h-full ">
          <div className="w-full h-full lg:w-5/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-3xl bg-white border-0">
              <div className="rounded-t-3xl mb-0 px-6 py-6">
                {/* <div className="text-center mb-3">
                  <h6 className="text-blueGray-500 text-sm font-bold">Sign in with</h6>
                </div> 

                <hr className="mt-6 border-b-1 border-blueGray-300" />*/}
              </div>
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <form>
                  <div className="relative w-full mb-3">
                    {/* <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="grid-password">
                      Username
                    </label> */}
                    <input
                      {...register("username", {
                        required: "Username is required",
                      })}
                      type="text"
                      className="border border-gray-500 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm focus:outline-none focus:ring-0 w-full"
                      placeholder="Enter your Mobile Number or Username"
                    />
                    <p className="text-sm text-red-500">{errors?.username?.message}</p>
                  </div>

                  <div className="relative w-full mb-3">
                    {/* <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="grid-password">
                      Pin
                    </label> */}
                    <input
                      {...register("pin", {
                        required: "PIN is required",
                        minLength: {
                          value: 4,
                          message: "PIN must be longer than 3 chars",
                        },
                      })}
                      type="password"
                      pattern="[0-9]*"
                      noValidate
                      className="border border-gray-500 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring-0 w-full ease-linear transition-all duration-150"
                      placeholder="Enter your 4 digit PIN Code"
                    />
                    <p className="text-sm text-red-500">{errors?.pin?.message}</p>
                  </div>

                  <div className="text-center mt-6">
                    {loginError.status && <p className="text-sm text-red-500">{loginError.message}</p>}
                    <button
                      disabled={processing}
                      className={`${
                        processing ? "bg-gray-300 text-gray-200" : "bg-green-600 text-white"
                      } active:bg-green-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150`}
                      type="button"
                      onClick={handleSubmit(handleUserSignIn)}
                    >
                      {processing && (
                        <div className="inline-block mr-2">
                          <Spinner type={"TailSpin"} color="black" width="10" height="10" />
                        </div>
                      )}
                      <span>Login</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

Login.layout = Auth;
