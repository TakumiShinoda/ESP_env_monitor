import React, { ReactNode, Component } from "react";

export interface ContentAreaProps{
  contents: ReactNode[]
  contentIndex: number
}

export interface ContentAreaStates{}

export class ContentArea extends Component<ContentAreaProps, ContentAreaStates>{
  constructor(props: ContentAreaProps){
    super(props)
    this.state = {}
  }

  public render(): ReactNode{
    return (
      <div>
        {this.props.contents[this.props.contentIndex]}
      </div>
    )
  }
}