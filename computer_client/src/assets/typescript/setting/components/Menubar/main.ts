import Utils from '../../../Utils';

interface MenubarInterface{
  registerMenuHoverEvent(enter: (ele: any) => void, out: (ele: any) => void): void
  registerMenuClickEvent(ev: (ele: any, index: number) => void): void
  render(): void
  setEvents(): void
}

const Styles: any = {
  'default': {
    '#menubar': {
      'margin': '0px',
      'padding': '0px',
      'width': '100%',
    },
    '#menubar li': {
      'padding': '0 6.5%',
      'padding-bottom': '4px',
      'margin': '0 1.2%',
      'font-size': '22px',
      'color': 'white',
      'display': 'inline',
      'border': 'solid 0px',
      'border-top-left-radius': '8px',
      'border-top-right-radius': '8px',
      'background': 'rgba(51, 51, 51, 1)'
    },
  },
  'onFocusMenu': {
    'background': 'rgb(122, 122, 122)'
  },
  'outFocusMenu': {
    'background': 'rgb(51, 51, 51)'
  }
}

export default class Menubar implements MenubarInterface{
  private $: JQueryStatic
  private TargetId: string
  private State: number
  private menuEnterHoverCallback: (ele: any) => void
  private menuOutHoverCallback: (ele: any) => void 
  private menuClickCallback: (ele: any, index: number) => void

  private static Menues: string[] = ['DashBoard', 'WiFi', 'BLE', 'Sensor']

  constructor(id: string, _$: JQueryStatic){
    this.TargetId = id
    this.$ = _$
    this.State = 0
    this.menuEnterHoverCallback = (ele: any) => {}
    this.menuOutHoverCallback = (ele: any) => {}
    this.menuClickCallback = (ele: any, index: number) => {}
  }

  private applyStyle(){
    Object.keys(Styles.default).forEach((key: string) => {
      this.$(key).css(Styles.default[key])
    })
  }

  private clearFocus(){
    $('#menubar li').css(Styles.outFocusMenu)
  }

  registerMenuHoverEvent(enter: (ele: any) => void, out: (ele: any) => void){
    this.menuEnterHoverCallback = enter
    this.menuOutHoverCallback = out
  }

  registerMenuClickEvent(ev: (ele: any, index: number) => void){
    this.menuClickCallback = ev
  }

  setEvents(){
    this.$('#menubar li').hover(
      (ele: any) => {
        if(parseInt(ele.currentTarget.attributes.name.nodeValue) != this.State){
          ele.currentTarget.style.background = Styles.onFocusMenu.background
          this.menuEnterHoverCallback(ele)
        }
      },
      (ele: any) => {
        if(parseInt(ele.currentTarget.attributes.name.nodeValue) != this.State){
          ele.currentTarget.style.background = Styles.outFocusMenu.background
          this.menuOutHoverCallback(ele)
        }
      }
    )

    this.$('#menubar li').click((ele: any) => {
      this.clearFocus()
      this.State = parseInt(ele.currentTarget.attributes.name.nodeValue)
      ele.currentTarget.style.background = Styles.onFocusMenu.background
      this.menuClickCallback(ele, this.State)
    })
  }

  changeFocus(index: number){
    let menues: JQuery<HTMLElement> = $('#menubar li')

    this.clearFocus()
    this.State = index
    console.log(menues)
    menues[index].style.background = Styles.onFocusMenu.background
  }

  render(){
    let ul: JQuery<HTMLElement> = this.$('<ul id=menubar>')

    for(var i = 0; i < Menubar.Menues.length; i++){
      let li: JQuery<HTMLElement> = this.$('<li name=' + i + '>').append(Menubar.Menues[i])

      ul.append(li)
    }
    this.$("#" + this.TargetId).append(ul);
    this.applyStyle()
    this.setEvents()
  }
}