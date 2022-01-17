// layout for page
import Auth from "layouts/Auth.js";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";

export default function Register() {
  const router = useRouter();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleUserSignUp = (values) => {
    localStorage.setItem("ipayUser", JSON.stringify(values));
    router.push("/");
  };

  return (
    <>
      <div className="container mx-auto px-4 h-full">
        <div className="flex content-center items-center justify-center h-full">
          <div className="w-full lg:w-6/12 px-4">
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
              <div className="rounded-t mb-0 px-6 py-6">
                <div className="text-center mb-3">
                  <h6 className="text-blueGray-500 text-sm font-bold">Sign up with</h6>
                </div>

                <hr className="mt-6 border-b-1 border-blueGray-300" />
              </div>
              <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                <form>
                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="grid-password">
                      Name
                    </label>
                    <input
                      {...register("name", {
                        required: "Name is required",
                      })}
                      type="text"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Name"
                    />
                    <p className="text-sm text-red-500">{errors?.name?.message}</p>
                  </div>

                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="grid-password">
                      Email
                    </label>
                    <input
                      {...register("email", {
                        required: "Email address is required",
                      })}
                      type="email"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Email"
                    />
                    <p className="text-sm text-red-500">{errors?.email?.message}</p>
                  </div>

                  <div className="relative w-full mb-3">
                    <label className="block uppercase text-blueGray-600 text-xs font-bold mb-2" htmlFor="grid-password">
                      Password
                    </label>
                    <input
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be longer than 5 chars",
                        },
                      })}
                      type="password"
                      autoComplete="current-password"
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      placeholder="Password"
                    />
                    <p className="text-sm text-red-500">{errors?.password?.message}</p>
                  </div>

                  {/* <div>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        id="customCheckLogin"
                        type="checkbox"
                        className="form-checkbox border-0 rounded text-blueGray-700 ml-1 w-5 h-5 ease-linear transition-all duration-150"
                      />
                      <span className="ml-2 text-sm font-semibold text-blueGray-600">
                        I agree with the{" "}
                        <a href="#pablo" className="text-lightBlue-500">
                          Privacy Policy
                        </a>
                      </span>
                    </label>
                  </div> */}

                  <div className="text-center mt-6">
                    <button
                      className="bg-blueGray-800 text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
                      type="button"
                      onClick={handleSubmit(handleUserSignUp)}
                    >
                      Create Account
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className="flex justify-end mt-2 relative">
              <div className="text-right">
                <Link href="/auth/login">
                  <p className="text-blueGray-200 cursor-pointer">
                    <small>Login</small>
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

Register.layout = Auth;
