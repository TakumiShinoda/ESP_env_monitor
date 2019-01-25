#include <BME280I2C.h>
#include <Wire.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <WiFi.h>

#include "local_property.h"
#include "parts/Sensors.h"
#include "parts/WifiConnection.h"
#include "ServerObject.h"

#define DEVICE_NAME "ENV_Monitor_BLE"
#define SERVICE_UUID "81d78b05-4e0a-4644-b364-b79312e4c307"
#define CHARACTERISTIC_UUID "0989bf07-e886-443e-82db-7108726bb650"

#define SERIAL_BAUD 115200
#define TEMP_HISTORY_LENGTH 10

String ResultStr = "";
bool deviceConnected = false;
float TempHistory[TEMP_HISTORY_LENGTH] = {0};
float EnvBuff[3] = {0};
float InternalTemp = 0;
BLECharacteristic *pCharacteristic;
ServerObject Server;

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

  for(int i = 0; i < TEMP_HISTORY_LENGTH; i++){
    if(TempHistory[i] != 0 && TempHistory[i] != NAN){
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
}

void homePageCallback(ChainArray params, String *resp, WiFiClient *client){
  *(resp) = ResultStr;
}

void setup(){
  Html homePage("", homePageCallback);

  Serial.begin(SERIAL_BAUD);
  delay(500);
  
  if(connectAP(SSID, PASS)){
    Serial.println("suc");
  }else{
    Serial.println("faild");
  }

  startAP(APSSID, APPASS);
  BLEDevice::init(DEVICE_NAME);
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  BLEService *pService = pServer->createService(SERVICE_UUID);
  pCharacteristic = pService->createCharacteristic(CHARACTERISTIC_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  pCharacteristic->addDescriptor(new BLE2902());

  pService->start();
  pServer->getAdvertising()->start();

  Server.setNotFound("404: Not found.");
  Server.addServer(80);

  Server.setResponse(80, "/", &homePage);
  Server.openAllServers();
  
  setupSensors(); 
}

void loop(){
  InternalTemp = temperatureRead();
  getBME280Data(EnvBuff);
  char resultCharBuff[512];
  uint8_t resultUint8Buff[512];

  utils.slideRightBuff(TempHistory, TEMP_HISTORY_LENGTH);
  TempHistory[0] = EnvBuff[0];
  ResultStr = makeResult();

  Serial.println(ResultStr);
  ResultStr.toCharArray(resultCharBuff, 512);
  utils.charArrToUint8_tArr(resultCharBuff, resultUint8Buff, ResultStr.length());
  pCharacteristic->setValue(resultUint8Buff, ResultStr.length());
  pCharacteristic->notify();

  Server.requestHandle(80);

  delay(500);
}