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
#define TEMP_HISTORY_LENGTH 400
#define TEMP_ADJ_RATIO 0.083

#define TIME_BLE_ADV 500 // us
#define TIME_SLEEP_US 1000000 // ns
#define TIME_BLE_WAIT_CONNECTING 1000 // us

struct FullInfo{
  float temperature = 0.0f;
  float humidity = 0.0f;
  float pressure = 0.0f;
  float cpuTemperature = 0.0f; 
  int8_t hour = 0;
  int8_t min = 0;
  int8_t sec = 0;
  bool wifiState = false;
};

char WIFI_STATUS_STATEMENT_CONNECTING[] = "true";
uint8_t WIFI_STATUS_STATEMENT_CONNECTING_LENGTH = 4;
char WIFI_STATUS_STATEMENT_NOTCONNECTING[] = "false";
uint8_t WIFI_STATUS_STATEMENT_NOTCONNECTING_LENGTH = 5;

String WifiApConfigReserved = "hoge";

String ResultStr = "";
String ResultDebugStr = "";
bool deviceConnecting = false;
std::vector<struct FullInfo> History;
float TempHistory[TEMP_HISTORY_LENGTH] = {0};
float EnvBuff[3] = {0};
float InternalTemp = 0;

BLEServer *pServer;
BLEService *pService;
BLEService *debugService;
BLECharacteristic *commandCharacteristic;
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
    deviceConnecting = true;
  }

  void onDisconnect(BLEServer* pServer) {
    deviceConnecting = false;
  }
};

class CharacteristicCallbacksCommand: public BLECharacteristicCallbacks{
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

void homePageCallback(ChainArray params, String *resp, WiFiClient *client){
  *(resp) = ResultStr;
}

void waitForBLECommunication(){
  uint16_t count = 0;

  while(deviceConnecting){
    count += 1;
    if(count > TIME_BLE_WAIT_CONNECTING) break;
    delay(1);
  }
}

void setup(){
  #ifdef COMPILE_SETUP
    Serial.begin(SERIAL_BAUD);
    delay(10);

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

    pServer = BLEDevice::createServer();
    pService = pServer->createService(SERVICE_UUID);
    debugService = pServer->createService(DEBUG_SERVICE_UUID);

    pServer->setCallbacks(new MyServerCallbacks());

    // create BLE characteristic
    commandCharacteristic = pService->createCharacteristic(CHARACTERISTIC_UUID_COMMAND, BLECharacteristic::PROPERTY_WRITE);

    // set BLE characteristic callbacks
    commandCharacteristic->setCallbacks(new CharacteristicCallbacksCommand());
    
    pService->start();
    debugService->start();

    // setting Wifi server
    #ifdef COMPILE_WIFI
      Html homePage("", homePageCallback);

      Server.setNotFound("404: Not found.");
      Server.addServer(80);

      Server.setResponse(80, "/", &homePage);
      Server.openAllServers();
    #endif
    
    if(!rtc.begin(true, SSID, PASS) == RTC_BEGIN_SUCCESS) Serial.println("RTC init failed.");
    WiFi.mode(WIFI_OFF);

    setupSensors();
    xTaskCreatePinnedToCore(reserveWifiAPConfig, "reserveWifiAPConfig", 9000, NULL, 1, NULL, 0);
  #endif
}

void loop(){
  #ifdef COMPILE_LOOP
    BLEAdvertisementData advData;
    BLEAdvertising *adv = pServer->getAdvertising();

    getBME280Data(EnvBuff);
    InternalTemp = temperatureRead();
    struct tm *timeNow = rtc.now();
    std::string manufacturerData = "";
    struct FullInfo currentInfo;

    currentInfo.temperature = EnvBuff[0];
    currentInfo.humidity = EnvBuff[1];
    currentInfo.pressure = EnvBuff[2];
    currentInfo.cpuTemperature = InternalTemp;

    uint8_t hour = 0;
    uint8_t min = 0;
    uint8_t sec = 0;
    double tempInt;
    double tempDecimal = modf(currentInfo.temperature, &tempInt);
    double tempCPUInt;
    double tempCPUDecimal = modf(InternalTemp, &tempCPUInt);
    double humInt;
    double humDecimal = modf(currentInfo.humidity, &humInt); 
    double preInt;
    double preDecimal = modf(currentInfo.pressure, &preInt);
    uint8_t preIntUpper = ((uint32_t)preInt & 0x00ff0000) >> 16;
    uint8_t preIntMid = ((uint32_t)preInt & 0x0000ff00) >> 8;
    uint8_t preIntLower = ((uint32_t)preInt & 0x000000ff);

    if(timeNow != nullptr){
      hour = timeNow->tm_hour;
      min = timeNow->tm_min;
      sec = timeNow->tm_sec;
    }

    currentInfo.hour = hour;
    currentInfo.min = min;
    currentInfo.sec = sec;

    manufacturerData += (char)currentInfo.hour;
    manufacturerData += (char)currentInfo.min;
    manufacturerData += (char)currentInfo.sec;
    manufacturerData += (char)((uint8_t)tempInt);
    manufacturerData += (char)((uint8_t)(tempDecimal * 100));
    manufacturerData += (char)((uint8_t)tempCPUInt);
    manufacturerData += (char)((uint8_t)(tempCPUDecimal * 100));
    manufacturerData += (char)((uint8_t)humInt);
    manufacturerData += (char)((uint8_t)(humDecimal * 100));
    manufacturerData += (char)preIntUpper;
    manufacturerData += (char)preIntMid;
    manufacturerData += (char)preIntLower;
    manufacturerData += (char)((uint8_t)(preDecimal * 100));

    advData.setManufacturerData(manufacturerData);
    adv->setAdvertisementData(advData);
    adv->start();

    #ifdef COMPILE_WIFI
      Server.requestHandle(80);
    #endif

    delay(TIME_BLE_ADV);
    waitForBLECommunication();
    adv->stop();
    esp_sleep_enable_timer_wakeup(TIME_SLEEP_US);
    esp_light_sleep_start();
  #endif
}