interface UtilsInterface{
}

export default class Utils implements UtilsInterface{
  static convertToHTML(ele: JQuery<HTMLElement>): string{
    return jQuery('<div>').append(ele.clone(true)).html();
  }
}