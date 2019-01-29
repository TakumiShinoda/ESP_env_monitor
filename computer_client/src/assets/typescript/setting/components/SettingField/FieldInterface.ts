export default interface FieldInterface{
  applyStyle(): void
  renderElement(prop: {}): string | JQuery<HTMLElement>
}