#include <BME280I2C.h>
#include <Wire.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <cmath>
#include <iostream>

#include "local_property.h"
#include "parts/Sensors.h"

#define SERIAL_BAUD 115200
#define TEMP_HISTORY_LENGTH 10

String ResultStr = "";
bool deviceConnected = false;
float TempHistory[TEMP_HISTORY_LENGTH] = {0};
float EnvBuff[3] = {0};
float InternalTemp = 0;
BLECharacteristic *pCharacteristic;

class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
  }

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
  }
};

String makeResult(){
  String result = "";
  float tempAve = 0;
  float tempCnt = 0;
  float tempSum = 0;

  if(!std::isnan(EnvBuff[0]) && !std::isnan(EnvBuff[1]) && !std::isnan(EnvBuff[2])){
    for(int i = 0; i < TEMP_HISTORY_LENGTH; i++){
      if(TempHistory[i] != 0 && !std::isnan(TempHistory[i])){
        tempSum += TempHistory[i];
        tempCnt += 1;
      }
    }
    tempAve = tempSum / tempCnt;

    result += "Temp_Raw: ";
    result += String(EnvBuff[0]);
    result += "   Temp_Ave: ";
    result += String(tempAve);
    result += "   Temp_Adj_Simple: ";
    result += String(EnvBuff[0] - (InternalTemp * 0.083));
    result += "   Temp_Ave_Adj_Simple: ";
    result += String(tempAve - (InternalTemp * 0.083));
    result += "   Temp_CPU: ";
    result += String(InternalTemp);
    result += "   Humidity: ";
    result += String(EnvBuff[1]);
    result += "   Pressure: ";
    result += String(EnvBuff[2]);

    return result;
  }else{
    return "";
  }
}

void setup(){
  Serial.begin(SERIAL_BAUD);
  delay(500);

  BLEDevice::init(DEVICE_NAME);
  BLEServer *pServer = BLEDevice::createServer();
  BLEService *pService = pServer->createService(SERVICE_UUID);

  pServer->setCallbacks(new MyServerCallbacks());

  // create BLE characteristic
  pCharacteristic = pService->createCharacteristic(CHARACTERISTIC_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);

  // BLE server open
  pService->start();
  pServer->getAdvertising()->start();
  
  setupSensors(); 
}

void loop(){
  InternalTemp = temperatureRead();
  getBME280Data(EnvBuff);
  char resultCharBuff[512];
  uint8_t resultUint8Buff[512];

  utils.slideRightBuff(TempHistory, TEMP_HISTORY_LENGTH);
  TempHistory[0] = EnvBuff[0];
  makeResult() != "" ? ResultStr = makeResult() : ResultStr;

  Serial.println(ResultStr);
  ResultStr.toCharArray(resultCharBuff, 512);
  utils.charArrToUint8_tArr(resultCharBuff, resultUint8Buff, ResultStr.length());

  pCharacteristic->setValue(resultUint8Buff, ResultStr.length());
  pCharacteristic->notify();
  
  delay(500);
}