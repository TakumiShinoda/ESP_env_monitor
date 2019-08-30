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
}

export const StyleTemplates: StyleTemplates = { 
  flex: {
    display: 'flex'
  }
}