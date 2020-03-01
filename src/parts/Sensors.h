#include <Arduino.h>
#include <BME280I2C.h>
#include <limits>
#include <cmath>
#include "../Utils.h"

#define TRY_BEGIN 10
#define SENSOR_TEMP_MIN -40
#define SENSOR_TEMP_MAX 85
#define SENSOR_HUMIDITY_MIN 0
#define SENSOR_HUMIDITY_MAX 100
#define SENSOR_PRESSURE_MIN 300 * 100
#define SENSOR_PRESSURE_MAX 1100 * 100

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

Utils utils;
BME280I2C bme(settings);

void setupSensors(){
  uint8_t tryBeginCnt = 0;

  Wire.begin();
  while(!bme.begin()){
    Serial.println("Could not find BME280I2C sensor!");
    if(tryBeginCnt > TRY_BEGIN) return;
    tryBeginCnt += 0;
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

bool getBME280Data(float *buff){
  float temp(NAN), hum(NAN), pres(NAN);
  BME280::TempUnit tempUnit(BME280::TempUnit_Celsius);
  BME280::PresUnit presUnit(BME280::PresUnit_Pa);
  bool isTempNorm = false;
  bool isHumNorm = false;
  bool isPresNorm = false;

  bme.read(pres, temp, hum, tempUnit, presUnit);

  if(std::isnan(temp) && constrain(temp, SENSOR_TEMP_MIN, SENSOR_TEMP_MAX)) isTempNorm = true;
  if(std::isnan(hum) && constrain(hum, SENSOR_HUMIDITY_MIN, SENSOR_HUMIDITY_MAX)) isHumNorm = true;
  if(std::isnan(pres) && constrain(pres, SENSOR_PRESSURE_MIN, SENSOR_PRESSURE_MAX)) isPresNorm = true;

  if(isTempNorm) *(buff) = temp;
  else *(buff) = std::numeric_limits<float>::quiet_NaN();

  if(isHumNorm) *(buff + 1) = hum; 
  else *(buff + 1) = std::numeric_limits<float>::quiet_NaN();

  if(isPresNorm) *(buff + 2) = pres;
  else *(buff + 2) = std::numeric_limits<float>::quiet_NaN();

  return isTempNorm && isHumNorm && isPresNorm;
}