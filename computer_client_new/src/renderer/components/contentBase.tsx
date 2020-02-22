import React, { Component, ReactNode, CSSProperties } from "react";
import { Styles } from "../styles";

interface ContentBaseProps{
  content: ReactNode
}
interface ContentBaseStates{}

export class ContentBase extends Component<ContentBaseProps, ContentBaseStates>{
  constructor(props: ContentBaseProps){
    super(props)
    this.state = {}
  }

  private static baseStyle: CSSProperties = {
    background: Styles.grayBackground,
    margin: 0,
    padding: 0,
    height: '100%'
  }

  public render(): ReactNode{
    return (
      <div className="contentBase" style={ContentBase.baseStyle}>
        {this.props.content}
      </div>
    )
  }
}