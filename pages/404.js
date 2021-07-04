import Router from "next/router"
import React, { Component } from "react"

export default class Error404 extends Component {
  componentDidMount = () => {
    Router.push("/")
  }

  render() {
    return <div />
  }
}
