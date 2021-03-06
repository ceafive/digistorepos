import "@fortawesome/fontawesome-free/css/all.min.css";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "react-day-picker/lib/style.css";
import "../styles/index.css";

import { Box, createTheme, CssBaseline, LinearProgress, ThemeProvider } from "@material-ui/core";
import { responsiveFontSizes } from "@material-ui/core/styles";
import App from "next/app";
import Head from "next/head";
import Router from "next/router";
import React from "react";
import { Provider } from "react-redux";
import { ToastProvider } from "react-toast-notifications";

import { store } from "../app/store";

export default class MyApp extends App {
  constructor(props) {
    super(props);
    this.state = { loading: false };
    // This binding is necessary to make `this` work in the callback
    this.handleRouteChange = this.handleRouteChange.bind(this);

    Router.events.on("routeChangeStart", (err, url) => this.handleRouteChange(err, url, true));
    Router.events.on("routeChangeComplete", (err, url) => this.handleRouteChange(err, url, false));
    Router.events.on("routeChangeError", (err, url) => this.handleRouteChange(err, url, false));
  }

  static async getInitialProps({ Component, router, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  handleRouteChange(err, url, loading) {
    // console.log(url);
    if (err.cancelled)
      return this.setState(() => ({
        loading: false,
      }));

    this.setState(() => ({
      loading,
    }));
  }

  render() {
    const { Component, pageProps } = this.props;
    const Layout = Component.layout || (({ children }) => <>{children}</>);

    const nunito = {
      fontFamily: "Nunito Sans",
      fontStyle: "normal",
      fontDisplay: "swap",
      fontWeight: 400,
    };

    let theme = createTheme({
      palette: {
        primary: {
          // light: will be calculated from palette.primary.main,
          main: "#21428F",
          // dark: will be calculated from palette.primary.main,
          // contrastText: will be calculated to contrast with palette.primary.main
        },
        secondary: {
          main: "#4AB647",
        },
      },
      typography: {
        fontFamily: "Nunito Sans",
      },
      overrides: {
        MuiCssBaseline: {
          "@global": {
            "@font-face": [nunito],
          },
        },
      },
    });

    theme = responsiveFontSizes(theme);

    return (
      <React.Fragment>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
          <title>Digistore :.: POS</title>
          {/* <script 
            type="text/javascript"
            src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAZxtyoPfteFDtEe0avkN0u3jdWuYiDC0U&libraries=places&v=weekly&region=GH"
          /> */}
          <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"></link>
        </Head>
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ToastProvider placement="top-center">
              {this.state.loading && (
                <Box style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 2002 }}>
                  <LinearProgress />
                </Box>
              )}
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </ToastProvider>
          </ThemeProvider>
        </Provider>
      </React.Fragment>
    );
  }
}
