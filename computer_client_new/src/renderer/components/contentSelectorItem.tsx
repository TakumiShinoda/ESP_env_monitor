import React, { Component, ReactNode, CSSProperties } from "react";
import { ContentSelector } from "./contentSelector";
import { Styles } from "../styles";

interface ContentSelectorItemProps{
  parent: ContentSelector
  value: string
  width: number
  selected: boolean
  onClick: () => void
}
interface ContentSelectorItemStates{
  selected: boolean
  hovered: boolean
}

export class ContentSelectorItem extends Component<ContentSelectorItemProps, ContentSelectorItemStates>{
  constructor(props: ContentSelectorItemProps){
    super(props)
    this.state = {
      selected: false,
      hovered: false
    }

    this.onMouseEnter = this.onMouseEnter.bind(this)
    this.onMouseLeave = this.onMouseLeave.bind(this)
  }

  private listItemStyle: CSSProperties = { 
    width: `${this.props.width}%`,
    textAlign: 'center',
    background: Styles.blueBackground,
    borderRadius: '8px 8px 0 0',
    margin: '0 5px'
  }

  private static listItemHoveredStyle: CSSProperties = {
    background: Styles.blueBackground,
    cursor: 'pointer'
  }

  private static listItemSelectedStyle: CSSProperties = {
    background: Styles.grayBackground
  }

  private onMouseEnter(): void{
    this.setState({hovered: true})
  }

  private onMouseLeave(): void{
    this.setState({hovered: false})
  }

  public render(): ReactNode{
    let style: CSSProperties = this.listItemStyle

    if(this.state.hovered)
      style = Object.assign({}, style, ContentSelectorItem.listItemHoveredStyle)
    if(this.props.selected)
      style = Object.assign({}, style, ContentSelectorItem.listItemSelectedStyle)

    return (
      <li
        style={style}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onClick={this.props.onClick}>{this.props.value}</li>
    )
  }
}