import { CSSProperties } from "react"; 

export interface Styles{
  blueBackground: string
  grayBackground: string
}

export const Styles: Styles ={
  blueBackground: 'rgb(0, 103, 193)',
  grayBackground: 'rgb(28, 28, 29)',
}

export interface StyleTemplates{
  flex: CSSProperties
  nospan: CSSProperties
  textColor: {
    white: CSSProperties
  }
}

export const StyleTemplates: StyleTemplates = { 
  flex: {
    display: 'flex'
  },
  nospan: {
    margin: 0,
    padding: 0
  },
  textColor: {
    white: {
      color: 'rgb(200, 200, 200)'
    }
  }
}