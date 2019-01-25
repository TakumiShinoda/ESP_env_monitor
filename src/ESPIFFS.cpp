#include "./ESPIFFS.h"

bool ESPIFFS::begin(){
  if(!SPIFFS.begin(true)) return false;
  else SPIFFSIni = true;
}

String ESPIFFS::readFile(String path){ 
  if(!SPIFFSIni) return "";

  File file = SPIFFS.open(path);
  String result = "";
  
  if (!file || file.isDirectory()) {
    return "";
  }
  while (file.available()) {
    result += char(file.read());
  }

  return result;
}

bool ESPIFFS::writeFile(String path, String value){
  if(!SPIFFSIni) return false;

  File file = SPIFFS.open(path, FILE_WRITE);

  if(!file) return false;
  if(file.print(value)) return true;
  else return false;
}

void ESPIFFS::removeFile(String path){
  if(!SPIFFSIni) return;

  SPIFFS.remove(path);
}