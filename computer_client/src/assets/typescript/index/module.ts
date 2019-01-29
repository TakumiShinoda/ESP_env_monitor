export default class Test{
  Mes: string

  constructor(mes: string = 'module test'){
    this.Mes = mes
  }

  logMes(mes?: string){ 
    if(mes) this.Mes = mes
    console.log(this.Mes);
  }
}