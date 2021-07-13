import "@fortawesome/fontawesome-free/css/all.min.css";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "../styles/index.css";

import { Box, createMuiTheme, CssBaseline, LinearProgress, ThemeProvider } from "@material-ui/core";
import { createTheme, responsiveFontSizes } from "@material-ui/core/styles";
import App from "next/app";
import Head from "next/head";
import Router from "next/router";
import React from "react";
import { Provider } from "react-redux";
import { ToastProvider } from "react-toast-notifications";

import { store } from "../app/store";

// Router.events.on("routeChangeStart", (url) => {
//   console.log(`Loading: ${url}`);
//   document.body.classList.add("body-page-transition");
//   ReactDOM.render(<PageChange path={url} />, document.getElementById("page-transition"));
// });
// Router.events.on("routeChangeComplete", () => {
//   ReactDOM.unmountComponentAtNode(document.getElementById("page-transition"));
//   document.body.classList.remove("body-page-transition");
// });
// Router.events.on("routeChangeError", () => {
//   ReactDOM.unmountComponentAtNode(document.getElementById("page-transition"));
//   document.body.classList.remove("body-page-transition");
// });

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

    let theme = createMuiTheme({
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
          <title>POS - iPay</title>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link href="https://fonts.googleapis.com/css2?family=Castoro&display=swap" rel="stylesheet" />
          <script
            type="text/javascript"
            src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAZxtyoPfteFDtEe0avkN0u3jdWuYiDC0U&libraries=places&v=weekly&region=GH"
          />
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
