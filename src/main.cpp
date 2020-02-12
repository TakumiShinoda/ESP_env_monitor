#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <ESP32Time.h>
#include <cmath>
#include <iostream>

#include "local_property.h"
#include "parts/Sensors.h"
#include "parts/WifiConnection.h"
#include "ServerObject.h"
#include "ESPIFFS.h"
#include "RTC.h"

// #define COMPILE_WIFI
#define COMPILE_SETUP
#define COMPILE_LOOP
 
#define SERIAL_BAUD 115200
#define TEMP_HISTORY_LENGTH 10
#define TEMP_ADJ_RATIO 0.083

char WIFI_STATUS_STATEMENT_CONNECTING[] = "true";
uint8_t WIFI_STATUS_STATEMENT_CONNECTING_LENGTH = 4;
char WIFI_STATUS_STATEMENT_NOTCONNECTING[] = "false";
uint8_t WIFI_STATUS_STATEMENT_NOTCONNECTING_LENGTH = 5;

String WifiApConfigReserved = "hoge";

String ResultStr = "";
String ResultDebugStr = "";
bool deviceConnected = false;
float TempHistory[TEMP_HISTORY_LENGTH] = {0};
float EnvBuff[3] = {0};
float InternalTemp = 0;
BLECharacteristic *pCharacteristic;
BLECharacteristic *wifiConfigPostCharacteristic;
BLECharacteristic *wifiStatusCharacteristic;
BLECharacteristic *wifiAPConnectCharacteristic;
BLECharacteristic *wifiAPDisconnectCharacteristic;
BLECharacteristic *getWifiAPConfigCharacteristic;
BLECharacteristic *sensorPostCharacteristic;
ServerObject Server;
ESPIFFS espiffs;
RTC rtc;

void reserveWifiAPConfig(void *pvParamaters){
  while(true){
    WifiApConfigReserved = espiffs.readFile(WIFI_CONF_DIR);
    vTaskDelay(5000);
  }
}

class MyServerCallbacks: public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
  }

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
  }
};

class WifiAPConnectCharacteristicCallbacks: public BLECharacteristicCallbacks{
  void onWrite(BLECharacteristic *chara){
    std::vector<String> aroundSSIDs = getAroundSSIDs();
    std::string rxVal = chara->getValue();
    String rxString = utils.stdString2String(rxVal);
    String savedWificonfs = espiffs.readFile(WIFI_CONF_DIR);
    std::vector<String> splitSavedWificonfs = utils.split2vector(savedWificonfs, '\n');

    if(rxVal == BLE_WIFI_CONNECT_PERMMISION){
      for(String aroundSSID : aroundSSIDs){
        for(String savedWificonf : splitSavedWificonfs){
          String savedSSID = utils.split(savedWificonf, ',', 0);

          if(aroundSSID == savedSSID){
            String savedPASS = utils.split(savedWificonf, ',', 1);
            char ssidBuff[255];
            char passBuff[255];

            savedSSID.toCharArray(ssidBuff, savedSSID.length() + 1);
            savedPASS.toCharArray(passBuff, savedPASS.length() + 1);
            if(connectAP(ssidBuff, passBuff)) Serial.println("WiFi Connected");
            else Serial.println("WiFi Connection failed");
            break;
          }
        }
        if(WiFi.status() == WL_CONNECTED) break;
      }
    }
  }
};

class WifiAPDisconnectCharacteristicCallbacks: public BLECharacteristicCallbacks{
  void onWrite(BLECharacteristic *chara){
    std::string rxVal = chara->getValue();
    String rxString = utils.stdString2String(rxVal);

    if(rxString == BLE_WIFI_DISCONNECT_PERMMISION) WiFi.disconnect();
  }
};

class WifiConfigPostCharacteristicCallbacks: public BLECharacteristicCallbacks{
  void onWrite(BLECharacteristic *pCharacteristic) {
    std::string rxValue = pCharacteristic->getValue();
    String rxString = utils.stdString2String(rxValue);
    rxString.replace("\n", "");
    std::vector<String> rxSplit = utils.split2vector(rxString, ',');
    String wifiConfigData = espiffs.readFile(WIFI_CONF_DIR);  
    std::vector<String> wifiConfigSplit = utils.split2vector(wifiConfigData, '\n');
    String result = "";

    if(rxSplit.size() == 2){
      wifiConfigSplit.push_back(rxString);
    }
    for(int i = 0; i < wifiConfigSplit.size(); i++){
      if(wifiConfigSplit[i] != ""){
        result += wifiConfigSplit[i] + "\n";
      }
    }
    if(!espiffs.writeFile(WIFI_CONF_DIR, result)) Serial.println("Write failed.");
    Serial.println(espiffs.readFile(WIFI_CONF_DIR));
  }
};

String makeResult_debug(){
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
    result += String(EnvBuff[0] - (InternalTemp * TEMP_ADJ_RATIO));
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

    result += String(EnvBuff[0]) + ','; // raw
    result += String(tempAve)  + ','; // raw ave
    result += String(EnvBuff[0] - (InternalTemp * TEMP_ADJ_RATIO)) + ','; // simple adj
    result += String(tempAve - (InternalTemp * 0.083))  + ','; // simple adj ave
    result += String(InternalTemp) + ','; // cpu temp
    result += String(EnvBuff[1]) + ','; // humidity
    result += String(EnvBuff[2]); // pressure

    return result;
  }else return "";
}

void homePageCallback(ChainArray params, String *resp, WiFiClient *client){
  *(resp) = ResultStr;
}

void setup(){
  #ifdef COMPILE_SETUP
    Serial.begin(SERIAL_BAUD);
    delay(500);

    if(!espiffs.begin()){
      Serial.println("ESPIFFS failed.");
      ESP.restart();
    }

    #ifdef COMPILE_WIFI
      WiFi.disconnect();
      startAP(APSSID, APPASS);
    #endif
    BLEDevice::init(DEVICE_NAME);
    BLEDevice::setPower(ESP_PWR_LVL_N14);
    BLEServer *pServer = BLEDevice::createServer();
    BLEService *pService = pServer->createService(SERVICE_UUID);
    BLEService *debugService = pServer->createService(DEBUG_SERVICE_UUID);

    pServer->setCallbacks(new MyServerCallbacks());

    // create BLE characteristic
    pCharacteristic = pService->createCharacteristic(CHARACTERISTIC_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
    wifiStatusCharacteristic = pService->createCharacteristic(WiFI_STATUS_CHARACTERISTIC_UUID, BLECharacteristic::PROPERTY_READ);
    wifiConfigPostCharacteristic = pService->createCharacteristic(WIFI_CONFIG_POST_CHARACTERISTIC_UUID, BLECharacteristic::PROPERTY_WRITE);
    wifiAPConnectCharacteristic = pService->createCharacteristic(WIFI_AP_CONNECT_CHARACTERISTIC_UUID, BLECharacteristic::PROPERTY_WRITE);
    wifiAPDisconnectCharacteristic = pService->createCharacteristic(WIFI_AP_DISCONNECT_CHARACTERISTIC_UUID, BLECharacteristic::PROPERTY_WRITE);
    getWifiAPConfigCharacteristic = debugService->createCharacteristic(GET_WIFI_AP_CONFIG_CHARACTERISTIC_UUID, BLECharacteristic::PROPERTY_READ);
    sensorPostCharacteristic = pService->createCharacteristic(SENSOR_POST_CHARACTERISTIC_UUID, BLECharacteristic::PROPERTY_READ);

    // set BLE characteristic callbacks
    wifiConfigPostCharacteristic->setCallbacks(new WifiConfigPostCharacteristicCallbacks());
    wifiAPConnectCharacteristic->setCallbacks(new WifiAPConnectCharacteristicCallbacks());
    wifiAPDisconnectCharacteristic->setCallbacks(new WifiAPDisconnectCharacteristicCallbacks());

    // BLE server open
    pService->start();
    debugService->start();
    pServer->getAdvertising()->start();

    // setting Wifi server
    #ifdef COMPILE_WIFI
      Html homePage("", homePageCallback);

      Server.setNotFound("404: Not found.");
      Server.addServer(80);

      Server.setResponse(80, "/", &homePage);
      Server.openAllServers();
    #endif
    
    setupSensors();
    xTaskCreatePinnedToCore(reserveWifiAPConfig, "reserveWifiAPConfig", 9000, NULL, 1, NULL, 0);
  #endif
}

void loop(){
  #ifdef COMPILE_LOOP
    InternalTemp = temperatureRead();
    getBME280Data(EnvBuff);
    char resultCharBuff[512];
    char resultDebugCharBuff[512];
    char wifiAPConfigCharBuff[1024];
    uint8_t resultDebugUint8Buff[512];
    uint8_t resultUint8Buff[512];
    uint8_t wifiStatusResult[8];
    uint8_t wifiAPConfigUint8_tBuff[1024];

    utils.slideRightBuff(TempHistory, TEMP_HISTORY_LENGTH);
    TempHistory[0] = EnvBuff[0];
    ResultDebugStr = makeResult_debug() != "" ? makeResult_debug() : ResultDebugStr;
    ResultStr = makeResult() != "" ? makeResult() : ResultStr;

    // Serial.println(ResultDebugStr);
    ResultDebugStr.toCharArray(resultDebugCharBuff, 512);
    utils.charArrToUint8_tArr(resultDebugCharBuff, resultDebugUint8Buff, ResultDebugStr.length());

    ResultStr.toCharArray(resultCharBuff, 512);
    utils.charArrToUint8_tArr(resultCharBuff, resultUint8Buff, ResultStr.length());

    if(WiFi.status() == WL_CONNECTED){
      utils.charArrToUint8_tArr(WIFI_STATUS_STATEMENT_CONNECTING, wifiStatusResult, WIFI_STATUS_STATEMENT_CONNECTING_LENGTH);
      wifiStatusCharacteristic->setValue(wifiStatusResult, WIFI_STATUS_STATEMENT_CONNECTING_LENGTH);
    }else{
      utils.charArrToUint8_tArr(WIFI_STATUS_STATEMENT_NOTCONNECTING, wifiStatusResult, WIFI_STATUS_STATEMENT_NOTCONNECTING_LENGTH);
      wifiStatusCharacteristic->setValue(wifiStatusResult, WIFI_STATUS_STATEMENT_NOTCONNECTING_LENGTH);
    }

    WifiApConfigReserved.toCharArray(wifiAPConfigCharBuff, 1024);
    utils.charArrToUint8_tArr(wifiAPConfigCharBuff, wifiAPConfigUint8_tBuff, WifiApConfigReserved.length());
    getWifiAPConfigCharacteristic->setValue(wifiAPConfigUint8_tBuff, WifiApConfigReserved.length());

    sensorPostCharacteristic->setValue(resultUint8Buff, ResultStr.length());

    pCharacteristic->setValue(resultDebugUint8Buff, ResultDebugStr.length());
    pCharacteristic->notify();

    #ifdef COMPILE_WIFI
      Server.requestHandle(80);
    #endif

    delay(500);
  #endif
}