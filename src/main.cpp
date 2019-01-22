#include <BME280I2C.h>
#include <Wire.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

#define DEVICE_NAME "ENV_Monitor_BLE"
#define SERVICE_UUID "81d78b05-4e0a-4644-b364-b79312e4c307"
#define CHARACTERISTIC_UUID "0989bf07-e886-443e-82db-7108726bb650"

#define SERIAL_BAUD 115200
#define TEMP_HISTORY_LENGTH 10

BME280I2C::Settings settings(
  BME280::OSR_X1,
  BME280::OSR_X1,
  BME280::OSR_X1,
  BME280::Mode_Forced,
  BME280::StandbyTime_1000ms,
  BME280::Filter_Off,
  BME280::SpiEnable_False,
  BME280I2C::I2CAddr_0x76
);

bool deviceConnected = false;
float TempHistory[TEMP_HISTORY_LENGTH] = {0};
float EnvBuff[3] = {0};
float InternalTemp = 0;
BME280I2C bme(settings);
BLECharacteristic *pCharacteristic;

void slideRightBuff(float buff[], uint16_t size){
  for(int i = size - 1; i >= 0; i--) buff[i] = buff[i - 1];
  buff[0] = 0;
}

void getBME280Data(float *buff){
  float temp(NAN), hum(NAN), pres(NAN);
  BME280::TempUnit tempUnit(BME280::TempUnit_Celsius);
  BME280::PresUnit presUnit(BME280::PresUnit_Pa);

  bme.read(pres, temp, hum, tempUnit, presUnit);

  if(temp != NAN){
    slideRightBuff(TempHistory, TEMP_HISTORY_LENGTH);
    TempHistory[0] = temp;

    *(buff) = temp;
    *(buff + 1) = hum;
    *(buff + 2) = pres; 
  }
}

String makeResult(){
  String result = "";
  float tempAve = 0;
  float tempSum = 0;

  for(int i = 0; i < TEMP_HISTORY_LENGTH; i++) TempHistory[i] != 0 ? tempSum += TempHistory[i] : tempSum;
  tempAve = tempSum / TEMP_HISTORY_LENGTH;

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

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
    }
 
    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
    }
};

void setup(){
  Serial.begin(SERIAL_BAUD);
  delay(500);

  BLEDevice::init(DEVICE_NAME);
  BLEServer *pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  BLEService *pService = pServer->createService(SERVICE_UUID);
  pCharacteristic = pService->createCharacteristic(CHARACTERISTIC_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  pCharacteristic->addDescriptor(new BLE2902());

  pService->start();
  pServer->getAdvertising()->start();

  
  Wire.begin();
  while(!bme.begin()){
    Serial.println("Could not find BME280I2C sensor!");
    return;
  }

  switch(bme.chipModel()){
    case BME280::ChipModel_BME280:
      Serial.println("Found BME280 sensor! Success.");
      break;
    case BME280::ChipModel_BMP280:
      Serial.println("Found BMP280 sensor! No Humidity available.");
      break;
    default:
      Serial.println("Found UNKNOWN sensor! Error!");
  }

  settings.tempOSR = BME280::OSR_X4;
  bme.setSettings(settings);
}

void charArrToUint8_tArr(char *str, uint8_t *buff, uint16_t length){
  for(int i = 0; i < length; i++){
    *(buff + i) = uint8_t(*(str + i));
  }
}

void loop(){
  InternalTemp = temperatureRead();
  getBME280Data(EnvBuff);
  String resultStr = makeResult();
  char resultCharBuff[512];
  uint8_t resultUint8Buff[512];

  Serial.println(resultStr);
  resultStr.toCharArray(resultCharBuff, 512);
  charArrToUint8_tArr(resultCharBuff, resultUint8Buff, resultStr.length());
  pCharacteristic->setValue(resultUint8Buff, resultStr.length());
  pCharacteristic->notify();

  delay(500);
}