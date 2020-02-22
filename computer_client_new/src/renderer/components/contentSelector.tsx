import React, { Component, ReactNode, CSSProperties } from "react";
import { ContentSelectorItem } from "./contentSelectorItem";
import { Application } from "./application";

export interface ContentSelectorProps{
  parent: Application
}

export interface ContentSelectorStates{}

export class ContentSelector extends Component<ContentSelectorProps, ContentSelectorStates>{
  constructor(props: ContentSelectorProps){
    super(props)
    this.state = {}
  }

  private static listStyle: CSSProperties = { 
    width: '100%',
    height: '7%',
    padding: 0,
    margin: 0,
    display: 'flex',
    listStyle: 'none',
    color: 'white',
    fontSize: '20px'
  }

  private listItems(): ReactNode{
    let component: ContentSelector = this

    return Application.menues.map((val: string, index: number) => {
      return (
        <ContentSelectorItem 
          key={index} 
          selected={this.props.parent.state.contentIndex == index} 
          parent={this} value={val}
          onClick={() => {component.props.parent.setState({contentIndex: index})}} 
          width={100 / Application.menues.length}/>
      )
    })
  }

  public render(): ReactNode{
    return (
      <ul className="contentSelector" style={ContentSelector.listStyle}>
        {this.listItems()}
      </ul>
    )
  }
}