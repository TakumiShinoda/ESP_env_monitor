import React, { Component, ReactNode, CSSProperties } from "react"; 

interface StateCardProps{
  icon: ReactNode
  value?: number
  title: string
}
interface StateCardState{}

export class StateCard extends Component<StateCardProps, StateCardState>{
  constructor(props: StateCardProps){
    super(props)
    this.state = {}
  }

  private static style: CSSProperties = {
    background: 'gray',
    width: '32.33%',
    height: '100%',
    padding: '1.5%',
    paddingTop: '2%',
    borderRadius: '5px'
  }

  private static flexStyle: CSSProperties = {
    display: 'flex',
    textAlign: 'center',
    margin: 'auto'
  }

  private static valueStyle: CSSProperties = {
    fontSize: '25px',
    overflowX: 'hidden',
    width: '100%',
    height: '100%'
  }

  public render(): ReactNode{
    let value: string = this.props.value == undefined ? "No data" : this.props.value.toString()

    return (
      <div className="stateCard" style={StateCard.style}>
        <div style={StateCard.flexStyle}>
          {this.props.icon}
          <div style={{textAlign: 'center', width: '80%'}}> 
            <div style={StateCard.valueStyle}>{value}</div>
            <div>{this.props.title}</div>
          </div>
        </div>
      </div>
    )
  }
}