#include <BME280I2C.h>
#include <Wire.h>
#include <cmath>

#define TRY_BEGIN 10

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

void getBME280Data(float *buff){
  float temp(NAN), hum(NAN), pres(NAN);
  BME280::TempUnit tempUnit(BME280::TempUnit_Celsius);
  BME280::PresUnit presUnit(BME280::PresUnit_Pa);

  bme.read(pres, temp, hum, tempUnit, presUnit);

  if(!std::isnan(temp)){
    *(buff) = temp;
    *(buff + 1) = hum;
    *(buff + 2) = pres;
  }else{
    *(buff) = std::numeric_limits<float>::quiet_NaN();
    *(buff + 1) = std::numeric_limits<float>::quiet_NaN();
    *(buff + 2) = std::numeric_limits<float>::quiet_NaN();
  }
}