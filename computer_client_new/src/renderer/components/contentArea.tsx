import React, { ReactNode, Component, CSSProperties } from "react";

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

  private static style: CSSProperties = {
    height: '93%'
  }

  public render(): ReactNode{
    return (
      <div className="contentArea" style={ContentArea.style}>
        {this.props.contents[this.props.contentIndex]}
      </div>
    )
  }
}